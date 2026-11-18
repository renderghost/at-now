import React from 'react';
import { DEFAULT_ICON, SAME_SITE_HOST } from './Link.constants';
import { getLinkStyles, iconStyles, labelStyles, labelWrapStyles } from './Link.styles';
import type { LinkProps } from './Link.types';

/** renderg.host and its subdomains open in the same tab. */
function isOffSite(href: string): boolean {
  if (!/^https?:\/\//.test(href)) return false;
  const host = new URL(href).hostname;
  return host !== SAME_SITE_HOST && !host.endsWith(`.${SAME_SITE_HOST}`);
}

export const Link: React.FC<LinkProps> = ({
  href,
  label,
  color = 'blue',
  size = 'base',
  icon = 'none',
  iconChar = DEFAULT_ICON,
  className,
  wrap = false,
}) => {
  const isExternal = isOffSite(href);

  const linkClass = getLinkStyles(color, size, className);
  const iconEl = <span className={iconStyles}>{iconChar}</span>;

  const content = (
    <>
      {icon === 'left' && iconEl}
      <span className={wrap ? labelWrapStyles : labelStyles}>{label}</span>
      {icon === 'right' && iconEl}
    </>
  );

  return (
    <a
      href={href}
      className={linkClass}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  );
};
