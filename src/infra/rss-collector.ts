import { Collector, BlogItem } from '../types';
import { fetchPageContent } from './jina';
import { hasState, getSeenUrls, markSeen } from './state';

const FALLBACK_HOURS = 24;

interface RSSCollectorConfig {
  name: string;
  displayName: string;
  feedUrl: string;
  useJina?: boolean; // 默认 true
  // 从 item block 中提取 url，默认取 <link>
  extractUrl?: (block: string, get: (tag: string) => string) => string;
  // 从 item block 中提取 author，默认空
  extractAuthor?: (block: string, get: (tag: string) => string) => string;
}

function getTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
    || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}

export function createRSSCollector(config: RSSCollectorConfig): Collector {
  const useJina = config.useJina ?? true;

  return {
    name: config.name,

    async run(): Promise<BlogItem[]> {
      const res = await fetch(config.feedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${config.feedUrl}`);
      const xml = await res.text();

      const seen = getSeenUrls(config.name);
      const hasLocalState = hasState(config.name);
      const cutoff = Date.now() - FALLBACK_HOURS * 60 * 60 * 1000;

      const candidates: { title: string; url: string; pubDate: string; description: string; author: string }[] = [];
      const allUrls: string[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;

      while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const get = (tag: string) => getTag(block, tag);
        const url = config.extractUrl ? config.extractUrl(block, get) : get('link');
        const pubDate = get('pubDate');
        const author = config.extractAuthor ? config.extractAuthor(block, get) : '';

        allUrls.push(url);

        if (hasLocalState) {
          if (seen.has(url)) continue;
        } else {
          if (pubDate && new Date(pubDate).getTime() < cutoff) continue;
        }

        candidates.push({
          title: get('title'),
          url,
          pubDate,
          description: get('description').replace(/<[^>]+>/g, '').trim(),
          author,
        });
      }

      const items: BlogItem[] = [];
      const newUrls: string[] = [];

      for (const c of candidates) {
        let content = c.description;
        if (useJina) {
          try {
            content = await fetchPageContent(c.url);
          } catch (err) {
            console.error(`[${config.name}] 获取文章详情失败: ${c.url}`, err instanceof Error ? err.message : err);
          }
        }
        items.push({
          source: 'blog',
          name: config.displayName,
          title: c.title,
          url: c.url,
          publishedAt: c.pubDate ? new Date(c.pubDate).toISOString() : null,
          author: c.author,
          description: c.description,
          content,
        });
        newUrls.push(c.url);
      }

      // 首次运行记录所有 URL，后续只记录新增
      markSeen(config.name, hasLocalState ? newUrls : allUrls);

      return items;
    },
  };
}
