import { createRSSCollector } from '../../infra/rss-collector';

export default createRSSCollector({
  name: 'openai-news',
  displayName: 'OpenAI News',
  feedUrl: 'https://openai.com/news/rss.xml',
});
