import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The page uses one type scale: 16, 24, 32, 40 or 48px.
const ALLOWED = new Set(['text-base', 'text-2xl', 'text-[32px]', 'text-[40px]', 'text-[48px]']);
const SIZE = /(?:^|[\s'"`:])((?:[a-z]+:)*text-(?:xs|sm|base|lg|xl|[2-9]xl|\[\d+(?:px|rem)\]))(?=[\s'"`]|$)/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('type scale', () => {
  it('uses only 16, 24, 32, 40 and 48px text', () => {
    const offenders: string[] = [];
    for (const file of files(join(process.cwd(), 'src/app'))) {
      for (const match of readFileSync(file, 'utf8').matchAll(SIZE)) {
        const utility = match[1].split(':').pop()!;
        if (!ALLOWED.has(utility)) offenders.push(`${file.split('src/app/')[1]}: ${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
