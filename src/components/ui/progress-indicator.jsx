import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ProgressIndicator = ({ progress, className, size = "md" }) => {
  const circumference = 28 * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  return (
    <div className={cn("relative", sizes[size], className)}>
      <svg className="w-full h-full" viewBox="0 0 60 60">
        <circle 
          className="text-muted/30" 
          strokeWidth="4" 
          stroke="currentColor" 
          fill="transparent" 
          r="28" 
          cx="30" 
          cy="30" 
        />
        <motion.circle 
          className="text-primary" 
          strokeWidth="4" 
          strokeLinecap="round"
          stroke="currentColor" 
          fill="transparent" 
          r="28" 
          cx="30" 
          cy="30" 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          style={{ 
            strokeDasharray: `${circumference} ${circumference}`,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;