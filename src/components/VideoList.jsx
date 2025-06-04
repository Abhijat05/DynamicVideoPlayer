import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/utils/motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Trash2, 
  Play, 
  List, 
  Grid, 
  ArrowUp, 
  Search, 
  X,
  Filter,
  MoreHorizontal,
  Folder,
  FolderOpen,
  Video,
  PlayCircle,
  Pause
} from 'lucide-react'

const VideoList = ({ videos, searchTerm, onVideoSelect, onDeleteVideo, currentVideoUrl, onSearchChange }) => {
  const [sortMode, setSortMode] = useState('name-asc') 
  const [viewMode, setViewMode] = useState('collections')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedCollections, setExpandedCollections] = useState([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hoveredVideo, setHoveredVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const scrollContainerRef = useRef(null)
  
  // Enhanced scroll tracking with smooth behavior
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        setShowScrollTop(scrollTop > 200)
      }
    }
    
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Auto-expand collections with better search matching
  useEffect(() => {
    if (searchTerm.trim()) {
      const matchingCollections = videoCollections
        .filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.videos.some(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map(c => c.name)
      
      setExpandedCollections(prev => {
        const newExpanded = [...new Set([...prev, ...matchingCollections])]
        return newExpanded
      })
    }
  }, [searchTerm, videos])

  // Enhanced scroll to current video
  useEffect(() => {
    if (currentVideoUrl) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(`video-${encodeURIComponent(currentVideoUrl)}`)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
        }
      }, 150)
      return () => clearTimeout(timeoutId)
    }
  }, [currentVideoUrl])
  
  // Load and save preferences
  useEffect(() => {
    const savedViewMode = localStorage.getItem('videoplayer_viewmode')
    const savedSortMode = localStorage.getItem('videoplayer_sortmode')
    const savedExpandedCollections = localStorage.getItem('videoplayer_expanded_collections')
    
    if (savedViewMode) setViewMode(savedViewMode)
    if (savedSortMode) setSortMode(savedSortMode)
    if (savedExpandedCollections) {
      try {
        setExpandedCollections(JSON.parse(savedExpandedCollections))
      } catch (e) {
        console.warn('Failed to parse saved expanded collections')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('videoplayer_viewmode', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('videoplayer_sortmode', sortMode)
  }, [sortMode])

  useEffect(() => {
    localStorage.setItem('videoplayer_expanded_collections', JSON.stringify(expandedCollections))
  }, [expandedCollections])

  // Enhanced video processing with better error handling
  const { videoCollections, singleVideos } = useMemo(() => {
    setIsLoading(true)
    
    try {
      const enhancedVideos = videos.map(video => {
        let result = { ...video }
        
        if (video.url && video.url.startsWith('blob:')) {
          result.isLocalFile = true
          result.icon = 'file'
        }
        return result
      })
      
      // Enhanced filtering with fuzzy search
      const filteredVideos = enhancedVideos.filter(video => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true
        
        const searchableText = `${video.name} ${video.url}`.toLowerCase()
        return searchableText.includes(term)
      })
      
      // Sort videos
      const sortedVideos = [...filteredVideos].sort((a, b) => {
        switch (sortMode) {
          case 'name-asc':
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          case 'name-desc':
            return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
          case 'date-newest':
            return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
          case 'date-oldest':
            return new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
          default:
            return 0
        }
      })
      
      // Group videos
      const collections = {}
      const singles = []
      
      sortedVideos.forEach(video => {
        const name = video.name.trim()
        collections[name] = collections[name] || []
        collections[name].push(video)
      })
      
      const collectionsArray = []
      
      Object.entries(collections).forEach(([name, videosArray]) => {
        if (videosArray.length > 1) {
          collectionsArray.push({
            name,
            videos: videosArray,
            count: videosArray.length,
            lastPlayed: getLatestDate(videosArray),
            progress: getAverageProgress(videosArray),
            totalDuration: getTotalDuration(videosArray)
          })
        } else {
          singles.push(videosArray[0])
        }
      })
      
      // Sort collections
      collectionsArray.sort((a, b) => {
        if (sortMode.startsWith('name')) {
          return sortMode === 'name-asc' 
            ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            : b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
        } else {
          return sortMode === 'date-newest'
            ? new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
            : new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
        }
      })
      
      setIsLoading(false)
      return { videoCollections: collectionsArray, singleVideos: singles }
    } catch (error) {
      console.error('Error processing videos:', error)
      setIsLoading(false)
      return { videoCollections: [], singleVideos: [] }
    }
  }, [videos, searchTerm, sortMode])
  
  // Helper functions
  function getLatestDate(videoArray) {
    return videoArray.reduce((latest, video) => {
      if (!video.lastPlayed) return latest
      if (!latest) return video.lastPlayed
      return new Date(video.lastPlayed) > new Date(latest) ? video.lastPlayed : latest
    }, null)
  }
  
  function getAverageProgress(videoArray) {
    if (videoArray.length === 0) return 0
    const sum = videoArray.reduce((total, video) => total + (video.progress || 0), 0)
    return sum / videoArray.length
  }

  function getTotalDuration(videoArray) {
    return videoArray.reduce((total, video) => total + (video.duration || 0), 0)
  }

  function formatDuration(seconds) {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }
  
  const toggleCollectionExpand = (collectionName) => {
    setExpandedCollections(prev => {
      if (prev.includes(collectionName)) {
        return prev.filter(name => name !== collectionName)
      } else {
        return [...prev, collectionName]
      }
    })
  }

  const toggleAllCollections = (expand) => {
    if (expand) {
      setExpandedCollections(videoCollections.map(c => c.name))
    } else {
      setExpandedCollections([])
    }
  }
  
  const handleSortChange = (mode) => {
    setSortMode(mode)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
  
  const handleDeleteClick = (url, e) => {
    e.stopPropagation()
    setConfirmDelete(url)
  }
  
  const cancelDelete = (e) => {
    e.stopPropagation()
    setConfirmDelete(null)
  }
  
  const confirmDeleteVideo = (url, e) => {
    e.stopPropagation()
    onDeleteVideo(url)
    setConfirmDelete(null)
  }
  
  const totalVisibleVideos = videoCollections.reduce((count, collection) => count + collection.count, 0) + singleVideos.length
  const hasResults = totalVisibleVideos > 0
  
  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 space-y-4 pb-4 border-b border-border/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Videos</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {videos.length} total
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  {totalVisibleVideos} shown
                </Badge>
              )}
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex gap-2 items-center">
            {/* View mode toggle with better icons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setViewMode(viewMode === 'collections' ? 'list' : 'collections')}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      "hover:scale-105 active:scale-95",
                      viewMode === 'collections' 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-card hover:bg-accent border-border"
                    )}
                  >
                    {viewMode === 'collections' ? 
                      <Folder size={16} /> : 
                      <List size={16} />
                    }
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {viewMode === 'collections' ? 'Switch to list view' : 'Switch to collections view'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Enhanced Sort dropdown */}
            <div className="relative group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2.5 rounded-lg transition-all duration-200 border bg-card hover:bg-accent border-border hover:scale-105 active:scale-95">
                      <Filter size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Sort options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="absolute right-0 top-full mt-2 bg-card border border-border shadow-xl rounded-lg overflow-hidden z-20 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100">
                <div className="p-1">
                  {[
                    { mode: 'name-asc', icon: ChevronUp, label: 'Name (A-Z)' },
                    { mode: 'name-desc', icon: ChevronDown, label: 'Name (Z-A)' },
                    { mode: 'date-newest', icon: Clock, label: 'Recently played' },
                    { mode: 'date-oldest', icon: Clock, label: 'Oldest first' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button 
                      key={mode}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 rounded-md transition-colors",
                        sortMode === mode 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => handleSortChange(mode)}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative">
          <div className={cn(
            "flex items-center relative transition-all duration-200",
            "bg-card border-2 rounded-xl shadow-sm",
            "hover:shadow-md",
            isSearchFocused 
              ? "border-primary shadow-lg ring-2 ring-primary/20" 
              : "border-border hover:border-border/80"
          )}>
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
              isSearchFocused ? "text-primary" : "text-muted-foreground"
            )} />
            <input
              type="text"
              placeholder="Search videos, collections, or URLs..."
              className="w-full py-3 pl-12 pr-12 bg-transparent border-none focus:outline-none rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collection controls */}
        {viewMode === 'collections' && videoCollections.length > 1 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleAllCollections(true)}
                className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors font-medium"
              >
                Expand all
              </button>
              <button 
                onClick={() => toggleAllCollections(false)}
                className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors font-medium"
              >
                Collapse all
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {videoCollections.length} collections, {singleVideos.length} individual
            </div>
          </div>
        )}
      </div>

      {/* Videos Content */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto pt-4 px-1 scrollbar-thin scrollbar-thumb-secondary/50 scrollbar-track-transparent hover:scrollbar-thumb-secondary"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading videos...</span>
                </div>
              </motion.div>
            ) : videos.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div className="p-4 rounded-full bg-muted/30">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No videos found</h3>
                  <p className="text-muted-foreground max-w-md">
                    Import some videos to get started, or try adjusting your search terms.
                  </p>
                </div>
              </motion.div>
            ) : !hasResults ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div className="p-4 rounded-full bg-muted/30">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No matching videos</h3>
                  <p className="text-muted-foreground max-w-md">
                    Try different search terms or clear the search to see all videos.
                  </p>
                  <button
                    onClick={() => onSearchChange('')}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              </motion.div>
            ) : viewMode === 'collections' ? (
              <CollectionsView
                videoCollections={videoCollections}
                singleVideos={singleVideos}
                expandedCollections={expandedCollections}
                currentVideoUrl={currentVideoUrl}
                confirmDelete={confirmDelete}
                hoveredVideo={hoveredVideo}
                onToggleCollection={toggleCollectionExpand}
                onVideoSelect={onVideoSelect}
                onDeleteClick={handleDeleteClick}
                onConfirmDelete={confirmDeleteVideo}
                onCancelDelete={cancelDelete}
                onVideoHover={setHoveredVideo}
                formatDate={formatDate}
                formatDuration={formatDuration}
              />
            ) : (
              <ListView
                videos={[...videoCollections.flatMap(c => c.videos), ...singleVideos]}
                sortMode={sortMode}
                currentVideoUrl={currentVideoUrl}
                confirmDelete={confirmDelete}
                hoveredVideo={hoveredVideo}
                onVideoSelect={onVideoSelect}
                onDeleteClick={handleDeleteClick}
                onConfirmDelete={confirmDeleteVideo}
                onCancelDelete={cancelDelete}
                onVideoHover={setHoveredVideo}
                formatDate={formatDate}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 z-30"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Enhanced Collections View Component
const CollectionsView = ({ 
  videoCollections, 
  singleVideos, 
  expandedCollections,
  currentVideoUrl,
  confirmDelete,
  hoveredVideo,
  onToggleCollection,
  onVideoSelect,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  onVideoHover,
  formatDate,
  formatDuration
}) => (
  <motion.div 
    key="collections"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {/* Collections */}
    {videoCollections.map((collection, index) => (
      <motion.div 
        key={collection.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="border border-border bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30"
      >
        <div 
          className={cn(
            "p-4 flex items-center justify-between cursor-pointer",
            "hover:bg-accent/30 transition-all duration-200",
            expandedCollections.includes(collection.name) && "bg-accent/20 border-b border-border/50"
          )}
          onClick={() => onToggleCollection(collection.name)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {expandedCollections.includes(collection.name) ? 
                <FolderOpen className="h-5 w-5 text-primary" /> : 
                <Folder className="h-5 w-5 text-muted-foreground" />
              }
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{collection.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {collection.count}
                </Badge>
                {collection.progress > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(collection.progress * 100)}%
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {collection.lastPlayed && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(collection.lastPlayed)}
                  </div>
                )}
                {collection.totalDuration > 0 && (
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    {formatDuration(collection.totalDuration)}
                  </div>
                )}
              </div>

              {collection.progress > 0 && (
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${collection.progress * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expandedCollections.includes(collection.name) && "rotate-180"
          )} />
        </div>
        
        <AnimatePresence>
          {expandedCollections.includes(collection.name) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/20 p-3 space-y-2">
                {collection.videos.map((video, videoIndex) => (
                  <VideoItem
                    key={video.url}
                    video={video}
                    index={videoIndex}
                    isActive={currentVideoUrl === video.url}
                    confirmDelete={confirmDelete}
                    hoveredVideo={hoveredVideo}
                    onVideoSelect={onVideoSelect}
                    onDeleteClick={onDeleteClick}
                    onConfirmDelete={onConfirmDelete}
                    onCancelDelete={onCancelDelete}
                    onVideoHover={onVideoHover}
                    formatDate={formatDate}
                    compact={true}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))}
    
    {/* Single Videos */}
    {singleVideos.length > 0 && (
      <div className="space-y-3">
        {videoCollections.length > 0 && (
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1 rounded-full border">
              Individual Videos
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
          </div>
        )}
        
        {singleVideos.map((video, index) => (
          <VideoItem
            key={video.url}
            video={video}
            index={index}
            isActive={currentVideoUrl === video.url}
            confirmDelete={confirmDelete}
            hoveredVideo={hoveredVideo}
            onVideoSelect={onVideoSelect}
            onDeleteClick={onDeleteClick}
            onConfirmDelete={onConfirmDelete}
            onCancelDelete={onCancelDelete}
            onVideoHover={onVideoHover}
            formatDate={formatDate}
          />
        ))}
      </div>
    )}
  </motion.div>
)

// Enhanced List View Component  
const ListView = ({ 
  videos, 
  sortMode, 
  currentVideoUrl,
  confirmDelete,
  hoveredVideo,
  onVideoSelect,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  onVideoHover,
  formatDate
}) => {
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortMode) {
      case 'name-asc':
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      case 'name-desc':
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
      case 'date-newest':
        return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
      case 'date-oldest':
        return new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
      default:
        return 0
    }
  })

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {sortedVideos.map((video, index) => (
        <VideoItem
          key={video.url}
          video={video}
          index={index}
          isActive={currentVideoUrl === video.url}
          confirmDelete={confirmDelete}
          hoveredVideo={hoveredVideo}
          onVideoSelect={onVideoSelect}
          onDeleteClick={onDeleteClick}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
          onVideoHover={onVideoHover}
          formatDate={formatDate}
        />
      ))}
    </motion.div>
  )
}

// Enhanced Video Item Component
const VideoItem = ({
  video,
  index,
  isActive,
  confirmDelete,
  hoveredVideo,
  onVideoSelect,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  onVideoHover,
  formatDate,
  compact = false
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    id={`video-${encodeURIComponent(video.url)}`}
    className={cn(
      "group relative overflow-hidden transition-all duration-200",
      compact 
        ? "rounded-lg border border-border/50 bg-card/30" 
        : "rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md",
      isActive 
        ? "ring-2 ring-primary border-primary bg-primary/5" 
        : "hover:border-primary/30",
      hoveredVideo === video.url && "scale-[1.02]"
    )}
    onMouseEnter={() => onVideoHover(video.url)}
    onMouseLeave={() => onVideoHover(null)}
  >
    <div
      className={cn(
        "flex items-center gap-3 cursor-pointer",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onVideoSelect(video)}
    >
      {/* Play Button */}
      <motion.button 
        className={cn(
          "flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200",
          compact ? "h-8 w-8" : "h-12 w-12",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground group-hover:scale-110"
        )}
        onClick={(e) => { 
          e.stopPropagation()
          onVideoSelect(video)
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive ? 
          <Pause className={cn("ml-0", compact ? "h-3 w-3" : "h-5 w-5")} /> :
          <Play className={cn("ml-0.5", compact ? "h-3 w-3" : "h-5 w-5")} />
        }
      </motion.button>
      
      {/* Video Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "font-medium truncate",
            compact ? "text-sm" : "text-base",
            isActive && "text-primary"
          )}>
            {video.isLocalFile && (
              <span className="inline-flex items-center mr-1">
                <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500/40 mr-1" />
              </span>
            )}
            {video.name}
          </h3>
          
          {video.progress > 0 && (
            <Badge variant="outline" className="text-xs">
              {Math.round(video.progress * 100)}%
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className={cn(
            "text-muted-foreground truncate",
            compact ? "text-xs" : "text-sm"
          )}>
            {video.url}
          </p>
          
          {video.lastPlayed && (
            <div className={cn(
              "flex items-center text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(video.lastPlayed)}
            </div>
          )}
          
          {video.progress > 0 && (
            <div className={cn("bg-secondary rounded-full overflow-hidden", compact ? "h-1" : "h-1.5")}>
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${video.progress * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Actions */}
      <div className="flex-shrink-0">
        {confirmDelete === video.url ? (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => onConfirmDelete(video.url, e)}
              className="px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
            >
              Delete
            </motion.button>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => onCancelDelete(e)}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        ) : (
          <motion.button 
            onClick={(e) => onDeleteClick(video.url, e)}
            className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            title="Delete video"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </div>
  </motion.div>
)

export default VideoList