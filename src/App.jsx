import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import PlayerSection from '@/components/player/PlayerSection';
import LibrarySection from '@/components/library/LibrarySection';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 70,
            damping: 20
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: 0.3, 
              duration: 0.8, 
              type: "spring" 
            }}
            className="lg:col-span-2"
          >
            <PlayerSection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 0.8, 
              type: "spring" 
            }}
          >
            <LibrarySection />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <Toaster />
    </MainLayout>
  );
};

export default App;