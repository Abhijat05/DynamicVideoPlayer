import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CollectionList = ({ collections, onVideoSelect }) => {
  const [expandedCollections, setExpandedCollections] = useState({});
  
  const toggleCollection = (collectionName) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionName]: !prev[collectionName]
    }));
  };
  
  if (Object.keys(collections).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Folder className="h-12 w-12 mb-3 opacity-30" />
        <p>No collections yet</p>
        <p className="text-xs mt-1">Add videos with the same name to create collections</p>
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
                  {videos.map((video, idx) => (
                    <motion.div 
                      key={`${video.url}-${idx}`}
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