import React from 'react';
import { Link } from '@/app/components/Link/Link';
import { TITLE, sentence } from './FootprintBlock.constants';
import * as styles from './FootprintBlock.styles';
import type { FootprintBlockProps } from './FootprintBlock.types';

/** How much of this page comes from open AT Protocol apps. */
export const FootprintBlock: React.FC<FootprintBlockProps> = ({ footprint }) => (
  <section className={styles.wrapper} aria-labelledby="footprint">
    <h2 id="footprint" className={styles.heading}>
      {TITLE}
    </h2>
    <p className={styles.text}>
      {sentence(footprint.collections, footprint.apps.length)}
    </p>
    <ul className={styles.list}>
      {footprint.apps.map((app) => (
        <li key={app.id}>
          <Link href={app.url} label={app.name} color="blue" />
        </li>
      ))}
    </ul>
  </section>
);
