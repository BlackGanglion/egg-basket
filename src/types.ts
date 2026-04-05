export interface Collector {
  name: string;
  run(): Promise<unknown>;
}

export interface CollectorResult {
  name: string;
  data?: unknown;
  error?: string;
}

export interface BlogItem {
  source: string;
  name: string;
  title: string;
  url: string;
  publishedAt: string | null;
  author: string;
  description: string;
  content: string;
}
