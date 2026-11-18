import React from 'react';
import { heading, section, summary as summaryStyles } from './ThemeSection.styles';
import type { ThemeSectionProps } from './ThemeSection.types';

export const ThemeSection: React.FC<ThemeSectionProps> = ({
  id,
  title,
  summary,
  children,
}) => {
  const headingId = `theme-${id}`;
  return (
    <section className={section} aria-labelledby={headingId}>
      <h2 id={headingId} className={heading}>
        {title}
      </h2>
      {summary && <p className={summaryStyles}>{summary}</p>}
      {children}
    </section>
  );
};
