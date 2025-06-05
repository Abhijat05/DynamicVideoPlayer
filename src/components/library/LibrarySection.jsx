import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import VideoList from '@/components/VideoList';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import FileImporter from '@/components/FileImporter';
import AddUrlForm from '@/components/AddUrlForm';
import CollectionList from '@/components/CollectionList';
import { useVideo } from '@/contexts/VideoContext';

const LibrarySection = () => {
  const { 
    videos, 
    collections, 
    recentlyPlayed,
    handleVideoSelect, 
    handleAddVideo, 
    handleImportVideos 
  } = useVideo();

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* First priority: Recently Played for quick access */}
      <Card>
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
      
      {/* Second priority: Main video library with tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="videos">
            <TabsList className="grid grid-cols-3 mb-4 w-full">
              <TabsTrigger value="videos">All Videos</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            <TabsContent value="videos">
              <VideoList videos={videos} onVideoSelect={handleVideoSelect} />
            </TabsContent>
            <TabsContent value="collections">
              <CollectionList collections={collections} onVideoSelect={handleVideoSelect} />
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