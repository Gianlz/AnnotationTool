
import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useWhiteboard } from './useWhiteboard';

describe('useWhiteboard Hook', () => {
  it('should initialize with empty elements and selection tool', () => {
    const { result } = renderHook(() => useWhiteboard());
    
    expect(result.current.elements).toEqual([]);
    expect(result.current.appState.tool).toBe('selection');
    expect(result.current.action).toBe('none');
  });

  it('should switch tools', () => {
    const { result } = renderHook(() => useWhiteboard());
    
    act(() => {
        result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
    });
    
    expect(result.current.appState.tool).toBe('rectangle');
  });

  it('should start drawing when mouse down with drawing tool', () => {
    const { result } = renderHook(() => useWhiteboard());
    
    // Set tool to rectangle
    act(() => {
        result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
    });

    // Mouse down
    act(() => {
        result.current.handleMouseDown(10, 10);
    });

    expect(result.current.elements.length).toBe(1);
    expect(result.current.action).toBe('drawing');
    expect(result.current.elements[0].type).toBe('rectangle');
    expect(result.current.elements[0].x).toBe(10);
  });

  it('should update element while drawing (mouse move)', () => {
    const { result } = renderHook(() => useWhiteboard());
    
    // Start drawing
    act(() => {
        result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
    });
    act(() => {
        result.current.handleMouseDown(10, 10);
    });

    // Move mouse
    act(() => {
        result.current.handleMouseMove(50, 60);
    });

    const el = result.current.elements[0];
    // width = 50 - 10 = 40, height = 60 - 10 = 50
    expect(el.width).toBe(40);
    expect(el.height).toBe(50);
  });

  it('should normalize element on mouse up', () => {
    const { result } = renderHook(() => useWhiteboard());
    
    // Start drawing backward (bottom-right to top-left)
    act(() => {
        result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
    });
    act(() => {
        result.current.handleMouseDown(100, 100);
    });
    act(() => {
        result.current.handleMouseMove(0, 0);
    });

    const elBefore = result.current.elements[0];
    expect(elBefore.width).toBe(-100);

    // Mouse up
    act(() => {
        result.current.handleMouseUp();
    });

    const elAfter = result.current.elements[0];
    // Should be normalized
    expect(elAfter.x).toBe(0);
    expect(elAfter.y).toBe(0);
    expect(elAfter.width).toBe(100);
    expect(elAfter.height).toBe(100);
    expect(result.current.action).toBe('none');
  });
  
  it('should select element on click if tool is selection', () => {
      const { result } = renderHook(() => useWhiteboard());

      // 1. Create an element first
      act(() => {
          result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
      });
      act(() => {
          // Create rect at 0,0 50x50
          result.current.handleMouseDown(0, 0);
      });
      act(() => {
          result.current.handleMouseMove(50, 50);
      });
      act(() => {
          result.current.handleMouseUp();
      });

      // 2. Switch to selection
      act(() => {
          result.current.setAppState(prev => ({ ...prev, tool: 'selection' }));
      });

      // 3. Click on element (at 25, 25)
      act(() => {
          result.current.handleMouseDown(25, 25);
      });

      expect(result.current.appState.selection).not.toBeNull();
      expect(result.current.appState.selection?.id).toBe(result.current.elements[0].id);
  });

  it('should handle undo and redo', () => {
    const { result } = renderHook(() => useWhiteboard());

    // 1. Draw Rect 1
    act(() => {
        result.current.setAppState(prev => ({ ...prev, tool: 'rectangle' }));
    });
    act(() => {
        result.current.handleMouseDown(0, 0);
    });
    act(() => {
        result.current.handleMouseMove(50, 50);
    });
    act(() => {
        result.current.handleMouseUp();
    });
    expect(result.current.elements.length).toBe(1);

    // 2. Draw Rect 2
    act(() => {
        result.current.handleMouseDown(100, 100);
    });
    act(() => {
        result.current.handleMouseMove(150, 150);
    });
    act(() => {
        result.current.handleMouseUp();
    });
    expect(result.current.elements.length).toBe(2);

    // 3. Undo (Remove Rect 2)
    act(() => {
        result.current.undo();
    });
    expect(result.current.elements.length).toBe(1);

    // 4. Undo (Remove Rect 1 - back to empty)
    act(() => {
        result.current.undo();
    });
    expect(result.current.elements.length).toBe(0);

    // 5. Redo (Restore Rect 1)
    act(() => {
        result.current.redo();
    });
    expect(result.current.elements.length).toBe(1);

    // 6. Redo (Restore Rect 2)
    act(() => {
        result.current.redo();
    });
    expect(result.current.elements.length).toBe(2);
  });
});
