import { createRSSCollector } from '../../infra/rss-collector';

export default createRSSCollector({
  name: 'tldr-ai',
  displayName: 'TLDR AI',
  feedUrl: 'https://bullrich.dev/tldr-rss/ai.rss',
  extractUrl: (_block, get) => (get('link') || get('guid')).replace(/\?utm_source=\w+/, ''),
});
