// Get stored videos from localStorage
export const getStoredVideos = () => {
    try {
        const videos = localStorage.getItem('videoplayer_videos')
        return videos ? JSON.parse(videos) : []
    } catch (error) {
        console.error('Error retrieving videos from localStorage:', error)
        return []
    }
}

// Save all videos to localStorage
export const saveVideos = (videos) => {
  try {
    localStorage.setItem('videoplayer_videos', JSON.stringify(videos))
  } catch (error) {
    console.error('Error saving videos to localStorage:', error)
  }
}

// Save progress for a specific video
export const saveVideoProgress = (videoUrl, progress) => {
    try {
        const videos = getStoredVideos()
        const updatedVideos = videos.map(video => {
            if (video.url === videoUrl) {
                return { ...video, progress, lastPlayed: new Date().toISOString() }
            }
            return video
        })

        saveVideos(updatedVideos)
    } catch (error) {
        console.error('Error saving video progress:', error)
    }
}

// Setup theme listener
export const setupThemeListener = (setTheme) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Define the handler function
    const handleThemeChange = (e) => {
        // Only update if user hasn't set a preference manually
        if (!localStorage.getItem('videoplayer_theme')) {
            setTheme(e.matches ? 'dark' : 'light')
        }
    }

    // Run once at the start to set initial theme based on system preference if no stored preference
    if (!localStorage.getItem('videoplayer_theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // Add the event listener
    mediaQuery.addEventListener('change', handleThemeChange)

    // Return a cleanup function
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
}