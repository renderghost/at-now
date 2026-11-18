import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  as?: 'article' | 'div' | 'section';
  /** 'default' p-24/p-32, 'compact' p-16/p-24 (media grids), 'none' (full-bleed media). */
  padding?: 'default' | 'compact' | 'none';
  /** 'tint' is for a card nested inside a white card. */
  tone?: 'white' | 'tint';
  className?: string;
}
