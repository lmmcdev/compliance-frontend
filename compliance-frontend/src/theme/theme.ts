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
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    status: {
      new: '#fce4ec',      // Pink background for "New" cards
      emergency: '#fff3e0',  // Orange background for "Emergency" cards
      inProgress: '#e3f2fd', // Light blue background for "In Progress" cards
      pending: '#f3e5f5',   // Purple background for "Pending" cards
      done: '#e8f5e8',      // Green background for "Done" cards
      duplicated: '#fff3e0', // Orange background for "Duplicated" cards
      total: '#e3f2fd',     // Blue background for "Total" cards
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