import React, { useState } from 'react';
import { mergeClasses } from '@/app/lib/mergeClasses';
import { placeholder } from './NowImage.styles';
import type { NowImageProps } from './NowImage.types';

/**
 * A lazy image that falls back to a neutral placeholder when there is no
 * source or the source fails (third-party previews often disappear).
 */
export const NowImage: React.FC<NowImageProps> = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className={mergeClasses(placeholder, className)}
        data-part="image-placeholder"
        aria-hidden="true"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};
