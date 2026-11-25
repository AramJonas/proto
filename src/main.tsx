import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LangProvider from './i18n/LangProvider.tsx'
import { redirectAdminPath } from './lib/useHashRoute.ts'
import ProductProvider from './store/ProductProvider.tsx'

redirectAdminPath()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Shared product store: the storefront and /admin read and write the same list. */}
    <ProductProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </ProductProvider>
  </StrictMode>,
)
