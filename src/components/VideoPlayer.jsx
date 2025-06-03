import { useState, useEffect, useRef } from 'react'
import { saveVideoProgress } from '@/utils/localStorage'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'

const VideoPlayer = ({ video, videos, setVideos }) => {
  // State management
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const controlsRef = useRef(null)
  const timelineRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const nextVideoCache = useRef(null)
  
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 0.8,
    muted: false,
    playbackRate: 1.0,
    isFullscreen: false
  })
  
  const [uiState, setUiState] = useState({
    showControls: true,
    isLoading: true,
    isVolumeSliderOpen: false,
    isSpeedMenuOpen: false,
    isSettingsOpen: false,
    isHoveringTimeline: false,
    timelineHoverPosition: null,
    timelinePreviewTime: 0,
    videoReady: false
  })
  
  // Derived state
  const { playing, currentTime, duration, buffered, volume, muted, playbackRate, isFullscreen } = playerState
  const { showControls, isLoading, isVolumeSliderOpen, isSpeedMenuOpen, 
          isSettingsOpen, isHoveringTimeline, timelineHoverPosition, videoReady } = uiState
  
  // Speed options
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
  
  // Preload next video when it changes
  useEffect(() => {
    // Clean up previous preload
    if (nextVideoCache.current) {
      URL.revokeObjectURL(nextVideoCache.current)
      nextVideoCache.current = null
    }
    
    // Start with fresh loading state when video changes
    setUiState(prev => ({...prev, isLoading: true, videoReady: false}))
    
    // For local file URLs, we don't need preloading
    if (video?.url.startsWith('blob:') || video?.url.startsWith('file:')) {
      return
    }
    
    // For remote URLs that support preloading
    if (video?.url) {
      // Only preload if source is prefetchable (http/https)
      if (video.url.startsWith('http')) {
        // Create a hidden video element to preload the next video
        const preloader = document.createElement('video')
        preloader.preload = 'auto'
        preloader.src = video.url
        
        // Listen for enough data to start playback
        preloader.addEventListener('canplay', () => {
          setUiState(prev => ({...prev, videoReady: true}))
        })
        
        // Start loading data
        preloader.load()
      }
    }
  }, [video?.url])

  // Load video with saved progress
  useEffect(() => {
    if (video && videoRef.current) {
      // Reset player state for new video
      setPlayerState(prev => ({
        ...prev, 
        currentTime: 0,
        duration: 0,
        playing: false
      }))
      
      // Set video source and load it
      if (videoRef.current.src !== video.url) {
        videoRef.current.src = video.url
        videoRef.current.load()
      }
      
      // Try to set initial position based on saved progress
      const setInitialProgress = () => {
        if (videoRef.current && videoRef.current.duration) {
          const targetTime = (video.progress || 0) * videoRef.current.duration
          videoRef.current.currentTime = targetTime
        }
      }
      
      // Set position once metadata is loaded
      if (videoRef.current.readyState >= 1) {
        setInitialProgress()
      } else {
        // Wait for metadata to load if not ready yet
        const handleMetadata = () => {
          setInitialProgress()
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata)
        }
        videoRef.current.addEventListener('loadedmetadata', handleMetadata)
      }
    }
  }, [video])
  
  // Update volume from state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])
  
  // Update playback rate from state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current || document.activeElement.tagName === 'INPUT') return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          seek(currentTime + 10)
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(currentTime - 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          adjustVolume(Math.min(1, volume + 0.05))
          break
        case 'ArrowDown':
          e.preventDefault()
          adjustVolume(Math.max(0, volume - 0.05))
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        default:
          break
      }
      
      showControlsTemporarily()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, volume, muted, playing])
  
  // Auto-hide controls after inactivity
  const showControlsTemporarily = () => {
    setUiState(prev => ({...prev, showControls: true}))
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setUiState(prev => ({...prev, showControls: false}))
      }
    }, 3000)
  }
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }))
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      if (nextVideoCache.current) URL.revokeObjectURL(nextVideoCache.current)
    }
  }, [])
  
  // Calculate buffered amount
  useEffect(() => {
    if (!videoRef.current) return
    
    const updateBuffered = () => {
      if (videoRef.current && videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
        const bufferedPercent = bufferedEnd / videoRef.current.duration
        setPlayerState(prev => ({...prev, buffered: bufferedPercent}))
      }
    }
    
    const video = videoRef.current
    video.addEventListener('progress', updateBuffered)
    return () => video.removeEventListener('progress', updateBuffered)
  }, [])
  
  // Player control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
        setPlayerState(prev => ({...prev, playing: false}))
      } else {
        // Attempt autoplay with user gesture
        const playPromise = videoRef.current.play()
        
        if (playPromise !== undefined) {
          // Update UI immediately for better responsiveness
          setPlayerState(prev => ({...prev, playing: true}))
          
          playPromise.catch(error => {
            // Autoplay was prevented
            console.warn('Autoplay was prevented:', error)
            
            // Update UI to reflect that play didn't start
            setPlayerState(prev => ({...prev, playing: false}))
          })
        }
      }
      
      showControlsTemporarily()
    }
  }
  
  const seek = (time) => {
    if (videoRef.current) {
      const newTime = Math.min(Math.max(0, time), videoRef.current.duration)
      videoRef.current.currentTime = newTime
      setPlayerState(prev => ({...prev, currentTime: newTime}))
    }
  }
  
  const adjustVolume = (newVolume) => {
    const clampedVolume = Math.min(Math.max(0, newVolume), 1)
    setPlayerState(prev => ({...prev, volume: clampedVolume, muted: clampedVolume === 0}))
  }
  
  const toggleMute = () => {
    setPlayerState(prev => ({...prev, muted: !prev.muted}))
  }
  
  const changePlaybackRate = (rate) => {
    setPlayerState(prev => ({...prev, playbackRate: rate}))
    setUiState(prev => ({...prev, isSpeedMenuOpen: false}))
  }
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
  
  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (error) {
      console.error('Picture-in-Picture failed:', error)
    }
  }
  
  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    
    setPlayerState(prev => ({...prev, currentTime: videoRef.current.currentTime}))
    
    // Calculate progress as percentage
    const progress = videoRef.current.currentTime / videoRef.current.duration
    
    // Update video progress in parent state
    const updatedVideos = videos.map(v => {
      if (v.url === video.url) {
        return { ...v, progress, lastPlayed: new Date().toISOString() }
      }
      return v
    })
    
    setVideos(updatedVideos)
    
    // Save to localStorage periodically (every 2 seconds)
    if (Math.floor(videoRef.current.currentTime) % 2 === 0) {
      saveVideoProgress(video.url, progress)
    }
  }
  
  // Format time (seconds → "00:00" or "00:00:00" if hours > 0)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00'
    
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Handle timeline hover for preview
  const handleTimelineHover = (e) => {
    if (!timelineRef.current || !duration) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const position = (e.clientX - rect.left) / rect.width
    const previewTime = position * duration
    
    setUiState(prev => ({
      ...prev,
      isHoveringTimeline: true,
      timelineHoverPosition: position,
      timelinePreviewTime: previewTime
    }))
  }
  
  // Handle click anywhere to toggle controls
  const handlePlayerClick = (e) => {
    // Don't trigger if clicking on a control
    if (controlsRef.current && controlsRef.current.contains(e.target)) return
    
    togglePlay()
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border transition-all">
      {/* Player container */}
      <div 
        ref={playerRef}
        className={cn(
          "relative aspect-video bg-black",
          isFullscreen && "h-screen max-h-screen w-screen"
        )} 
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => playing && setUiState(prev => ({...prev, showControls: false}))}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlayerState(prev => ({...prev, playing: true}))}
          onPause={() => setPlayerState(prev => ({...prev, playing: false}))}
          onDurationChange={(e) => setPlayerState(prev => ({...prev, duration: e.target.duration}))}
          onClick={handlePlayerClick}
          onError={() => console.error("Video failed to load")}
          onWaiting={() => setUiState(prev => ({...prev, isLoading: true}))}
          onCanPlay={() => setUiState(prev => ({...prev, isLoading: false, videoReady: true}))}
          onLoadedData={() => setUiState(prev => ({...prev, isLoading: false}))}
          playsInline
          preload="auto"
        />
        
        {/* Big play button overlay (when video is paused) */}
        {!playing && !isLoading && videoReady && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <div className="bg-primary/20 hover:bg-primary/40 rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-md transition-transform transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-white mt-4">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Video controls */}
        <div 
          ref={controlsRef}
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 transition-all duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Custom gradient background for better control visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
          
          {/* Timeline preview (when hovering) */}
          {isHoveringTimeline && timelineHoverPosition !== null && (
            <div 
              className="absolute bottom-16 bg-black/80 rounded-md py-1 px-2 transform -translate-x-1/2 pointer-events-none border border-white/20 backdrop-blur-md"
              style={{ left: `${timelineHoverPosition * 100}%` }}
            >
              <span className="text-white text-xs font-medium">
                {formatTime(uiState.timelinePreviewTime)}
              </span>
            </div>
          )}
          
          {/* Timeline/seek bar */}
          <div 
            className="px-4 pt-2" 
            ref={timelineRef}
            onMouseMove={handleTimelineHover}
            onMouseEnter={() => setUiState(prev => ({...prev, isHoveringTimeline: true}))}
            onMouseLeave={() => setUiState(prev => ({...prev, isHoveringTimeline: false}))}
          >
            <div className="relative h-1.5 group">
              {/* Track background */}
              <div className="absolute inset-0 rounded-full bg-white/30"></div>
              
              {/* Buffered indicator */}
              <div 
                className="absolute inset-y-0 left-0 bg-white/50 rounded-full" 
                style={{ width: `${buffered * 100}%` }}
              ></div>
              
              {/* Progress indicator */}
              <div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                {/* Thumb/handle that appears on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-white transition-opacity"></div>
              </div>
              
              {/* Invisible larger hit area for better UX */}
              <input 
                type="range" 
                min="0" 
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-8 -top-3"
              />
            </div>
            
            {/* Time display */}
            <div className="flex justify-between text-xs text-white/90 pt-1.5 pb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main controls row */}
          <div className="px-4 pb-4 flex items-center justify-between">
            {/* Left side controls */}
            <div className="flex items-center space-x-4">
              {/* Play/pause */}
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-primary transition-colors focus:outline-none"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                  </svg>
                )}
              </button>
              
              {/* Skip backward 10s */}
              <button 
                onClick={() => seek(currentTime - 10)}
                className="text-white hover:text-primary transition-colors focus:outline-none"
                aria-label="Skip back 10 seconds"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                </svg>
              </button>
              
              {/* Skip forward 10s */}
              <button 
                onClick={() => seek(currentTime + 10)}
                className="text-white hover:text-primary transition-colors focus:outline-none"
                aria-label="Skip forward 10 seconds"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                </svg>
              </button>
              
              {/* Volume control */}
              <div className="relative">
                <button 
                  onClick={toggleMute} 
                  onMouseEnter={() => setUiState(prev => ({...prev, isVolumeSliderOpen: true}))}
                  className="text-white hover:text-primary transition-colors focus:outline-none"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                      <path d="M18.584 18.894a.75.75 0 001.06 0 9 9 0 000-12.788.75.75 0 00-1.06 1.06 7.5 7.5 0 010 10.668.75.75 0 000 1.06z" />
                      <path d="M15.932 15.874a.75.75 0 00.578-1.359A6 6 0 1001.555 9.01a.75.75 0 00-1.352.647A7.5 7.5 0 0115.932 15.874z" />
                      <path d="M15.432 16.87a.75.75 0 10.598-1.373A7.493 7.493 0 008.25 4.5a.75.75 0 00-.75.75v11.25c0 .414.336.75.75.75h5.25a7.493 7.493 0 002.932-.38z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM10.5 12.75a.75.75 0 000-1.5.75.75 0 000 1.5z" />
                      <path d="M10.5 6a.75.75 0 000 1.5.75.75 0 000-1.5zm0 9.75a.75.75 0 000 1.5.75.75 0 000-1.5zM10.5 9.75a.75.75 0 000-1.5.75.75 0 000 1.5zm0 3a.75.75 0 000 1.5.75.75 0 000-1.5zm4.5-5.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" />
                      <path d="M3.75 10.5a.75.75 0 000 1.5.75.75 0 000-1.5zm1.5-1.5a.75.75 0 000-1.5.75.75 0 000 1.5zm0 3a.75.75 0 000 1.5.75.75 0 000-1.5zm3-3a.75.75 0 000 1.5.75.75 0 000-1.5z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM10.5 12.75a.75.75 0 000-1.5.75.75 0 000 1.5z" />
                    </svg>
                  )}
                </button>
                
                {/* Volume slider */}
                <div 
                  className={cn(
                    "absolute bottom-full left-0 mb-2 py-2 px-3 rounded-md bg-black/80 backdrop-blur-md border border-white/10 shadow-lg transform -translate-x-1/4 transition-all",
                    isVolumeSliderOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                  )}
                  onMouseEnter={() => setUiState(prev => ({...prev, isVolumeSliderOpen: true}))}
                  onMouseLeave={() => setUiState(prev => ({...prev, isVolumeSliderOpen: false}))}
                >
                  <div className="flex flex-col items-center w-28">
                    <div className="w-full h-20 flex flex-col justify-between items-center">
                      <div className="relative w-1.5 h-full bg-white/30 rounded-full">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-full"
                          style={{ height: `${volume * 100}%` }}
                        ></div>
                        
                        {/* Invisible input for better accessibility */}
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={muted ? 0 : volume}
                          onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                          className="absolute inset-0 w-6 -left-2 h-full opacity-0 cursor-pointer"
                          style={{ WebkitAppearance: "slider-vertical" }}
                          orient="vertical"
                        />
                      </div>
                      <span className="text-white text-xs mt-2">{Math.round((muted ? 0 : volume) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Playback speed */}
              <div className="relative">
                <button 
                  onClick={() => setUiState(prev => ({...prev, isSpeedMenuOpen: !prev.isSpeedMenuOpen}))}
                  className="text-white text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {playbackRate}x
                </button>
                
                {/* Speed selection menu */}
                {isSpeedMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 py-1 bg-black/80 backdrop-blur-md rounded-md border border-white/10 shadow-lg min-w-[90px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changePlaybackRate(speed)}
                        className={cn(
                          "w-full text-left py-1.5 px-3 text-sm hover:bg-white/10 transition-colors",
                          playbackRate === speed ? "text-primary font-medium" : "text-white"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Picture in Picture */}
              <button
                onClick={togglePictureInPicture}
                className="text-white hover:text-primary transition-colors focus:outline-none"
                aria-label="Picture in Picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25z" />
                </svg>
              </button>
              
              {/* Fullscreen toggle */}
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-colors focus:outline-none"
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3.22 3.22a.75.75 0 011.06 0l3.97 3.97V4.5a.75.75 0 011.5 0V9a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h2.69L3.22 4.28a.75.75 0 010-1.06zm17.56 0a.75.75 0 010 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0zM3.75 15a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.97 3.97a.75.75 0 01-1.06-1.06l3.97-3.97H4.5a.75.75 0 01-.75-.75zm10.5 0a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-2.69l3.97 3.97a.75.75 0 11-1.06 1.06l-3.97-3.97v2.69a.75.75 0 01-1.5 0V15z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video info card (outside player) - only shown when not fullscreen */}
      {!isFullscreen && (
        <div className="p-4 space-y-3">
          <h2 className="text-xl font-bold">{video?.name}</h2>
          
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(video?.progress || 0) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {Math.round((video?.progress || 0) * 100)}% watched
            </span>
          </div>
          
          {/* Video metadata */}
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm break-all line-clamp-1 flex-1">
              {video?.url}
            </p>
            
            {video?.lastPlayed && (
              <div className="flex items-center text-xs text-muted-foreground ml-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" />
                </svg>
                {new Date(video.lastPlayed).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer