import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CollectionList = ({ collections, onVideoSelect, viewMode = 'list' }) => {
  const [expandedCollections, setExpandedCollections] = useState({});
  
  const toggleCollection = (collectionName) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionName]: !prev[collectionName]
    }));
  };
  
  // Enhance the empty state with animation
  if (Object.keys(collections).length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={{ 
            scale: [0.8, 1, 0.8], 
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut" 
          }}
        >
          <Folder className="h-12 w-12 mb-3" />
        </motion.div>
        <motion.p
          animate={{ 
            y: [0, -5, 0],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          No collections yet
        </motion.p>
        <p className="text-xs mt-1">Add videos with the same name to create collections</p>
      </motion.div>
    );
  }
  
  // Update your render method to handle grid view
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1">
        {Object.entries(collections).map(([collectionName, videos]) => (
          <motion.div
            key={collectionName}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => toggleCollection(collectionName)}
            className="cursor-pointer"
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="bg-muted/20 p-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                  <Folder size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{collectionName}</p>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Film size={10} className="mr-1" />
                    <span>{videos.length} videos</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-1 bg-muted/10">
                {videos.slice(0, 2).map((video, idx) => (
                  <motion.div
                    key={`${video.url}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoSelect(video);
                    }}
                    className="text-xs text-muted-foreground truncate p-1 hover:bg-muted/20 rounded"
                  >
                    {video.url.slice(0, 30)}...
                  </motion.div>
                ))}
                {videos.length > 2 && (
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    +{videos.length - 2} more
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 -mr-1">
      {Object.entries(collections).map(([collectionName, videos]) => (
        <Card key={collectionName} className="overflow-hidden border-muted/60">
          <div 
            className="flex items-center gap-3 p-3 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => toggleCollection(collectionName)}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Folder size={16} className="text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{collectionName}</h4>
                <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                  {videos.length}
                </Badge>
              </div>
            </div>
            
            {expandedCollections[collectionName] ? 
              <ChevronDown size={18} className="text-muted-foreground" /> : 
              <ChevronRight size={18} className="text-muted-foreground" />
            }
          </div>
          
          <AnimatePresence>
            {expandedCollections[collectionName] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent className="p-0 divide-y divide-muted/20">
                  {/* Add staggered container for children */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08
                        }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {videos.map((video, idx) => (
                      <motion.div 
                        key={`${video.url}-${idx}`}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          show: { opacity: 1, x: 0 }
                        }}
                        className="flex items-center p-3 hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => onVideoSelect(video)}
                        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                      >
                        <div className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center mr-3 flex-shrink-0">
                          <Film size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{video.url}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
};

export default CollectionList;