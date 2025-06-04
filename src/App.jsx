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
import { motion, fadeIn } from '@/utils/motion'
import { Search, X } from 'lucide-react'

const RecentlyPlayed = ({ videos, onVideoSelect, currentVideoUrl }) => {
  // Get recently played videos (with lastPlayed date, sorted by most recent)
  const recentVideos = videos
    .filter(video => video.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
    .slice(0, 5);
  
  if (recentVideos.length === 0) return null;
  
  return (
    <motion.div 
      variants={fadeIn('up')}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-lg p-4 shadow-md border border-border mb-6"
    >
      <h2 className="text-lg font-semibold mb-3">Recently Played</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {recentVideos.map(video => (
          <div 
            key={video.url}
            className={cn(
              "flex-shrink-0 w-32 cursor-pointer rounded-md overflow-hidden border transition-all",
              currentVideoUrl === video.url 
                ? "border-primary ring-1 ring-primary" 
                : "border-border hover:border-primary/30"
            )}
            onClick={() => onVideoSelect(video)}
          >
            <div className="bg-secondary aspect-video flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
              </svg>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-1">{video.name}</p>
              {video.progress > 0 && (
                <div className="mt-1 h-1 bg-secondary rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${video.progress * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const App = () => {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')
  const [showQuickMenu, setShowQuickMenu] = useState(false);

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
            <div className="lg:col-span-3">
              <RecentlyPlayed 
                videos={videos}
                onVideoSelect={setCurrentVideo}
                currentVideoUrl={currentVideo?.url}
              />
            </div>
            
            <FileImport onImport={handleImportVideos} />
            
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md border border-border video-list-container">
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
      
      <div className="fixed bottom-16 right-4 z-30">
        <div className={`space-y-2 mb-2 transition-all ${showQuickMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
          <button 
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            onClick={() => document.querySelector('input[placeholder*="Search videos"]')?.focus()}
            title="Search Videos"
          >
            <Search size={20} />
          </button>
          <button 
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            onClick={() => document.querySelector('summary, [role="button"]')?.click()}
            title="Import Videos"
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>
        
        <button
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={() => setShowQuickMenu(!showQuickMenu)}
        >
          {showQuickMenu ? (
            <X size={24} />
          ) : (
            <span className="text-lg font-bold">•••</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default App