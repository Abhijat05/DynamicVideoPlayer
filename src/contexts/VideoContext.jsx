import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from "@/hooks/useLocalStorage";

const VideoContext = createContext(null);

export function VideoProvider({ children }) {
  // State for videos, collections and recently played
  const [videos, setVideos] = useLocalStorage('videos', []);
  const [collections, setCollections] = useLocalStorage('collections', {});
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);
  const [watchProgress, setWatchProgress] = useLocalStorage('watchProgress', {}); // New: track progress per video
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // Effect to organize videos into collections
  useEffect(() => {
    const newCollections = {};
    
    videos.forEach(video => {
      if (video.name) {
        if (!newCollections[video.name]) {
          newCollections[video.name] = [];
        }
        newCollections[video.name].push(video);
      }
    });
    
    // Only keep collections with more than one video
    const filteredCollections = {};
    Object.entries(newCollections).forEach(([name, videoList]) => {
      if (videoList.length > 1) {
        filteredCollections[name] = videoList;
      }
    });
    
    setCollections(filteredCollections);
  }, [videos, setCollections]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    
    // Add to recently played
    const now = new Date().toISOString();
    const updatedVideo = { ...video, lastPlayed: now };
    
    setRecentlyPlayed(prev => {
      // Remove if already exists
      const filtered = prev.filter(v => v.url !== video.url);
      // Add to beginning (most recent)
      return [updatedVideo, ...filtered].slice(0, 10); // Keep only last 10
    });
  };

  // New: Save watch progress
  const handleProgressUpdate = (videoUrl, currentTime, duration) => {
    if (!videoUrl || !duration || duration === 0) return;
    
    const progressPercent = (currentTime / duration) * 100;
    
    // Only save if progress is meaningful (more than 5% and less than 95%)
    if (progressPercent > 5 && progressPercent < 95) {
      setWatchProgress(prev => ({
        ...prev,
        [videoUrl]: {
          currentTime,
          duration,
          progressPercent,
          lastWatched: new Date().toISOString()
        }
      }));
    } else if (progressPercent >= 95) {
      // Mark as completed - remove progress
      setWatchProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoUrl];
        return newProgress;
      });
    }
  };

  // New: Get saved progress for a video
  const getVideoProgress = (videoUrl) => {
    return watchProgress[videoUrl] || null;
  };

  const handleAddVideo = (video) => {
    setVideos(prev => {
      // Check if video already exists
      if (prev.some(v => v.url === video.url)) {
        return prev; // Don't add duplicates
      }
      return [...prev, video];
    });
  };

  const handleImportVideos = (newVideos) => {
    setVideos(prev => {
      // Filter out duplicates based on URL
      const existingUrls = new Set(prev.map(v => v.url));
      const uniqueNewVideos = newVideos.filter(v => !existingUrls.has(v.url));
      
      return [...prev, ...uniqueNewVideos];
    });
  };

  return (
    <VideoContext.Provider value={{
      videos,
      collections,
      recentlyPlayed,
      currentVideo,
      watchProgress,
      handleVideoSelect,
      handleAddVideo,
      handleImportVideos,
      handleProgressUpdate,
      getVideoProgress
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}