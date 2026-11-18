// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BlockInteractions } from '@/app/components/BlockInteractions/BlockInteractions';
import { BlockListening } from '@/app/components/BlockListening/BlockListening';
import { CardNowGallery } from '@/app/components/CardNowGallery/CardNowGallery';
import { CardNowPost } from '@/app/components/CardNowPost/CardNowPost';
import { CardNowSaved } from '@/app/components/CardNowSaved/CardNowSaved';
import { CardNowTrack } from '@/app/components/CardNowTrack/CardNowTrack';
import { RowNowRepo } from '@/app/components/RowNowRepo/RowNowRepo';
import type {
  GalleryItem,
  InteractionBlock,
  ListeningTheme,
  PostItem,
} from '@/core/types';

const NOW = new Date('2026-11-18T12:00:00Z');
const AT = '2026-11-16T12:00:00.000Z';
afterEach(cleanup);

describe('CardNowTrack', () => {
  it('uses a placeholder without artwork', () => {
    const { container } = render(
      <CardNowTrack
        item={{ key: 't', at: AT, app: 'plyr', title: 'Tin', artist: 'sneptech' }}
        now={NOW}
      />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Tin')).toBeTruthy();
    expect(screen.getByText('sneptech')).toBeTruthy();
  });
});

describe('RowNowRepo', () => {
  it('links the repo name', () => {
    render(
      <RowNowRepo
        item={{ key: 'r', at: AT, app: 'tangled', href: 'https://tangled.org/renderg.host/x', name: 'x', description: 'A thing' }}
        now={NOW}
      />
    );
    expect(screen.getByRole('link', { name: 'x' }).getAttribute('href')).toBe(
      'https://tangled.org/renderg.host/x'
    );
    expect(screen.getByText('A thing')).toBeTruthy();
  });
});

describe('CardNowGallery', () => {
  it('shows five photos and how many more', () => {
    const item: GalleryItem = {
      key: 'g',
      at: AT,
      app: 'grain',
      title: 'Autumn',
      photos: [1, 2, 3, 4, 5].map((i) => ({ url: `https://x/${i}.jpg`, alt: `Photo ${i}` })),
      photoCount: 7,
    };
    render(<CardNowGallery item={item} now={NOW} />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByText('+2 more')).toBeTruthy();
  });
});

describe('BlockListening', () => {
  it('summarises plays and the last track', () => {
    const theme: ListeningTheme = {
      id: 'listening',
      playCount: 13,
      topArtists: [{ label: 'gggiiirrrlllsss', count: 12 }],
      topTracks: [{ label: 'Diamond Sirens', sublabel: 'gggiiirrrlllsss', count: 3 }],
      lastPlayed: { key: 'p', at: AT, app: 'teal', track: 'nai palm', artist: 'nate' },
    };
    render(<BlockListening theme={theme} now={NOW} />);
    expect(screen.getByText('13 plays in the last 30 days')).toBeTruthy();
    expect(screen.getByText(/Last played: nai palm — nate/)).toBeTruthy();
    expect(screen.getByText('Top artists')).toBeTruthy();
  });
});

describe('CardNowPost', () => {
  const post: PostItem = { key: 'p', at: AT, app: 'bluesky', href: 'https://bsky.app/x', text: 'Hello world', images: [] };

  it('renders plain text posts without media', () => {
    const { container } = render(<CardNowPost item={post} now={NOW} />);
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders external link cards', () => {
    render(
      <CardNowPost
        item={{ ...post, external: { uri: 'https://github.com/xyflow/strudel-flow', title: 'Strudel Flow' } }}
        now={NOW}
      />
    );
    expect(screen.getByRole('link', { name: /Strudel Flow/ }).getAttribute('href')).toBe(
      'https://github.com/xyflow/strudel-flow'
    );
  });
});

describe('CardNowSaved', () => {
  it('shows the note in the saved item', () => {
    render(
      <CardNowSaved
        item={{ key: 's', at: AT, app: 'semble', title: 'renderghost on GitHub', url: 'https://github.com/renderghost', note: 'All my code work' }}
        now={NOW}
      />
    );
    expect(screen.getByText('All my code work')).toBeTruthy();
  });
});

describe('BlockInteractions', () => {
  const block: InteractionBlock = {
    total: 119,
    capped: false,
    byApp: [
      { app: 'bluesky', count: 100 },
      { app: 'grain', count: 17 },
      { app: 'standard', count: 1 },
      { app: 'streamplace', count: 1 },
    ],
    highlights: [{ key: 'h', at: AT, app: 'bluesky', label: 'A post', sublabel: '@someone' }],
  };

  it('summarises totals and the per-app breakdown', () => {
    render(<BlockInteractions title="Appreciated" verb="Appreciated" noun="things" block={block} now={NOW} />);
    expect(screen.getByText('Appreciated 119 things')).toBeTruthy();
    expect(screen.getByText(/100 on Bluesky/)).toBeTruthy();
  });

  it('marks capped counts', () => {
    render(<BlockInteractions title="Appreciated" verb="Appreciated" noun="things" block={{ ...block, capped: true }} now={NOW} />);
    expect(screen.getByText('Appreciated 119+ things')).toBeTruthy();
  });

  it('renders highlights without avatars', () => {
    const { container } = render(
      <BlockInteractions title="Appreciated" verb="Appreciated" noun="things" block={block} now={NOW} />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('A post')).toBeTruthy();
  });
});
