import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, onProgress, onEnded, onReady, playing: propPlaying }) => {
  const playerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  
  // Create a stable reference to the player wrapper
  const playerWrapperRef = useRef(null);
  
  // Create the player wrapper object only once
  useEffect(() => {
    playerWrapperRef.current = {
      // Original ReactPlayer instance gets updated on every render
      get instance() {
        return playerRef.current;
      },
      
      // Methods that properly handle different player types
      setVolume: (vol) => {
        setVolume(vol);
      },
      
      setMuted: (mute) => {
        setMuted(mute);
      },
      
      seekTo: (time) => {
        if (playerRef.current) {
          playerRef.current.seekTo(time, 'seconds');
        }
      },
      
      getDuration: () => {
        if (playerRef.current) {
          return playerRef.current.getDuration();
        }
        return 0;
      }
    };
  }, []);

  // Only call onReady when the player is actually loaded
  const handleReady = useCallback(() => {
    setLoaded(true);
    if (onReady && playerWrapperRef.current) {
      onReady(playerWrapperRef.current);
    }
  }, [onReady]);

  const handleProgress = useCallback((state) => {
    if (onProgress) onProgress(state);
  }, [onProgress]);

  const handleEnded = useCallback(() => {
    if (onEnded) onEnded();
  }, [onEnded]);

  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={propPlaying}
        volume={volume}
        muted={muted}
        onReady={handleReady}
        onProgress={handleProgress}
        onEnded={handleEnded}
        controls={false}
        config={{
          youtube: {
            playerVars: { disablekb: 1 }
          },
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;