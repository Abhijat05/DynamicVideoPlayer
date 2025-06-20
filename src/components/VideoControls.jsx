import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const VideoControls = ({ player, playing, onPlayPause, onSeek, duration, currentTime }) => {
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!seeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, seeking]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [playing, showControls]);

  const handlePlayPause = () => {
    if (onPlayPause) onPlayPause(!playing);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
    
    if (player && player.setVolume) {
      player.setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    if (player && player.setMuted) {
      player.setMuted(newMuted);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e) => {
    setSeekValue(parseFloat(e.target.value));
    setShowControls(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    const seekTime = parseFloat(e.target.value);
    
    if (player && player.seekTo) {
      player.seekTo(seekTime);
    }
    
    if (onSeek) {
      onSeek(seekTime);
    }
  };

  const handleSkipBack = () => {
    if (player && player.seekTo) {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
      if (onSeek) onSeek(newTime);
    }
  };

  const handleSkipForward = () => {
    if (player && player.seekTo) {
      const newTime = Math.min(currentTime + 10, duration || 0);
      player.seekTo(newTime);
      if (onSeek) onSeek(newTime);
    }
  };

  const handleFullscreen = () => {
    const elem = document.querySelector('.player-container');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Calculate progress percentage
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      className="flex flex-col backdrop-blur-md bg-card/80 rounded-md shadow-lg p-2 border border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: showControls ? 1 : 0.3 }}
      onMouseEnter={() => setShowControls(true)}
      transition={{ duration: 0.3 }}
    >
      {/* Progress bar with enhanced animated fill */}
      <div className="mb-2 relative h-2 bg-muted rounded-lg overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full rounded-lg"
          style={{ width: `${progress}%` }}
          initial={{ width: '0%' }}
          animate={{ 
            width: `${progress}%`,
            background: [
              "linear-gradient(to right, hsl(var(--primary)), hsl(var(--chart-1)))",
              "linear-gradient(to right, hsl(var(--chart-1)), hsl(var(--chart-2)))",
              "linear-gradient(to right, hsl(var(--chart-2)), hsl(var(--primary)))"
            ]
          }}
          transition={{ 
            type: "spring", 
            stiffness: 120, 
            damping: 20,
            background: { 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse" 
            }
          }}
        />
        <input 
          type="range"
          min={0}
          max={duration || 1}
          step="any"
          value={seeking ? seekValue : (isNaN(seekValue) ? 0 : seekValue)}
          onMouseDown={handleSeekMouseDown}
          onChange={handleSeekChange}
          onMouseUp={handleSeekMouseUp}
          onTouchStart={handleSeekMouseDown}
          onTouchEnd={handleSeekMouseUp}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatTime(seekValue)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>
      
      {/* Controls - now in a more compact layout */}
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSkipBack}
            aria-label="Skip back 10 seconds"
            className="h-8 w-8 p-0"
          >
            <SkipBack size={16} />
          </Button>
          
          {/* Enhanced play/pause button with micro-interactions */}
          <Button
            size="sm"
            variant={playing ? "outline" : "default"}
            onClick={handlePlayPause}
            className="rounded-full w-10 h-10 relative overflow-hidden"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <motion.div
              className="absolute inset-0 bg-primary/10 rounded-full"
              initial={false}
              animate={{ 
                scale: playing ? [1, 1.3, 1] : 1 
              }}
              transition={{ 
                duration: 0.5,
                times: [0, 0.5, 1]
              }}
            />
            <motion.div
              animate={{ 
                rotate: playing ? 0 : 180,
                scale: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut"
              }}
            >
              {playing ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </motion.div>
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSkipForward}
            aria-label="Skip forward 10 seconds"
            className="h-8 w-8 p-0"
          >
            <SkipForward size={16} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="h-8 w-8 p-0"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          
          <div className="w-16 hidden sm:block relative h-1.5 bg-muted rounded-lg overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary"
              style={{ width: `${muted ? 0 : volume * 100}%` }}
              animate={{ width: `${muted ? 0 : volume * 100}%` }}
              transition={{ type: "tween" }}
            />
            <input 
              type="range"
              min={0}
              max={1}
              step="any"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
            className="h-8 w-8 p-0"
          >
            <Maximize size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoControls;