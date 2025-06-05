import React from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VideoProvider } from '@/contexts/VideoContext';
import { PlayerProvider } from '@/contexts/PlayerContext';

const MainLayout = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="video-player-theme">
      <VideoProvider>
        <PlayerProvider>
          <div className="container mx-auto p-4 min-h-screen">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center mb-6"
            >
              <h1 className="text-3xl font-bold">Dynamic Video Player</h1>
              <ThemeToggle />
            </motion.div>
            {children}
          </div>
        </PlayerProvider>
      </VideoProvider>
    </ThemeProvider>
  );
};

export default MainLayout;