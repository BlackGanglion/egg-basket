import { createRSSCollector } from '../../infra/rss-collector';

export default createRSSCollector({
  name: 'google-ai',
  displayName: 'Google AI Blog',
  feedUrl: 'https://blog.google/innovation-and-ai/technology/ai/rss/',
});
