// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/app/App';

describe('App shell', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 500 }))
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the page title', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Now' })
    ).toBeTruthy();
  });

  it('links back to renderg.host', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /renderg\.host/ });
    expect(link.getAttribute('href')).toBe('https://renderg.host/');
  });

  it('keeps legal links', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: 'Impressum' });
    expect(link.getAttribute('href')).toBe('https://renderg.host/impressum');
  });
});
