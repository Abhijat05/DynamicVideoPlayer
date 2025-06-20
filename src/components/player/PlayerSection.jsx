import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoControls from '@/components/VideoControls';
import { useVideo } from '@/contexts/VideoContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientBorder } from "@/components/ui/gradient-border"; // Add this import
import { cn } from '@/lib/utils';

const PlayerSection = ({ className, ...props }) => {
  const { currentVideo, getVideoProgress } = useVideo();
  const { 
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
  } = usePlayer();
  
  const playerContainerRef = useRef(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  // Check for saved progress when video changes
  useEffect(() => {
    if (currentVideo && !hasResumed) {
      const progress = getVideoProgress(currentVideo.url);
      if (progress && progress.currentTime > 30) { // Only show if more than 30 seconds
        setSavedProgress(progress);
        setShowResumePrompt(true);
      }
    }
  }, [currentVideo, hasResumed, getVideoProgress]);

  const handleResumeVideo = () => {
    if (player && savedProgress) {
      player.seekTo(savedProgress.currentTime);
      setShowResumePrompt(false);
      handlePlayPause(true); // Start playback after resuming
    }
  };

  const handleStartOver = () => {
    if (player) {
      player.seekTo(0); // Seek to the beginning of the video
    }
    setShowResumePrompt(false);
    handlePlayPause(true); // Start playback after dismissing prompt
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("lg:col-span-2 space-y-4", className)} {...props}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="player-container bg-card rounded-lg shadow-md overflow-hidden aspect-video relative group hover:shadow-xl transition-shadow duration-300"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {currentVideo ? (
          <>
            <VideoPlayer 
              url={currentVideo.url}
              playing={playing && !showResumePrompt}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onReady={handlePlayerReady}
            />
            
            {/* New: Add fancy info overlay that slides up on hover */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pointer-events-none"
            >
              <div className="flex items-start justify-between">
                <div>
                  {currentVideo && (
                    <h3 className="text-white font-medium truncate">{currentVideo.name}</h3>
                  )}
                  <p className="text-white/70 text-xs truncate mt-0.5">
                    {currentVideo && formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
                <div className="flex items-center text-white/80 text-xs space-x-2">
                  {/* Optional: Display video quality badge */}
                  <span className="px-1.5 py-0.5 bg-white/20 rounded">HD</span>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-muted/20 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center relative"
            >
              {/* Add decorative elements */}
              <motion.div 
                className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-chart-1/20 blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-chart-2/20 blur-xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.7, 0.3] 
                }}
                transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
              />
              
              {/* Main content */}
              <svg className="w-24 h-24 mx-auto mb-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-medium mb-3"
              >
                Welcome to Dynamic Video Player
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-muted-foreground max-w-sm mx-auto"
              >
                Select a video from your library or add a new one to start enjoying your personalized viewing experience.
              </motion.p>
              
              {/* Quick-start buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6 flex gap-4 justify-center flex-wrap"
              >
                <Button 
                  variant="gradient" 
                  onClick={() => {
                    const urlTab = document.querySelector('[data-state="inactive"][value="url"]');
                    if (urlTab) urlTab.click();
                  }}
                >
                  Add Your First Video
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const importTab = document.querySelector('[data-state="inactive"][value="import"]');
                    if (importTab) importTab.click();
                  }}
                >
                  Import from File
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Resume Prompt Overlay */}
        <AnimatePresence>
          {showResumePrompt && savedProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card p-6 rounded-lg shadow-lg max-w-sm mx-4 text-center"
              >
                <RotateCcw className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Resume Watching?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pick up where you left off at {formatTime(savedProgress.currentTime)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOver} // Use the new handler
                    className="flex-1"
                  >
                    Start Over
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResumeVideo}
                    className="flex-1"
                  >
                    Resume
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Video Controls */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <VideoControls 
              player={player}
              playing={playing}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              duration={duration}
              currentTime={currentTime}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Current Video Info */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GradientBorder animated colors="from-primary via-chart-3 to-chart-4">
              <Card className="border-none">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{currentVideo.name}</h2>
                  <p className="text-sm text-muted-foreground break-all">{currentVideo.url}</p>
                </CardContent>
              </Card>
            </GradientBorder>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerSection;