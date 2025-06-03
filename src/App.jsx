import { useState, useEffect } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import VideoList from '@/components/VideoList'
import FileImport from '@/components/FileImport'
import { 
  getStoredVideos, 
  saveVideos 
} from '@/utils/localStorage'

const App = () => {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Load saved videos on mount
  useEffect(() => {
    // Load videos
    const storedVideos = getStoredVideos()
    if (storedVideos.length) setVideos(storedVideos)
  }, [])
  
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Video Player</h1>
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
              <div className="bg-card text-card-foreground rounded-lg p-8 text-center shadow-md">
                <p className="text-xl">Select a video from the list or import new videos</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <FileImport onImport={handleImportVideos} />
            
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
              <input
                type="text"
                placeholder="Search videos..."
                className="w-full p-2 mb-4 border rounded bg-muted text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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