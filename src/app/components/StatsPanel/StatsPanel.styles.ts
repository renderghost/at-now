export const wrapper = 'flex flex-col gap-24 w-full';

export const title =
  'font-sans font-semibold text-base leading-[24px] text-white uppercase tracking-[2px]';

export const grid = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-24 sm:gap-32 w-full';

export const group = 'flex flex-col gap-16 items-start';

export const groupTitle =
  'font-sans font-semibold text-sm leading-[20px] text-white-83 uppercase tracking-[1px]';

// Two-up on phones so the band stays short; one column per group from sm.
export const list = 'grid grid-cols-2 gap-16 w-full sm:flex sm:flex-col';

// dt follows dd in the DOM for screen readers' label-then-value order;
// column-reverse shows the value first, packed to the top of the cell.
export const stat = 'flex flex-col-reverse justify-end';

export const statWide = 'col-span-2';

export const value =
  'font-sans font-black text-2xl leading-[32px] sm:text-3xl sm:leading-[40px] text-white break-words';

export const label = 'font-sans font-medium text-base leading-[24px] text-white-83';
