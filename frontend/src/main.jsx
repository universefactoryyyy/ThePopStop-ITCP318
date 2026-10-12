import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { HelmetProvider } from 'react-helmet-async'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import store from './store'
import theme, { applyPaletteCssVariables } from './theme'

// the palette is written to :root as --pop-* variables before anything renders
applyPaletteCssVariables()

// the session lives in an httpOnly cookie, so every API call must send credentials
axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </Provider>

)
