import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { NowImage } from '@/app/components/NowImage/NowImage';
import { StatusLine } from '@/app/components/StatusLine/StatusLine';
import { mergeClasses } from '@/app/lib/mergeClasses';
import * as styles from './ProfileIdentity.styles';
import type { ProfileIdentityProps } from './ProfileIdentity.types';

/** Barry's Bluesky profile as a card: banner, avatar, name, bio, status. */
export const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profile, status, now }) => {
  const name = profile.displayName ?? profile.handle;
  const details = [profile.pronouns, profile.location].filter(Boolean);
  const hasBanner = Boolean(profile.bannerUrl);

  return (
    <Card padding="none">
      {hasBanner && <NowImage src={profile.bannerUrl} alt="" className={styles.banner} />}
      <div className={mergeClasses(styles.body, !hasBanner && styles.bodyNoBanner)}>
        {profile.avatarUrl &&
          (hasBanner ? (
            <div className={styles.avatarSlot}>
              <img src={profile.avatarUrl} alt={name} className={styles.avatarLifted} />
            </div>
          ) : (
            <img src={profile.avatarUrl} alt={name} className={styles.avatar} />
          ))}
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>
          <a href={profile.profileUrl} className={styles.handle} target="_blank" rel="noopener noreferrer">
            @{profile.handle}
          </a>
          {details.map((d) => (
            <React.Fragment key={d}>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <span>{d}</span>
            </React.Fragment>
          ))}
        </p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        {status && (
          <div className={styles.status}>
            <StatusLine status={status} now={now} />
          </div>
        )}
      </div>
    </Card>
  );
};
