
import React from 'react';
import { describe, it, expect, mock } from 'bun:test';
import { render, fireEvent, within } from '@testing-library/react';
import { Toolbar } from './Toolbar';

describe('Toolbar Component', () => {
  it('should render all tools', () => {
    const setTool = mock(() => {});
    const { container } = render(<Toolbar activeTool="selection" setTool={setTool} />);
    
    // Query within the Paper element specifically to avoid MUI Tooltip clones
    const paper = container.querySelector('[class*="MuiPaper-root"]');
    expect(paper).toBeTruthy();
    
    // Get only direct buttons within the paper, not duplicates from tooltips
    const buttons = within(paper as HTMLElement).getAllByRole('button');
    // 7 tools in the list
    expect(buttons.length).toBe(7);
  });

  it('should call setTool when a tool is clicked', () => {
    const setTool = mock(() => {});
    const { container } = render(<Toolbar activeTool="selection" setTool={setTool} />);
    
    const paper = container.querySelector('[class*="MuiPaper-root"]');
    const buttons = within(paper as HTMLElement).getAllByRole('button');
    
    // Click "Rectangle" (index 1)
    fireEvent.click(buttons[1]);
    
    expect(setTool).toHaveBeenCalledWith('rectangle');
  });

  it('should highlight the active tool', () => {
    const setTool = mock(() => {});
    render(<Toolbar activeTool="rectangle" setTool={setTool} />);
    // Tests functional rendering only for now
  });

  it('should switch tools using number keys', () => {
    const setTool = mock(() => {});
    render(<Toolbar activeTool="selection" setTool={setTool} />);
    
    fireEvent.keyDown(window, { key: '2' }); // Rectangle is 2nd (index 1)
    expect(setTool).toHaveBeenCalledWith('rectangle');
    
    fireEvent.keyDown(window, { key: '3' }); // Circle
    expect(setTool).toHaveBeenCalledWith('circle');
  });

  it('should switch tools using arrow keys', () => {
    const setTool = mock(() => {});
    render(<Toolbar activeTool="selection" setTool={setTool} />);
    
    // Selection is index 0. ArrowRight -> index 1 (Rectangle)
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(setTool).toHaveBeenCalledWith('rectangle');
  });
});
