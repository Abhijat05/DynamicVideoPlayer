import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { fadeIn } from '@/utils/motion'
import { Search, List, Folder, SortAsc, SortDesc, Video } from 'lucide-react'
import { useVideoProcessor } from '@/hooks/useVideoProcessor'
import VideoCollections from '@/components/VideoCollections'
import VideoItem from '@/components/VideoItem'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

const VideoList = ({ 
  videos, 
  searchTerm, 
  onVideoSelect, 
  onDeleteVideo, 
  currentVideoUrl, 
  onSearchChange 
}) => {
  const [viewMode, setViewMode] = useState('collections')
  const [sortMode, setSortMode] = useState('name-asc')
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  // Use the processor hook instead of embedding logic here
  const { collections, singles } = useVideoProcessor(videos, searchTerm, sortMode)
  
  // Handle video deletion
  const handleDeleteClick = useCallback((url) => {
    setConfirmDelete(url)
  }, [])
  
  const handleConfirmDelete = useCallback((url) => {
    onDeleteVideo(url)
    setConfirmDelete(null)
  }, [onDeleteVideo])
  
  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null)
  }, [])
  
  return (
    <motion.div 
      className="space-y-4 video-list-container"
      initial="hidden"
      animate="visible"
      variants={fadeIn('up')}
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Videos ({videos.length})</h2>
        </div>
        
        <div className="flex gap-2">
          {/* View toggle button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setViewMode(viewMode === 'collections' ? 'list' : 'collections')}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    viewMode === 'collections' 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card hover:bg-accent"
                  )}
                >
                  {viewMode === 'collections' ? <Folder size={16} /> : <List size={16} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {viewMode === 'collections' ? 'Switch to list view' : 'Switch to collections view'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Sort button */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "p-2 rounded-lg border bg-card hover:bg-accent transition-all duration-200",
                      "flex items-center justify-center"
                    )}>
                      <SortAsc size={16} />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Sort videos</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setSortMode('name-asc')}
                className={cn("flex justify-between gap-2", sortMode === 'name-asc' ? 'bg-accent' : '')}
              >
                Name (A-Z)
                {sortMode === 'name-asc' && <SortAsc size={16} className="text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortMode('name-desc')}
                className={cn("flex justify-between gap-2", sortMode === 'name-desc' ? 'bg-accent' : '')}
              >
                Name (Z-A)
                {sortMode === 'name-desc' && <SortDesc size={16} className="text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search videos..."
          className="w-full py-2 pl-10 pr-4 bg-background border rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Video list */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {videos.length === 0 ? (
          <motion.div 
            className="text-center py-12 rounded-lg border border-dashed border-muted-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Video className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No videos found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchTerm ? 'Try a different search term' : 'Add videos to get started'}
            </p>
          </motion.div>
        ) : viewMode === 'collections' ? (
          <VideoCollections 
            collections={collections}
            singles={singles}
            currentVideoUrl={currentVideoUrl}
            onVideoSelect={onVideoSelect}
            confirmDelete={confirmDelete}
            onDeleteClick={handleDeleteClick}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
          />
        ) : (
          // List view - all videos in flat list
          <VideoCollections 
            collections={[]} // Empty collections for list view
            singles={collections.flatMap(c => c.videos).concat(singles)} // Flatten all videos into singles
            currentVideoUrl={currentVideoUrl}
            onVideoSelect={onVideoSelect}
            confirmDelete={confirmDelete}
            onDeleteClick={handleDeleteClick}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default VideoList