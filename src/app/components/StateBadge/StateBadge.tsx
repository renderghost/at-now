import React from 'react';
import { badge } from './StateBadge.styles';
import type { StateBadgeProps } from './StateBadge.types';

export const StateBadge: React.FC<StateBadgeProps> = ({ label }) => (
  <span className={badge} data-part="state-badge">
    {label}
  </span>
);
