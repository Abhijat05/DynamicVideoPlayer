# React Video Player

A feature-rich video player application built with React and TailwindCSS that lets you manage and play your collection of videos with various playback controls and customization options.

## Features

- **Video playback** with native controls (play/pause, seek, volume, fullscreen)
- **Progress tracking** - automatically saves your watching progress for each video
- **Dark/Light mode** with theme persistence
- **Video management**:
  - Search and filter videos
  - Sort videos alphabetically
  - Delete unwanted videos
  - Import videos from various sources
- **Advanced playback controls**:
  - Adjustable playback speed (0.5x to 2x)
  - Keyboard shortcuts for common actions
  - Picture-in-Picture support
- **Import options**:
  - Add individual videos with URLs
  - Import multiple videos from JSON files
  - Import multiple videos from text files
- **Responsive design** that works on both desktop and mobile devices

## Tech Stack

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - State persistence

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173/`

### Building for Production

Create a production build:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Usage

### Adding Videos

- **Manual entry**: Enter the video name (optional) and URL, then click "Add Video"
- **File Import**: 
  - JSON format: Upload a JSON file containing an array of objects with `name` and `url` properties
  - Text format: Upload a text file with each line containing either just a URL or "name,url" format

### Playback Controls

- **Space**: Toggle play/pause
- **Left/Right Arrow**: Seek backward/forward 10 seconds
- **Click on progress bar**: Jump to that position in the video
- **Playback speed menu**: Change playback speed from 0.5x to 2x
- **Picture-in-Picture**: Enable floating video window

## Storage

The application uses localStorage to persist:
- Video collection
- Playback progress for each video
- Theme preferences
