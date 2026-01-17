import React from 'react';
import { Box, Paper, Typography, Slider, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import { Circle } from '@mui/icons-material';
import type { WhiteboardTool, ToolProperties } from '../../../types/whiteboard';

interface ToolPropertiesSidebarProps {
  activeTool: WhiteboardTool;
  properties: ToolProperties;
  onChange: (key: keyof ToolProperties, value: string | number) => void;
}

import { useThemeContext } from '../../../context/ThemeContext';
// Colors moved inside component or memoized based on theme

const FONTS = [
  'Montserrat',
  'Roboto Mono',
  'Inter',
  'Arial',
  'Courier New',
];

export const ToolPropertiesSidebar: React.FC<ToolPropertiesSidebarProps> = ({
  activeTool,
  properties,
  onChange,
}) => {
  const { mode } = useThemeContext();
  
  const COLORS = [
    mode === 'light' ? '#111111' : '#FFFFFF', // Swap Black/White based on theme for visibility
    '#FF4D00', // Flare Orange
    '#1976D2', // Blue
    '#388E3C', // Green
    '#D32F2F', // Red
    '#FBC02D', // Yellow
  ];
  if (activeTool === 'selection' && !properties) return null; // Or show nothing if nothing selected? 
  // Actually hook ensures properties are populated from selection.
  
  // Decide what to show based on tool
  const showColor = true; // All tools use color except maybe eraser (not implemented)
  const showThickness = ['rectangle', 'circle', 'line', 'arrow', 'pencil', 'selection'].includes(activeTool);
  const showFont = ['text', 'selection'].includes(activeTool);
  
  // If selection is active but we don't know the type of selected element easily here (we only have properties),
  // we show all relevant controls. "properties" contains everything.
  // Actually, for "non-chalant", maybe we only show what's relevant. 
  // But if selection is active, we might have mixed types or just one. 
  // Let's assume we show all if selection, or infer from properties? 
  // Simpler: Show all controls available in properties state, which mimics "Contextual Sidebar".

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: '50%',
        left: 20,
        transform: 'translateY(-50%)', // Center vertically
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        zIndex: 90,
        width: '200px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
        Properties
      </Typography>

      {/* Color Picker */}
      {showColor && (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {COLORS.map(color => (
                    <IconButton
                        key={color}
                        onClick={() => onChange('strokeColor', color)}
                        size="small"
                        sx={{
                            p: 0.5,
                            border: properties.strokeColor === color ? 2 : 2,
                            borderColor: properties.strokeColor === color ? 'text.primary' : 'transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Circle sx={{ color, fontSize: 24, stroke: '#eee', strokeWidth: 1 }} />
                    </IconButton>
                ))}
                {/* Custom Color Input could go here */}
                <input 
                    type="color" 
                    value={properties.strokeColor}
                    onChange={(e) => onChange('strokeColor', e.target.value)}
                    style={{ 
                        width: 32, height: 32, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' 
                    }} 
                />
            </Box>
        </Box>
      )}

      {/* Thickness Slider */}
      {showThickness && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Thickness: {properties.strokeWidth}px
            </Typography>
            <Slider
                value={properties.strokeWidth}
                min={1}
                max={20}
                onChange={(_, val) => onChange('strokeWidth', val as number)}
                sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(17, 17, 17, 0.16)',
                        },
                    },
                }}
            />
          </Box>
      )}

      {/* Opacity Slider */}
      <Box>
         <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Opacity: {properties.opacity}%
         </Typography>
         <Slider
            value={properties.opacity}
            min={10}
            max={100}
            onChange={(_, val) => onChange('opacity', val as number)}
            sx={{
                color: 'primary.main',
            }}
         />
      </Box>

      {/* Font Settings */}
      {showFont && (
          <>
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Font Family</Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={properties.fontFamily}
                        onChange={(e) => onChange('fontFamily', e.target.value)}
                        sx={{
                            fontFamily: properties.fontFamily,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'text.primary',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'text.primary',
                            },
                        }}
                    >
                        {FONTS.map(font => (
                            <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                                {font}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box>
                 <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Font Size: {properties.fontSize}px
                 </Typography>
                 <Slider
                    value={properties.fontSize}
                    min={12}
                    max={72}
                    step={2}
                    onChange={(_, val) => onChange('fontSize', val as number)}
                    sx={{ color: 'primary.main' }}
                 />
            </Box>
          </>
      )}

    </Paper>
  );
};
