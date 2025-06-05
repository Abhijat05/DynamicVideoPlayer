import { useState, useEffect, useCallback } from 'react'
import { setupThemeListener } from '@/utils/localStorage'

const THEME_KEY = 'videoplayer_theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system' // New option to follow system preference
}

export function useThemeManager() {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage during hook initialization
    // to avoid flickering on first render
    try {
      return localStorage.getItem(THEME_KEY) || THEMES.SYSTEM
    } catch {
      return THEMES.LIGHT // Fallback if localStorage is not available
    }
  })
  
  // Memoize this function to prevent unnecessary re-renders
  const setThemeWithPersistence = useCallback((newTheme) => {
    // Handle system theme separately
    if (newTheme === THEMES.SYSTEM) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT
      
      // Apply system theme to DOM
      document.documentElement.classList.toggle('dark', systemTheme === THEMES.DARK)
      
      // But store 'system' in state and localStorage
      setTheme(THEMES.SYSTEM)
      localStorage.setItem(THEME_KEY, THEMES.SYSTEM)
    } else {
      // For explicit light/dark themes
      setTheme(newTheme)
      localStorage.setItem(THEME_KEY, newTheme)
      document.documentElement.classList.toggle('dark', newTheme === THEMES.DARK)
    }
  }, [])

  // Effect to handle initial setup and system preference changes
  useEffect(() => {
    // Determine initial theme to apply
    const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.SYSTEM
    
    // Apply theme immediately
    if (savedTheme === THEMES.SYSTEM) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', savedTheme === THEMES.DARK)
    }
    
    // Set up listener for system preference changes
    const cleanup = setupThemeListener((isDark) => {
      // Only update if theme is set to follow system
      if (theme === THEMES.SYSTEM) {
        document.documentElement.classList.toggle('dark', isDark)
      }
    })
    
    return cleanup
  }, [theme]) // Re-run if user switches to/from system theme
  
  // Return values to be used by components
  return {
    theme,
    setTheme: setThemeWithPersistence,
    isSystemTheme: theme === THEMES.SYSTEM,
    isDarkTheme: theme === THEMES.DARK || 
                 (theme === THEMES.SYSTEM && 
                  window.matchMedia('(prefers-color-scheme: dark)').matches),
    themes: THEMES // Export constants
  }
}