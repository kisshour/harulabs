import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { ProductProvider } from './context/ProductContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
