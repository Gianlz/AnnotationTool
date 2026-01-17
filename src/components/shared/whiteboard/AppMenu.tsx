import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Menu as MenuIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';

export const AppMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          color: '#111111',
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
            border: '1px solid #F5F5F5',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
          }
        }}
      >
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
      </Menu>
    </>
  );
};


