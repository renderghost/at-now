export const row = 'flex flex-wrap items-center gap-x-8 gap-y-4';

const small = 'font-sans font-medium text-sm leading-[24px]';

export const time = {
  onLight: `${small} text-dimgray`,
  onBlue: `${small} text-white-83`,
} as const;

export const separator = {
  onLight: `${small} text-dimgray select-none`,
  onBlue: `${small} text-white-83 select-none`,
} as const;
