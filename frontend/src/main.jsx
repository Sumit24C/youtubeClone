import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { BrowserRouter, RouterProvider } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <AppRouter/>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
