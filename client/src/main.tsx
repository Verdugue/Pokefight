import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from './App'

const theme = createTheme({
  palette: {
    primary: {
      main: '#EE1515', // Rouge Pokémon
      contrastText: '#fff',
    },
    secondary: {
      main: '#3B4CCA', // Bleu Pokémon
      contrastText: '#fff',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 