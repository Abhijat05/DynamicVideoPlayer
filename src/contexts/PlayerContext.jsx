import React, { createContext, useContext, useState } from 'react';
import { useVideo } from './VideoContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { currentVideo } = useVideo();
  
  // Player state
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayerReady = (playerInstance) => {
    setPlayer(playerInstance);
    
    if (playerInstance && playerInstance.getDuration) {
      const dur = playerInstance.getDuration();
      setDuration(isNaN(dur) ? 0 : dur);
    }
  };

  const handleProgress = (state) => {
    if (!isNaN(state.playedSeconds)) {
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
  };

  const handlePlayPause = (play) => {
    setPlaying(play);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
  };
  
  // Reset player state when video changes
  React.useEffect(() => {
    if (currentVideo) {
      setPlayer(null);
      setCurrentTime(0);
      setDuration(0);
      setPlaying(true);
    }
  }, [currentVideo]);

  return (
    <PlayerContext.Provider value={{
      player,
      playing,
      duration,
      currentTime,
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