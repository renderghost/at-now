export const wrapper = 'flex flex-col items-start gap-16 w-full';

// Same overline as theme sections.
export const title =
  'font-sans font-semibold text-base leading-[24px] text-dimgray tracking-[1px] uppercase';

export const grid = 'grid grid-cols-1 md:grid-cols-3 gap-8 w-full';

export const groupTitle =
  'font-sans font-semibold text-sm leading-[20px] text-dimgray tracking-[1px] uppercase';

// Two-up on phones; one column per group from sm.
export const list = 'grid grid-cols-2 gap-16 w-full sm:flex sm:flex-col';

// dt follows dd in the DOM so screen readers read label then value;
// column-reverse shows the value first, packed to the top of the cell.
export const stat = 'flex flex-col-reverse justify-end';

export const value =
  'font-sans font-black text-2xl leading-[32px] sm:text-3xl sm:leading-[40px] text-black break-words';

export const label = 'font-sans font-medium text-base leading-[24px] text-dimgray';
