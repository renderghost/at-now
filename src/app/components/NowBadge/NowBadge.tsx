import React from 'react';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { NOW_LABEL } from './NowBadge.constants';
import { badge } from './NowBadge.styles';
import type { NowBadgeProps } from './NowBadge.types';

export const NowBadge: React.FC<NowBadgeProps> = ({ className }) => (
  <span className={mergeClasses(badge, className)}>{NOW_LABEL}</span>
);
