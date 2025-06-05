import { useState, useEffect } from 'react'
import { getStoredVideos, saveVideos } from '@/utils/localStorage'

export function useVideoManager() {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load saved videos on mount
  useEffect(() => {
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
          url: video.url
        })
      }
    })
    
    setVideos(newVideos)
  }
  
  // Handle video deletion
  const handleDeleteVideo = (urlToDelete) => {
    const updatedVideos = videos.filter(video => video.url !== urlToDelete)
    setVideos(updatedVideos)
    
    if (currentVideo && currentVideo.url === urlToDelete) {
      setCurrentVideo(null)
    }
  }

  return {
    videos,
    currentVideo,
    searchTerm,
    setCurrentVideo,
    setSearchTerm,
    handleImportVideos,
    handleDeleteVideo
  }
}