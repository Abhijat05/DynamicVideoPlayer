import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define default themes in case they're not passed as props
const DEFAULT_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

const ThemeToggle = ({ theme, setTheme, themes = DEFAULT_THEMES }) => {
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentIcon = () => {
    if (theme === themes.SYSTEM) {
      return <MonitorIcon className="h-[1.2rem] w-[1.2rem]" />
    } else if (theme === themes.DARK) {
      return <MoonIcon className="h-[1.2rem] w-[1.2rem] text-yellow-300" />
    } else {
      return <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-600" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-ring",
            "bg-secondary hover:bg-secondary/80 transition-all duration-300"
          )}
          aria-label="Select theme"
        >
          {currentIcon()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme(themes.LIGHT)}>
          <SunIcon className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === themes.LIGHT && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(themes.DARK)}>
          <MoonIcon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === themes.DARK && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(themes.SYSTEM)}>
          <MonitorIcon className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === themes.SYSTEM && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle