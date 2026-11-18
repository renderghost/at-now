// One card system; every grid uses the 8px gap of renderg.host/career.
export const twoUp = 'grid grid-cols-1 md:grid-cols-2 gap-8 w-full';

export const threeUp = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full';

export const mediaGrid = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 w-full';

export const stack = 'flex flex-col gap-8 w-full';

// Posts vary wildly in height: masonry columns instead of equal-height rows.
export const masonry = 'columns-1 md:columns-2 gap-8 w-full';

export const masonryItem = 'break-inside-avoid pb-8';

// Social sub-blocks fill the row whatever their number.
export const socialGrid: Record<number, string> = {
  1: 'grid grid-cols-1 gap-8 w-full lg:w-2/3',
  2: 'grid grid-cols-1 md:grid-cols-2 gap-8 w-full',
  3: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full',
};

export const subBlocks = 'flex flex-col gap-24 w-full';

export const subBlock = 'flex flex-col gap-16 w-full';

export const subtitle =
  'font-sans font-semibold text-sm leading-[20px] text-dimgray tracking-[1px] uppercase';
