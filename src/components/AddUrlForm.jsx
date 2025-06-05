import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const AddUrlForm = ({ onAddVideo }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic URL validation
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      // Check if it's at least a somewhat valid URL
      new URL(url.startsWith('http') ? url : `https://${url}`);
      
      // Format URL with http protocol if missing
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      onAddVideo({
        name: name.trim() || `Video ${formattedUrl.slice(0, 15)}...`,
        url: formattedUrl
      });
      
      // Reset form
      setName('');
      setUrl('');
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div>
        <label htmlFor="video-name" className="block text-sm font-medium mb-1">
          Name (optional)
        </label>
        <Input
          id="video-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Video"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="video-url" className="block text-sm font-medium mb-1">
          URL <span className="text-destructive">*</span>
        </label>
        <Input
          id="video-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
          className={error ? "border-destructive" : ""}
          required
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-1 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
      
      <Button type="submit" className="w-full">
        <Plus size={16} className="mr-2" /> Add Video
      </Button>
    </motion.form>
  );
};

export default AddUrlForm;