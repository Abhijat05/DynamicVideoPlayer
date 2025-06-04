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
import Navbar from '@/components/ui/Navbar'
import { motion } from '@/utils/motion'

const App = () => {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')

  // Load saved videos and theme on mount
  useEffect(() => {
    // Set up theme listener for system preference changes
    const cleanup = setupThemeListener(setThemeWithPersistence)
    
    // Load videos
    const storedVideos = getStoredVideos()
    if (storedVideos.length) setVideos(storedVideos)
    
    // Load theme preference
    const savedTheme = localStorage.getItem('videoplayer_theme')
    if (savedTheme) {
      setThemeWithPersistence(savedTheme)
    } else {
      // If no saved theme, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeWithPersistence(prefersDark ? 'dark' : 'light')
    }
    
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
          url: video.url
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
      <Navbar theme={theme} setTheme={setThemeWithPersistence} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentVideo ? (
              <VideoPlayer
                video={currentVideo}
                videos={videos}
                setVideos={setVideos}
                onSelectVideo={setCurrentVideo}
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
            
            <VideoList
              videos={videos}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onVideoSelect={setCurrentVideo}
              onDeleteVideo={handleDeleteVideo}
              currentVideoUrl={currentVideo?.url}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App