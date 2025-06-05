import { useState, useEffect, useRef, useCallback } from 'react'

export function usePlyrSetup(video, videos, onSelectVideo) {
  const plyrRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [player, setPlayer] = useState(null)

  // Error codes mapping
  const errorCodes = {
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4
  }

  // Get detailed error message based on error code
  const getDetailedErrorMessage = (error) => {
    switch (error?.code) {
      case errorCodes.MEDIA_ERR_ABORTED:
        return "Video playback was aborted by the user"
      case errorCodes.MEDIA_ERR_NETWORK:
        return "A network error occurred. Check your connection and try again."
      case errorCodes.MEDIA_ERR_DECODE:
        return "The video is corrupted or uses a format that your browser doesn't support."
      case errorCodes.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "This video format or source is not supported by your browser."
      default:
        return "An unknown error occurred during video playback."
    }
  }

  // Handle video end
  const handleVideoEnded = useCallback(() => {
    // Auto-play next video if available
    const currentIndex = videos.findIndex(v => v.url === video?.url)
    if (currentIndex < videos.length - 1) {
      onSelectVideo(videos[currentIndex + 1])
    }
  }, [videos, video, onSelectVideo])

  // Handle video errors
  const handleVideoError = useCallback((event) => {
    console.error('Video error:', event)
    setHasError(true)
    
    let message = getDetailedErrorMessage(event?.detail)
    setErrorMessage(message)
    
    // Log to analytics or monitoring service
    // logError({ type: 'video_playback', message, url: video?.url })
  }, [])

  // Plyr event handlers
  const onPlyrReady = useCallback((playerInstance) => {
    setPlayer(playerInstance)
    setHasError(false)
    setErrorMessage('')
  }, [])

  // Setup event listeners once player is ready
  useEffect(() => {
    if (!player) return
    
    // Setup event handlers
    const endedHandler = handleVideoEnded
    const errorHandler = handleVideoError
    const fullscreenEnterHandler = () => setIsFullscreen(true)
    const fullscreenExitHandler = () => setIsFullscreen(false)
    
    // Get the Plyr element
    const plyrElement = player.elements?.container
    
    if (plyrElement) {
      plyrElement.addEventListener('ended', endedHandler)
      plyrElement.addEventListener('error', errorHandler)
      plyrElement.addEventListener('enterfullscreen', fullscreenEnterHandler)
      plyrElement.addEventListener('exitfullscreen', fullscreenExitHandler)
    }
    
    return () => {
      if (plyrElement) {
        plyrElement.removeEventListener('ended', endedHandler)
        plyrElement.removeEventListener('error', errorHandler)
        plyrElement.removeEventListener('enterfullscreen', fullscreenEnterHandler)
        plyrElement.removeEventListener('exitfullscreen', fullscreenExitHandler)
      }
    }
  }, [player, handleVideoEnded, handleVideoError, video])

  // Effect to handle video changes
  useEffect(() => {
    if (player && video) {
      setHasError(false)
      setErrorMessage('')
    }
  }, [video, player])

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    const blobUrls = []
    
    if (video?.url && video.url.startsWith('blob:')) {
      blobUrls.push(video.url)
    }
    
    return () => {
      blobUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [video])

  // Initialize player after mount
  useEffect(() => {
    const playerInstance = plyrRef.current?.plyr
    if (playerInstance && !player) {
      onPlyrReady(playerInstance)
    }
  }, [onPlyrReady, player])

  // Cleanup player when component unmounts
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }
    };
  }, [player]);

  // Custom retry function
  const retryVideo = () => {
    if (player) {
      setHasError(false)
      setErrorMessage('')
      player.restart()
    }
  }

  return {
    plyrRef,
    player,
    isFullscreen,
    hasError,
    errorMessage,
    handleVideoEnded,
    handleVideoError,
    retryVideo
  }
}