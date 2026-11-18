export const summary = (plays: number): string =>
  `${plays} ${plays === 1 ? 'play' : 'plays'} in the last 30 days`;
