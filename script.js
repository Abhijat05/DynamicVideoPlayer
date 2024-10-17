const videoSelect = document.getElementById('videoSelect');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const videoTitle = document.getElementById('videoTitle');
const timeDisplay = document.getElementById('timeDisplay');
const progressBar = document.getElementById('progressBar');
const loadingIndicator = document.getElementById('loadingIndicator');
const playPauseButton = document.getElementById('playPauseButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const speedControl = document.getElementById('speedControl');
const muteButton = document.getElementById('muteButton');
const volumeControl = document.getElementById('volumeControl');
const fullscreenButton = document.getElementById('fullscreenButton');
const currentVolume = document.getElementById('currentVolume');
const themeToggle = document.getElementById('themeToggle');
const fileInput = document.getElementById('fileInput');
const rewindButton = document.getElementById('rewindButton'); // New button
const fastForwardButton = document.getElementById('fastForwardButton'); // New button

const videoFiles = [
    { src: './video/1.mp4', title: 'Video 1' },
    { src: './video/2.mp4', title: 'Video 2' },
    { src: './video/3.mp4', title: 'Video 3' },
    { src: './video/4.mp4', title: 'Video 4' },
    { src: './video/5.mp4', title: 'Video 5' },
    { src: './video/6.mp4', title: 'Video 6' },
    { src: './video/7.mp4', title: 'Video 7' },
];

// Populate video selection dropdown
videoFiles.forEach((video, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = video.title;
    videoSelect.appendChild(option);
});

function loadVideo(index) {
    const selectedVideo = videoFiles[index];
    videoSource.src = selectedVideo.src;
    videoTitle.textContent = selectedVideo.title;
    videoPlayer.load();
    videoPlayer.play();
    document.getElementById('videoContainer').style.display = 'block';
    loadingIndicator.style.display = 'none';
}

// Event Listeners
videoSelect.addEventListener('change', () => {
    loadingIndicator.style.display = 'block';
    loadVideo(videoSelect.value);
});

playPauseButton.addEventListener('click', () => {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playPauseButton.textContent = '⏸';
    } else {
        videoPlayer.pause();
        playPauseButton.textContent = '▶';
    }
});

videoPlayer.addEventListener('timeupdate', () => {
    const currentTime = Math.floor(videoPlayer.currentTime);
    const duration = Math.floor(videoPlayer.duration);
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    progressBar.value = (currentTime / duration) * 100 || 0;
});

progressBar.addEventListener('input', () => {
    const duration = videoPlayer.duration;
    videoPlayer.currentTime = (progressBar.value / 100) * duration;
});

volumeControl.addEventListener('input', () => {
    videoPlayer.volume = volumeControl.value;
    currentVolume.textContent = `${Math.round(volumeControl.value * 100)}%`;
});

muteButton.addEventListener('click', () => {
    videoPlayer.muted = !videoPlayer.muted;
    muteButton.textContent = videoPlayer.muted ? '🔊' : '🔇';
});

speedControl.addEventListener('change', () => {
    videoPlayer.playbackRate = parseFloat(speedControl.value);
});

nextButton.addEventListener('click', () => {
    const newIndex = (parseInt(videoSelect.value) + 1) % videoFiles.length;
    videoSelect.value = newIndex;
    loadVideo(newIndex);
});

prevButton.addEventListener('click', () => {
    const newIndex = (parseInt(videoSelect.value) - 1 + videoFiles.length) % videoFiles.length;
    videoSelect.value = newIndex;
    loadVideo(newIndex);
});

// New functionality to rewind and fast forward
rewindButton.addEventListener('click', () => {
    videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10); // Decrease 10 seconds
});

fastForwardButton.addEventListener('click', () => {
    videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 10); // Increase 10 seconds
});

fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        videoPlayer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
    const container = document.querySelector('.container');
    container.classList.toggle('light');
    container.classList.toggle('dark');
});

videoPlayer.addEventListener('error', () => {
    loadingIndicator.style.display = 'none';
    alert('Error loading video. Please check the format or try another video.');
});

videoPlayer.addEventListener('loadstart', () => {
    loadingIndicator.style.display = 'block';
});

videoPlayer.addEventListener('loadeddata', () => {
    loadingIndicator.style.display = 'none';
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        videoSource.src = fileURL;
        videoTitle.textContent = file.name; 
        videoPlayer.load();
        videoPlayer.play();
        document.getElementById('videoContainer').style.display = 'block';
        loadingIndicator.style.display = 'none';
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
