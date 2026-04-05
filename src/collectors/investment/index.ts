import { Collector, CollectorResult } from '../../types';

// 在此文件中导入并注册所有投资相关的收集器
const collectors: Collector[] = [];

export function register(collector: Collector) {
  collectors.push(collector);
}

export async function runAll(): Promise<CollectorResult[]> {
  const results: CollectorResult[] = [];
  for (const collector of collectors) {
    try {
      const data = await collector.run();
      results.push({ name: collector.name, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Investment] ${collector.name} 失败:`, message);
      results.push({ name: collector.name, error: message });
    }
  }
  return results;
}
