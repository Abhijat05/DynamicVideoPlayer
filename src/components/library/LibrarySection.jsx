import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import VideoList from '@/components/VideoList';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import FileImporter from '@/components/FileImporter';
import AddUrlForm from '@/components/AddUrlForm';
import CollectionList from '@/components/CollectionList';
import { useVideo } from '@/contexts/VideoContext';
import { Button } from '@/components/ui/button';
import { Grid, List, Play, Video } from 'lucide-react';

const LibrarySection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref,
    offset: ["start end", "end start"] 
  });
  
  const cardYOffset = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [0.3, 1, 1]);
  const cardScale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);
  const cardRotation = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  const { 
    videos, 
    collections, 
    recentlyPlayed,
    handleVideoSelect, 
    handleAddVideo, 
    handleImportVideos 
  } = useVideo();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  return (
    <motion.div 
      ref={ref}
        className="space-y-4 relative" // Added 'relative' here
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Use the parallax effect on the cards */}
      <motion.div 
        style={{ 
          y: cardYOffset,
          opacity: cardOpacity,
          scale: cardScale,
          rotateZ: cardRotation
        }}
      >
        <Card glassEffect>
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Recently Played</h2>
          </CardHeader>
          <CardContent className="p-4">
            <RecentlyPlayed 
              recentVideos={recentlyPlayed.slice(0, 3)} 
              onVideoSelect={handleVideoSelect} 
              compact={true}
            />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Second priority: Main video library with tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="videos">
            <TabsList className="grid grid-cols-3 mb-4 w-full">
              <TabsTrigger value="videos">All Videos</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="relative">
              {videos.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.07
                      }
                    }
                  }}
                  className="space-y-2 max-h-[350px] overflow-y-auto pr-1 -mr-1"
                >
                  {videos.map((video, index) => {
                    const videoRef = useRef(null);
                    const isInView = useInView(videoRef, { once: true, amount: 0.2 });
                    
                    return (
                      <motion.div
                        ref={videoRef}
                        key={`${video.url}-${index}`}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 }
                        }}
                        transition={{ 
                          duration: 0.4,
                          ease: "easeOut"
                        }}
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? "none" : "translateY(20px)"
                        }}
                      >
                        <Card
                          className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-all border-transparent hover:border-muted relative overflow-hidden group"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="relative">
                            <motion.div 
                              className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-md flex-shrink-0"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play size={18} className="text-primary ml-0.5" />
                            </motion.div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{video.name || 'Untitled Video'}</h4>
                            <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Video className="h-12 w-12 mb-3 opacity-30" />
                  <p>Your library is empty</p>
                  <p className="text-xs mt-1">Add videos or import from files</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="collections">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Your Collections</h3>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 p-0"
                  >
                    <List size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0"
                  >
                    <Grid size={14} />
                  </Button>
                </div>
              </div>
              <CollectionList 
                collections={collections} 
                onVideoSelect={handleVideoSelect}
                viewMode={viewMode}
              />
            </TabsContent>
            <TabsContent value="recent">
              <RecentlyPlayed 
                recentVideos={recentlyPlayed} 
                onVideoSelect={handleVideoSelect} 
                compact={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Third priority: Add new content */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold">Add Videos</h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url">
            <TabsList className="grid grid-cols-2 mb-4 w-full">
              <TabsTrigger value="url">Add URL</TabsTrigger>
              <TabsTrigger value="import">Import File</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <AddUrlForm onAddVideo={handleAddVideo} />
            </TabsContent>
            <TabsContent value="import">
              <FileImporter onImportVideos={handleImportVideos} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LibrarySection;