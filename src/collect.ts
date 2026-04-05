import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
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

function mergeResults(results: { name: string; data?: unknown; error?: string }[]) {
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

export async function collect() {
  console.log(`[${new Date().toISOString()}] 开始收集...`);

  const [aiResults, investmentResults] = await Promise.all([
    ai.runAll(),
    investment.runAll(),
  ]);

  const result = {
    ai: mergeResults(aiResults),
    investment: mergeResults(investmentResults),
  };

  if (!existsSync(RESULT_DIR)) {
    await mkdir(RESULT_DIR, { recursive: true });
  }
  const filePath = join(RESULT_DIR, `${getDateStr()}.json`);
  await writeFile(filePath, JSON.stringify(result, null, 2));
  console.log(`已写入 ${filePath}`);
  console.log(`[${new Date().toISOString()}] 收集完成`);
}

// 直接运行时执行收集
const isDirectRun = process.argv[1]?.includes('collect');
if (isDirectRun) {
  collect();
}
