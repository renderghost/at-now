import type { InteractionBlock } from '@/core/types';

export interface BlockInteractionsProps {
  title: 'Following' | 'Subscribed' | 'Appreciated';
  verb: 'Followed' | 'Subscribed to' | 'Appreciated';
  noun: 'people' | 'publications' | 'things';
  block: InteractionBlock;
  now: Date;
}
