
import { describe, it, expect } from 'bun:test';
import { 
  createElement, 
  distance, 
  adjustElementCoordinates, 
  cursorForPosition,
  resizedCoordinates
} from './elementUtils';

describe('elementUtils', () => {
  describe('createElement', () => {
    it('should create a rectangle element', () => {
      const element = createElement('1', 0, 0, 100, 100, 'rectangle');
      expect(element).toEqual({
        id: '1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        strokeColor: '#111111',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
        seed: expect.any(Number),
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      });
    });

    it('should create an element with custom options', () => {
      const element = createElement('2', 10, 10, 50, 50, 'circle', { strokeColor: '#FF0000' });
      expect(element.strokeColor).toBe('#FF0000');
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });
  });

  describe('adjustElementCoordinates', () => {
    it('should normalize rectangle coordinates with negative width/height', () => {
      // Created dragging from bottom-right (100,100) to top-left (0,0)
      const element = createElement('1', 100, 100, 0, 0, 'rectangle');
      // initial createElement stores x,y as start point, width/height as diff
      // But createElement implementation: width = x2 - x = -100
      expect(element.x).toBe(100);
      expect(element.width).toBe(-100);

      const adjusted = adjustElementCoordinates(element);
      expect(adjusted.x).toBe(0);
      expect(adjusted.y).toBe(0);
      expect(adjusted.width).toBe(100);
      expect(adjusted.height).toBe(100);
    });

    it('should NOT normalize line coordinates', () => {
       const element = createElement('1', 100, 100, 0, 0, 'line');
       const adjusted = adjustElementCoordinates(element);
       expect(adjusted.x).toBe(100);
       expect(adjusted.width).toBe(-100);
    });
  });

  describe('cursorForPosition', () => {
    it('should return correct cursor for positions', () => {
      expect(cursorForPosition('tl')).toBe('nwse-resize');
      expect(cursorForPosition('br')).toBe('nwse-resize');
      expect(cursorForPosition('start')).toBe('nwse-resize');
      
      expect(cursorForPosition('tr')).toBe('nesw-resize');
      expect(cursorForPosition('bl')).toBe('nesw-resize');
      
      expect(cursorForPosition('inside')).toBe('move');
    });
  });

  describe('resizedCoordinates', () => {
    it('should display correct new coordinates when resizing from top-left', () => {
        // Start: x=10, y=10, w=100, h=100. Mouse moves to 0,0 (delta -10, -10)
        // new x should be 0, new y 0, new w 110, new h 110
        const result = resizedCoordinates(
            0, 0, 
            'tl', 
            { x: 10, y: 10, width: 100, height: 100 }
        );
        expect(result).toEqual({ x: 0, y: 0, width: 110, height: 110 });
    });

    it('should display correct new coordinates when resizing from bottom-right', () => {
        // Start: x=10, y=10, w=100, h=100. Mouse moves to 120, 120 (delta +10, +10)
        // x,y stay same. width becomes 110, height 110.
        const result = resizedCoordinates(
            120, 120,
            'br',
            { x: 10, y: 10, width: 100, height: 100 }
        );
        expect(result).toEqual({ x: 10, y: 10, width: 110, height: 110 });
    });
  });
});
