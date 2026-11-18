import React from 'react';
import { ItemRow } from '@/app/components/ItemRow/ItemRow';
import { ThemeSection } from '@/app/components/ThemeSection/ThemeSection';
import { THEME_TITLES } from '@/app/components/ThemeSection/ThemeSection.constants';
import type { ItemBase, Theme } from '@/core/types';
import { list } from './ThemeRenderer.styles';
import type { ThemeRendererProps } from './ThemeRenderer.types';

type Row = ItemBase & { label: string };

function rowsOf(theme: Theme): Row[] {
  switch (theme.id) {
    case 'working':
      return theme.items.map((i) => ({ ...i, label: i.title }));
    case 'going':
      return theme.items.map((i) => ({ ...i, label: i.name }));
    case 'writing':
    case 'reading':
      return theme.items.map((i) => ({ ...i, label: i.title }));
    case 'making':
      return [
        ...theme.repos.map((i) => ({ ...i, label: i.name })),
        ...theme.tracks.map((i) => ({ ...i, label: i.title })),
      ];
    case 'photographing':
      return theme.galleries.map((i) => ({ ...i, label: i.title }));
    case 'listening':
      return theme.lastPlayed ? [{ ...theme.lastPlayed, label: theme.lastPlayed.track }] : [];
    case 'posting':
      return theme.items.map((i) => ({ ...i, label: i.text }));
    case 'saving':
      return theme.items.map((i) => ({ ...i, label: i.title }));
    case 'social':
      return [theme.following, theme.subscribed, theme.appreciated].flatMap(
        (block) => block?.highlights ?? []
      );
  }
}

/** Renders one theme as a titled section. */
export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ theme, now }) => (
  <ThemeSection id={theme.id} title={THEME_TITLES[theme.id]}>
    <ul className={list}>
      {rowsOf(theme).map((row) => (
        <li key={row.key}>
          <ItemRow label={row.label} href={row.href} at={row.at} app={row.app} now={now} />
        </li>
      ))}
    </ul>
  </ThemeSection>
);
