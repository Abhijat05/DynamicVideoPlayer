export function validateJsonVideos(jsonContent) {
  if (!Array.isArray(jsonContent)) {
    return { 
      success: false, 
      error: 'Invalid JSON format: Expected an array of video objects' 
    }
  }
  
  const validationErrors = []
  const validVideos = jsonContent.filter(video => {
    if (typeof video !== 'object' || !video) {
      validationErrors.push('Some items are not objects')
      return false
    }
    if (!video.url) {
      validationErrors.push(`Missing URL for item with name: ${video.name || 'unnamed'}`)
      return false
    }
    if (!isValidURL(video.url)) {
      validationErrors.push(`Invalid URL format: ${video.url}`)
      return false
    }
    return true
  })
  
  if (validVideos.length === 0) {
    return {
      success: false,
      error: `No valid videos found. Issues: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`
    }
  }
  
  // Partial success
  if (validVideos.length < jsonContent.length) {
    return {
      success: true,
      videos: validVideos,
      warning: `Only ${validVideos.length} out of ${jsonContent.length} videos were valid.`
    }
  }
  
  return {
    success: true,
    videos: validVideos
  }
}

export function parseTxtVideos(content) {
  const parsedVideos = []
  
  const entries = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n(?=[^https?:\/\/])/)
    .map(entry => entry.trim())
    .filter(Boolean)
  
  entries.forEach(entry => {
    if (entry.includes(',')) {
      // Format: name,url
      const [name, ...urlParts] = entry.split(',')
      const url = urlParts.join(',').trim()
      
      if (url && isValidURL(url)) {
        parsedVideos.push({ name: name.trim() || getNameFromUrl(url), url })
      }
    } else {
      // Try to parse as just a URL
      const url = entry.trim()
      if (isValidURL(url)) {
        const name = getNameFromUrl(url)
        parsedVideos.push({ name, url })
      }
    }
  })
  
  if (parsedVideos.length === 0) {
    return {
      success: false,
      error: 'No valid videos found in the text file'
    }
  }
  
  return {
    success: true,
    videos: parsedVideos
  }
}

export function isValidURL(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return /^(https?|rtmp|rtsp):\/\/\S+/i.test(string.trim())
  }
}

export function getNameFromUrl(url) {
  try {
    const urlObj = new URL(url)
    let pathParts = urlObj.pathname.split('/')
    // Remove empty parts and decode URI components
    pathParts = pathParts.filter(Boolean).map(part => decodeURIComponent(part))
    const lastPart = pathParts[pathParts.length - 1]
    
    // Remove file extensions and replace dashes/underscores with spaces
    return (lastPart || 'Video')
      .replace(/\.(mp4|webm|mov|avi|mkv|flv)$/i, '')
      .replace(/[-_]/g, ' ')
  } catch (_) {
    const parts = url.split('/')
    const lastPart = parts[parts.length - 1] || 'Video'
    return lastPart
      .replace(/\.(mp4|webm|mov|avi|mkv|flv)$/i, '')
      .replace(/[-_]/g, ' ')
  }
}