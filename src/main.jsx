import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { TranslationProvider } from './services/TranslationContext'
import { DebugProvider } from './services/DebugContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary context="MainApp" userMessage="The Freestyle Rap App encountered an error. Please refresh the page to continue.">
      <HelmetProvider>
        <DebugProvider>
          <TranslationProvider>
            <App />
          </TranslationProvider>
        </DebugProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
) 