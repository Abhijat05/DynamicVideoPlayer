import React from 'react';
import { Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import ProgressBar from "@/components/ui/progress-bar";
import { useVideo } from '@/contexts/VideoContext';

const VideoList = ({ videos, onVideoSelect }) => {
  const { getVideoProgress } = useVideo();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: index * 0.07,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }),
    hover: { 
      y: -8, 
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
    tap: { scale: 0.97 }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Video className="h-12 w-12 mb-3 opacity-30" />
        <p>Your library is empty</p>
        <p className="text-xs mt-1">Add videos or import from files</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 -mr-1">
      {videos.map((video, index) => {
        const progress = getVideoProgress(video.url);
        
        return (
          <motion.div
            key={`${video.url}-${index}`}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
          >
            <Card
              className="flex items-center gap-3 p-3 cursor-pointer transition-all border-transparent hover:border-primary/20 relative overflow-hidden group"
              onClick={() => onVideoSelect(video)}
            >
              {/* Enhanced background animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -z-10"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ type: "tween", duration: 0.4 }}
              />
              
              {/* Color strip indicator for progress */}
              <motion.div 
                className="absolute inset-0 bg-primary/5 -z-10 origin-left"
                initial={false}
                animate={{ 
                  scaleX: progress ? progress.progressPercent / 100 : 0
                }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
              />
              
              {/* Thumbnail/icon with glow effect */}
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-md bg-gradient-to-tr from-primary/20 to-chart-2/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 20px rgba(var(--primary), 0.3)', '0 0 0 rgba(0,0,0,0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Play size={18} className="text-primary ml-0.5" />
                </motion.div>
                {progress && (
                  <div className="absolute -bottom-1 left-0 right-0">
                    <ProgressBar progress={progress.progressPercent} />
                  </div>
                )}
              </div>
              
              {/* Content with improved typography */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{video.name || 'Untitled Video'}</h4>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1">{video.url}</p>
                  {progress && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {Math.round(progress.progressPercent)}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* Play button that appears on hover */}
              <motion.div
                className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Play size={14} />
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default VideoList;