import React from 'react'
import { cn } from '@/lib/utils'
import { Pause, Play, Trash2 } from 'lucide-react'

const VideoItem = React.memo(({ 
  video, 
  isActive, 
  confirmDelete,
  onVideoSelect,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  compact = false 
}) => (
  <div
    className={cn(
      "group border rounded-lg bg-card transition-all hover:shadow-sm",
      isActive && "ring-2 ring-primary border-primary",
      compact ? "p-2" : "p-3"
    )}
    id={`video-${encodeURIComponent(video.url)}`}
  >
    <div className="flex items-center gap-3">
      <button 
        className={cn(
          "flex-shrink-0 rounded-full flex items-center justify-center",
          "transition-all duration-200 hover:scale-105",
          compact ? "h-8 w-8" : "h-10 w-10",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-secondary hover:bg-primary hover:text-primary-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onVideoSelect(video);
        }}
      >
        {isActive ? 
          <Pause className={compact ? "h-3 w-3" : "h-4 w-4"} /> :
          <Play className={cn("ml-0.5", compact ? "h-3 w-3" : "h-4 w-4")} />
        }
      </button>
      
      <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => {
        e.stopPropagation();
        onVideoSelect(video);
      }}>
        <h3 className={cn(
          "font-medium truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {video.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs truncate">
            {video.url}
          </p>
        </div>
      </div>
      
      <div>
        {confirmDelete === video.url ? (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmDelete(video.url);
              }}
              className="px-2 py-1 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded transition-colors"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelDelete();
              }}
              className="px-2 py-1 text-xs font-medium bg-secondary/50 hover:bg-secondary rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(video.url);
            }}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
))

export default VideoItem