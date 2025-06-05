import React, { useRef, useState } from 'react';
import { Upload, FileText, FileJson, AlertCircle } from 'lucide-react';

const FileImporter = ({ onImportVideos }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setImporting(true);
    
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let videos = [];
      
      if (fileExt === 'json') {
        const content = await file.text();
        try {
          const parsedData = JSON.parse(content);
          
          if (Array.isArray(parsedData)) {
            videos = parsedData.filter(item => 
              item && typeof item === 'object' && item.url && typeof item.url === 'string'
            ).map(item => ({
              name: item.name || 'Untitled Video',
              url: item.url
            }));
          } else {
            throw new Error('JSON file must contain an array of video objects');
          }
        } catch (jsonError) {
          throw new Error(`Invalid JSON format: ${jsonError.message}`);
        }
      } else if (fileExt === 'txt') {
        const content = await file.text();
        videos = content.split('\n')
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
      } else {
        throw new Error('Unsupported file format. Please use .json or .txt files.');
      }
      
      if (videos.length === 0) {
        throw new Error('No valid video entries found in the file.');
      }
      
      onImportVideos(videos);
      e.target.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={triggerFileInput} 
        className="border-2 border-dashed border-muted rounded-md p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json,.txt" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={importing}
        />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium mb-1">
          {importing ? 'Importing...' : 'Click to import videos'}
        </p>
        <p className="text-xs text-muted-foreground">
          Supports .json and .txt files
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/30 rounded p-2 flex flex-col items-center">
          <FileJson size={16} className="mb-1" />
          <p className="text-center text-muted-foreground">
            JSON format:<br />
            <code>[{"{name:'Title', url:'URL'}"}, ...]</code>
          </p>
        </div>
        <div className="bg-muted/30 rounded p-2 flex flex-col items-center">
          <FileText size={16} className="mb-1" />
          <p className="text-center text-muted-foreground">
            TXT format:<br />
            <code>Title,URL</code> or just <code>URL</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileImporter;