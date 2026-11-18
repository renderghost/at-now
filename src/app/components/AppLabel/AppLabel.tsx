import React from 'react';
import { APPS } from '@/core/config';
import { label } from './AppLabel.styles';
import type { AppLabelProps } from './AppLabel.types';

/** The source app's name, linking to the app. */
export const AppLabel: React.FC<AppLabelProps> = ({ app, tone = 'onLight' }) => {
  const ref = APPS[app];
  return (
    <a href={ref.url} className={label[tone]} target="_blank" rel="noopener noreferrer">
      {ref.name}
    </a>
  );
};
