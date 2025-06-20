import React from 'react';
import { History, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ui/progress-bar";
import { formatDistanceToNow } from 'date-fns';
import { useVideo } from '@/contexts/VideoContext';

const RecentlyPlayed = ({ recentVideos, onVideoSelect, compact = false }) => {
  const { getVideoProgress } = useVideo();

  if (!recentVideos || recentVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <History className="h-12 w-12 mb-3 opacity-30" />
        <p>No watch history yet</p>
        <p className="text-xs mt-1">Recently played videos will appear here</p>
      </div>
    );
  }

  const displayVideos = compact ? recentVideos.slice(0, 3) : recentVideos;

  // Add this function for 3D card effect to the component
  const handleMouseMove = (event, cardRef) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "all 0.05s ease";
  };
  
  const handleMouseLeave = (cardRef) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.style.transition = "all 0.5s ease";
  };
  
  // Create refs for each card
  const cardRefs = recentVideos.map(() => React.useRef(null));
  
  return (
    <div className="space-y-2">
      <div className={`space-y-2 ${!compact && "max-h-[350px] overflow-y-auto pr-1 -mr-1"}`}>
        {displayVideos.map((video, index) => {
          const progress = getVideoProgress(video.url);
          
          return (
            <motion.div
              key={`recent-${video.url}-${index}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              ref={cardRefs[index]}
              onMouseMove={(e) => handleMouseMove(e, cardRefs[index])}
              onMouseLeave={() => handleMouseLeave(cardRefs[index])}
              className="transform-gpu"
            >
              <Card
                className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-all border-transparent hover:border-muted shadow-sm hover:shadow-md"
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
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(video.lastPlayed), { addSuffix: true })}
                    </p>
                    {progress && (
                      <span className="text-xs text-primary ml-auto">
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
      
      {/* View All button for compact mode */}
      {compact && recentVideos.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-xs" 
          onClick={() => {
            // Find the tab with recently played and activate it
            const recentTab = document.querySelector('[data-state="inactive"][value="recent"]');
            if (recentTab) recentTab.click();
          }}
        >
          View all recent videos <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default RecentlyPlayed;