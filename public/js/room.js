const roomId = getRoomIdFromUrl();
if (!roomId) window.location.href = '/dashboard.html';

let webrtc;
let videoSync;
let musicMixer;
let currentMode = 'camera';
let isCreator = false;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  document.getElementById('local-label').textContent = user.username + ' (You)';

  try {
    const data = await apiFetch(`/api/rooms/${roomId}`);
    if (data && data.success) {
      document.getElementById('room-title').textContent = data.room.name || 'Room: ' + roomId;
      currentMode = data.room.mode;
      updateUIForMode(currentMode);
      if (data.room.createdBy === user._id || data.room.createdBy === user.id) {
        isCreator = true;
        const leaveBtn = document.getElementById('leave-room-btn');
        if (leaveBtn) {
          const textSpan = document.getElementById('leave-btn-text');
          if (textSpan) textSpan.textContent = 'End';
          else leaveBtn.textContent = 'End';
        }
      }
    }
  } catch (err) {}

  webrtc = new WebRTCManager(socket, roomId);
  
  webrtc.onRemoteStream = (stream) => {
    document.getElementById('remote-video').srcObject = stream;
    document.getElementById('remote-waiting-layer').classList.add('hidden');
    document.getElementById('remote-overlay-container').classList.remove('hidden');
    startVoiceAnalyzer(stream, document.getElementById('remote-waveform'));
  };

  try {
    const stream = await webrtc.startLocalStream({ video: true, audio: true });
    document.getElementById('local-video').srcObject = stream;
    musicMixer = new MusicMixer(stream);
    startVoiceAnalyzer(stream, document.getElementById('local-waveform'));
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
    document.getElementById('remote-waiting-layer').classList.remove('hidden');
    document.getElementById('remote-overlay-container').classList.add('hidden');
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
    if (navigator.share) {
      navigator.share({
        title: 'Join my room on toStream',
        url: window.location.href
      }).catch(console.error);
    } else {
      copyToClipboard(window.location.href);
    }
  });

  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(window.location.href);
    });
  }

  document.getElementById('leave-room-btn').addEventListener('click', async () => {
    if (isCreator) {
      try {
        await apiFetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      } catch (err) {}
    } else {
      socket.emit('leave-room', { roomId });
    }
    window.location.href = '/dashboard.html';
  });

  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          showToast('Fullscreen not supported', 'warning');
        });
        fullscreenBtn.querySelector('span').textContent = 'fullscreen_exit';
      } else {
        document.exitFullscreen();
        fullscreenBtn.querySelector('span').textContent = 'fullscreen';
      }
    });
  }

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

  document.getElementById('toggle-cam').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    // visual feedback while waiting
    btn.style.opacity = '0.5';
    
    const isOff = await webrtc.toggleCamera();
    btn.style.opacity = '1';
    
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

  webrtc.onScreenShareEnded = () => {
    const btn = document.getElementById('share-screen');
    btn.classList.add('neo-button', 'hover:text-primary');
    btn.classList.remove('neo-pressed', 'text-success', 'hover:text-green-400');
    btn.querySelector('span').textContent = 'screen_share';
    document.getElementById('local-video').srcObject = webrtc.localStream;
  };

  document.getElementById('share-screen').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const isSharing = btn.classList.contains('neo-pressed');
    
    if (isSharing) {
      await webrtc.stopScreenShare();
      webrtc.onScreenShareEnded();
    } else {
      try {
        const screenStream = await webrtc.startScreenShare();
        document.getElementById('local-video').srcObject = screenStream;
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

let sharedAudioContext = null;

function startVoiceAnalyzer(stream, waveformElement) {
  if (!stream.getAudioTracks().length) return;
  
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  try {
    // Safari/some browsers need the track to be played first or MediaStreamSource might fail if stream is inactive.
    const analyser = sharedAudioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    
    // Create source from the stream
    const source = sharedAudioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    // Auto-resume audio context on user interaction if suspended
    if (sharedAudioContext.state === 'suspended') {
      const resumeAudio = () => {
        sharedAudioContext.resume();
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      };
      document.addEventListener('click', resumeAudio);
      document.addEventListener('touchstart', resumeAudio);
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function checkVolume() {
      if (!waveformElement.isConnected || stream.getTracks().every(t => t.readyState === 'ended')) {
        waveformElement.classList.remove('speaking');
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Volume threshold
      if (average > 12) {
        waveformElement.classList.add('speaking');
      } else {
        waveformElement.classList.remove('speaking');
      }
      
      requestAnimationFrame(checkVolume);
    }
    
    checkVolume();
  } catch (err) {
    console.warn('Audio analyzer failed to start:', err);
  }
}
