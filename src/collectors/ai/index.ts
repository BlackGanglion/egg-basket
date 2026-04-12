import { CollectorResult, BlogItem } from '../../types';
import { runWithRetry } from '../../retry';
import followBuilders from './follow-builders';
import openaiNews from './openai-news';
import yageAI from './yage-ai';
import googleAI from './google-ai';
import deepmind from './deepmind';
import baoyu from './baoyu';

// follow-builders 提供基础的 x、podcasts、blogs
// 其他 blog 收集器的结果会合并到 blogs 中
const baseCollector = followBuilders;
const blogCollectors = [openaiNews, yageAI, googleAI, deepmind, baoyu];

export async function runAll(): Promise<CollectorResult[]> {
  const [baseResult, ...blogResults] = await Promise.all([
    runWithRetry(baseCollector),
    ...blogCollectors.map((c) => runWithRetry(c)),
  ]);

  return [baseResult, ...blogResults];
}

export function mergeAIResults(results: CollectorResult[]) {
  const [baseResult, ...blogResults] = results;

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

  return base;
}
