import 'dotenv/config';
import { execSync } from 'child_process';
import cron from 'node-cron';
import { collect, getDateStr } from './collect';

async function collectAndPush() {
  await collect();

  try {
    execSync('git add result/', { stdio: 'inherit' });
    const status = execSync('git diff --cached --quiet || echo changed', { encoding: 'utf-8' }).trim();
    if (status === 'changed') {
      const dateStr = getDateStr();
      execSync(`git commit -m "chore: add result ${dateStr}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('已推送到 main 分支');
    } else {
      console.log('result 无变更，跳过提交');
    }
  } catch (err) {
    console.error('git push 失败:', err instanceof Error ? err.message : err);
  }
}

// 每天北京时间早上 8 点执行 (UTC 0:00)
cron.schedule('0 0 * * *', collectAndPush);

console.log('egg-basket 已启动，等待定时任务执行...');

// 启动时立即执行一次
collectAndPush();
