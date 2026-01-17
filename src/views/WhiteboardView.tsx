
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import rough from 'roughjs';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { Toolbar } from '../components/shared/whiteboard/Toolbar';
import { AppMenu } from '../components/shared/whiteboard/AppMenu';
import { ToolPropertiesSidebar } from '../components/shared/whiteboard/ToolPropertiesSidebar';

export const WhiteboardView = () => {
  const { 
    elements, 
    appState, 
    setAppState, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp,
    updateToolProperty
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
          type, x, y, width, height, strokeColor, backgroundColor, opacity, points, seed, fontFamily, fontSize
      } = element;
      
      const options = {
          seed,
          stroke: strokeColor,
          strokeWidth: element.strokeWidth / scale, // ADJUSTED: strokeWidth logic
          // roughjs options
          roughness: 1,
          opacity: opacity, // roughjs might not handle opacity in options directly, check roughjs docs? 
          // usually globalAlpha handles it.
          // fill: backgroundColor !== 'transparent' ? backgroundColor : undefined,
          // fillStyle: 'hachure', 
      };

      // Handle opacity contextually
      ctx.globalAlpha = opacity / 100;

      switch (type) {
        case 'rectangle':
            rc.rectangle(x, y, width, height, { ...options, strokeWidth: element.strokeWidth, fill: backgroundColor !== 'transparent' ? backgroundColor : undefined, fillStyle: 'hachure' });
            break;
        case 'diamond':
            rc.polygon([
                [x + width / 2, y],
                [x + width, y + height / 2],
                [x + width / 2, y + height],
                [x, y + height / 2]
            ], { ...options, strokeWidth: element.strokeWidth, fill: backgroundColor !== 'transparent' ? backgroundColor : undefined, fillStyle: 'hachure' });
            break;
        case 'database': {
             const ry = height * 0.15;
             // Top Ellipse
             rc.ellipse(x + width / 2, y + ry, width, ry * 2, { ...options, strokeWidth: element.strokeWidth, fill: backgroundColor !== 'transparent' ? backgroundColor : undefined, fillStyle: 'hachure' });
             // Bottom Ellipse
             rc.ellipse(x + width / 2, y + height - ry, width, ry * 2, { ...options, strokeWidth: element.strokeWidth, fill: backgroundColor !== 'transparent' ? backgroundColor : undefined, fillStyle: 'hachure' });
             // Sides
             rc.line(x, y + ry, x, y + height - ry, { ...options, strokeWidth: element.strokeWidth });
             rc.line(x + width, y + ry, x + width, y + height - ry, { ...options, strokeWidth: element.strokeWidth });
             break;
        }
        case 'cloud': {
             // Simple cloud made of ellipses
             // Draw filled parts first if background
             const fill = backgroundColor !== 'transparent' ? backgroundColor : undefined;
             const opts = { ...options, strokeWidth: element.strokeWidth, fill, fillStyle: 'hachure' };
             
             // Center
             rc.ellipse(x + width * 0.5, y + height * 0.55, width * 0.7, height * 0.6, opts);
             // Left
             rc.ellipse(x + width * 0.25, y + height * 0.6, width * 0.4, height * 0.5, opts);
             // Right
             rc.ellipse(x + width * 0.75, y + height * 0.6, width * 0.4, height * 0.5, opts);
             // Top
             rc.ellipse(x + width * 0.5, y + height * 0.35, width * 0.5, height * 0.5, opts);
             break;
        }
        case 'circle':
            rc.ellipse(x + width / 2, y + height / 2, width, height, { ...options, strokeWidth: element.strokeWidth, fill: backgroundColor !== 'transparent' ? backgroundColor : undefined, fillStyle: 'hachure' });
            break;
        case 'line':
            rc.line(x, y, x + width, y + height, { ...options, strokeWidth: element.strokeWidth });
            break;
        case 'arrow': {
            rc.line(x, y, x + width, y + height, { ...options, strokeWidth: element.strokeWidth });
            const angle = Math.atan2(height, width);

            // Let's use strict numbers and let transform handle it.
            const headLenFixed = 20;
            const endX = x + width;
            const endY = y + height;
            rc.line(endX, endY, endX - headLenFixed * Math.cos(angle - Math.PI / 6), endY - headLenFixed * Math.sin(angle - Math.PI / 6), { ...options, strokeWidth: element.strokeWidth });
            rc.line(endX, endY, endX - headLenFixed * Math.cos(angle + Math.PI / 6), endY - headLenFixed * Math.sin(angle + Math.PI / 6), { ...options, strokeWidth: element.strokeWidth });
            break;
        }
        case 'text':
            ctx.textBaseline = 'top';
            ctx.font = `${fontSize || 24}px ${fontFamily || 'Montserrat'}`; 
            ctx.fillStyle = strokeColor;
            ctx.fillText(element.text || 'Text', x, y);
            break;
        case 'pencil':
             if (points && points.length) {
                 rc.linearPath(points.map(p => [p.x, p.y]), { ...options, strokeWidth: element.strokeWidth });
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
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', position: 'relative' }}>
      <AppMenu />
      <Toolbar 
        activeTool={appState.tool} 
        setTool={(tool) => setAppState(prev => ({ ...prev, tool }))} 
      />
      <ToolPropertiesSidebar 
         activeTool={appState.tool}
         properties={appState.toolProperties}
         onChange={updateToolProperty}
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
