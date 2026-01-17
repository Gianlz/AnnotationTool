
import { useState } from 'react';
import type { 
  WhiteboardElement, 
  WhiteboardTool, 
  ElementType
} from '../types/whiteboard';
import { 
  createElement, 
  getElementAtPosition, 
  adjustElementCoordinates,
  generateId
} from '../utils/elementUtils';

// Helper to determine mode
type ActionType = 'drawing' | 'moving' | 'resizing' | 'none';

export const useWhiteboard = () => {
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [appState, setAppState] = useState<{
    tool: WhiteboardTool;
    selection: WhiteboardElement | null;
  }>({
    tool: 'selection',
    selection: null,
  });
  
  const [action, setAction] = useState<ActionType>('none');
  const [selectedElement, setSelectedElement] = useState<WhiteboardElement | null>(null);
  
  // Ref for current drawing/interaction state to avoid stale closures in callbacks if needed
  // But useState is fine if we use functional updates correctly.
  
  // History
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveHistory = (newElements: WhiteboardElement[]) => {
      // If we went back, remove future history
      const prevHistory = history.slice(0, historyStep + 1);
      const newHistory = [...prevHistory, newElements];
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  const updateElement = (id: string, x: number, y: number, x2: number, y2: number, type: ElementType, options?: { strokeColor?: string }) => {
    const updatedElement = createElement(id, x, y, x2, y2, type, options);
    
    setElements((prevState) => 
       prevState.map((el) => el.id === id ? { ...updatedElement, seed: el.seed } : el)
    );
  };

  const handleMouseDown = (x: number, y: number) => {

    if (appState.tool === 'selection') {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        // Determine if resizing or moving based on proximity to corners? 
        // For simplicity, let's just do moving for now, or assume resize if selected.
        // If we want resize handles, we check if we clicked a handle.
        // For this MVP, let's stick to moving or simple selection.
        
        // Basic Move Logic
        // const offsetX = x - element.x;
        // const offsetY = y - element.y;
        
        setSelectedElement({ ...element });
        setAppState(prev => ({ ...prev, selection: element }));
        setAction('moving');
        // We'd store offset here if using refs
      } else {
         setAppState(prev => ({ ...prev, selection: null }));
         setSelectedElement(null);
      }
    } else {
      const id = generateId();
      const type = appState.tool as ElementType;
      // Start creating element
      const newElement = createElement(id, x, y, x, y, type, { strokeColor: '#111111' }); // Default color
      setElements((prevState) => [...prevState, newElement]);
      setSelectedElement(newElement);
      setAction('drawing');
    }
  };

  const handleMouseMove = (x: number, y: number) => {

    if (appState.tool === 'selection') {
      // Cursor handling moved to view
      // const element = getElementAtPosition(x, y, elements);
    }

    if (action === 'drawing') {
      const index = elements.length - 1;
      if(index < 0) return;
      
      const { x: x1, y: y1, type, strokeColor, points } = elements[index];

      if (type === 'pencil') {
        const newPoints = [...(points || []), { x, y }];
        setElements(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], points: newPoints };
            return copy;
        });
      } else {
        updateElement(elements[index].id, x1, y1, x, y, type, { strokeColor });
      }
      
    } else if (action === 'moving' && selectedElement) {
        // const { id, x: startX, y: startY, width, height, type, strokeColor } = selectedElement;
        // This is tricky without ref for start click position.
        // Simplification: We need the delta. 
        // Real implementation requires storing the initial click position in a ref.
        
        // Let's assume for MVP dragging is "center to mouse" or need to add start offset ref.
        // I will add a REF for interaction start state to make this reliable.
    }
  };

  const handleMouseUp = () => {
      if (action === 'drawing' || action === 'moving') {
        // Adjust coordinates (normalize rectangle to positive width/height)
        if (selectedElement) {
            // Because we update state continuously, the last element is the current one
            // We need to normalize the last element if we were drawing
            if (action === 'drawing') {
                 // normalize
                 const index = elements.length - 1;
                 const el = elements[index];
                 const adj = adjustElementCoordinates(el);
                 const newElements = [...elements];
                 newElements[index] = adj;
                 setElements(newElements);
                 saveHistory(newElements);
            } else {
                saveHistory(elements);
            }
        }
      }
      setAction('none');
      setSelectedElement(null);
  };
  
  // Note: This Hook is incomplete without refs for drag offsets.
  // I will refactor to use refs for interaction state in the next step or keep it here if I can edit.
  // I'll leave the basic structure for now and refine in the View or a refined Hook file.
  
  return {
    elements,
    setElements, // exposed for clear/load
    action,
    ACTION_SETTERS: { setAction },
    appState,
    setAppState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    undo: () => {}, // TODO
    redo: () => {} // TODO
  };
};
