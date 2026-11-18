import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { Link } from '@/app/components/Link/Link';
import { NOW_ABOUT_URL, TITLE, sentence } from './AboutBlock.constants';
import * as styles from './AboutBlock.styles';
import type { AboutBlockProps } from './AboutBlock.types';

/** What a now page is, and how much of this one comes from the ATmosphere. */
export const AboutBlock: React.FC<AboutBlockProps> = ({ footprint }) => (
  <section className={styles.wrapper} aria-labelledby="about">
    <h2 id="about" className={styles.heading}>
      {TITLE}
    </h2>
    <Card>
      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={styles.text}>
            A now page says what I’m focused on at this point in my life, an idea from Derek
            Sivers’{' '}
            <a href={NOW_ABOUT_URL} className={styles.inlineLink} target="_blank" rel="noopener noreferrer">
              nownownow.com
            </a>
            .
          </p>
          <p className={styles.text}>
            Unlike most, this one writes itself from my open social data on the AT Protocol. It
            covers the last 30 days, with anything from the past week marked Now.
          </p>
        </div>
        <div className={styles.column}>
          <p className={styles.text}>
            {sentence(footprint.collections, footprint.apps.length, footprint.pdsHost)}
          </p>
          <ul className={styles.list}>
            {footprint.apps.map((app) => (
              <li key={app.id}>
                <Link href={app.url} label={app.name} color="blue" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  </section>
);
