import { useState, useEffect, useRef } from 'react'
import { saveVideoProgress } from '@/utils/localStorage'

const VideoPlayer = ({ video, videos, setVideos }) => {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  
  // Load video with saved progress
  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.currentTime = video.progress * duration
    }
  }, [video, duration])
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          videoRef.current.currentTime += 10
          break
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10
          break
        default:
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setPlaying(!playing)
    }
  }
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      
      // Save progress (as percentage)
      const progress = videoRef.current.currentTime / videoRef.current.duration
      
      // Update video progress in state
      const updatedVideos = videos.map(v => {
        if (v.url === video.url) {
          return { ...v, progress, lastPlayed: new Date().toISOString() }
        }
        return v
      })
      
      setVideos(updatedVideos)
      
      // Save to localStorage every 2 seconds
      if (Math.floor(videoRef.current.currentTime) % 2 === 0) {
        saveVideoProgress(video.url, progress)
      }
    }
  }
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }
  
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }
  
  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
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
      console.error('PiP failed:', error)
    }
  }
  
  // Format time for display (mm:ss)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={video?.url}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onError={() => console.error('Video failed to load')}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2">
          {/* Progress bar */}
          <div className="relative h-1 bg-gray-400 cursor-pointer mb-2" 
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect()
                 const pos = (e.clientX - rect.left) / rect.width
                 videoRef.current.currentTime = pos * duration
               }}>
            <div 
              className="absolute top-0 left-0 h-full bg-red-500" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Play/Pause button */}
              <button onClick={togglePlay} className="focus:outline-none">
                {playing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              
              {/* Time display */}
              <div>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              {/* Volume control */}
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16" 
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Playback speed */}
              <div className="relative group">
                <button className="focus:outline-none">{playbackRate}x</button>
                <div className="hidden absolute bottom-full right-0 bg-gray-800 rounded shadow-lg p-2 group-hover:block">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button 
                      key={rate} 
                      className={`block px-2 py-1 hover:bg-gray-700 w-full text-left ${playbackRate === rate ? 'text-red-500' : ''}`}
                      onClick={() => handlePlaybackRateChange(rate)}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Picture-in-Picture */}
              <button onClick={togglePictureInPicture} className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </button>
              
              {/* Fullscreen button */}
              <button onClick={toggleFullScreen} className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video info */}
      <div className="p-4">
        <h2 className="text-xl font-bold">{video?.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 break-all">{video?.url}</p>
      </div>
    </div>
  )
}

export default VideoPlayer