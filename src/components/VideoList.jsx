import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { fadeIn } from '@/utils/motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, Clock, Filter, Trash2, Play, List, Grid, ArrowUp, Search, X } from 'lucide-react'

const VideoList = ({ videos, searchTerm, onVideoSelect, onDeleteVideo, currentVideoUrl, onSearchChange }) => {
  const [sortMode, setSortMode] = useState('name-asc') 
  const [viewMode, setViewMode] = useState('collections')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedCollections, setExpandedCollections] = useState([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0,
    videoUrl: null 
  })
  const [gridView, setGridView] = useState(false); // Add to VideoList state
  
  // Create ref for scrolling container
  const scrollContainerRef = useRef(null)
  
  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setShowScrollTop(scrollContainerRef.current.scrollTop > 300)
      }
    }
    
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Auto-expand collections that match search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const matchingCollections = videoCollections
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(c => c.name)
      
      setExpandedCollections(prev => {
        const newExpanded = [...prev]
        matchingCollections.forEach(name => {
          if (!newExpanded.includes(name)) {
            newExpanded.push(name)
          }
        })
        return newExpanded
      })
    }
  }, [searchTerm, videos])

  // Scroll to the current playing video when it changes
  useEffect(() => {
    if (currentVideoUrl) {
      setTimeout(() => {
        const element = document.getElementById(`video-${encodeURIComponent(currentVideoUrl)}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [currentVideoUrl])
  
  // Add to VideoList component
  useEffect(() => {
    // Load user preferences
    const savedViewMode = localStorage.getItem('videoplayer_viewmode');
    const savedSortMode = localStorage.getItem('videoplayer_sortmode');
    const savedGridView = localStorage.getItem('videoplayer_gridview');
    
    if (savedViewMode) setViewMode(savedViewMode);
    if (savedSortMode) setSortMode(savedSortMode);
    if (savedGridView) setGridView(savedGridView === 'true');
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('videoplayer_viewmode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('videoplayer_sortmode', sortMode);
  }, [sortMode]);

  useEffect(() => {
    localStorage.setItem('videoplayer_gridview', gridView.toString());
  }, [gridView]);

  // Remaining logic stays the same...
  const { videoCollections, singleVideos } = useMemo(() => {
    // For local files, provide better visualization and handling
    const enhancedVideos = videos.map(video => {
      let result = { ...video };
      
      if (video.url && video.url.startsWith('blob:')) {
        result.isLocalFile = true;
        result.icon = 'file'; // Used for display differentiation
        
        // If the video doesn't already have a thumbnail, create one
        if (!video.thumbnailUrl) {
          // Create a temporary video element to generate thumbnail
          try {
            // Attempt to generate thumbnail from video
            const tempVideo = document.createElement('video');
            tempVideo.src = video.url;
            tempVideo.muted = true;
            tempVideo.crossOrigin = "anonymous"; // Add this for cross-origin videos
            
            // Add error handler
            tempVideo.onerror = (e) => {
              console.error('Error loading video for thumbnail generation:', e);
            };
            
            // Add timeout to prevent hanging
            const timeoutId = setTimeout(() => {
              if (tempVideo) {
                tempVideo.pause();
                tempVideo.src = '';
                tempVideo.load();
                console.warn('Thumbnail generation timed out for:', video.url);
              }
            }, 10000); // 10 second timeout
            
            tempVideo.onloadeddata = () => {
              clearTimeout(timeoutId);
              // Wait a bit to make sure video is ready
              setTimeout(() => {
                try {
                  // Seek to 1/3 of the video for a good thumbnail spot
                  if (tempVideo.duration) {
                    tempVideo.currentTime = tempVideo.duration / 3;
                  }
                  
                  tempVideo.onseeked = () => {
                    // Create canvas and draw video frame
                    const canvas = document.createElement('canvas');
                    canvas.width = tempVideo.videoWidth;
                    canvas.height = tempVideo.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                    
                    // Convert canvas to thumbnail URL
                    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6);
                    
                    // Update this video in state
                    setVideos(prevVideos => 
                      prevVideos.map(v => 
                        v.url === video.url ? { ...v, thumbnailUrl } : v
                      )
                    );
                    
                    // Clean up
                    tempVideo.pause();
                    tempVideo.src = '';
                    tempVideo.load();
                  };
                } catch (err) {
                  console.error('Error generating thumbnail:', err);
                }
              }, 200);
            };
            
            // Start loading
            tempVideo.load();
          } catch (err) {
            console.error('Error generating thumbnail:', err);
          }
        }
      }
      return result;
    })
    
    // First filter by search term
    const filteredVideos = enhancedVideos.filter(video => {
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
  
  // Helper functions remain the same...
  function getLatestDate(videoArray) {
    return videoArray.reduce((latest, video) => {
      if (!video.lastPlayed) return latest
      if (!latest) return video.lastPlayed
      return new Date(video.lastPlayed) > new Date(latest) ? video.lastPlayed : latest
    }, null)
  }
  
  function getAverageProgress(videoArray) {
    const totalProgress = videoArray.reduce((sum, video) => sum + (video.progress || 0), 0)
    return totalProgress / videoArray.length
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

  // Handle expanding/collapsing all collections
  const toggleAllCollections = (expand) => {
    if (expand) {
      // Expand all collections
      setExpandedCollections(videoCollections.map(c => c.name))
    } else {
      // Collapse all collections
      setExpandedCollections([])
    }
  }
  
  const handleSortChange = (mode) => {
    setSortMode(mode)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Scroll to top function
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
  
  const handleContextMenu = (e, videoUrl) => {
    e.preventDefault();
    setContextMenu({ 
      visible: true, 
      x: e.clientX, 
      y: e.clientY,
      videoUrl 
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) setContextMenu(prev => ({...prev, visible: false}));
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [/* No dependency on contextMenu */]);

  // Count total visible videos for better user awareness
  const totalVisibleVideos = singleVideos.length + videoCollections.reduce((sum, c) => sum + c.videos.length, 0)
  
  return (
    <div className="space-y-4">
      {/* Enhanced header with better alignment and spacing */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Title and badge row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Videos</h2>
            <Badge variant="secondary" className="text-xs">
              {videos.length} {searchTerm && <> / {totalVisibleVideos} shown</>}
            </Badge>
          </div>

          {/* Controls in a flex container */}
          <div className="flex gap-2 items-center">
            {/* View mode toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setViewMode(viewMode === 'collections' ? 'list' : 'collections')}
                    className={cn(
                      "p-2 rounded-md transition-all",
                      "bg-secondary hover:bg-secondary/80",
                      viewMode === 'list' && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {viewMode === 'collections' ? <List size={16} /> : <Grid size={16} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {viewMode === 'collections' ? 'Show as flat list' : 'Show as collections'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Sort dropdown menu */}
            <div className="relative group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={cn(
                        "p-2 rounded-md transition-all flex items-center",
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
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Sort videos</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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

            {/* Grid/List toggle button */}
            <button
              onClick={() => setGridView(!gridView)}
              className={cn(
                "p-2 rounded-md transition-all",
                "bg-secondary hover:bg-secondary/80",
                gridView && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              aria-label={gridView ? "Switch to list view" : "Switch to grid view"}
            >
              {gridView ? <List size={16} /> : <Grid size={16} />}
            </button>
          </div>
        </div>
        
        {/* Enhanced search bar with improved styling */}
        <div className="relative w-full mb-4">
          <div className={cn(
            "flex items-center relative",
            "bg-card border rounded-md transition-all",
            "focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
            isSearchFocused && "shadow-md"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos by name or URL..."
              className="w-full py-2.5 pl-10 pr-10 bg-transparent border-none focus:outline-none focus:ring-0 rounded-md"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collection controls when in collection view */}
      {viewMode === 'collections' && videoCollections.length > 1 && (
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => toggleAllCollections(true)}
                    className="text-xs px-2 py-1 bg-secondary/50 hover:bg-secondary rounded-md"
                  >
                    Expand all
                  </button>
                </TooltipTrigger>
                <TooltipContent>Show all videos in collections</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => toggleAllCollections(false)}
                    className="text-xs px-2 py-1 bg-secondary/50 hover:bg-secondary rounded-md"
                  >
                    Collapse all
                  </button>
                </TooltipTrigger>
                <TooltipContent>Hide all videos in collections</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Video list with scroll indicator */}
      <div 
        ref={scrollContainerRef}
        className="relative max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin"
      >
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
          <motion.div 
            className="space-y-3"
            variants={fadeIn('up')}
            initial="hidden"
            animate="visible"
          >
            {/* Collections */}
            {videoCollections.length > 0 && (
              <div className="space-y-2">
                {videoCollections.map(collection => (
                  <motion.div 
                    key={collection.name}
                    variants={fadeIn('up')}
                    className="border border-border bg-card rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40"
                  >
                    <div 
                      className={cn(
                        "p-4 flex items-start justify-between cursor-pointer",
                        "hover:bg-accent/30 transition-colors",
                        expandedCollections.includes(collection.name) && "bg-accent/20"
                      )}
                      onClick={() => toggleCollectionExpand(collection.name)}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 className="font-medium">{collection.name}</h3>
                          <Badge>{collection.count}</Badge>
                          {collection.progress > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {Math.round(collection.progress * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {collection.progress > 0 && (
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${collection.progress * 100}%` }}
                            ></div>
                          </div>
                        )}
                        
                        {collection.lastPlayed && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
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
                    
                    {/* Collection videos with improved styling */}
                    {expandedCollections.includes(collection.name) && (
                      <div className="bg-muted/30 border-t border-border px-2 py-2">
                        <ul className="space-y-2">
                          {collection.videos.map(video => (
                            <li 
                              key={video.url}
                              id={`video-${encodeURIComponent(video.url)}`}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md",
                                "hover:bg-accent/50 transition-colors",
                                currentVideoUrl === video.url ? "bg-accent ring-1 ring-primary/30" : ""
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
                  </motion.div>
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
                  <motion.div
                    variants={fadeIn('up')}
                    key={video.url}
                    id={`video-${encodeURIComponent(video.url)}`}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all duration-300",
                      "hover:shadow-md hover:border-primary/40",
                      currentVideoUrl === video.url 
                        ? 'bg-accent border-primary ring-1 ring-primary/50' 
                        : 'hover:bg-accent/50 border-border',
                    )}
                    onClick={() => onVideoSelect(video)}
                    onContextMenu={(e) => handleContextMenu(e, video.url)}
                  >
                    {/* Main content with better structure */}
                    <div className="flex flex-col gap-2">
                      {/* Header row with improved spacing */}
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium flex items-center gap-1.5 truncate max-w-[70%]">
                          {video.isLocalFile && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                          )}
                          <span className="truncate">{video.name}</span>
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {video.progress > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                              {Math.round(video.progress * 100)}%
                            </span>
                          )}
                          
                          {/* Delete button */}
                          {confirmDelete === video.url ? (
                            <div 
                              className="flex items-center gap-1 z-10"
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
                              className="text-muted-foreground hover:text-destructive p-1 transition-colors rounded-full hover:bg-muted flex-shrink-0"
                              title="Delete video"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      {video.progress > 0 && (
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${video.progress * 100}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* URL and last played info in a footer row */}
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {video.url}
                        </p>
                        
                        {video.lastPlayed && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            {formatDate(video.lastPlayed)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // Standard list view
          <motion.ul 
            variants={fadeIn('up')}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
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
                <motion.li
                  variants={fadeIn('up')} 
                  key={video.url}
                  id={`video-${encodeURIComponent(video.url)}`}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all relative border flex items-center gap-3",
                    currentVideoUrl === video.url 
                      ? 'bg-accent border-primary ring-1 ring-primary/50' 
                      : 'hover:bg-accent/50 border-border',
                  )}
                  onClick={() => onVideoSelect(video)}
                  onContextMenu={(e) => handleContextMenu(e, video.url)}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoSelect(video);
                    }} 
                    className={cn(
                      "p-1.5 rounded-full flex-shrink-0",
                      currentVideoUrl === video.url 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <Play size={14} className="ml-0.5" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium flex items-center gap-1.5 truncate max-w-[80%]">
                        {video.isLocalFile && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                          </svg>
                        )}
                        {video.name}
                      </h3>
                      
                      {video.progress > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                          {Math.round(video.progress * 100)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col mt-1">
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
                      
                      {video.lastPlayed && (
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          {formatDate(video.lastPlayed)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {/* Delete button */}
                    {confirmDelete === video.url ? (
                      <div 
                        className="flex items-center gap-1 z-10"
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
                        className="text-muted-foreground hover:text-destructive p-1.5 transition-colors rounded-full hover:bg-muted"
                        title="Delete video"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.li>
              ))
            }
          </motion.ul>
        )}
        
        {/* Scroll to top button */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-all"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </div>

      {/* Quick action buttons above the list */}
      <div className="flex items-center gap-3 px-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        <button 
          className={cn(
            "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-all",
            "border border-border",
            searchTerm ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
          onClick={() => searchTerm ? onSearchChange('') : null}
        >
          {searchTerm ? "Clear Search" : "All Videos"}
        </button>
        
        <button
          className={cn(
            "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-all",
            "border border-border hover:bg-accent"
          )}
          onClick={() => {
            // Focus on search input
            document.querySelector('input[placeholder*="Search videos"]')?.focus();
          }}
        >
          <Search className="h-3.5 w-3.5 inline mr-1" />
          Search
        </button>
        
        {/* Additional quick filters could go here */}
      </div>

      {/* Context menu for video items */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            className="px-4 py-2 text-sm w-full text-left hover:bg-accent"
            onClick={() => {
              // Find the video and play it
              const video = videos.find(v => v.url === contextMenu.videoUrl);
              if (video) onVideoSelect(video);
              setContextMenu({...contextMenu, visible: false});
            }}
          >
            Play
          </button>
          <button 
            className="px-4 py-2 text-sm w-full text-left hover:bg-accent"
            onClick={() => {
              onDeleteVideo(contextMenu.videoUrl);
              setContextMenu({...contextMenu, visible: false});
            }}
          >
            Delete
          </button>
          {/* Add more context menu options as needed */}
        </div>
      )}
    </div>
  )
}

export default VideoList