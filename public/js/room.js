const roomId = getRoomIdFromUrl();
if (!roomId) window.location.href = '/dashboard.html';

let webrtc;
let videoSync;
let musicMixer;
let currentMode = 'camera';
let isCreator = false;

window.sounds = {
  join: new Audio('/audio/joined.wav'),
  rejoin: new Audio('/audio/cameback.wav'),
  back: new Audio('/audio/back.mp3'),
  callcut: new Audio('/audio/callcut.wav'),
  micon: new Audio('/audio/micon.mp3'),
  click: new Audio('/audio/click.mp3')
};

window.playSound = function(name) {
  if (window.sounds[name]) {
    window.sounds[name].currentTime = 0;
    window.sounds[name].play().catch(e => console.warn('Audio play failed:', e));
  }
};

let seenUsers = new Set();
let myJoinCount = 0;

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
          leaveBtn.title = 'End Room';
        }
      }
    } else if (data && !data.success) {
      if (data.message === 'You are not a participant in this room.' || data.message === 'Room not found.') {
        window.location.href = `/dashboard.html?join=${roomId}`;
        return;
      }
    }
  } catch (err) {}

  document.getElementById('join-room-btn').addEventListener('click', async () => {
    document.getElementById('join-overlay').classList.add('hidden');
    document.getElementById('main-room-content').classList.remove('hidden');
    window.playSound('click');
    await joinRoom();
  });

  // Ping the server every 5 minutes to keep Render free instance awake
  setInterval(() => {
    fetch('/api/ping').catch(() => {});
  }, 5 * 60 * 1000);
});

async function joinRoom() {
  webrtc = new WebRTCManager(socket, roomId);
  
  webrtc.onRemoteStream = (stream) => {
    document.getElementById('remote-video').srcObject = stream;
    document.getElementById('remote-waiting-layer').classList.add('hidden');
    document.getElementById('remote-overlay-container').classList.remove('hidden');
    startVoiceAnalyzer(stream, document.getElementById('remote-waveform'));
    
    // Check initial track state
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && (videoTrack.muted || !videoTrack.enabled)) {
      document.getElementById('remote-video').parentElement.classList.add('remote-audio-only');
    } else {
      document.getElementById('remote-video').parentElement.classList.remove('remote-audio-only');
    }
  };

  webrtc.onRemoteVideoMute = () => {
    document.getElementById('remote-video').parentElement.classList.add('remote-audio-only');
  };

  webrtc.onRemoteVideoUnmute = () => {
    document.getElementById('remote-video').parentElement.classList.remove('remote-audio-only');
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
}


function setupSocketListeners() {
  socket.on('connect', () => {
    socket.emit('join-room', { roomId });
  });

  socket.on('room-joined', (data) => {
    myJoinCount++;
    if (myJoinCount > 1) window.playSound('rejoin');
    else window.playSound('join');
    
    if (data.existingUser) {
      document.getElementById('remote-label').textContent = data.existingUser.username;
      document.getElementById('remote-overlay-label').textContent = data.existingUser.username;
    }

    currentMode = data.mode;
    updateUIForMode(currentMode);
    if (data.videoUrl && data.videoUrl !== '') {
      document.getElementById('video-url-input').value = data.videoUrl;
      videoSync.syncLateJoiner(data.videoUrl, data.videoState);
    }
  });

  socket.on('room-error', (data) => {
    window.playSound('callcut');
    showToast(data.message, 'error');
    setTimeout(() => window.location.href = '/dashboard.html', 2000);
  });

  socket.on('media-state-changed', (data) => {
    const remoteContainer = document.getElementById('remote-video').parentElement;
    
    // Handle audio mute indicator
    let muteIcon = document.getElementById('remote-mute-icon');
    if (data.audio) {
      if (!muteIcon) {
        muteIcon = document.createElement('div');
        muteIcon.id = 'remote-mute-icon';
        muteIcon.className = 'absolute top-4 right-4 bg-error/90 text-white p-2 rounded-full flex items-center justify-center z-20 backdrop-blur-sm';
        muteIcon.innerHTML = '<span class="material-symbols-outlined text-sm">mic_off</span>';
        remoteContainer.appendChild(muteIcon);
      }
    } else {
      if (muteIcon) muteIcon.remove();
    }
    
    // Handle camera off indicator
    if (data.video) {
      remoteContainer.classList.add('opacity-50', 'grayscale');
    } else {
      remoteContainer.classList.remove('opacity-50', 'grayscale');
    }
  });

  socket.on('user-joined', (data) => {
    if (seenUsers.has(data.username)) window.playSound('rejoin');
    else {
      seenUsers.add(data.username);
      window.playSound('join');
    }
    
    document.getElementById('remote-label').textContent = data.username;
    document.getElementById('remote-overlay-label').textContent = data.username;
    showToast(`${data.username} joined`, 'success');
  });

  socket.on('user-left', (data) => {
    document.getElementById('remote-label').textContent = 'Waiting for friend...';
    document.getElementById('remote-overlay-label').textContent = 'Friend';
    document.getElementById('remote-video').srcObject = null;
    document.getElementById('remote-video').parentElement.classList.remove('remote-audio-only');
    document.getElementById('remote-waiting-layer').classList.remove('hidden');
    document.getElementById('remote-overlay-container').classList.add('hidden');
    webrtc.resetConnection();
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

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.playSound('back');
      setTimeout(() => window.location.href = '/dashboard.html', 200);
    });
  }

  document.getElementById('leave-room-btn').addEventListener('click', async () => {
    window.playSound('callcut');
    if (isCreator) {
      try {
        await apiFetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      } catch (err) {}
    } else {
      socket.emit('leave-room', { roomId });
    }
    setTimeout(() => window.location.href = '/dashboard.html', 300);
  });

  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      window.playSound('click');
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
    
    socket.emit('media-state', { roomId, audio: webrtc.isMuted, video: webrtc.isCameraOff });
    
    if (!isMuted) window.playSound('micon');
    else window.playSound('click');
    
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

  let isCameraToggling = false;
  document.getElementById('toggle-cam').addEventListener('click', async (e) => {
    if (isCameraToggling) return;
    isCameraToggling = true;
    
    const btn = e.currentTarget;
    // visual feedback while waiting
    btn.style.opacity = '0.5';
    
    const isOff = await webrtc.toggleCamera();
    btn.style.opacity = '1';
    isCameraToggling = false;
    
    socket.emit('media-state', { roomId, audio: webrtc.isMuted, video: webrtc.isCameraOff });
    
    if (!isOff) window.playSound('micon');
    else window.playSound('click');
    
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
    window.playSound('click');
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
      window.playSound('click');
      const mode = btn.dataset.mode;
      socket.emit('mode-change', { roomId, mode });
      currentMode = mode;
      updateUIForMode(mode);
    });
  });

  document.getElementById('load-video-btn').addEventListener('click', () => {
    window.playSound('click');
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

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // If the page is restored from bfcache, it's safer to reload it entirely
    // since WebRTC connections and WebSockets were torn down on beforeunload.
    window.location.reload();
  }
});
