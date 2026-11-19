import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import type { CountItem } from '@/core/types';
import { playsLabel } from './BlockListening.constants';
import * as styles from './BlockListening.styles';
import type { BlockListeningProps } from './BlockListening.types';

const Ranked: React.FC<{ title: string; items: CountItem[] }> = ({ title, items }) => (
  <div className={styles.column}>
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
  <Card>
    <div className={styles.stack}>
      <div className={styles.column}>
        <div className="flex flex-col">
          <p className={styles.big}>{theme.playCount}</p>
          <p className={styles.label}>{playsLabel(theme.playCount)}</p>
        </div>
        {theme.lastPlayed && (
          <>
            <p className={styles.lastText}>
              Last played: {theme.lastPlayed.track}
              {theme.lastPlayed.artist ? ` — ${theme.lastPlayed.artist}` : ''}
            </p>
            <ItemMeta
              at={theme.lastPlayed.at}
              app={theme.lastPlayed.app}
              now={now}
              serviceHref={theme.lastPlayed.serviceHref}
            />
          </>
        )}
      </div>
      <div className={styles.grid}>
        {theme.topArtists.length > 0 && <Ranked title="Top artists" items={theme.topArtists} />}
        {theme.topTracks.length > 0 && <Ranked title="Top tracks" items={theme.topTracks} />}
      </div>
    </div>
  </Card>
);
