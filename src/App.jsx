import VideoPlayer from '@/components/VideoPlayer'
import VideoList from '@/components/VideoList'
import FileImport from '@/components/FileImport'
import { cn } from '@/lib/utils'
import Navbar from '@/components/ui/Navbar'
import { useVideoManager } from '@/hooks/useVideoManager'
import { useThemeManager } from '@/hooks/useThemeManager'

const App = () => {
  const { 
    videos, 
    currentVideo, 
    searchTerm, 
    setCurrentVideo, 
    setSearchTerm,
    handleImportVideos, 
    handleDeleteVideo 
  } = useVideoManager()
  
  const themeManager = useThemeManager() 
  
  return (
    <div className={cn("min-h-screen bg-background text-foreground transition-colors duration-300")}>
      <Navbar 
        theme={themeManager.theme} 
        setTheme={themeManager.setTheme} 
        themes={themeManager.themes}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentVideo ? (
              <VideoPlayer
                video={currentVideo}
                videos={videos}
                setVideos={setCurrentVideo}
                onSelectVideo={setCurrentVideo}
              />
            ) : (
              <EmptyVideoPlayer />
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

const EmptyVideoPlayer = () => (
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
)

export default App