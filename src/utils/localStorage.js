// Get stored videos from localStorage
export const getStoredVideos = () => {
    try {
        const videos = localStorage.getItem('videos')
        return videos ? JSON.parse(videos) : []
    } catch (error) {
        console.error('Error retrieving videos:', error)
        return []
    }
}

// Save all videos to localStorage
export const saveVideos = (videos) => {
    try {
        // Keep necessary properties
        const cleanedVideos = videos.map(video => {
            const { name, url, isLocalFile } = video;
            return { name, url, isLocalFile };
        });
        
        localStorage.setItem('videos', JSON.stringify(cleanedVideos));
    } catch (error) {
        console.error('Error saving videos:', error);
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