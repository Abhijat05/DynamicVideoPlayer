import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const ThemeToggle = ({ theme, setTheme }) => {
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-ring",
        "bg-secondary hover:bg-secondary/80 transition-all duration-300",
        "relative overflow-hidden"
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-500",
        theme === 'dark' ? "opacity-100 transform-none" : "opacity-0 rotate-90 scale-0"
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>
      <span className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-500",
        theme === 'dark' ? "opacity-0 -rotate-90 scale-0" : "opacity-100 transform-none"
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  )
}

export default ThemeToggle