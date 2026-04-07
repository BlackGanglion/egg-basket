import { Collector, BlogItem } from '../../types';
import { hasState, getSeenUrls, markSeen } from '../../infra/state';

const YAGE_ATOM_URL = 'https://yage.ai/feeds/atom.xml';
const FALLBACK_HOURS = 24;
const COLLECTOR_NAME = 'yage-ai';

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const yageAI: Collector = {
  name: COLLECTOR_NAME,

  async run(): Promise<BlogItem[]> {
    const res = await fetch(YAGE_ATOM_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${YAGE_ATOM_URL}`);
    const xml = await res.text();

    const seen = getSeenUrls(COLLECTOR_NAME);
    const hasLocalState = hasState(COLLECTOR_NAME);
    const cutoff = Date.now() - FALLBACK_HOURS * 60 * 60 * 1000;

    const items: BlogItem[] = [];
    const allUrls: string[] = [];
    const newUrls: string[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const getTag = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].trim() : '';
      };
      const getAttr = (tag: string, attr: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, 'i'));
        return m ? m[1] : '';
      };

      const url = getAttr('link', 'href');
      const published = getTag('published');
      allUrls.push(url);

      if (hasLocalState) {
        if (seen.has(url)) continue;
      } else {
        if (published && new Date(published).getTime() < cutoff) continue;
      }

      const contentHtml = getTag('content');
      const summaryHtml = getTag('summary');

      items.push({
        source: 'blog',
        name: 'Yage AI',
        title: getTag('title'),
        url,
        publishedAt: published ? new Date(published).toISOString() : null,
        author: getTag('name'),
        description: stripHtml(summaryHtml).slice(0, 300),
        content: stripHtml(contentHtml || summaryHtml),
      });
      newUrls.push(url);
    }

    markSeen(COLLECTOR_NAME, hasLocalState ? newUrls : allUrls);

    return items;
  },
};

export default yageAI;
