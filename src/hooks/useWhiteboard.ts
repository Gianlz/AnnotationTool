
import { useState, useEffect } from 'react';
import type { 
  WhiteboardElement, 
  WhiteboardTool, 
  ElementType,
  ToolProperties
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
    toolProperties: ToolProperties;
  }>({
    tool: 'selection',
    selection: null,
    toolProperties: {
      strokeColor: '#111111',
      strokeWidth: 2,
      opacity: 100,
      fontFamily: 'Montserrat',
      fontSize: 24,
    }
  });
  
  const [action, setAction] = useState<ActionType>('none');
  const [selectedElement, setSelectedElement] = useState<WhiteboardElement | null>(null);
  
  // Ref for current drawing/interaction state to avoid stale closures in callbacks if needed
  // But useState is fine if we use functional updates correctly.
  
  // History
  // History
  const [history, setHistory] = useState<WhiteboardElement[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveHistory = (newElements: WhiteboardElement[]) => {
      const prevHistory = history.slice(0, historyStep + 1);
      const newHistory = [...prevHistory, newElements];
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setElements(history[newStep]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setElements(history[newStep]);
    }
  };

  const updateToolProperty = (key: keyof ToolProperties, value: any) => {
      setAppState(prev => {
          const newProps = { ...prev.toolProperties, [key]: value };
          
          // If there is a selected element, update it as well
          if (prev.selection) {
             const updatedElements = elements.map(el => {
                 if (el.id === prev.selection!.id) {
                     return { ...el, [key]: value };
                 }
                 return el;
             });
             setElements(updatedElements);
             // Should we save history here? Ideally yes, but maybe debounce it?
             // For now, let's not save history on every slide change to avoid stack bloat, 
             // but user might expect undo. Let's save history for discrete changes (like font family), 
             // but maybe not slider unless we implement proper "commit" or "debounce".
             // Let's safe history for simplicity.
             saveHistory(updatedElements);
          }

          return { ...prev, toolProperties: newProps };
      });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyStep]);

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
        // Update selection state and also sync tool properties to selected element for UI feedback
        setAppState(prev => ({ 
            ...prev, 
            selection: element,
            toolProperties: {
                strokeColor: element.strokeColor,
                strokeWidth: element.strokeWidth,
                opacity: element.opacity,
                fontFamily: element.fontFamily || 'Montserrat',
                fontSize: element.fontSize || 24,
            }
        }));
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
      const newElement = createElement(
          id, x, y, x, y, type, 
          appState.toolProperties // Pass current properties
      ); 
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
      
      const { x: x1, y: y1, type, points } = elements[index]; // read from element in state to keep properties?
      // Wait, updateElement re-creates the element using createElement. 
      // If we don't pass all properties, they reset to default!
      // We must pass the properties from the EXISTING element (or appState).
      // Let's use appState properties for the element being drawn.
      
      if (type === 'pencil') {
        const newPoints = [...(points || []), { x, y }];
        setElements(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], points: newPoints };
            return copy;
        });
      } else {
        // Update element needs to preserve properties.
        // The original updateElement function only accepted simplified options.
        // Let's inline the logic here to better control it or update updateElement signature.
        // Inlining is safer as updateElement was a bit rigid.
        
        const updatedElement = createElement(
            elements[index].id, 
            x1, y1, x, y, type, 
            appState.toolProperties 
        );
         setElements((prevState) => 
           prevState.map((el, i) => i === index ? { ...updatedElement, seed: el.seed } : el)
        );
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
    undo,
    redo,
    updateToolProperty
  };
};
