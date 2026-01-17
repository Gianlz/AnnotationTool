
export type WhiteboardTool = 'selection' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pencil' | 'diamond' | 'database' | 'cloud';

export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pencil' | 'diamond' | 'database' | 'cloud';

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
  fontFamily?: string;
  fontSize?: number;
  seed: number;     // For roughjs randomness
  isDeleted?: boolean;
};

export type ToolProperties = {
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontFamily: string;
  fontSize: number;
};

export type WhiteboardState = {
  elements: WhiteboardElement[];
  history: WhiteboardElement[][];
  historyStep: number;
  tool: WhiteboardTool;
  selection: string[]; // array of selected element IDs
  toolProperties?: ToolProperties;
};
