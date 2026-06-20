import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import './theme/theme'
import './index.css'
import App from './App.tsx'

// Required once at startup so Fluent UI's icon glyphs (nav icons, chevrons,
// the hamburger button, etc.) render correctly instead of empty boxes.
initializeIcons()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
