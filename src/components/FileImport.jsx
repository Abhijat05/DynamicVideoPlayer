import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileUp, Plus, Upload } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const FileImport = ({ onImport }) => {
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoName, setVideoName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [importCount, setImportCount] = useState(0)
  
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
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
          // Handle TXT files
          const content = event.target.result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          const entries = content.split(/\n(?=[^https?:\/\/])/).map(entry => entry.trim()).filter(Boolean)
          
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
            setError('No valid videos found in the text file')
            return
          }
        } else {
          setError('Unsupported file format. Please upload .json or .txt files.')
          return
        }
        
        onImport(parsedVideos)
        setImportCount(prev => prev + parsedVideos.length)
        
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
    setImportCount(prev => prev + 1)
    
    // Reset form
    setVideoUrl('')
    setVideoName('')
    setError('')
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!dragActive) {
      setDragActive(true)
    }
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }
  
  const isValidURL = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return /^(https?|rtmp|rtsp):\/\/\S+/i.test(string.trim())
    }
  }
  
  const getNameFromUrl = (url) => {
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
      return lastPart.replace(/\.(mp4|webm|mov|avi|mkv|flv)$/i, '').replace(/[-_]/g, ' ')
    }
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 group">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Add Videos</h2>
              {importCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {importCount} imported
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="px-4 pb-4">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span>Add URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-1.5">
                    <FileUp className="h-4 w-4" />
                    <span>Import File</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-0">
                  <form onSubmit={handleAddSingleVideo} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoName">Video Name (optional)</Label>
                      <Input
                        id="videoName"
                        placeholder="My Awesome Video"
                        value={videoName}
                        onChange={(e) => setVideoName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl" className="flex justify-between">
                        <span>Video URL</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help">
                                Supported: http, https, rtmp, rtsp
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter direct URL to video files or streams</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://example.com/video.mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Add Video
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="file" className="mt-0">
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg transition-colors",
                      "p-8 text-center flex flex-col items-center justify-center",
                      dragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-muted-foreground/40"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <div className="space-y-1">
                      <p className="font-medium">Drag & drop or click to upload</p>
                      <p className="text-sm text-muted-foreground">
                        Support for .json and .txt files
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept=".json,.txt"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label 
                      htmlFor="file-upload" 
                      className="mt-4 inline-flex cursor-pointer"
                    >
                      <Button variant="outline" className="mt-2" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                  
                  <div className="mt-4 bg-muted rounded-md p-3 text-sm">
                    <p className="font-medium mb-2">Supported formats:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="inline-flex bg-primary/20 text-primary rounded px-1.5 py-0.5 text-xs font-mono mr-1.5">.json</span>
                        <span>Array of objects with <code className="text-xs bg-muted-foreground/20 px-1 rounded">name</code> and <code className="text-xs bg-muted-foreground/20 px-1 rounded">url</code> properties</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex bg-primary/20 text-primary rounded px-1.5 py-0.5 text-xs font-mono mr-1.5">.txt</span>
                        <span>Each line: <code className="text-xs bg-muted-foreground/20 px-1 rounded">name,url</code> or just <code className="text-xs bg-muted-foreground/20 px-1 rounded">url</code></span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default FileImport