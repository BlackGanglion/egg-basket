import { Collector, CollectorResult } from '../../types';
import { runWithRetry } from '../../retry';

const collectors: Collector[] = [];

export function register(collector: Collector) {
  collectors.push(collector);
}

export async function runAll(): Promise<CollectorResult[]> {
  return Promise.all(collectors.map((c) => runWithRetry(c)));
}
