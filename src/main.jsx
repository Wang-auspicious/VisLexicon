import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installStaticDiscoveryApi } from './lib/static-discovery-api.js'

// The deployed site is static: search runs in the browser (see static-discovery-api.js).
if (import.meta.env.VITE_STATIC_API === '1') installStaticDiscoveryApi()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
