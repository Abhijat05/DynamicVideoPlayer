import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react'; // Import Play and Pause icons from lucide-react

const VideoPlayer = ({ url, onProgress, onEnded, onReady, playing: propPlaying }) => {
  const playerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false); // State to control play/pause overlay visibility
  
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

  // Toggle play/pause and show overlay
  const handlePlayPause = () => {
    if (playerRef.current) {
      const newPlayingState = !propPlaying;
      playerRef.current.seekTo(0); // Seek to 0 before toggling play state
      setShowPlayOverlay(true); // Show overlay
      setTimeout(() => setShowPlayOverlay(false), 1500); // Hide overlay after 1.5 seconds
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div className="flex flex-col items-center">
            <motion.div 
              className="w-24 h-24 relative"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
              <motion.div 
                className="absolute inset-0"
                animate={{ 
                  rotate: 360,
                  background: [
                    "conic-gradient(from 0deg, hsl(var(--primary)), transparent 60%)",
                    "conic-gradient(from 180deg, hsl(var(--primary)), transparent 60%)",
                    "conic-gradient(from 360deg, hsl(var(--primary)), transparent 60%)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ borderRadius: "50%" }}
              />
              <div className="absolute inset-[3px] bg-black rounded-full flex items-center justify-center">
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-primary w-12 h-12"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <motion.path 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                    />
                    <motion.path 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
            <motion.p 
              className="mt-6 text-primary-foreground text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Loading your video...
            </motion.p>
          </motion.div>
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
      {/* Play/Pause overlay - appears briefly on toggle */}
      <AnimatePresence>
        {showPlayOverlay && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 bg-primary/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              {propPlaying ? (
                <Pause size={36} className="text-white ml-0.5" />
              ) : (
                <Play size={36} className="text-white ml-2" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;