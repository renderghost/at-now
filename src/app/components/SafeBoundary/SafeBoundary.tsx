import React from 'react';
import type { SafeBoundaryProps, SafeBoundaryState } from './SafeBoundary.types';

/**
 * Renders nothing if its section throws, so one bad remote record hides only
 * that section (as an empty theme would be hidden) instead of the whole page.
 */
export class SafeBoundary extends React.Component<SafeBoundaryProps, SafeBoundaryState> {
  state: SafeBoundaryState = { failed: false };

  static getDerivedStateFromError(): SafeBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(`[now] ${this.props.name} failed to render:`, error);
  }

  render(): React.ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
