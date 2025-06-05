import React from 'react';
import { Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";

const VideoList = ({ videos, onVideoSelect }) => {
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
      {videos.map((video, index) => (
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
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0">
              <Play size={16} className="text-primary ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{video.name || 'Untitled Video'}</h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{video.url}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default VideoList;