import { createRSSCollector } from '../../infra/rss-collector';

export default createRSSCollector({
  name: 'deepmind',
  displayName: 'Google DeepMind',
  feedUrl: 'https://deepmind.google/blog/rss.xml',
});
