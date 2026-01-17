
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import rough from 'roughjs';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { Toolbar } from '../components/shared/whiteboard/Toolbar';
import { AppMenu } from '../components/shared/whiteboard/AppMenu';

export const WhiteboardView = () => {
  const { 
    elements, 
    appState, 
    setAppState, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp,
  } = useWhiteboard();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize canvas to fill window
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  // Viewport State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
     const handleResize = () => {
         setWidth(window.innerWidth);
         setHeight(window.innerHeight);
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas (reset transform first to clear entire screen)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply Viewport Transform
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Create rough canvas
    const rc = rough.canvas(canvas);

    elements.forEach(element => {
      const { 
          type, x, y, width, height, strokeColor, backgroundColor, opacity, points, seed 
      } = element;
      
      const options = {
          seed,
          stroke: strokeColor,
          strokeWidth: 2 / scale, // Scale stroke width? Optional. Let's keep it constant in world space (so it zooms). "2" implies world units.
          roughness: 1,
          opacity: opacity,
          fill: backgroundColor !== 'transparent' ? backgroundColor : undefined,
          fillStyle: 'hachure', 
      };

      // Handle opacity
      ctx.globalAlpha = opacity / 100;

      switch (type) {
        case 'rectangle':
            rc.rectangle(x, y, width, height, options);
            break;
        case 'circle':
            rc.ellipse(x + width / 2, y + height / 2, width, height, options);
            break;
        case 'line':
            rc.line(x, y, x + width, y + height, options);
            break;
        case 'arrow': {
            rc.line(x, y, x + width, y + height, options);
            const angle = Math.atan2(height, width);

            // Let's use strict numbers and let transform handle it.
            const headLenFixed = 20;
            const endX = x + width;
            const endY = y + height;
            rc.line(endX, endY, endX - headLenFixed * Math.cos(angle - Math.PI / 6), endY - headLenFixed * Math.sin(angle - Math.PI / 6), options);
            rc.line(endX, endY, endX - headLenFixed * Math.cos(angle + Math.PI / 6), endY - headLenFixed * Math.sin(angle + Math.PI / 6), options);
            break;
        }
        case 'text':
            ctx.textBaseline = 'top';
            ctx.font = '24px Montserrat'; 
            ctx.fillStyle = strokeColor;
            ctx.fillText(element.text || 'Text', x, y);
            break;
        case 'pencil':
             if (points && points.length) {
                 rc.linearPath(points.map(p => [p.x, p.y]), options);
             }
             break;
        default:
            break;
      }
      ctx.globalAlpha = 1; 
    });

    ctx.restore();

  }, [elements, width, height, scale, offset]);

  // Coordinate conversion
  const getMouseCoordinates = (clientX: number, clientY: number) => {
      const worldX = (clientX - offset.x) / scale;
      const worldY = (clientY - offset.y) / scale;
      return { x: worldX, y: worldY };
  };

  const onMouseDown = (e: React.MouseEvent) => {
      // Middle Click (button 1) for Panning
      if (e.button === 1) {
          setIsPanning(true);
          return;
      }
      
      const { x, y } = getMouseCoordinates(e.clientX, e.clientY);
      handleMouseDown(x, y);
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
      if (isPanning) {
          setOffset(prev => ({
              x: prev.x + e.movementX,
              y: prev.y + e.movementY
          }));
          return;
      }

      const { x, y } = getMouseCoordinates(e.clientX, e.clientY);
      
      // Update cursor if hovering over elements (using the getElementAtPosition logic from hook indirectly or simpler check?)
      // We removed hook's cursor logic. View can handle it if needed. 
      // For now just pass coords.
      handleMouseMove(x, y);
  };

  const onMouseUp = () => {
      if (isPanning) {
          setIsPanning(false);
      }
      handleMouseUp();
  };

  const onWheel = (e: React.WheelEvent) => {
    const scaleBy = 1.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? scaleBy : 1 / scaleBy;
    
    // Calculate new scale, clamped
    let newScale = scale * factor;
    if (newScale < 0.1) newScale = 0.1;
    if (newScale > 10) newScale = 10;

    // Mouse world config
    const worldPos = getMouseCoordinates(e.clientX, e.clientY);

    // newOffset = mouse - world * newScale
    const newOffset = {
        x: e.clientX - worldPos.x * newScale,
        y: e.clientY - worldPos.y * newScale
    };

    setScale(newScale);
    setOffset(newOffset);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', bgcolor: '#FFFFFF', position: 'relative' }}>
      <AppMenu />
      <Toolbar 
        activeTool={appState.tool} 
        setTool={(tool) => setAppState(prev => ({ ...prev, tool }))} 
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'default' }}
      >
        Canvas not supported
      </canvas>
    </Box>
  );
};
