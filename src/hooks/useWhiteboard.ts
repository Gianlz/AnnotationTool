
import { useState, useEffect, useRef } from 'react';
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
  
  // Ref for drag state
  const dragInfo = useRef<{
    startMouse: { x: number, y: number };
    originalElement: WhiteboardElement | null;
  }>({ startMouse: { x: 0, y: 0 }, originalElement: null });
  
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
        setSelectedElement({ ...element });
        
        // Store drag start info
        dragInfo.current = {
            startMouse: { x, y },
            originalElement: element
        };

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
      } else {
         setAppState(prev => ({ ...prev, selection: null }));
         setSelectedElement(null);
         dragInfo.current = { startMouse: { x: 0, y: 0 }, originalElement: null };
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
      
      const { x: x1, y: y1, type, points } = elements[index]; 
      
      if (type === 'pencil') {
        const newPoints = [...(points || []), { x, y }];
        setElements(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], points: newPoints };
            return copy;
        });
      } else {
        const updatedElement = createElement(
            elements[index].id, 
            x1, y1, x, y, type, 
            appState.toolProperties 
        );
         setElements((prevState) => 
           prevState.map((el, i) => i === index ? { ...updatedElement, seed: el.seed } : el)
        );
      }
      
    } else if (action === 'moving' && dragInfo.current.originalElement) {
        const { startMouse, originalElement } = dragInfo.current;
        const dx = x - startMouse.x;
        const dy = y - startMouse.y;
        
        const updatedElement = {
            ...originalElement,
            x: originalElement.x + dx,
            y: originalElement.y + dy,
            points: originalElement.points?.map(p => ({ x: p.x + dx, y: p.y + dy })) || undefined
        };

        setElements(prev => prev.map(el => el.id === updatedElement.id ? updatedElement : el));
        // Keep selected element updated so we can see the bounding box move if we had one, 
        // or for any other derived state
        setSelectedElement(updatedElement);
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
      dragInfo.current = { startMouse: { x: 0, y: 0 }, originalElement: null };
  };
  
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
