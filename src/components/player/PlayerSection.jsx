import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoControls from '@/components/VideoControls';
import { useVideo } from '@/contexts/VideoContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PlayerSection = () => {
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
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Video Player */}
        <div 
          ref={playerContainerRef}
          className="player-container bg-card rounded-lg shadow-md overflow-hidden aspect-video relative"
        >
          {currentVideo ? (
            <VideoPlayer 
              url={currentVideo.url}
              playing={playing}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onReady={handlePlayerReady}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <motion.p 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                Select a video to play
              </motion.p>
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
                      onClick={() => setShowResumePrompt(false)}
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
        </div>
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
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-1">{currentVideo.name}</h2>
                <p className="text-sm text-muted-foreground break-all">{currentVideo.url}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerSection;