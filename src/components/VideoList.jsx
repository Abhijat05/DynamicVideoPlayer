import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, Clock, Filter, Trash2, Play } from 'lucide-react'

const VideoList = ({ videos, searchTerm, onVideoSelect, onDeleteVideo, currentVideoUrl }) => {
  const [sortMode, setSortMode] = useState('name-asc') // 'name-asc', 'name-desc', 'date-newest', 'date-oldest'
  const [viewMode, setViewMode] = useState('collections') // 'collections', 'list'
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedCollections, setExpandedCollections] = useState([])
  
  // Create video collections based on same names
  const { videoCollections, singleVideos } = useMemo(() => {
    // First filter by search term
    const filteredVideos = videos.filter(video => {
      const term = searchTerm.toLowerCase().trim()
      if (!term) return true
      return video.name.toLowerCase().includes(term) || 
             video.url.toLowerCase().includes(term)
    })
    
    // Sort videos based on sort mode
    const sortedVideos = [...filteredVideos].sort((a, b) => {
      switch (sortMode) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'date-newest':
          return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
        case 'date-oldest':
          return new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
        default:
          return 0
      }
    })
    
    // Group videos by name
    const collections = {}
    const singles = []
    
    sortedVideos.forEach(video => {
      const name = video.name.trim()
      
      if (collections[name]) {
        collections[name].push(video)
      } else {
        collections[name] = [video]
      }
    })
    
    // Separate single videos and collections
    const collectionsArray = []
    
    Object.entries(collections).forEach(([name, videosArray]) => {
      if (videosArray.length > 1) {
        collectionsArray.push({
          name,
          videos: videosArray,
          count: videosArray.length,
          lastPlayed: getLatestDate(videosArray),
          progress: getAverageProgress(videosArray)
        })
      } else {
        singles.push(videosArray[0])
      }
    })
    
    // Sort collections by name
    collectionsArray.sort((a, b) => {
      if (sortMode.startsWith('name')) {
        return sortMode === 'name-asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      } else {
        return sortMode === 'date-newest'
          ? new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
          : new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
      }
    })
    
    return { videoCollections: collectionsArray, singleVideos: singles }
  }, [videos, searchTerm, sortMode])
  
  // Helper function to get the most recent date from a collection of videos
  function getLatestDate(videoArray) {
    return videoArray.reduce((latest, video) => {
      if (!video.lastPlayed) return latest
      if (!latest) return video.lastPlayed
      return new Date(video.lastPlayed) > new Date(latest) ? video.lastPlayed : latest
    }, null)
  }
  
  // Helper function to get average progress of a collection
  function getAverageProgress(videoArray) {
    const totalProgress = videoArray.reduce((sum, video) => sum + (video.progress || 0), 0)
    return totalProgress / videoArray.length
  }
  
  // Toggle collection expansion
  const toggleCollectionExpand = (collectionName) => {
    setExpandedCollections(prev => {
      if (prev.includes(collectionName)) {
        return prev.filter(name => name !== collectionName)
      } else {
        return [...prev, collectionName]
      }
    })
  }
  
  // Handle sort mode change
  const handleSortChange = (mode) => {
    setSortMode(mode)
  }
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  // Handle deletion
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
  
  return (
    <div className="space-y-4">
      {/* Header with count and controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Videos</h2>
          <Badge variant="secondary" className="text-xs">
            {videos.length}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {/* View mode toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setViewMode(viewMode === 'collections' ? 'list' : 'collections')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {viewMode === 'collections' ? (
                    <Filter size={16} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {viewMode === 'collections' ? 'Show as list' : 'Show collections'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Sort dropdown menu */}
          <div className="relative group">
            <button 
              className={cn(
                "p-2 rounded-md transition-colors flex items-center gap-1",
                "bg-secondary hover:bg-secondary/80"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="M11 4h10" />
                <path d="M11 8h7" />
                <path d="M11 12h4" />
              </svg>
              <span className="sr-only">Sort</span>
            </button>
            
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border shadow-lg rounded-md overflow-hidden z-10 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-1">
                <button 
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                    sortMode === 'name-asc' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => handleSortChange('name-asc')}
                >
                  <ChevronUp size={14} />
                  <span>Name (A-Z)</span>
                </button>
                <button 
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                    sortMode === 'name-desc' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => handleSortChange('name-desc')}
                >
                  <ChevronDown size={14} />
                  <span>Name (Z-A)</span>
                </button>
                <button 
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                    sortMode === 'date-newest' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => handleSortChange('date-newest')}
                >
                  <Clock size={14} />
                  <span>Newest first</span>
                </button>
                <button 
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                    sortMode === 'date-oldest' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => handleSortChange('date-oldest')}
                >
                  <Clock size={14} />
                  <span>Oldest first</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video list */}
      <div className="max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
        {videos.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed border-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-muted-foreground">
              No videos found. Import some videos or adjust your search.
            </p>
          </div>
        ) : viewMode === 'collections' ? (
          <div className="space-y-3">
            {/* Collections */}
            {videoCollections.length > 0 && (
              <div className="space-y-2">
                {videoCollections.map(collection => (
                  <div 
                    key={collection.name} 
                    className="border border-border bg-card rounded-lg overflow-hidden shadow-sm"
                  >
                    <div 
                      className={cn(
                        "p-3 flex items-start justify-between cursor-pointer",
                        "hover:bg-accent/30 transition-colors"
                      )}
                      onClick={() => toggleCollectionExpand(collection.name)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{collection.name}</h3>
                          <Badge>{collection.count}</Badge>
                          {collection.progress > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {Math.round(collection.progress * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {collection.progress > 0 && (
                          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${collection.progress * 100}%` }}
                            ></div>
                          </div>
                        )}
                        
                        {collection.lastPlayed && (
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(collection.lastPlayed)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        {expandedCollections.includes(collection.name) ? (
                          <ChevronUp size={18} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={18} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    {/* Collection videos */}
                    {expandedCollections.includes(collection.name) && (
                      <div className="bg-muted/30 border-t border-border px-1 py-2">
                        <ul className="space-y-1.5">
                          {collection.videos.map(video => (
                            <li 
                              key={video.url}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md",
                                "hover:bg-accent/50 transition-colors",
                                currentVideoUrl === video.url ? "bg-accent" : ""
                              )}
                            >
                              <button 
                                onClick={() => onVideoSelect(video)} 
                                className={cn(
                                  "p-1.5 rounded-full",
                                  currentVideoUrl === video.url 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                                )}
                              >
                                <Play size={14} className="ml-0.5" />
                              </button>
                              
                              <div className="flex-1 min-w-0" onClick={() => onVideoSelect(video)}>
                                <p className="text-xs text-muted-foreground truncate">
                                  {video.url}
                                </p>
                                {video.progress > 0 && (
                                  <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${video.progress * 100}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Delete button */}
                              {confirmDelete === video.url ? (
                                <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                                  <button 
                                    className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90"
                                    onClick={(e) => confirmDeleteVideo(video.url, e)}
                                  >
                                    Delete
                                  </button>
                                  <button 
                                    className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
                                    onClick={cancelDelete}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={(e) => handleDeleteClick(video.url, e)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted"
                                  title="Delete video"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Single videos */}
            {singleVideos.length > 0 && (
              <div className="space-y-2">
                {singleVideos.length > 0 && videoCollections.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-xs font-medium text-muted-foreground">Individual Videos</span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>
                )}
                
                {singleVideos.map(video => (
                  <div 
                    key={video.url} 
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      currentVideoUrl === video.url 
                        ? 'bg-accent border-primary' 
                        : 'hover:bg-accent/50 border-border',
                    )}
                    onClick={() => onVideoSelect(video)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{video.name}</h3>
                      <div className="flex items-center space-x-2">
                        {video.progress > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {Math.round(video.progress * 100)}%
                          </span>
                        )}
                        
                        {/* Delete button */}
                        {confirmDelete === video.url ? (
                          <div 
                            className="flex items-center space-x-1 z-10"
                            onClick={e => e.stopPropagation()}
                          >
                            <button 
                              className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90"
                              onClick={(e) => confirmDeleteVideo(video.url, e)}
                            >
                              Delete
                            </button>
                            <button 
                              className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
                              onClick={cancelDelete}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => handleDeleteClick(video.url, e)}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors rounded-full hover:bg-muted"
                            title="Delete video"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {video.progress > 0 && (
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${video.progress * 100}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {video.url}
                    </p>
                    
                    {video.lastPlayed && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(video.lastPlayed)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Standard list view
          <ul className="space-y-2">
            {[...videoCollections.flatMap(c => c.videos), ...singleVideos]
              .sort((a, b) => {
                switch (sortMode) {
                  case 'name-asc':
                    return a.name.localeCompare(b.name)
                  case 'name-desc':
                    return b.name.localeCompare(a.name)
                  case 'date-newest':
                    return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0)
                  case 'date-oldest':
                    return new Date(a.lastPlayed || 0) - new Date(b.lastPlayed || 0)
                  default:
                    return 0
                }
              })
              .map((video) => (
                <li 
                  key={video.url} 
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all relative border",
                    currentVideoUrl === video.url 
                      ? 'bg-accent border-primary' 
                      : 'hover:bg-accent/50 border-border',
                  )}
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{video.name}</h3>
                    <div className="flex items-center space-x-2">
                      {video.progress > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {Math.round(video.progress * 100)}%
                        </span>
                      )}
                      
                      {/* Delete button */}
                      {confirmDelete === video.url ? (
                        <div 
                          className="flex items-center space-x-1 z-10"
                          onClick={e => e.stopPropagation()}
                        >
                          <button 
                            className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90 transition-colors"
                            onClick={(e) => confirmDeleteVideo(video.url, e)}
                          >
                            Delete
                          </button>
                          <button 
                            className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 transition-colors"
                            onClick={cancelDelete}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleDeleteClick(video.url, e)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors rounded-full hover:bg-muted"
                          title="Delete video"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {video.progress > 0 && (
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${video.progress * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {video.url}
                  </p>
                  {video.lastPlayed && (
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(video.lastPlayed)}
                    </div>
                  )}
                </li>
              ))
            }
          </ul>
        )}
      </div>
    </div>
  )
}

export default VideoList