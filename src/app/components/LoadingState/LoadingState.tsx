import React from 'react';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { BLOCKS, LABEL } from './LoadingState.constants';
import { block, srOnly, wrapper } from './LoadingState.styles';
import type { LoadingStateProps } from './LoadingState.types';

export const LoadingState: React.FC<LoadingStateProps> = ({ className }) => (
  <div className={mergeClasses(wrapper, className)} aria-busy="true" role="status">
    <span className={srOnly}>{LABEL}</span>
    {Array.from({ length: BLOCKS }, (_, i) => (
      <div key={i} className={block} />
    ))}
  </div>
);
