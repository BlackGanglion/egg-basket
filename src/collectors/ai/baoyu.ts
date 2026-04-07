import { createRSSCollector } from '../../infra/rss-collector';

export default createRSSCollector({
  name: 'baoyu',
  displayName: '宝玉的工程技术分享',
  feedUrl: 'https://s.baoyu.io/feed.xml',
  extractUrl: (_block, get) => get('link') || get('guid'),
  extractAuthor: (_block, get) => get('author'),
});
