/**
 * Parse JSON file content to extract video entries
 * @param {string} content - The JSON file content
 * @returns {Array} - Array of video objects with name and url
 */
export const parseJsonContent = (content) => {
  try {
    const parsedData = JSON.parse(content);
    
    if (!Array.isArray(parsedData)) {
      throw new Error('JSON must contain an array of video objects');
    }
    
    return parsedData
      .filter(item => item && typeof item === 'object' && item.url)
      .map(item => ({
        name: item.name || 'Untitled Video',
        url: item.url
      }));
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

/**
 * Parse text file content to extract video entries
 * @param {string} content - The text file content
 * @returns {Array} - Array of video objects with name and url
 */
export const parseTextContent = (content) => {
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length >= 2) {
        return {
          name: parts[0],
          url: parts[1]
        };
      } else if (parts.length === 1 && parts[0]) {
        return {
          name: `Video ${parts[0].slice(0, 15)}...`,
          url: parts[0]
        };
      }
      return null;
    })
    .filter(item => item !== null);
};

/**
 * Detect URL type (YouTube, Vimeo, direct file, etc.)
 * @param {string} url - The video URL
 * @returns {string} - The type of video URL
 */
export const detectUrlType = (url) => {
  if (!url) return 'unknown';
  
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
  const vimeoPattern = /^(https?:\/\/)?(www\.)?(vimeo\.com)\//i;
  const filePattern = /\.(mp4|webm|ogg|ogv|mov)$/i;
  
  if (youtubePattern.test(url)) return 'youtube';
  if (vimeoPattern.test(url)) return 'vimeo';
  if (filePattern.test(url)) return 'direct';
  
  return 'unknown';
};