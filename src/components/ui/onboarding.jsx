// Create a component for onboarding tooltips
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function OnboardingTooltip({ 
  id, 
  children, 
  title, 
  placement = 'bottom',
  delay = 0
}) {
  const [seen, setSeen] = useLocalStorage(`onboarding-${id}`, false);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (!seen) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [seen, delay]);
  
  const handleDismiss = () => {
    setVisible(false);
    setSeen(true);
  };
  
  const directions = {
    top: { y: -10, originY: 1 },
    bottom: { y: 10, originY: 0 },
    left: { x: -10, originX: 1 },
    right: { x: 10, originX: 0 }
  };
  
  const placementStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };
  
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {visible && !seen && (
          <motion.div
            className={`absolute ${placementStyles[placement]} z-50 w-64 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-primary/20`}
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              ...directions[placement]
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: placement === 'top' ? -5 : placement === 'bottom' ? 5 : 0,
              x: placement === 'left' ? -5 : placement === 'right' ? 5 : 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              ...directions[placement]
            }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            <Button 
              size="sm"
              variant="ghost" 
              className="absolute right-1 top-1 h-5 w-5 p-0"
              onClick={handleDismiss}
            >
              <X size={12} />
            </Button>
            <h4 className="font-medium text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{children}</p>
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={handleDismiss} variant="outline" className="h-7 text-xs">
                Got it
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}