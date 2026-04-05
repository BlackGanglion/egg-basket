import 'dotenv/config';
import cron from 'node-cron';
import { collect } from './collect';
import { pullLatest, pushResult } from './git';

async function collectAndPush() {
  try {
    pullLatest();
  } catch (err) {
    console.error('git pull 失败:', err instanceof Error ? err.message : err);
  }

  const success = await collect();

  if (success) {
    try {
      pushResult();
    } catch (err) {
      console.error('git push 失败:', err instanceof Error ? err.message : err);
    }
  }
}

// 每天北京时间早上 8 点执行
cron.schedule('0 8 * * *', collectAndPush, { timezone: 'Asia/Shanghai' });

console.log('egg-basket 已启动，等待定时任务执行...');

// 启动时立即执行一次
collectAndPush();
