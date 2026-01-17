
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import rough from 'roughjs';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { Toolbar } from '../components/shared/whiteboard/Toolbar';

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
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create rough canvas
    const rc = rough.canvas(canvas);

    elements.forEach(element => {
      const { 
          type, x, y, width, height, strokeColor, backgroundColor, opacity, points, seed 
      } = element;
      
      const options = {
          seed,
          stroke: strokeColor,
          strokeWidth: 2,
          roughness: 1,
          opacity: opacity,
          fill: backgroundColor !== 'transparent' ? backgroundColor : undefined,
          fillStyle: 'hachure', // default roughjs fill
      };

      // Handle opacity
      // roughjs options doesn't have opacity property for the whole shape directly in strict sense, 
      // but we can set context globalAlpha or use rgba colors.
      // Let's use context globalAlpha saving/restoring.
      ctx.globalAlpha = opacity / 100;

      switch (type) {
        case 'rectangle':
            rc.rectangle(x, y, width, height, options);
            break;
        case 'circle':
            // roughjs ellipse(centerX, centerY, width, height)
            rc.ellipse(x + width / 2, y + height / 2, width, height, options);
            break;
        case 'line':
            // points[0] is start, points[1] is end
            // but for simple line type we store x,y,width,height as well for bounding box
            // Let's stick to using x,y and x+width, y+height or use the points logic if present.
            // Our utils `createElement` sets x,y,width,height. 
            // So line is from (x,y) to (x+width, y+height).
            rc.line(x, y, x + width, y + height, options);
            break;
        case 'arrow': {
            // Draw line
            rc.line(x, y, x + width, y + height, options);
            // Draw arrow head (simplistic)
            const angle = Math.atan2(height, width);
            const headLen = 20;
            const endX = x + width;
            const endY = y + height;
            // Left wing
            rc.line(endX, endY, endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6), options);
            // Right wing
            rc.line(endX, endY, endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6), options);
            break;
        }
        case 'text':
            ctx.textBaseline = 'top';
            ctx.font = '24px Montserrat'; 
            ctx.fillStyle = strokeColor;
            ctx.fillText(element.text || 'Text', x, y);
            break;
        case 'pencil':
             // Not implemented fully in utils yet (just creates a dot), wait for point collection update
             // If we had points: rc.linearPath(points, options)
             if (points && points.length) {
                 // map points to [x,y] arrays
                 rc.linearPath(points.map(p => [p.x, p.y]), options);
             }
             break;
        default:
            break;
      }
      ctx.globalAlpha = 1; 
    });

  }, [elements, width, height]);

  const onMouseDown = (e: React.MouseEvent) => {
      // Offset if canvas is not top-left 0,0 (it is here)
      handleMouseDown(e, { x: 0, y: 0 });
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
      handleMouseMove(e, { x: 0, y: 0 });
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
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
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none' }}
      >
        Canvas not supported
      </canvas>
    </Box>
  );
};
