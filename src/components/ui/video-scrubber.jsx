// Create a custom video scrubber component with thumbnail preview (simulated)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils'; // Add this utility function for time formatting

export function VideoScrubber({
  duration,
  currentTime,
  onSeek,
  onSeeking,
  className
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  
  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - bounds.left) / bounds.width;
    const time = position * duration;
    
    setHoverPosition(position);
    setHoverTime(time);
  };
  
  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };
  
  const handleMouseDown = () => {
    setIsDragging(true);
    if (onSeeking) onSeeking(true);
  };
  
  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      const bounds = e.currentTarget.getBoundingClientRect();
      const position = (e.clientX - bounds.left) / bounds.width;
      const time = position * duration;
      if (onSeek) onSeek(time);
      if (onSeeking) onSeeking(false);
    }
  };
  
  const progress = (currentTime / duration) * 100;
  const previewPosition = hoverPosition !== null ? hoverPosition * 100 : null;
  
  return (
    <div 
      className={`relative h-10 group cursor-pointer ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Preview thumbnail (simulated) */}
      {hoverPosition !== null && (
        <motion.div 
          className="absolute bottom-full mb-2 transform -translate-x-1/2 bg-card border border-muted shadow-lg rounded overflow-hidden pointer-events-none"
          style={{ left: `${previewPosition}%` }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-32 h-20 bg-gradient-to-br from-muted/50 to-background flex items-center justify-center">
            <span className="text-xs opacity-70">Preview at {formatTime(hoverTime)}</span>
          </div>
          <div className="px-2 py-1 text-center">
            <span className="text-xs font-medium">{formatTime(hoverTime)}</span>
          </div>
        </motion.div>
      )}
      
      {/* Time indicator that follows cursor */}
      {hoverPosition !== null && !isDragging && (
        <motion.div 
          className="absolute bottom-full mb-1 transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${previewPosition}%` }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-1.5 py-0.5 bg-primary/80 text-primary-foreground rounded-md text-[10px]">
            {formatTime(hoverTime)}
          </div>
        </motion.div>
      )}
      
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/40 rounded-full overflow-hidden group-hover:h-2 transition-all">
        {/* Buffered progress */}
        <div className="absolute h-full bg-muted/80" style={{ width: '60%' }} />
        
        {/* Playback progress */}
        <motion.div 
          className="absolute h-full bg-gradient-to-r from-primary/90 to-primary rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Chapter markers (simulated) */}
        <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: '25%' }} />
        <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: '50%' }} />
        <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: '75%' }} />
        
        {/* Hover indicator */}
        {hoverPosition !== null && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-white/80 z-10" 
            style={{ left: `${previewPosition}%` }} 
          />
        )}
        
        {/* Handle */}
        <motion.div 
          className="absolute h-4 w-4 bg-primary rounded-full -top-1 -ml-2 border-2 border-background shadow-sm opacity-0 group-hover:opacity-100"
          style={{ left: `${progress}%` }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}