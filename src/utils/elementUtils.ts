
import { v4 as uuidv4 } from 'uuid';
import type { ElementType, WhiteboardElement, Point } from '../types/whiteboard';

export const generateId = (): string => uuidv4();

export const createElement = (
  id: string,
  x: number,
  y: number,
  x2: number,
  y2: number,
  type: ElementType,
  options?: { strokeColor?: string; backgroundColor?: string }
): WhiteboardElement => {
  // const roughElement = null; // We will generate the visual part in the renderer
  const width = x2 - x;
  const height = y2 - y;

  return {
    id,
    type,
    x,
    y,
    width,
    height,
    strokeColor: options?.strokeColor || '#111111',
    backgroundColor: options?.backgroundColor || 'transparent',
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    seed: Math.floor(Math.random() * 2 ** 31),
    points: [{ x, y }, { x: x2, y: y2 }], // Initial points for line/arrow/pencil
  };
};

export const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const isWithinElement = (x: number, y: number, element: WhiteboardElement): boolean => {
  const { type, x: x1, y: y1, width, height } = element;
  const x2 = x1 + width;
  const y2 = y1 + height;

  switch (type) {
    case 'rectangle':
    case 'text': {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    case 'line':
    case 'arrow': {
      // Basic distance check to line segment
      // This is a simplification. For better results, use distance to segment.
       const a = { x: x1, y: y1 };
       const b = { x: x2, y: y2 };
       const c = { x, y };
       const offset = distance(a, b) - (distance(a, c) + distance(b, c));
       return Math.abs(offset) < 1;
    }
    case 'circle': {
        // Center calculation assumes x1,y1 is top-left of bounding box
        const centerX = x1 + width / 2;
        const centerY = y1 + height / 2;
        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2;
        // Normalized distance for ellipse
        const dx = x - centerX;
        const dy = y - centerY;
        return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
    }
    case 'pencil':
        // Check if point is close to any segment
        // Optimally, check bounding box first
        if (x < x1 || x > x2 || y < y1 || y > y2) return false;
        // Then detailed check (omitted for brevity, assume bounding box for now for free draw)
        return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
    default:
      return false;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: WhiteboardElement[]
): WhiteboardElement | null => {
  // meaningful order: iterate from top (last) to bottom (first)
  for (let i = elements.length - 1; i >= 0; i--) {
     if (isWithinElement(x, y, elements[i])) {
      return elements[i];
    }
  }
  return null;
};

export const adjustElementCoordinates = (element: WhiteboardElement): WhiteboardElement => {
    const { type, x, y, width, height } = element;
    if (type === 'rectangle' || type === 'circle' || type === 'text') {
        const minX = Math.min(x, x + width);
        const maxX = Math.max(x, x + width);
        const minY = Math.min(y, y + height);
        const maxY = Math.max(y, y + height);
        return {
            ...element,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    // Lines/Arrows/Pencil allow negative width/height for direction, 
    // or we can normalize. Excalidraw keeps start/end points.
    // For now, let's keep them as is to preserve direction for arrows.
    return element;
};

export const cursorForPosition = (position: string): string => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    default:
      return 'move';
  }
};

export const resizedCoordinates = (
  clientX: number, 
  clientY: number, 
  position: string, 
  coordinates: { x: number; y: number; width: number; height: number }
): { x: number; y: number; width: number; height: number } | null => {
  const { x, y, width, height } = coordinates;
  switch (position) {
    case 'tl':
    case 'start':
      return { x: clientX, y: clientY, width: width + (x - clientX), height: height + (y - clientY) };
    case 'tr':
      return { x, y: clientY, width: clientX - x, height: height + (y - clientY) };
    case 'bl':
      return { x: clientX, y, width: width + (x - clientX), height: clientY - y };
    case 'br':
    case 'end':
      return { x, y, width: clientX - x, height: clientY - y };
    default:
      return null;
  }
};
