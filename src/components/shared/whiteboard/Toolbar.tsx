
import React from 'react';
import { IconButton, Tooltip, Paper } from '@mui/material';
import {
  RadioButtonUnchecked as CircleIcon,
  CropSquare as RectangleIcon,
  Timeline as LineIcon,
  ArrowRightAlt as ArrowIcon,
  TextFields as TextIcon,
  Edit as PencilIcon,
  NearMe as SelectionIcon,
} from '@mui/icons-material';
import type { WhiteboardTool } from '../../../types/whiteboard';

interface ToolbarProps {
  activeTool: WhiteboardTool;
  setTool: (tool: WhiteboardTool) => void;
}

const tools: { id: WhiteboardTool; icon: React.ReactNode; label: string }[] = [
  { id: 'selection', icon: <SelectionIcon />, label: 'Selection' },
  { id: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' },
  { id: 'circle', icon: <CircleIcon />, label: 'Circle' },
  { id: 'line', icon: <LineIcon />, label: 'Line' },
  { id: 'arrow', icon: <ArrowIcon />, label: 'Arrow' },
  { id: 'text', icon: <TextIcon />, label: 'Text' },
  { id: 'pencil', icon: <PencilIcon />, label: 'Pencil' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setTool }) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLDivElement && event.target.isContentEditable
      ) {
        return;
      }

      const currentIndex = tools.findIndex((t) => t.id === activeTool);

      if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % tools.length;
        setTool(tools[nextIndex].id);
      } else if (event.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + tools.length) % tools.length;
        setTool(tools[prevIndex].id);
      } else if (/^[1-9]$/.test(event.key)) {
        const index = parseInt(event.key, 10) - 1;
        if (index >= 0 && index < tools.length) {
          setTool(tools[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setTool]);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1,
        p: 1,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        border: '1px solid #F5F5F5',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
      }}
    >
      {tools.map((tool, index) => (
        <Tooltip key={tool.id} title={`${tool.label} (${index + 1})`}>
          <IconButton
            onClick={() => setTool(tool.id)}
            sx={{
              color: activeTool === tool.id ? '#FFFFFF' : '#111111',
              backgroundColor: activeTool === tool.id ? '#FF4D00' : 'transparent',
              '&:hover': {
                backgroundColor: activeTool === tool.id ? '#E04400' : '#F5F5F5',
              },
              transition: 'all 0.2s',
            }}
          >
            {tool.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Paper>
  );
};
