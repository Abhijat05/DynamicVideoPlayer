import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import VideoItem from '@/components/VideoItem' // Extract VideoItem to its own file

export default function VideoCollections({ 
  collections, 
  singles, 
  currentVideoUrl, 
  onVideoSelect, 
  confirmDelete,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete 
}) {
  const [expandedCollections, setExpandedCollections] = useState([])
  
  // Toggle collection expansion
  const toggleCollection = (name) => {
    setExpandedCollections(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name) 
        : [...prev, name]
    )
  }
  
  return (
    <>
      {/* Collections */}
      {collections.map((collection, index) => (
        <motion.div 
          key={collection.name} 
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <div 
            className="p-3 flex items-center bg-card cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => toggleCollection(collection.name)}
          >
            <div className="flex items-center gap-2 flex-1">
              {expandedCollections.includes(collection.name) ? 
                <FolderOpen className="h-5 w-5 text-primary" /> : 
                <Folder className="h-5 w-5" />
              }
              <h3 className="font-medium">{collection.name}</h3>
              <Badge variant="secondary" className="text-xs">{collection.count}</Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              expandedCollections.includes(collection.name) && "rotate-180"
            )} />
          </div>
          
          {/* Collection videos */}
          <AnimatePresence>
            {expandedCollections.includes(collection.name) && (
              <motion.div 
                className="p-2 space-y-2 bg-muted/20"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {collection.videos.map((video, vIndex) => (
                  <motion.div
                    key={video.url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: vIndex * 0.03, duration: 0.2 }}
                  >
                    <VideoItem 
                      video={video}
                      isActive={currentVideoUrl === video.url}
                      confirmDelete={confirmDelete}
                      onVideoSelect={onVideoSelect}
                      onDeleteClick={onDeleteClick}
                      onConfirmDelete={onConfirmDelete}
                      onCancelDelete={onCancelDelete}
                      compact
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      
      {/* Individual videos */}
      {singles.length > 0 && (
        <>
          {collections.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                Individual Videos
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          
          {singles.map((video, index) => (
            <motion.div
              key={video.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (collections.length + index) * 0.05, duration: 0.3 }}
            >
              <VideoItem
                video={video}
                isActive={currentVideoUrl === video.url}
                confirmDelete={confirmDelete}
                onVideoSelect={onVideoSelect}
                onDeleteClick={onDeleteClick}
                onConfirmDelete={onConfirmDelete}
                onCancelDelete={onCancelDelete}
              />
            </motion.div>
          ))}
        </>
      )}
    </>
  )
}