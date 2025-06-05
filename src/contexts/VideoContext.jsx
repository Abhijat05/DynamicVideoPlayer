import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from "@/hooks/useLocalStorage";

const VideoContext = createContext(null);

export function VideoProvider({ children }) {
  // State for videos, collections and recently played
  const [videos, setVideos] = useLocalStorage('videos', []);
  const [collections, setCollections] = useLocalStorage('collections', {});
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);
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
      handleVideoSelect,
      handleAddVideo,
      handleImportVideos
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