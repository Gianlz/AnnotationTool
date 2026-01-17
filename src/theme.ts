import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        nebula: {
            white: string;
            black: string;
            concrete: string;
            steel: string;
            orange: string;
        };
    }
    interface PaletteOptions {
        nebula?: {
            white: string;
            black: string;
            concrete: string;
            steel: string;
            orange: string;
        };
    }
}

export const theme = createTheme({
    palette: {
        primary: {
            main: '#111111', // Carbon Black
        },
        secondary: {
            main: '#333333', // Steel Grey
        },
        error: {
            main: '#FF4D00', // Flare Orange
        },
        info: {
            main: '#FF4D00', // Flare Orange (as alert/action)
        },
        background: {
            default: '#FFFFFF', // Nebula White
            paper: '#F5F5F5', // Concrete Grey structure
        },
        text: {
            primary: '#111111',
            secondary: '#333333',
        },
        nebula: {
            white: '#FFFFFF',
            black: '#111111',
            concrete: '#F5F5F5',
            steel: '#333333',
            orange: '#FF4D00',
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
        // Use Roboto Mono for specific class-based overrides or variants if added
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4, // Sharp/Slightly rounded
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#333333', // Slight lighten on hover? Or keep distinct?
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { // concrete grey for structural elements often
                    // Default paper might be white or concrete depending on context.
                    // keeping default 'paper' background from palette
                }
            }
        }
    },
});
