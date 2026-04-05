import 'dotenv/config';
import cron from 'node-cron';
import { collect } from './collect';
import { pushResult } from './git';

async function collectAndPush() {
  await collect();

  try {
    pushResult();
  } catch (err) {
    console.error('git push 失败:', err instanceof Error ? err.message : err);
  }
}

// 每天北京时间早上 8 点执行 (UTC 0:00)
cron.schedule('0 0 * * *', collectAndPush);

console.log('egg-basket 已启动，等待定时任务执行...');

// 启动时立即执行一次
collectAndPush();
