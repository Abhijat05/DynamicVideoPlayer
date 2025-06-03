# React Video Player

React Video Player is a modern, feature-rich web application for managing and watching your video collection. Built with React and TailwindCSS, it provides an intuitive interface with advanced playback controls, progress tracking, and theme customization. Users can import videos via URLs or files, organize and search their library, and enjoy a responsive experience across devices. The app saves your video progress and preferences using localStorage, ensuring a seamless and personalized viewing experience.

## Features

- **Video playback** with custom controls (play/pause, seek, volume, fullscreen)
- **Progress tracking** - automatically saves your watching progress for each video
- **Dark/Light mode** with theme persistence and system preference support
- **Video management**:
  - Search and filter videos
  - Sort videos alphabetically or by last played date
  - Delete unwanted videos
  - Import videos from various sources
- **Advanced playback controls**:
  - Adjustable playback speed (0.5x to 2x)
  - Keyboard shortcuts for common actions (play/pause, seek, volume, mute, fullscreen)
  - Picture-in-Picture support
- **Import options**:
  - Add individual videos with URLs
  - Import multiple videos from JSON files (array of `{ name, url }`)
  - Import multiple videos from text files (one URL or "name,url" per line)
- **Responsive design** for desktop and mobile devices

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
- **Up/Down Arrow**: Adjust volume
- **M**: Mute/unmute
- **F**: Toggle fullscreen
- **Click on progress bar**: Jump to that position in the video
- **Playback speed menu**: Change playback speed from 0.5x to 2x
- **Picture-in-Picture**: Enable floating video window

## Storage

The application uses localStorage to persist:
- Video collection
- Playback progress for each video
- Theme preferences