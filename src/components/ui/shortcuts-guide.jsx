// Create a keyboard shortcuts guide component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);
  
  const shortcuts = [
    { key: 'Space / K', action: 'Play/Pause' },
    { key: '←', action: 'Seek backward (10s)' },
    { key: '→', action: 'Seek forward (10s)' },
    { key: 'M', action: 'Mute/Unmute' },
    { key: '↑', action: 'Volume up' },
    { key: '↓', action: 'Volume down' },
    { key: 'F', action: 'Toggle fullscreen' },
  ];
  
  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Keyboard size={16} />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card max-w-md w-full p-6 rounded-xl shadow-xl border border-muted"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              
              <div className="grid gap-3">
                {shortcuts.map((shortcut, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      {shortcut.key.split(' / ').map((k, i, arr) => (
                        <React.Fragment key={i}>
                          <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {k}
                          </kbd>
                          {i < arr.length - 1 && <span className="mx-1 text-muted-foreground">or</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}