/** Small helpers shared by the theme selectors. */

/** The token after '#' in a lexicon value, e.g. 'id.sifa.defs#remote' → 'remote'. */
export const tokenOf = (value?: string): string | undefined =>
  value ? value.split('#').pop() : undefined;

export const rkeyOf = (uri: string): string => uri.split('/').pop() ?? '';

export const didOf = (uri: string): string => uri.split('/')[2] ?? '';

/** Sorts by a date, newest first. */
export const newestFirst = <T>(items: T[], dateOf: (item: T) => Date): T[] =>
  [...items].sort((a, b) => dateOf(b).getTime() - dateOf(a).getTime());

/** Joins non-empty, non-repeated parts. */
export const joinParts = (parts: (string | undefined)[], sep = ', '): string | undefined => {
  const kept = parts.filter((p): p is string => Boolean(p && p.trim()));
  const unique = kept.filter((p, i) => kept.indexOf(p) === i);
  return unique.length ? unique.join(sep) : undefined;
};
