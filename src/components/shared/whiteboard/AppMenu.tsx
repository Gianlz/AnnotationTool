import React, { useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Menu as MenuIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  DarkMode,
  LightMode,
  Dashboard as DashboardIcon,
  ViewKanban as ViewKanbanIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../../../context/ThemeContext';
import { useViewContext } from '../../../context/ViewContext';

export const AppMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleTheme } = useThemeContext();
  const { currentView, setView } = useViewContext();
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback((view: 'whiteboard' | 'kanban') => {
    setView(view);
    handleClose();
  }, [setView, handleClose]);

  return (
    <>
      <IconButton
        id="app-menu-button"
        aria-controls={open ? 'app-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          color: 'text.primary',
          '&:hover': {
            backgroundColor: 'transparent',
            opacity: 0.7,
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        id="app-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'app-menu-button',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: 2,
            border: 1,
            borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel', // Dynamic border
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            bgcolor: 'background.paper',
            color: 'text.primary',
          }
        }}
      >
        {/* Views Navigation Section */}
        <MenuItem
          onClick={() => handleNavigate('whiteboard')}
          selected={currentView === 'whiteboard'}
          sx={{
            '&.Mui-selected': {
              bgcolor: mode === 'light' ? 'nebula.concrete' : 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Whiteboard</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate('kanban')}
          selected={currentView === 'kanban'}
          sx={{
            '&.Mui-selected': {
              bgcolor: mode === 'light' ? 'nebula.concrete' : 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <ListItemIcon>
            <ViewKanbanIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Kanban</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        {/* File Operations */}
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Image</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
             <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear Canvas</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <GitHubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>GitHub</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { toggleTheme(); handleClose(); }}>
          <ListItemIcon>
            {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
