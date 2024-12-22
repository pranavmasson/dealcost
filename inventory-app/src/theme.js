import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#4dabf5',
      dark: '#1976d2',
    },
    secondary: {
      main: '#3f51b5',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#1a1a1a',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#242424',
          },
          '&:hover': {
            backgroundColor: '#333333 !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #333333',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBox-root': {
            backgroundColor: '#1e1e1e',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e1e1e',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#2196f3',
          '&:hover': {
            backgroundColor: '#1976d2',
          },
        },
        outlined: {
          borderColor: '#2196f3',
          color: '#2196f3',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderColor: '#333333',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          '&:hover': {
            backgroundColor: '#2a2a2a',
          },
          '&.Mui-focused': {
            backgroundColor: '#2a2a2a',
          },
        },
        input: {
          color: '#ffffff',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404040',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4f4f4f',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2196f3',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#2196f3',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#2196f3',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1976d2',
          },
        },
        outlined: {
          borderColor: '#2196f3',
          color: '#2196f3',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            borderColor: '#1976d2',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
      },
    },
  },
});
