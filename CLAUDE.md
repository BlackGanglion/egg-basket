# egg-basket

定时信息收集项目，使用 node-cron 调度，pnpm + TypeScript + tsx 运行。

## 项目结��

- `src/index.ts` — 入口，定时调度 + 结果写入 `result/YYYYMMDD.json`
- `src/collectors/ai/` — AI 相关收集器
- `src/collectors/investment/` — 投资相关收集器
- `src/infra/` — 基础设施（如 Jina Reader API）
- `src/types.ts` — 公共类型定义

## 规则

- 增加新的信息源时，必须同步更新 README.md 的数据来源部分
