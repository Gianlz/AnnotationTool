
export type WhiteboardTool = 'selection' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pencil';

export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pencil';

export type Point = {
  x: number;
  y: number;
};

export type WhiteboardElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  points?: Point[]; // For pencil/lines
  text?: string;    // For text
  seed: number;     // For roughjs randomness
  isDeleted?: boolean;
};

export type WhiteboardState = {
  elements: WhiteboardElement[];
  history: WhiteboardElement[][];
  historyStep: number;
  tool: WhiteboardTool;
  selection: string[]; // array of selected element IDs
};
