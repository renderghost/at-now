// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link } from '@/app/components/Link/Link';
import { SafeBoundary } from '@/app/components/SafeBoundary/SafeBoundary';

afterEach(cleanup);

describe('Link with a malformed URL', () => {
  it('renders instead of throwing', () => {
    render(<Link href="https://my blog.com" label="My blog" />);
    expect(screen.getByText('My blog')).toBeTruthy();
  });
});

describe('SafeBoundary', () => {
  it('hides a section that fails to render and keeps its siblings', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('bad record');
    };
    render(
      <div>
        <SafeBoundary name="broken">
          <Broken />
        </SafeBoundary>
        <SafeBoundary name="fine">
          <p>Still here</p>
        </SafeBoundary>
      </div>
    );
    spy.mockRestore();
    expect(screen.getByText('Still here')).toBeTruthy();
  });
});
