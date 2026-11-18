import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import type { CountItem } from '@/core/types';
import { summary } from './BlockListening.constants';
import * as styles from './BlockListening.styles';
import type { BlockListeningProps } from './BlockListening.types';

const Ranked: React.FC<{ title: string; items: CountItem[] }> = ({ title, items }) => (
  <div className="flex flex-col gap-8">
    <p className={styles.listTitle}>{title}</p>
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.label} className={styles.entry}>
          {item.label}
          {item.sublabel ? ` — ${item.sublabel}` : ''} <span className={styles.count}>× {item.count}</span>
        </li>
      ))}
    </ol>
  </div>
);

export const BlockListening: React.FC<BlockListeningProps> = ({ theme, now }) => (
  <div className={styles.wrapper}>
    <p className={styles.entry}>{summary(theme.playCount)}</p>
    <div className={styles.columns}>
      {theme.topArtists.length > 0 && <Ranked title="Top artists" items={theme.topArtists} />}
      {theme.topTracks.length > 0 && <Ranked title="Top tracks" items={theme.topTracks} />}
    </div>
    {theme.lastPlayed && (
      <div className={styles.last}>
        <p className={styles.lastText}>
          Last played: {theme.lastPlayed.track}
          {theme.lastPlayed.artist ? ` — ${theme.lastPlayed.artist}` : ''}
        </p>
        <ItemMeta at={theme.lastPlayed.at} app={theme.lastPlayed.app} now={now} />
      </div>
    )}
  </div>
);
