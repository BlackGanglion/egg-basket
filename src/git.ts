import { execSync } from 'child_process';
import { getDateStr } from './collect';

export function pushResult() {
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
}
