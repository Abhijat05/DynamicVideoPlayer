import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import VideoControls from '@/components/VideoControls';
import { useVideo } from '@/contexts/VideoContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card, CardContent } from "@/components/ui/card";

const PlayerSection = () => {
  const { currentVideo } = useVideo();
  const { 
    player, 
    playing, 
    duration, 
    currentTime,
    handlePlayerReady,
    handleProgress,
    handleVideoEnded,
    handlePlayPause,
    handleSeek
  } = usePlayer();
  
  const playerContainerRef = useRef(null);

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