import { useState, useEffect } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import VideoList from '@/components/VideoList'
import FileImport from '@/components/FileImport'
import { 
  getStoredVideos, 
  saveVideos,
  setupThemeListener 
} from '@/utils/localStorage'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'

const App = () => {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')
  
  // Load saved videos and theme on mount
  useEffect(() => {
    // Load videos
    const storedVideos = getStoredVideos()
    if (storedVideos.length) setVideos(storedVideos)
    
    // Load theme preference
    const savedTheme = localStorage.getItem('videoplayer_theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
    
    // Set up theme listener for system preference changes
    const cleanup = setupThemeListener(setThemeWithPersistence)
    
    return cleanup
  }, [])
  
  // Set theme with persistence
  const setThemeWithPersistence = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('videoplayer_theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }
  
  // Save videos to localStorage whenever they change
  useEffect(() => {
    saveVideos(videos)
  }, [videos])
  
  // Handle new videos added via import
  const handleImportVideos = (importedVideos) => {
    const newVideos = [...videos]
    
    importedVideos.forEach(video => {
      if (!videos.some(v => v.url === video.url)) {
        newVideos.push({
          ...video,
          progress: 0,
          lastPlayed: null
        })
      }
    })
    
    setVideos(newVideos)
  }
  
  // Handle video deletion
  const handleDeleteVideo = (urlToDelete) => {
    // Create new array without the deleted video
    const updatedVideos = videos.filter(video => video.url !== urlToDelete)
    setVideos(updatedVideos)
    
    // If the current video is being deleted, clear the current video
    if (currentVideo && currentVideo.url === urlToDelete) {
      setCurrentVideo(null)
    }
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      "transition-colors duration-300"
    )}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
            React Video Player
          </h1>
          <ThemeToggle theme={theme} setTheme={setThemeWithPersistence} />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentVideo ? (
              <VideoPlayer
                video={currentVideo}
                videos={videos}
                setVideos={setVideos}
              />
            ) : (
              <div className="bg-card text-card-foreground rounded-lg p-8 shadow-md border border-border flex flex-col items-center justify-center min-h-[300px]">
                <div className="mb-4 opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2">No video selected</h2>
                <p className="text-center text-muted-foreground">
                  Select a video from the list or import new videos to get started
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <FileImport onImport={handleImportVideos} />
            
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md border border-border">
              <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search videos..."
                  className={cn(
                    "w-full py-2 pl-10 pr-4 bg-background border rounded-md",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                    "transition-colors"
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <VideoList 
                videos={videos}
                searchTerm={searchTerm}
                onVideoSelect={setCurrentVideo}
                onDeleteVideo={handleDeleteVideo}
                currentVideoUrl={currentVideo?.url}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App