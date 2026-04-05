import { Collector, CollectorResult, BlogItem } from '../../types';
import followBuilders from './follow-builders';
import openaiNews from './openai-news';
import yageAI from './yage-ai';
import googleAI from './google-ai';
import deepmind from './deepmind';
import baoyu from './baoyu';
import tldrAI from './tldr-ai';

// follow-builders 提供基础的 x、podcasts、blogs
// 其他 blog 收集器的结果会合并到 blogs 中
const baseCollector = followBuilders;
const blogCollectors: Collector[] = [openaiNews, yageAI, googleAI, deepmind, baoyu, tldrAI];

async function safeRun(collector: Collector): Promise<CollectorResult> {
  try {
    const data = await collector.run();
    return { name: collector.name, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[AI] ${collector.name} 失败:`, message);
    return { name: collector.name, error: message };
  }
}

export async function runAll(): Promise<CollectorResult[]> {
  const [baseResult, ...blogResults] = await Promise.all([
    safeRun(baseCollector),
    ...blogCollectors.map(safeRun),
  ]);

  // 将各 blog 收集器的结果合并到 base 的 blogs 中
  const base = (baseResult.data ?? { x: [], podcasts: [], blogs: [] }) as {
    x: unknown[];
    podcasts: unknown[];
    blogs: BlogItem[];
  };

  for (const r of blogResults) {
    if (!r.error && Array.isArray(r.data)) {
      base.blogs.push(...(r.data as BlogItem[]));
    }
  }

  return [{ name: baseCollector.name, data: base }];
}
