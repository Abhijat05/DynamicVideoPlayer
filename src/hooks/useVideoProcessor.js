import { useMemo } from 'react'

export function useVideoProcessor(videos, searchTerm, sortMode) {
  return useMemo(() => {
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
}