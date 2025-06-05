import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Plyr from 'plyr-react'
import { cn } from '@/lib/utils'
import { usePlyrSetup } from '@/hooks/usePlyrSetup' // Create this hook
import 'plyr/dist/plyr.css'

const VideoPlayer = ({ video, videos, onSelectVideo }) => {
  const {
    plyrRef,
    player,
    isFullscreen,
    hasError,
    errorMessage,
    handleVideoEnded,
    handleVideoError,
    retryVideo
  } = usePlyrSetup(video, videos, onSelectVideo)

  // Navigation functions
  const goToPreviousVideo = () => {
    const currentIndex = videos.findIndex(v => v.url === video?.url)
    if (currentIndex > 0) {
      onSelectVideo(videos[currentIndex - 1])
    }
  }

  const goToNextVideo = () => {
    const currentIndex = videos.findIndex(v => v.url === video?.url)
    if (currentIndex < videos.length - 1) {
      onSelectVideo(videos[currentIndex + 1])
    }
  }

  // Add memoized video source generation
  const videoSource = useMemo(() => getVideoSource(video), [video?.url])

  if (!video) {
    return <EmptyPlayerState />
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border transition-all video-player-container">
      <div className={cn("relative", isFullscreen && "h-screen max-h-screen w-screen")}>
        <Plyr
          ref={plyrRef}
          source={videoSource}
          options={plyrOptions}
          className="plyr-react plyr--video"
        />
        
        {/* Video navigation controls */}
        {!isFullscreen && videos.length > 1 && (
          <NavigationControls 
            goToPreviousVideo={goToPreviousVideo}
            goToNextVideo={goToNextVideo}
            isFirst={videos.findIndex(v => v.url === video.url) === 0}
            isLast={videos.findIndex(v => v.url === video.url) === videos.length - 1}
          />
        )}
        
        {/* Error overlay */}
        {hasError && (
          <ErrorOverlay 
            errorMessage={errorMessage} 
            retryVideo={retryVideo}
            goToNextVideo={goToNextVideo}
          />
        )}  
      </div>
      
      {/* Video info card (outside player) */}
      {!isFullscreen && (
        <VideoInfoCard video={video} />
      )}
    </div>
  )
}

export default VideoPlayer

// Helper components and functions
function EmptyPlayerState() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border transition-all">
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <p>No video selected</p>
        </div>
      </div>
    </div>
  )
}

function NavigationControls({ goToPreviousVideo, goToNextVideo, isFirst, isLast }) {
  return (
    <div className="absolute top-2 right-2 z-20 flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg">
      <button 
        className="p-1 text-white/80 hover:text-white disabled:opacity-40"
        onClick={goToPreviousVideo}
        disabled={isFirst}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="19 20 9 12 19 4 19 20"></polygon>
          <line x1="5" y1="19" x2="5" y2="5"></line>
        </svg>
      </button>
      <button
        className="p-1 text-white/80 hover:text-white disabled:opacity-40"
        onClick={goToNextVideo}
        disabled={isLast}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 4 15 12 5 20 5 4"></polygon>
          <line x1="19" y1="5" x2="19" y2="19"></line>
        </svg>
      </button>
    </div>
  )
}

function ErrorOverlay({ errorMessage, retryVideo, goToNextVideo }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
      <div className="bg-card/95 backdrop-blur-sm p-8 rounded-xl max-w-md text-center border border-destructive/20 shadow-2xl">
        <div className="relative mx-auto mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="absolute inset-0 border-2 border-destructive/30 rounded-full animate-ping"></div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-destructive">Playback Error</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{errorMessage}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={retryVideo}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
          
          <button 
            className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg hover:bg-secondary/80 transition-all duration-200 font-medium hover:scale-105"
            onClick={goToNextVideo}
          >
            Skip Video
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoInfoCard({ video }) {
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">{video?.name}</h2>
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm break-all line-clamp-1 flex-1">
          {video?.url}
        </p>
      </div>
    </div>
  )
}

function getVideoSource(video) {
  return {
    type: 'video',
    sources: video ? [{
      src: video.url,
      type: getVideoType(video.url, video)
    }] : [],
    poster: ''
  }
}

// Fix the getVideoType function - replace with this version
function getVideoType(url, video) {
  // Handle blob URLs for local files
  if (url.startsWith('blob:')) {
    // Try to infer type from original file if available
    if (video?.isLocalFile && video?.originalType) {
      return video.originalType;
    }
    return 'video/mp4'; // Default type for blob URLs
  }
  
  const extension = url.split('.').pop().toLowerCase();
  const typeMap = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'm3u8': 'application/x-mpegURL'
  }
  return typeMap[extension] || 'video/mp4';
}

// Plyr options - moved outside component to prevent recreating on each render
const plyrOptions = {
  controls: [
    'play-large',
    'play',
    'progress', 
    'current-time',
    'duration',
    'mute',
    'volume',
    'fullscreen'
  ],
  settings: ['captions', 'quality', 'speed'],
  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
  keyboard: { focused: true, global: false },
  tooltips: { controls: false, seek: false },
  captions: { active: false, update: true },
  quality: {
    default: 720,
    options: [1080, 720, 480, 360]
  },
  storage: { enabled: true, key: 'plyr_video_player_settings' }
}