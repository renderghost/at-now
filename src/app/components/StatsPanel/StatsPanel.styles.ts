export const wrapper = 'flex flex-col items-start gap-16 w-full';

// Same overline as theme sections.
export const title = 'font-sans font-black text-2xl leading-[32px] text-black';

export const grid = 'grid grid-cols-1 sm:grid-cols-3 gap-32 w-full';

export const group = 'flex flex-col gap-16 items-start';

export const groupTitle =
  'font-sans font-semibold text-base leading-[24px] text-dimgray tracking-[1px] uppercase';

// Two-up on phones; one column per group from sm.
export const list = 'grid grid-cols-2 gap-16 w-full sm:flex sm:flex-col';

// dt follows dd in the DOM so screen readers read label then value;
// column-reverse shows the value first, packed to the top of the cell.
export const stat = 'flex flex-col-reverse justify-end';

export const value =
  'font-sans font-black text-2xl leading-[32px] sm:text-[32px] sm:leading-[40px] text-black break-words';

export const label = 'font-sans font-medium text-base leading-[24px] text-dimgray';
