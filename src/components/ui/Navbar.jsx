import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

const Navbar = ({ theme, setTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { showToast } = useToast()
  
  const handleLibraryClick = (e) => {
    e.preventDefault()
    // Scroll to the video list section
    const videoList = document.querySelector('.video-list-container') || document.querySelector('.bg-card.text-card-foreground.p-4')
    
    if (videoList) {
      videoList.scrollIntoView({ behavior: 'smooth', block: 'start' })
      showToast('Navigated to your video library', 'success')
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }
  
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
            React Video Player
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a 
            href="#library" 
            className="text-foreground/80 hover:text-primary transition-colors"
            onClick={handleLibraryClick}
          >
            Library
          </a>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        
        {/* Mobile menu */}
        <div className={cn(
          "absolute top-full left-0 right-0 bg-background border-b border-border md:hidden",
          "transition-all duration-300 origin-top",
          isMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
        )}>
          <div className="container mx-auto px-4 py-3 flex flex-col gap-4">
            <a 
              href="#library" 
              className="py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={handleLibraryClick}
            >
              Library
            </a>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Toggle theme</span>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar