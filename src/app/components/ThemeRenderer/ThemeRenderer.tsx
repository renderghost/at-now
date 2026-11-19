import React from 'react';
import { BlockInteractions } from '@/app/components/BlockInteractions/BlockInteractions';
import { BlockListening } from '@/app/components/BlockListening/BlockListening';
import { CardNowBook } from '@/app/components/CardNowBook/CardNowBook';
import { CardNowEvent } from '@/app/components/CardNowEvent/CardNowEvent';
import { CardNowGallery } from '@/app/components/CardNowGallery/CardNowGallery';
import { CardNowPosition } from '@/app/components/CardNowPosition/CardNowPosition';
import { CardNowPost } from '@/app/components/CardNowPost/CardNowPost';
import { CardNowSaved } from '@/app/components/CardNowSaved/CardNowSaved';
import { CardNowTrack } from '@/app/components/CardNowTrack/CardNowTrack';
import { CardNowWriting } from '@/app/components/CardNowWriting/CardNowWriting';
import { RowNowRepo } from '@/app/components/RowNowRepo/RowNowRepo';
import { ThemeSection } from '@/app/components/ThemeSection/ThemeSection';
import { THEME_TITLES } from '@/app/components/ThemeSection/ThemeSection.constants';
import type { Theme } from '@/core/types';
import { postingSummary } from './ThemeRenderer.constants';
import * as styles from './ThemeRenderer.styles';
import type { ThemeRendererProps } from './ThemeRenderer.types';

function body(theme: Theme, now: Date): React.ReactNode {
  switch (theme.id) {
    case 'working':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowPosition item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'going':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowEvent item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'writing':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowWriting item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'making':
      return (
        <div className={styles.subBlocks}>
          {theme.tracks.length > 0 && (
            <div className={styles.subBlock}>
              <p className={styles.subtitle}>Music</p>
              <ul className={styles.stack}>
                {theme.tracks.map((item) => (
                  <li key={item.key}>
                    <CardNowTrack item={item} now={now} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {theme.repos.length > 0 && (
            <div className={styles.subBlock}>
              <p className={styles.subtitle}>Code</p>
              <ul className={styles.stack}>
                {theme.repos.map((item) => (
                  <li key={item.key}>
                    <RowNowRepo item={item} now={now} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    case 'photographing':
      return (
        <ul className={styles.stack}>
          {theme.galleries.map((item) => (
            <li key={item.key}>
              <CardNowGallery item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'reading':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowBook item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'listening':
      return <BlockListening theme={theme} now={now} />;
    case 'posting':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowPost item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'saving':
      return (
        <ul className={styles.stack}>
          {theme.items.map((item) => (
            <li key={item.key}>
              <CardNowSaved item={item} now={now} />
            </li>
          ))}
        </ul>
      );
    case 'social': {
      return (
        <div className={styles.stack}>
          {theme.following && (
            <BlockInteractions title="Following" verb="Followed" noun="people" block={theme.following} now={now} />
          )}
          {theme.subscribed && (
            <BlockInteractions
              title="Subscribed"
              verb="Subscribed to"
              noun="publications"
              block={theme.subscribed}
              now={now}
            />
          )}
          {theme.appreciated && (
            <BlockInteractions
              title="Appreciated"
              verb="Appreciated"
              noun="things"
              block={theme.appreciated}
              now={now}
            />
          )}
        </div>
      );
    }
  }
}

/** Renders one theme as a titled section. */
export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ theme, now }) => (
  <ThemeSection
    id={theme.id}
    title={THEME_TITLES[theme.id]}
    summary={theme.id === 'posting' ? postingSummary(theme.weekCount, theme.weekReplies) : undefined}
  >
    {body(theme, now)}
  </ThemeSection>
);
