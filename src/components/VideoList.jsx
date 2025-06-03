import { useState } from 'react'

const VideoList = ({ videos, searchTerm, onVideoSelect, onDeleteVideo, currentVideoUrl }) => {
  const [sortAZ, setSortAZ] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null) // Track which video is pending deletion
  
  // Filter videos by search term
  const filteredVideos = videos.filter(video => {
    const term = searchTerm.toLowerCase()
    return video.name.toLowerCase().includes(term) || 
           video.url.toLowerCase().includes(term)
  })
  
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortAZ) {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })
  
  // Toggle sort direction
  const toggleSort = () => {
    setSortAZ(!sortAZ)
  }
  
  // Handle delete button click
  const handleDeleteClick = (url, e) => {
    // Stop click from propagating to the parent element (which would select the video)
    e.stopPropagation()
    
    // Set this video as the one we want to confirm deletion for
    setConfirmDelete(url)
  }
  
  // Cancel delete operation
  const cancelDelete = (e) => {
    e.stopPropagation()
    setConfirmDelete(null)
  }
  
  // Confirm deletion
  const confirmDeleteVideo = (url, e) => {
    e.stopPropagation()
    onDeleteVideo(url)
    setConfirmDelete(null)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Videos ({filteredVideos.length})</h2>
        <button 
          onClick={toggleSort}
          className="text-sm flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
        >
          <span>Sort</span>
          {sortAZ ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </button>
      </div>
      
      {sortedVideos.length > 0 ? (
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {sortedVideos.map((video) => (
            <li 
              key={video.url} 
              className={`p-3 rounded cursor-pointer transition-colors relative
                ${currentVideoUrl === video.url 
                  ? 'bg-blue-100 dark:bg-blue-900' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => onVideoSelect(video)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{video.name}</h3>
                <div className="flex items-center space-x-2">
                  {video.progress > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
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
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={(e) => confirmDeleteVideo(video.url, e)}
                      >
                        Delete
                      </button>
                      <button 
                        className="text-xs bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        onClick={cancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleDeleteClick(video.url, e)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1"
                      title="Delete video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {video.progress > 0 && (
                <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-1 bg-blue-500 rounded-full"
                    style={{ width: `${video.progress * 100}%` }}
                  ></div>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {video.url}
              </p>
              {video.lastPlayed && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last played: {new Date(video.lastPlayed).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center py-6 text-gray-500 dark:text-gray-400">
          No videos found. Import some videos or adjust your search.
        </p>
      )}
    </div>
  )
}

export default VideoList