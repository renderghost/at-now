import React from 'react';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { base, padding as paddingStyles, tone as toneStyles } from './Card.styles';
import type { CardProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  children,
  as: Element = 'div',
  padding = 'default',
  tone = 'white',
  className,
}) => (
  <Element
    data-card=""
    className={mergeClasses(base, toneStyles[tone], paddingStyles[padding], className)}
  >
    {children}
  </Element>
);
