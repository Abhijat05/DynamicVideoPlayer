import React from 'react';
import { Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import ProgressBar from "@/components/ui/progress-bar";
import { useVideo } from '@/contexts/VideoContext';

const VideoList = ({ videos, onVideoSelect }) => {
  const { getVideoProgress } = useVideo();

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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-all border-transparent hover:border-muted"
              onClick={() => onVideoSelect(video)}
            >
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0 relative">
                <Play size={16} className="text-primary ml-0.5" />
                {progress && (
                  <div className="absolute -bottom-1 left-0 right-0">
                    <ProgressBar progress={progress.progressPercent} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{video.name || 'Untitled Video'}</h4>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1">{video.url}</p>
                  {progress && (
                    <span className="text-xs text-primary ml-2 flex-shrink-0">
                      {Math.round(progress.progressPercent)}%
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default VideoList;