import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'
import { useAppStore } from './store/useAppStore'

// Synchronize and rehydrate persisted state on app boot
try {
  useAppStore.persist?.rehydrate?.()
} catch {}

if (typeof window !== 'undefined') {
  (window as any).__USE_APP_STORE__ = useAppStore
}

const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
const RouterComponent = useHashRouter ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterComponent>
      <App />
    </RouterComponent>
  </React.StrictMode>,
)

