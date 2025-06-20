import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const GradientBorder = ({ 
  children, 
  className, 
  colors = "from-primary to-chart-1", 
  borderWidth = "2px",
  animated = false
}) => {
  return (
    <div className={cn("relative p-[2px] rounded-lg overflow-hidden", className)}>
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${colors} rounded-lg`}
        animate={animated ? { 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        } : {}}
        transition={animated ? { 
          duration: 5, 
          repeat: Infinity, 
          ease: "linear" 
        } : {}}
        style={animated ? { backgroundSize: '200% 200%' } : {}}
      />
      <div className="bg-card rounded-[calc(0.5rem-2px)] relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};