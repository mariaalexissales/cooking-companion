import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#783a40',
    },
    background: {
      default: '#2d0c13',
      paper: '#561d20',
    },
    text: {
      primary: '#e3b68e',
      secondary: '#d4a57d',
    },
  },
  typography: {
    h1: {
      fontSize: '48px',
    },
    subtitle1: {
      fontFamily: '"Mea Culpa", cursive',
      fontSize: '32px',
      color: '#d4a57d',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#561d20',
        },
      },
    },
  },
});

export default theme;
