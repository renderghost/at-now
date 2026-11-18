export const banner = 'w-full aspect-[3/1] max-h-[200px] object-cover';

export const body = 'flex flex-col gap-16 items-start w-full px-24 sm:px-32 pb-24 sm:pb-32';

export const bodyNoBanner = 'pt-24 sm:pt-32';

// With a banner, the avatar overlaps its lower edge: a half-height slot holds
// the avatar, lifted by half its size.
export const avatarSlot = 'h-[48px] w-full';

export const avatarLifted =
  'w-[96px] h-[96px] rounded-circular object-cover ring-4 ring-whitesmoke -translate-y-1/2';

export const avatar = 'w-[96px] h-[96px] rounded-circular object-cover';

export const name = 'font-sans font-black text-3xl leading-[40px] text-black';

export const meta =
  'flex flex-wrap items-center gap-x-8 gap-y-4 font-sans font-medium text-base leading-[28px] text-dimgray';

export const separator = 'select-none';

export const handle =
  'font-bold text-mediumblue hover:text-blue underline decoration-dotted underline-offset-4 hover:decoration-solid ' +
  'focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow focus-visible:outline-offset-4';

export const bio =
  'font-sans font-medium text-base leading-[28px] text-black whitespace-pre-line break-words';

export const status = 'bg-white p-16 w-full';
