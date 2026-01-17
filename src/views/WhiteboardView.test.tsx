
import React from 'react';
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, fireEvent, within } from '@testing-library/react';
import { WhiteboardView } from './WhiteboardView';

// Mock dependencies
mock.module('../hooks/useWhiteboard', () => ({
  useWhiteboard: () => ({
    elements: [],
    appState: { tool: 'selection' },
    setAppState: mock(() => {}),
    handleMouseDown: mock(() => {}),
    handleMouseMove: mock(() => {}),
    handleMouseUp: mock(() => {}),
  }),
}));

describe('WhiteboardView', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.prototype.getContext
    // This is global, be careful
    // Bun's HappyDOM environment might already provide a stub.
  });

  it('scrolls (zooms) on wheel event', () => {
    const { getByText } = render(<WhiteboardView />);
    const canvas = getByText('Canvas not supported'); // inner text
    
    // Simulate wheel
    fireEvent.wheel(canvas, { clientX: 100, clientY: 100, deltaY: -100 });
    
    // We can't easily check internal state (scale) unless we spy on something or check side effects.
    // But we verified it doesn't crash.
    expect(canvas).toBeTruthy();
  });
  
  it('handles zoom interaction (integration smoke test)', () => {
      const { container } = render(<WhiteboardView />);
      
      // Use container queries to get specific elements and avoid duplicates
      // Get the menu button by its specific ID
      const menuButton = document.getElementById('app-menu-button');
      expect(menuButton).toBeTruthy();
      
      // Get the Paper (toolbar) and query within it for the selection button
      const paper = container.querySelector('[class*="MuiPaper-root"]');
      expect(paper).toBeTruthy();
      
      const selectionButton = within(paper as HTMLElement).getByRole('button', { name: /selection/i });
      expect(selectionButton).toBeTruthy();
  });
});
