import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { CollectorResult } from './types';
import * as ai from './collectors/ai';
import * as investment from './collectors/investment';

const RESULT_DIR = join(process.cwd(), 'result');

export function getDateStr(): string {
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const y = beijing.getUTCFullYear();
  const m = String(beijing.getUTCMonth() + 1).padStart(2, '0');
  const d = String(beijing.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function mergeResults(results: CollectorResult[]) {
  let merged: Record<string, unknown> = {};
  for (const r of results) {
    if (r.error) {
      merged[r.name] = { error: r.error };
    } else if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
      merged = { ...merged, ...(r.data as Record<string, unknown>) };
    } else {
      merged[r.name] = r.data;
    }
  }
  return merged;
}

export async function collect(): Promise<boolean> {
  console.log(`[${new Date().toISOString()}] 开始收集...`);

  const [aiResults, investmentResults] = await Promise.all([
    ai.runAll(),
    investment.runAll(),
  ]);

  const hasError = [...aiResults, ...investmentResults].some((r) => r.error);
  if (hasError) {
    console.error('收集仍有失败项，跳过本次写入和提交');
    return false;
  }

  const result = {
    ai: ai.mergeAIResults(aiResults),
    investment: mergeResults(investmentResults),
  };

  if (!existsSync(RESULT_DIR)) {
    await mkdir(RESULT_DIR, { recursive: true });
  }
  const filePath = join(RESULT_DIR, `${getDateStr()}.json`);
  await writeFile(filePath, JSON.stringify(result, null, 2));
  console.log(`已写入 ${filePath}`);
  console.log(`[${new Date().toISOString()}] 收集完成`);
  return true;
}

// 直接运行 collect.ts 时执行收集并推送
const isDirectRun = process.argv[1]?.endsWith('collect.ts');
if (isDirectRun) {
  (async () => {
    const { pullLatest, pushResult } = await import('./git');
    pullLatest();
    const success = await collect();
    if (success) pushResult();
  })();
}
