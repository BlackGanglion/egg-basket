# egg-basket

定时收集信息，包括 AI 和投资两大部分。每天北京时间早上 8 点执行，结果写入 `result/YYYYMMDD.json`。

## 数据来源

### AI

- [follow-builders](https://github.com/zarazhangrui/follow-builders) — 聚合 AI 领域 builders 的 X/Twitter 动态、播客内容和博客文章
  - X: Andrej Karpathy, Swyx, Josh Woodward, Kevin Weil, Peter Yang, Nan Yu, Madhu Guru, Amanda Askell, Cat Wu, Thariq, Google Labs, Amjad Masad, Guillermo Rauch, Alex Albert, Aaron Levie, Ryo Lu, Garry Tan, Matt Turck, Zara Zhang, Nikunj Kothari, Peter Steinberger, Dan Shipper, Aditya Agarwal, Sam Altman, Claude
  - Podcasts: Latent Space, Training Data, No Priors, Unsupervised Learning, The MAD Podcast with Matt Turck, AI & I by Every
  - Blogs: Anthropic Engineering, Claude Blog
- [OpenAI News](https://openai.com/news/rss.xml) — OpenAI 官方新闻 RSS，通过 Jina Reader 获取文章全文
- [Yage AI](https://yage.ai/feeds/atom.xml) — Yage AI 博客 Atom feed
- [Google AI Blog](https://blog.google/innovation-and-ai/technology/ai/rss/) — Google AI 官方博客 RSS，通过 Jina Reader 获取文章全文
- [Google DeepMind](https://deepmind.google/blog/rss.xml) — Google DeepMind 博客 RSS，通过 Jina Reader 获取文章全文
- [宝玉的工程技术分享](https://s.baoyu.io/feed.xml) — 宝玉博客 RSS，通过 Jina Reader 获取文章全文
- [TLDR AI](https://bullrich.dev/tldr-rss/ai.rss) — TLDR AI 每日摘要 RSS，通过 Jina Reader 获取原文全文

### Investment

（待补充）

## 使用

```bash
pnpm install
pnpm start
```
