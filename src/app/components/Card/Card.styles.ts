import type { CardProps } from './Card.types';

// The one card used everywhere: white on whitesmoke, as renderg.host/career.
export const base = 'flex flex-col items-start w-full h-full overflow-hidden';

export const tone: Record<NonNullable<CardProps['tone']>, string> = {
  white: 'bg-white',
  yellow: 'bg-yellow',
};

export const padding: Record<NonNullable<CardProps['padding']>, string> = {
  default: 'gap-16 p-24 sm:p-32',
  compact: 'gap-8 p-16 sm:p-24',
  none: '',
};
