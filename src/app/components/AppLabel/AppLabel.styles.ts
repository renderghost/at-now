const base =
  'font-sans font-medium text-sm leading-[24px] ' +
  'underline decoration-dotted underline-offset-4 hover:decoration-solid ' +
  'focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow focus-visible:outline-offset-4';

export const label = {
  onLight: `${base} text-dimgray hover:text-black`,
  onBlue: `${base} text-white-83 hover:text-white`,
} as const;
