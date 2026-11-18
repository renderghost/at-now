import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  as?: 'article' | 'div' | 'section';
  /** 'default' p-24/p-32, 'compact' p-16/p-24 (media grids), 'none' (full-bleed media). */
  padding?: 'default' | 'compact' | 'none';
  /** 'yellow' is reserved for the featured Now card (the Now badge colour). */
  tone?: 'white' | 'yellow';
  className?: string;
}
