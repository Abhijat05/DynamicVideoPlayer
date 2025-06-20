import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ProgressBar = ({ progress, className, showPercentage = false }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress || 0));
  
  return (
    <div className={cn("relative", className)}>
      <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full origin-left"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--primary-darker, hsl(var(--primary))), hsl(var(--primary)))'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: clampedProgress / 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.span 
          className="text-xs text-muted-foreground mt-1 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={Math.round(clampedProgress)} // Remount on significant changes
        >
          {Math.round(clampedProgress)}% watched
        </motion.span>
      )}
    </div>
  );
};

export default ProgressBar;