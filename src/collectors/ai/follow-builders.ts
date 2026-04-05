import { Collector } from '../../types';

const FEED_URLS = {
  x: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json',
  podcasts: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json',
  blogs: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-blogs.json',
};

async function fetchJSON(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json() as Promise<Record<string, unknown>>;
}

const followBuilders: Collector = {
  name: 'follow-builders',

  async run() {
    const [xFeed, podcastsFeed, blogsFeed] = await Promise.all([
      fetchJSON(FEED_URLS.x),
      fetchJSON(FEED_URLS.podcasts),
      fetchJSON(FEED_URLS.blogs),
    ]);

    return {
      x: xFeed.x ?? [],
      podcasts: podcastsFeed.podcasts ?? [],
      blogs: blogsFeed.blogs ?? [],
    };
  },
};

export default followBuilders;
