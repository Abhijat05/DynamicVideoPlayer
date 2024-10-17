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

const videoFiles = [
    { src: './exp.mp4', title: 'Video 1' },//add your own file
];

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

videoSelect.addEventListener('change', () => {
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

// Format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

