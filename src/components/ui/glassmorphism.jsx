// Create a new component for glass-like UI elements
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GlassMorphism = ({
  children,
  className,
  intensity = 'medium', // 'light', 'medium', 'heavy'
  animate = false,
  ...props
}) => {
  let bgOpacity = '0.3';
  let blurAmount = 'backdrop-blur-md';
  
  if (intensity === 'light') {
    bgOpacity = '0.2';
    blurAmount = 'backdrop-blur-sm';
  } else if (intensity === 'heavy') {
    bgOpacity = '0.4';
    blurAmount = 'backdrop-blur-lg';
  }
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-muted/20",
        className
      )}
      {...props}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-chart-1/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
        />
      )}
      <div className={`relative z-10 h-full bg-background/${bgOpacity} ${blurAmount}`}>
        {children}
      </div>
    </div>
  );
};