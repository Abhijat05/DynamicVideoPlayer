import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VideoProvider } from '@/contexts/VideoContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react'; // Import the Help icon

const MainLayout = ({ children }) => {
  // For mouse-following animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animation variants for background elements
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.08 }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="video-player-theme">
      <VideoProvider>
        <PlayerProvider>
          <div className="container mx-auto p-4 min-h-screen relative overflow-hidden">
            {/* Decorative background elements with mouse following effect */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <svg 
                className="absolute inset-0 -z-10 h-full w-full stroke-primary/10"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="grid-pattern"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                    x="50%"
                    y="100%"
                    patternTransform="translate(0 -1)"
                  >
                    <path 
                      d="M.5 50V.5H50" 
                      fill="none" 
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
              </svg>
              
              <motion.div
                className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-chart-1/20 blur-3xl"
                animate={{
                  x: mousePosition.x * 0.02,
                  y: mousePosition.y * 0.02,
                  opacity: 0.08
                }}
                transition={{ type: "spring", damping: 50, stiffness: 100 }}
                initial={{ opacity: 0 }}
              />
              <motion.div
                className="absolute top-[40%] right-[15%] w-80 h-80 rounded-full bg-chart-2/20 blur-3xl"
                animate={{
                  x: mousePosition.x * -0.01,
                  y: mousePosition.y * -0.01,
                  opacity: 0.08
                }}
                transition={{ type: "spring", damping: 50, stiffness: 80 }}
                initial={{ opacity: 0 }}
              />
              <motion.div
                className="absolute bottom-[10%] left-[20%] w-72 h-72 rounded-full bg-chart-3/20 blur-3xl"
                animate={{
                  x: mousePosition.x * 0.015,
                  y: mousePosition.y * -0.015,
                  opacity: 0.08
                }}
                transition={{ type: "spring", damping: 60, stiffness: 90 }}
                initial={{ opacity: 0 }}
              />
              
              {/* Add more subtle animated background elements */}
              <motion.div
                className="absolute top-[60%] right-[30%] w-48 h-48 rounded-full bg-chart-4/20 blur-3xl"
                animate={{
                  x: mousePosition.x * 0.008,
                  y: mousePosition.y * 0.008,
                  opacity: 0.06
                }}
                transition={{ type: "spring", damping: 60, stiffness: 70 }}
                initial={{ opacity: 0 }}
              />
              <motion.div
                className="absolute bottom-[30%] right-[10%] w-56 h-56 rounded-full bg-chart-5/20 blur-3xl"
                animate={{
                  x: mousePosition.x * -0.01,
                  y: mousePosition.y * 0.01,
                  opacity: 0.07
                }}
                transition={{ type: "spring", damping: 70, stiffness: 110 }}
                initial={{ opacity: 0 }}
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center mb-8" // Increased margin
            >
              <div>
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Dynamic Video Player
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground text-sm mt-1"
                >
                  Your personal video collection, organized and beautiful
                </motion.p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            {children}
          </div>
        </PlayerProvider>
      </VideoProvider>
    </ThemeProvider>
  );
};

export default MainLayout;