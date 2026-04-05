import { Collector, BlogItem } from '../../types';
import { fetchPageContent } from '../../infra/jina';

const BAOYU_RSS_URL = 'https://s.baoyu.io/feed.xml';
const LOOKBACK_HOURS = 24;

const baoyu: Collector = {
  name: 'baoyu',

  async run(): Promise<BlogItem[]> {
    const res = await fetch(BAOYU_RSS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${BAOYU_RSS_URL}`);
    const xml = await res.text();

    const candidates: { title: string; url: string; pubDate: string; description: string; author: string }[] = [];
    const cutoff = Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000;
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const get = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
          || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].trim() : '';
      };

      const pubDate = get('pubDate');
      if (pubDate && new Date(pubDate).getTime() < cutoff) continue;

      candidates.push({
        title: get('title'),
        url: get('link') || get('guid'),
        pubDate,
        description: get('description').replace(/<[^>]+>/g, '').trim(),
        author: get('author'),
      });
    }

    const items: BlogItem[] = [];
    for (const c of candidates) {
      let content = c.description;
      try {
        content = await fetchPageContent(c.url);
      } catch (err) {
        console.error(`[baoyu] 获取文章详情失败: ${c.url}`, err instanceof Error ? err.message : err);
      }
      items.push({
        source: 'blog',
        name: '宝玉的工程技术分享',
        title: c.title,
        url: c.url,
        publishedAt: c.pubDate ? new Date(c.pubDate).toISOString() : null,
        author: c.author,
        description: c.description,
        content,
      });
    }

    return items;
  },
};

export default baoyu;
