// Create a custom overlay for video player with more sophisticated controls
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Maximize, Settings } from 'lucide-react';
import { VideoScrubber } from '@/components/ui/video-scrubber';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const PlayerOverlay = ({ 
  player, 
  playing, 
  duration, 
  currentTime,
  onPlayPause,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  title 
}) => {
  const [showControls, setShowControls] = useState(false);
  const [idle, setIdle] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  
  // Show controls when mouse moves
  useEffect(() => {
    let timer;
    
    const handleMouseMove = () => {
      setShowControls(true);
      setIdle(false);
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (playing) {
          setIdle(true);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [playing]);
  
  // Hide controls when idle
  useEffect(() => {
    if (idle) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [idle]);
  
  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    togglePlay: () => onPlayPause?.(!playing),
    seekForward: () => onSeek?.(Math.min(currentTime + 10, duration)),
    seekBackward: () => onSeek?.(Math.max(currentTime - 10, 0)),
    toggleMute: () => {
      setMuted(!muted);
      onToggleMute?.(!muted);
    },
    volumeUp: () => {
      const newVolume = Math.min(volume + 0.1, 1);
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
    },
    volumeDown: () => {
      const newVolume = Math.max(volume - 0.1, 0);
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
    },
    toggleFullscreen: onToggleFullscreen
  });
  
  // Time formatting helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return hh ? `${hh}:${mm.toString().padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
  };
  
  return (
    <div 
      className="absolute inset-0 flex flex-col justify-between z-20"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setIdle(true)}
    >
      <AnimatePresence>
        {showControls && (
          <>
            {/* Top bar with title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-gradient-to-b from-black/70 to-transparent"
            >
              <h3 className="text-white font-medium truncate">{title}</h3>
            </motion.div>
            
            {/* Center play/pause button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-16 w-16 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 border border-white/10"
                onClick={() => onPlayPause?.(!playing)}
              >
                {playing ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white ml-1" />
                )}
              </Button>
            </motion.div>
            
            {/* Bottom control bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
              <VideoScrubber
                duration={duration || 0}
                currentTime={currentTime || 0}
                onSeek={onSeek}
                className="mb-4"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                    onClick={() => onPlayPause?.(!playing)}
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                    onClick={() => onSeek?.(Math.max(currentTime - 10, 0))}
                  >
                    <SkipBack size={18} />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                    onClick={() => onSeek?.(Math.min(currentTime + 10, duration))}
                  >
                    <SkipForward size={18} />
                  </Button>
                  
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                      onClick={() => {
                        setMuted(!muted);
                        onToggleMute?.(!muted);
                      }}
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </Button>
                    
                    <div className="w-20 hidden sm:block">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          setMuted(newVolume === 0);
                          onVolumeChange?.(newVolume);
                        }}
                        className="w-full accent-white"
                      />
                    </div>
                  </div>
                  
                  <span className="text-white/90 text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                  >
                    <Settings size={18} />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-white hover:bg-white/10 rounded-full"
                    onClick={onToggleFullscreen}
                  >
                    <Maximize size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerOverlay;