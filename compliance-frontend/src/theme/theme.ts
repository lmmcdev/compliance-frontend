import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    status: {
      new: string;
      emergency: string;
      inProgress: string;
      pending: string;
      done: string;
      duplicated: string;
      total: string;
    };
  }

  interface PaletteOptions {
    status?: {
      new?: string;
      emergency?: string;
      inProgress?: string;
      pending?: string;
      done?: string;
      duplicated?: string;
      total?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#00A1FF',
      light: '#BAE7FF',
      dark: '#0080CC',
      50: '#E6F7FF',
      200: '#BAE7FF',
      500: '#00A1FF',
      600: '#0080CC',
    } as any,
    secondary: {
      main: '#8965E5',
      light: '#EAE8FA',
      dark: '#6200EA',
    },
    error: {
      main: '#f46a6a',
    },
    warning: {
      main: '#ffb900',
    },
    success: {
      main: '#00b8a3',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    status: {
      new: '#FFE2EA',        // Matching maintenance-frontend colors
      emergency: '#FFF5DA',
      inProgress: '#DFF3FF',
      pending: '#EAE8FA',
      done: '#DAF8F4',
      duplicated: '#FFE3C4',
      total: '#DFF3FF',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 12,
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafafa',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#424242',
            borderBottom: '1px solid #e0e0e0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});