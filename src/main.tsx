import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'

const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
const RouterComponent = useHashRouter ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterComponent>
      <App />
    </RouterComponent>
  </React.StrictMode>,
)

