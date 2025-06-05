import React, { createContext, useContext, useState } from 'react';
import { useVideo } from './VideoContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { currentVideo, handleProgressUpdate, getVideoProgress } = useVideo();
  
  // Player state
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  const handlePlayerReady = (playerInstance) => {
    setPlayer(playerInstance);
    
    if (playerInstance && playerInstance.getDuration) {
      const dur = playerInstance.getDuration();
      setDuration(isNaN(dur) ? 0 : dur);
    }

    // Auto-resume if there's saved progress
    if (currentVideo && !hasResumed) {
      const savedProgress = getVideoProgress(currentVideo.url);
      if (savedProgress && savedProgress.currentTime > 0) {
        setTimeout(() => {
          if (playerInstance && playerInstance.seekTo) {
            playerInstance.seekTo(savedProgress.currentTime);
            setCurrentTime(savedProgress.currentTime);
            setHasResumed(true);
          }
        }, 500); // Small delay to ensure player is ready
      } else {
        setHasResumed(true);
      }
    }
  };

  const handleProgress = (state) => {
    if (!isNaN(state.playedSeconds)) {
      setCurrentTime(state.playedSeconds);
      
      // Save progress periodically (every 5 seconds)
      if (currentVideo && duration > 0 && Math.floor(state.playedSeconds) % 5 === 0) {
        handleProgressUpdate(currentVideo.url, state.playedSeconds, duration);
      }
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    // Clear progress when video ends completely
    if (currentVideo) {
      handleProgressUpdate(currentVideo.url, duration, duration);
    }
  };

  const handlePlayPause = (play) => {
    setPlaying(play);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    // Save progress when user seeks
    if (currentVideo && duration > 0) {
      handleProgressUpdate(currentVideo.url, time, duration);
    }
  };
  
  // Reset player state when video changes
  React.useEffect(() => {
    if (currentVideo) {
      setPlayer(null);
      setCurrentTime(0);
      setDuration(0);
      setPlaying(true);
      setHasResumed(false);
    }
  }, [currentVideo]);

  return (
    <PlayerContext.Provider value={{
      player,
      playing,
      duration,
      currentTime,
      hasResumed,
      handlePlayerReady,
      handleProgress,
      handleVideoEnded,
      handlePlayPause,
      handleSeek
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}