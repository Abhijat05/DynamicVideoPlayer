import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/utils/motion'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip"
import { 
  ChevronDown, Search, Trash2, Play, List, 
  Filter, Folder, FolderOpen, Video, Pause, 
  SortAsc, SortDesc
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Simple date formatter
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

const VideoList = ({ videos, searchTerm, onVideoSelect, onDeleteVideo, currentVideoUrl, onSearchChange }) => {
  const [viewMode, setViewMode] = useState('collections')
  const [sortMode, setSortMode] = useState('name-asc')
  const [expandedCollections, setExpandedCollections] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  // Process videos into collections
  const { collections, singles } = useMemo(() => {
    // Filter videos by search term
    const filtered = videos.filter(video => {
      const term = searchTerm.toLowerCase().trim()
      return !term || `${video.name} ${video.url}`.toLowerCase().includes(term)
    })
    
    // Group videos by name
    const groups = {}
    filtered.forEach(video => {
      const name = video.name.trim()
      groups[name] = groups[name] || []
      groups[name].push(video)
    })
    
    // Create collections and singles arrays
    const collectionArray = []
    const singlesArray = []
    
    Object.entries(groups).forEach(([name, videoArray]) => {
      if (videoArray.length > 1) {
        collectionArray.push({
          name,
          videos: videoArray,
          count: videoArray.length
        })
      } else {
        singlesArray.push(videoArray[0])
      }
    })
    
    // Sort collections and singles based on sort mode
    const sortByName = (a, b, direction) => {
      return direction === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    };
    
    if (sortMode.startsWith('name')) {
      const direction = sortMode.endsWith('asc') ? 'asc' : 'desc';
      collectionArray.sort((a, b) => sortByName(a, b, direction));
      singlesArray.sort((a, b) => sortByName(a, b, direction));
    }
    
    return { collections: collectionArray, singles: singlesArray }
  }, [videos, searchTerm, sortMode])
  
  // Toggle collection expansion
  const toggleCollection = (name) => {
    setExpandedCollections(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name) 
        : [...prev, name]
    )
  }
  
  // Handle video deletion
  const handleDeleteClick = (url) => {
    setConfirmDelete(url)
  }
  
  const handleConfirmDelete = (url) => {
    onDeleteVideo(url)
    setConfirmDelete(null)
  }
  
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
      <AnimatePresence>
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
                              onDeleteClick={handleDeleteClick}
                              onConfirmDelete={handleConfirmDelete}
                              onCancelDelete={() => setConfirmDelete(null)}
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
                        onDeleteClick={handleDeleteClick}
                        onConfirmDelete={handleConfirmDelete}
                        onCancelDelete={() => setConfirmDelete(null)}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </>
          ) : (
            // List view - all videos in flat list
            <>
              {[...collections.flatMap(c => c.videos), ...singles].map((video, index) => (
                <motion.div
                  key={video.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <VideoItem
                    video={video}
                    isActive={currentVideoUrl === video.url}
                    confirmDelete={confirmDelete}
                    onVideoSelect={onVideoSelect}
                    onDeleteClick={handleDeleteClick}
                    onConfirmDelete={handleConfirmDelete}
                    onCancelDelete={() => setConfirmDelete(null)}
                  />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// Individual video item component
const VideoItem = ({ 
  video, 
  isActive, 
  confirmDelete,
  onVideoSelect,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  compact = false 
}) => (
  <div
    className={cn(
      "group border rounded-lg bg-card transition-all hover:shadow-sm",
      isActive && "ring-2 ring-primary border-primary",
      compact ? "p-2" : "p-3"
    )}
    id={`video-${encodeURIComponent(video.url)}`}
  >
    <div className="flex items-center gap-3">
      <button 
        className={cn(
          "flex-shrink-0 rounded-full flex items-center justify-center",
          "transition-all duration-200 hover:scale-105",
          compact ? "h-8 w-8" : "h-10 w-10",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-secondary hover:bg-primary hover:text-primary-foreground"
        )}
        onClick={() => onVideoSelect(video)}
      >
        {isActive ? 
          <Pause className={compact ? "h-3 w-3" : "h-4 w-4"} /> :
          <Play className={cn("ml-0.5", compact ? "h-3 w-3" : "h-4 w-4")} />
        }
      </button>
      
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onVideoSelect(video)}>
        <h3 className={cn(
          "font-medium truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {video.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs truncate">
            {video.url}
          </p>
        </div>
      </div>
      
      <div>
        {confirmDelete === video.url ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onConfirmDelete(video.url)}
              className="px-2 py-1 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              className="px-2 py-1 text-xs font-medium bg-secondary/50 hover:bg-secondary rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onDeleteClick(video.url)}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
)

export default VideoList