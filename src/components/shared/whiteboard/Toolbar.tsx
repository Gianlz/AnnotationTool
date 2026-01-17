
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
  MoreVert as MoreIcon,
  Diamond as DiamondIcon,
  Storage as DatabaseIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
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

const extraTools: { id: WhiteboardTool; icon: React.ReactNode; label: string }[] = [
  { id: 'diamond', icon: <DiamondIcon fontSize="small" />, label: 'Diamond' },
  { id: 'database', icon: <DatabaseIcon fontSize="small" />, label: 'Database' },
  { id: 'cloud', icon: <CloudIcon fontSize="small" />, label: 'Cloud' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setTool }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExtraToolClick = (id: WhiteboardTool) => {
      setTool(id);
      handleMenuClose();
  };

  const isExtraToolActive = extraTools.some(t => t.id === activeTool);
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
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
      }}
    >
      {tools.map((tool, index) => (
        <Tooltip key={tool.id} title={`${tool.label} (${index + 1})`}>
          <IconButton
            onClick={() => setTool(tool.id)}
            sx={{
              color: activeTool === tool.id ? 'common.white' : 'text.primary',
              backgroundColor: activeTool === tool.id ? 'error.main' : 'transparent',
              '&:hover': {
                backgroundColor: activeTool === tool.id ? 'error.dark' : 'action.hover',
              },
              transition: 'all 0.2s',
            }}
          >
            {tool.icon}
          </IconButton>
        </Tooltip>
      ))}
      
      <Tooltip title="More Shapes">
        <IconButton
          onClick={handleMenuClick}
          sx={{
            color: isExtraToolActive ? 'common.white' : 'text.primary',
            backgroundColor: isExtraToolActive ? 'error.main' : 'transparent',
            '&:hover': {
              backgroundColor: isExtraToolActive ? 'error.dark' : 'action.hover',
            },
            transition: 'all 0.2s',
          }}
        >
          <MoreIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
            elevation: 0,
            sx: {
                mt: 1.5,
                border: 1,
                borderColor: 'divider',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '& .MuiMenuItem-root': {
                    typography: 'body2',
                    fontFamily: 'Montserrat',
                }
            }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {extraTools.map((tool) => (
            <MenuItem 
                key={tool.id} 
                onClick={() => handleExtraToolClick(tool.id)}
                selected={activeTool === tool.id}
                sx={{
                    '&.Mui-selected': {
                        backgroundColor: 'nebula.concrete',
                        '&:hover': { backgroundColor: 'nebula.concrete' },
                    }
                }}
            >
                <ListItemIcon sx={{ minWidth: 32 }}>
                    {tool.icon}
                </ListItemIcon>
                <ListItemText primary={tool.label} />
            </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};
