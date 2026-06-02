const roomId = getRoomIdFromUrl();
if (!roomId) window.location.href = '/dashboard.html';

let webrtc;
let videoSync;
let musicMixer;
let currentMode = 'camera';

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  document.getElementById('local-label').textContent = user.username + ' (You)';

  try {
    const data = await apiFetch(`/api/rooms/${roomId}`);
    if (data && data.success) {
      document.getElementById('room-title').textContent = data.room.name || 'Room: ' + roomId;
      currentMode = data.room.mode;
      updateUIForMode(currentMode);
    }
  } catch (err) {}

  webrtc = new WebRTCManager(socket, roomId);
  
  webrtc.onRemoteStream = (stream) => {
    document.getElementById('remote-video').srcObject = stream;
  };

  try {
    const stream = await webrtc.startLocalStream({ video: true, audio: true });
    document.getElementById('local-video').srcObject = stream;
    musicMixer = new MusicMixer(stream);
  } catch (err) {
    if (err.message === 'PERMISSION_DENIED') {
      showToast('Camera/Mic permission denied.', 'error');
    } else {
      showToast('No camera or microphone found.', 'warning');
    }
  }

  videoSync = new VideoSyncManager(socket, roomId, document.getElementById('sync-video'));

  connectSocket();
  setupSocketListeners();
  setupUIListeners();
});

function setupSocketListeners() {
  socket.on('connect', () => {
    socket.emit('join-room', { roomId });
  });

  socket.on('room-joined', (data) => {
    currentMode = data.mode;
    updateUIForMode(currentMode);
    if (data.videoUrl && data.videoUrl !== '') {
      document.getElementById('video-url-input').value = data.videoUrl;
      videoSync.changeVideo(data.videoUrl);
    }
  });

  socket.on('room-error', (data) => {
    showToast(data.message, 'error');
    setTimeout(() => window.location.href = '/dashboard.html', 2000);
  });

  socket.on('user-joined', (data) => {
    document.getElementById('remote-label').textContent = data.username;
    showToast(`${data.username} joined`, 'success');
  });

  socket.on('user-left', (data) => {
    document.getElementById('remote-label').textContent = 'Waiting for friend...';
    document.getElementById('remote-video').srcObject = null;
    webrtc.destroy();
    webrtc.createPeerConnection(); 
    webrtc.addLocalStreamToPeer();
    showToast(`${data.username} left`, 'info');
  });

  socket.on('start-call', async () => {
    webrtc.createPeerConnection();
    webrtc.addLocalStreamToPeer();
    await webrtc.createOffer();
  });

  socket.on('offer', async (data) => {
    if (!webrtc.peerConnection) {
      webrtc.createPeerConnection();
      webrtc.addLocalStreamToPeer();
    }
    await webrtc.handleOffer(data.offer);
  });

  socket.on('answer', async (data) => {
    await webrtc.handleAnswer(data.answer);
  });

  socket.on('ice-candidate', async (data) => {
    await webrtc.addIceCandidate(data.candidate);
  });

  socket.on('video-sync', (data) => {
    videoSync.handleRemoteSync(data);
  });

  socket.on('mode-changed', (data) => {
    currentMode = data.mode;
    updateUIForMode(currentMode);
    showToast(`${data.by} changed mode to ${data.mode}`, 'info');
  });
}

function setupUIListeners() {
  document.getElementById('invite-btn').addEventListener('click', () => {
    copyToClipboard(window.location.href);
  });

  document.getElementById('leave-room-btn').addEventListener('click', () => {
    socket.emit('leave-room', { roomId });
    window.location.href = '/dashboard.html';
  });

  document.getElementById('toggle-mic').addEventListener('click', (e) => {
    const isMuted = webrtc.toggleMute();
    const btn = e.currentTarget;
    if (isMuted) {
      btn.classList.remove('neo-button', 'hover:text-primary');
      btn.classList.add('neo-pressed', 'text-error', 'hover:text-red-400');
      btn.querySelector('span').textContent = 'mic_off';
    } else {
      btn.classList.add('neo-button', 'hover:text-primary');
      btn.classList.remove('neo-pressed', 'text-error', 'hover:text-red-400');
      btn.querySelector('span').textContent = 'mic';
    }
  });

  document.getElementById('toggle-cam').addEventListener('click', (e) => {
    const isOff = webrtc.toggleCamera();
    const btn = e.currentTarget;
    if (isOff) {
      btn.classList.remove('neo-button', 'hover:text-primary');
      btn.classList.add('neo-pressed', 'text-error', 'hover:text-red-400');
      btn.querySelector('span').textContent = 'videocam_off';
    } else {
      btn.classList.add('neo-button', 'hover:text-primary');
      btn.classList.remove('neo-pressed', 'text-error', 'hover:text-red-400');
      btn.querySelector('span').textContent = 'videocam';
    }
  });

  document.getElementById('share-screen').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const isSharing = btn.classList.contains('neo-pressed');
    
    if (isSharing) {
      await webrtc.stopScreenShare();
      btn.classList.add('neo-button', 'hover:text-primary');
      btn.classList.remove('neo-pressed', 'text-success', 'hover:text-green-400');
      btn.querySelector('span').textContent = 'screen_share';
    } else {
      try {
        await webrtc.startScreenShare();
        btn.classList.remove('neo-button', 'hover:text-primary');
        btn.classList.add('neo-pressed', 'text-success', 'hover:text-green-400');
        btn.querySelector('span').textContent = 'stop_screen_share';
      } catch (err) {
        if (err.message !== 'SCREEN_SHARE_DENIED') showToast('Screen share failed', 'error');
      }
    }
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      socket.emit('mode-change', { roomId, mode });
      currentMode = mode;
      updateUIForMode(mode);
    });
  });

  document.getElementById('load-video-btn').addEventListener('click', () => {
    const url = document.getElementById('video-url-input').value;
    if (url) videoSync.changeVideo(url);
  });

  const fileInput = document.getElementById('music-file-input');
  const stopBtn = document.getElementById('stop-music-btn');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const mixedTrack = await musicMixer.playFile(file);
      webrtc.replaceAudioTrack(mixedTrack);
      document.getElementById('now-playing').textContent = `Playing: ${file.name}`;
      stopBtn.classList.remove('hidden');
    }
  });

  stopBtn.addEventListener('click', () => {
    musicMixer.stopFile();
    document.getElementById('now-playing').textContent = '';
    stopBtn.classList.add('hidden');
    fileInput.value = '';
    const origAudio = webrtc.localStream.getAudioTracks()[0];
    if (origAudio) webrtc.replaceAudioTrack(origAudio);
  });
}

function updateUIForMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');

  document.querySelectorAll('.view-layer').forEach(v => {
    v.classList.remove('active');
    v.classList.add('hidden');
  });

  document.getElementById(`${mode}-view`).classList.remove('hidden');
  document.getElementById(`${mode}-view`).classList.add('active');

  if (mode === 'url-video') {
    document.getElementById('camera-view').classList.remove('hidden');
    document.getElementById('camera-view').classList.add('pip-mode');
  } else {
    document.getElementById('camera-view').classList.remove('pip-mode');
  }
}

window.addEventListener('beforeunload', () => {
  webrtc.destroy();
  socket.emit('leave-room', { roomId });
  disconnectSocket();
});
