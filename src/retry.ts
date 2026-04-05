import { Collector, CollectorResult } from './types';

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 60 * 1000; // 1 分钟

export async function runWithRetry(collector: Collector): Promise<CollectorResult> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const data = await collector.run();
      return { name: collector.name, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${collector.name}] 第 ${attempt} 次失败:`, message);
      if (attempt < MAX_RETRIES) {
        console.log(`[${collector.name}] ${RETRY_INTERVAL / 1000} 秒后重试...`);
        await new Promise((r) => setTimeout(r, RETRY_INTERVAL));
      } else {
        return { name: collector.name, error: message };
      }
    }
  }
  return { name: collector.name, error: 'unreachable' };
}
