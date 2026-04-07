import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const STATE_PATH = join(process.cwd(), 'state.json');

interface State {
  // collector name -> set of seen URLs
  [collector: string]: string[];
}

function load(): State {
  if (!existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function save(state: State) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function hasState(collector: string): boolean {
  const state = load();
  return Array.isArray(state[collector]) && state[collector].length > 0;
}

export function getSeenUrls(collector: string): Set<string> {
  const state = load();
  return new Set(state[collector] ?? []);
}

export function markSeen(collector: string, urls: string[]) {
  const state = load();
  const existing = new Set(state[collector] ?? []);
  for (const url of urls) existing.add(url);
  state[collector] = [...existing];
  save(state);
}
