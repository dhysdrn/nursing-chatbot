/**
 * @description
 * Entry point for the React application. 
 * Renders the main <App /> component inside the HTML element with ID 'root'.
 * Includes React StrictMode to help identify potential issues during development.
 * @version 1.0 
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
