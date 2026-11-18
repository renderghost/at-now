import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { HOME_URL } from './NowFallback.constants';
import { link, text } from './NowFallback.styles';
import type { NowFallbackProps } from './NowFallback.types';

/** Shown when the API fails or returns nothing at all. */
export const NowFallback: React.FC<NowFallbackProps> = ({ className }) => (
  <Card className="lg:w-2/3">
  <p className={mergeClasses(text, className)}>
    I can’t fetch what I’ve been up to right now. Have a look around{' '}
    <a href={HOME_URL} className={link}>
      renderg.host
    </a>{' '}
    instead.
  </p>
  </Card>
);
