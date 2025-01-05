import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TranslationProvider } from './services/TranslationContext'
import { DebugProvider } from './services/DebugContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DebugProvider>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </DebugProvider>
  </React.StrictMode>,
) 