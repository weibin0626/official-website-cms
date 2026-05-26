import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3a6b',
    },
    secondary: {
      main: '#1a6b3a',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans SC", sans-serif',
  },
});

export default theme;
