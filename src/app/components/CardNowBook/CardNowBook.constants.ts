import type { BookItem } from '@/core/types';

export const TOTAL_STARS = 5;
export const STAR_CHAR = '★';

export const STATUS_LABELS: Record<BookItem['status'], string> = {
  reading: 'Reading',
  finished: 'Finished',
  wantToRead: 'Want to read',
};

export const DATE_PREFIX: Record<BookItem['status'], string> = {
  reading: 'started',
  finished: 'finished',
  wantToRead: 'added',
};
