import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './globals.css' // Import the new global styles
import App from './App.jsx'

// Get the initial theme from localStorage or default to 'system'
const getInitialTheme = () => {
  const storedTheme = localStorage.getItem("video-player-theme")
  
  if (storedTheme) {
    return storedTheme
  }
  
  // If no theme stored, check system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// Apply theme class to document before render to prevent flash
document.documentElement.classList.add(
  getInitialTheme() === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : getInitialTheme()
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)