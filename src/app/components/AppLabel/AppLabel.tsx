import React from 'react';
import { APPS } from '@/core/config';
import { label } from './AppLabel.styles';
import type { AppLabelProps } from './AppLabel.types';

/** The source app's name, linking to the item inside that app. */
export const AppLabel: React.FC<AppLabelProps> = ({ app, href }) => {
  const ref = APPS[app];
  return (
    <a href={href ?? ref.url} className={label} target="_blank" rel="noopener noreferrer">
      {ref.name}
    </a>
  );
};
