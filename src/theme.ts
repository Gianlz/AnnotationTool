import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        nebula: {
            white: string;
            black: string;
            concrete: string;
            steel: string;
            orange: string;
            canvas: string;
            surface: string;
            structure: string;
            detail: string;
        };
    }
    interface PaletteOptions {
        nebula?: {
            white: string;
            black: string;
            concrete: string;
            steel: string;
            orange: string;
            canvas: string;
            surface: string;
            structure: string;
            detail: string;
        };
    }
}

export const getTheme = (mode: 'light' | 'dark') => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'light' ? '#111111' : '#FFFFFF', // Carbon Black / Nebula White
        },
        secondary: {
            main: mode === 'light' ? '#333333' : '#F5F5F5', // Steel Grey / Concrete Grey
        },
        error: {
            main: '#FF4D00', // Flare Orange
        },
        info: {
            main: '#FF4D00', // Flare Orange (as alert/action)
        },
        background: {
            default: mode === 'light' ? '#FFFFFF' : '#111111', // Nebula White / Carbon Black
            paper: mode === 'light' ? '#FFFFFF' : '#333333', // Nebula White / Steel Grey (Surfaces)
        },
        text: {
            primary: mode === 'light' ? '#111111' : '#FFFFFF',
            secondary: mode === 'light' ? '#333333' : '#F5F5F5',
        },
        nebula: {
            white: '#FFFFFF',
            black: '#111111',
            concrete: '#F5F5F5',
            steel: '#333333',
            orange: '#FF4D00',
            // Semantic roles
            canvas: mode === 'light' ? '#FFFFFF' : '#111111',
            surface: mode === 'light' ? '#111111' : '#FFFFFF', // Contrast surface
            structure: mode === 'light' ? '#F5F5F5' : '#333333',
            detail: mode === 'light' ? '#333333' : '#F5F5F5',
        },
    },
    typography: {
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        body1: { fontWeight: 400 },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    backgroundColor: mode === 'light' ? '#111111' : '#FFFFFF',
                    color: mode === 'light' ? '#FFFFFF' : '#111111',
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#333333' : '#F5F5F5',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Disable overlay in dark mode
                    backgroundColor: mode === 'light' ? '#FFFFFF' : '#333333', // Explicit surface color
                    borderColor: mode === 'light' ? '#F5F5F5' : '#111111', // Borders should be subtle
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: mode === 'light' ? '#111111' : '#FFFFFF',
                    '&:hover': {
                        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
                    }
                }
            }
        }
    },
});
