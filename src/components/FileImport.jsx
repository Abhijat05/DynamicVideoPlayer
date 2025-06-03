import { useState } from 'react'

const FileImport = ({ onImport }) => {
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoName, setVideoName] = useState('')
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const fileReader = new FileReader()
    
    fileReader.onload = (event) => {
      try {
        let parsedVideos = []
        
        if (file.name.endsWith('.json')) {
          // Handle JSON files
          const jsonContent = JSON.parse(event.target.result)
          
          // Validate JSON structure
          if (!Array.isArray(jsonContent)) {
            setError('Invalid format: JSON must be an array of video objects')
            return
          }
          
          // Validate each video has name and url
          parsedVideos = jsonContent.filter(video => {
            return typeof video === 'object' && video.name && video.url
          })
          
          if (parsedVideos.length === 0) {
            setError('No valid videos found. Each video must have name and url properties.')
            return
          }
        } else if (file.name.endsWith('.txt')) {
          // Handle TXT files - improved to handle multi-line URLs
          
          // First, normalize line endings
          const content = event.target.result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          
          // Look for patterns that indicate a new entry
          // This regex matches lines that start with a non-URL character (likely a name)
          // followed by a comma and then a URL
          const entries = content.split(/\n(?=[^https?:\/\/])/).map(entry => entry.trim()).filter(Boolean)
          
          entries.forEach(entry => {
            // For each entry, check if it has a name,url format or just url
            if (entry.includes(',')) {
              // Format: name,url
              const [name, ...urlParts] = entry.split(',')
              const url = urlParts.join(',').trim() // Rejoin in case URL contained commas
              
              if (url && isValidURL(url)) {
                parsedVideos.push({ name: name.trim(), url })
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
            setError('No valid videos found in the text file')
            return
          }
        } else {
          setError('Unsupported file format. Please upload .json or .txt files.')
          return
        }
        
        onImport(parsedVideos)
        
        // Reset file input
        e.target.value = ''
        setError('')
        
      } catch (err) {
        console.error(err)
        setError('Error processing file: ' + err.message)
      }
    }
    
    fileReader.onerror = () => {
      setError('Error reading file')
    }
    
    fileReader.readAsText(file)
  }
  
  const handleAddSingleVideo = (e) => {
    e.preventDefault()
    
    if (!videoUrl) {
      setError('Please enter a video URL')
      return
    }
    
    if (!isValidURL(videoUrl)) {
      setError('Please enter a valid URL')
      return
    }
    
    const name = videoName.trim() || getNameFromUrl(videoUrl)
    onImport([{ name, url: videoUrl }])
    
    // Reset form
    setVideoUrl('')
    setVideoName('')
    setError('')
  }
  
  const isValidURL = (string) => {
    try {
      // Try standard URL parsing
      new URL(string)
      return true
    } catch (_) {
      // Allow protocols like rtmp:// which might not be recognized by URL constructor
      return /^(https?|rtmp|rtsp):\/\/\S+/i.test(string.trim())
    }
  }
  
  const getNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const lastPart = pathParts[pathParts.length - 1]
      return lastPart || 'Video'
    } catch (_) {
      // Try to extract a meaningful name from non-standard URLs
      const parts = url.split('/')
      return parts[parts.length - 1] || 'Video'
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Add Videos</h2>
      
      {/* Manual URL entry */}
      <form onSubmit={handleAddSingleVideo} className="mb-4">
        <input
          type="text"
          placeholder="Video name (optional)"
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Video URL"
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button 
          type="submit" 
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Add Video
        </button>
      </form>
      
      <div className="my-4 text-center text-gray-500 dark:text-gray-400">or</div>
      
      {/* File import */}
      <div className="text-center">
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Import from file (.json or .txt)</span>
          <input
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     dark:file:bg-blue-900 dark:file:text-blue-200
                     dark:hover:file:bg-blue-800"
          />
        </label>
      </div>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-semibold mb-1">File Formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="font-mono">.json</span> - Array of objects with name and url properties</li>
          <li><span className="font-mono">.txt</span> - Format: "name,url" or just "url" (URLs can span multiple lines)</li>
        </ul>
      </div>
    </div>
  )
}

export default FileImport