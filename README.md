# Dynamic Video Player

Dynamic Video Player is a modern web application designed for managing and playing a personal collection of videos from various online sources. It offers a user-friendly interface with features like video organization, playback resumption, and theme customization.

<!-- Optional: Add a GIF or screenshot of the application here -->
<!-- ![App Screenshot](link_to_your_screenshot.png) -->

## ✨ Features

-   **Add Videos via URL:** Easily add videos by pasting their direct URL.
-   **File Import:** Import video lists from JSON or TXT files.
-   **Automatic Collections:** Videos are automatically grouped into collections based on their names.
-   **Recently Played:** Quickly access videos you've watched recently.
-   **Resume Playback:** Continue watching videos from where you left off.
-   **Watch Progress Tracking:** Visual indicators show how much of a video you've watched.
-   **Theme Customization:** Switch between Light, Dark, and System themes.
-   **Responsive Design:** Enjoy a seamless experience across different screen sizes.
-   **Intuitive Controls:** Standard video player controls including play/pause, seek, volume, and fullscreen.

## 🚀 Tech Stack

-   **Frontend:** React (v19) with Vite
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui, Radix UI
-   **State Management:** React Context API (`VideoContext`, `PlayerContext`)
-   **Video Playback:** `react-player`
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **Local Storage:** Custom `useLocalStorage` hook for persistence
-   **Linting:** ESLint

## 📂 Project Structure

```
DynamicVideoPlayer/
├── public/               # Static assets
├── src/
│   ├── components/       # UI components
│   │   ├── layout/       # Main layout structure (MainLayout.jsx)
│   │   ├── library/      # Components for the library section (LibrarySection.jsx)
│   │   ├── player/       # Components for the player section (PlayerSection.jsx)
│   │   └── ui/           # Generic UI elements from shadcn/ui (Button, Card, etc.)
│   ├── contexts/         # React Context providers
│   │   ├── PlayerContext.jsx # Manages player state (playing, duration, etc.)
│   │   └── VideoContext.jsx  # Manages video data (list, collections, progress)
│   ├── hooks/            # Custom React hooks (useLocalStorage.js)
│   ├── lib/              # Utility functions (cn for classnames - utils.js)
│   ├── utils/            # Helper functions (fileParser.js)
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global CSS and Tailwind directives
│   └── main.jsx          # Entry point of the React application
├── .gitignore            # Specifies intentionally untracked files
├── components.json       # shadcn/ui configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # Main HTML file
├── jsconfig.json         # JavaScript configuration (for path aliases)
├── package.json          # Project metadata and dependencies
├── postcss.config.js     # PostCSS configuration
├── README.md             # This file
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd DynamicVideoPlayer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The optimized static files will be generated in the `dist` directory.

## 📜 Available Scripts

In the project directory, you can run the following scripts:

-   `npm run dev`: Starts the development server with hot reloading.
-   `npm run build`: Bundles the application for production.
-   `npm run lint`: Lints the codebase using ESLint to check for code quality and style issues.
-   `npm run preview`: Serves the production build locally to preview it before deployment.

## 🧩 Key Components & Architecture

The application is structured around a few core concepts:

-   **[`src/App.jsx`](src/App.jsx):** The root component that orchestrates the main layout and global providers.
-   **Layout ([`src/components/layout/MainLayout.jsx`](src/components/layout/MainLayout.jsx)):** Provides the overall page structure, including the header and theme integration. It wraps the application with necessary context providers.
-   **Contexts:**
    -   **[`VideoContext`](src/contexts/VideoContext.jsx):** Manages all video-related data, including the list of videos, collections, recently played items, and watch progress. It provides functions to add, import, and select videos, as well as update and retrieve watch progress.
    -   **[`PlayerContext`](src/contexts/PlayerContext.jsx):** Handles the state of the video player itself, such as play/pause status, current playback time, video duration, and resume logic. It interacts with `VideoContext` to get current video information and saved progress.
-   **Sections:**
    -   **[`PlayerSection`](src/components/player/PlayerSection.jsx):** Contains the video player ([`VideoPlayer`](src/components/VideoPlayer.jsx)), playback controls ([`VideoControls`](src/components/VideoControls.jsx)), and information about the currently playing video. It also handles the "resume playback" prompt.
    -   **[`LibrarySection`](src/components/library/LibrarySection.jsx):** Displays the video library, organized into tabs for all videos ([`VideoList`](src/components/VideoList.jsx)), collections ([`CollectionList`](src/components/CollectionList.jsx)), and recently played ([`RecentlyPlayed`](src/components/RecentlyPlayed.jsx)). It also includes forms for adding videos via URL ([`AddUrlForm`](src/components/AddUrlForm.jsx)) and importing from files ([`FileImporter`](src/components/FileImporter.jsx)).
-   **UI Components ([`src/components/ui/`](src/components/ui/)):** Reusable UI elements, primarily from shadcn/ui, such as `Button`, `Card`, `Input`, `Tabs`, `Toaster`, etc.
-   **Custom Hooks:**
    -   **[`useLocalStorage`](src/hooks/useLocalStorage.js):** A hook to easily persist and retrieve state from the browser's local storage.
-   **Utilities:**
    -   **[`fileParser.js`](src/utils/fileParser.js):** Contains functions to parse video data from JSON and TXT files.
    -   **[`utils.js`](src/lib/utils.js):** Includes helper functions like `cn` for merging Tailwind CSS classes.

## ⚙️ Configuration

-   **Theme:** The selected theme (light, dark, system) is stored in local storage under the key `video-player-theme` (configurable in [`src/components/layout/MainLayout.jsx`](src/components/layout/MainLayout.jsx) via `ThemeProvider`).
-   **Video Data:** All video metadata, collections, recently played lists, and watch progress are stored in local storage. Keys include `videos`, `collections`, `recentlyPlayed`, and `watchProgress`.
-   **shadcn/ui:** Component configuration and aliases are defined in [`components.json`](components.json) and `jsconfig.json`.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any bugs, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature` or `bugfix/YourBugfix`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

Please ensure your code adheres to the existing style and that all tests pass.
---