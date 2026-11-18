// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BlockInteractions } from '@/app/components/BlockInteractions/BlockInteractions';
import { CardNowSaved } from '@/app/components/CardNowSaved/CardNowSaved';
import { NowImage } from '@/app/components/NowImage/NowImage';

const NOW = new Date('2026-11-18T12:00:00Z');
const AT = '2026-11-16T12:00:00.000Z';
afterEach(cleanup);

describe('NowImage', () => {
  it('swaps to a placeholder when the image fails to load', () => {
    const { container } = render(
      <NowImage src="https://gone.example/x.png" alt="" className="w-[64px]" />
    );
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-part="image-placeholder"]')).toBeTruthy();
  });

  it('renders a placeholder when there is no source', () => {
    const { container } = render(<NowImage alt="" className="w-[64px]" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-part="image-placeholder"]')).toBeTruthy();
  });
});

describe('saved items with dead preview images', () => {
  it('keep their layout', () => {
    const { container } = render(
      <CardNowSaved
        item={{ key: 's', at: AT, app: 'semble', title: 'radioghost', url: 'https://radio.renderg.host/', imageUrl: 'https://radio.renderg.host/art/og.png' }}
        now={NOW}
      />
    );
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('[data-part="image-placeholder"]')).toBeTruthy();
    expect(screen.getByText('radioghost')).toBeTruthy();
  });
});

describe('interaction highlights', () => {
  it('reserve the avatar slot so rows align', () => {
    const { container } = render(
      <BlockInteractions
        title="Appreciated"
        verb="Appreciated"
        noun="things"
        block={{
          total: 2,
          capped: false,
          byApp: [{ app: 'grain', count: 2 }],
          highlights: [{ key: 'h', at: AT, app: 'grain', label: 'reflections' }],
        }}
        now={NOW}
      />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('[data-part="image-placeholder"]')).toHaveLength(1);
  });
});
