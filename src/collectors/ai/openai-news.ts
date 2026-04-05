import { Collector, BlogItem } from '../../types';
import { fetchPageContent } from '../../infra/jina';

const OPENAI_RSS_URL = 'https://openai.com/news/rss.xml';
const LOOKBACK_HOURS = 24;

const openaiNews: Collector = {
  name: 'openai-news',

  async run(): Promise<BlogItem[]> {
    const res = await fetch(OPENAI_RSS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${OPENAI_RSS_URL}`);
    const xml = await res.text();

    const candidates: { title: string; url: string; pubDate: string; description: string }[] = [];
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
        url: get('link'),
        pubDate,
        description: get('description'),
      });
    }

    const items: BlogItem[] = [];
    for (const c of candidates) {
      let content = c.description;
      try {
        content = await fetchPageContent(c.url);
      } catch (err) {
        console.error(`[openai-news] 获取文章详情失败: ${c.url}`, err instanceof Error ? err.message : err);
      }
      items.push({
        source: 'blog',
        name: 'OpenAI News',
        title: c.title,
        url: c.url,
        publishedAt: c.pubDate ? new Date(c.pubDate).toISOString() : null,
        author: '',
        description: c.description,
        content,
      });
    }

    return items;
  },
};

export default openaiNews;
