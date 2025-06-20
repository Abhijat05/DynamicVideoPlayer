// Create a custom hook for keyboard shortcuts
import { useEffect } from 'react';

export function useKeyboardShortcuts({ 
  togglePlay, 
  seekForward, 
  seekBackward, 
  toggleMute, 
  volumeUp, 
  volumeDown, 
  toggleFullscreen 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay?.();
          break;
        case 'arrowright':
          e.preventDefault();
          seekForward?.();
          break;
        case 'arrowleft':
          e.preventDefault();
          seekBackward?.();
          break;
        case 'm':
          e.preventDefault();
          toggleMute?.();
          break;
        case 'arrowup':
          e.preventDefault();
          volumeUp?.();
          break;
        case 'arrowdown':
          e.preventDefault();
          volumeDown?.();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen?.();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, seekForward, seekBackward, toggleMute, volumeUp, volumeDown, toggleFullscreen]);
}