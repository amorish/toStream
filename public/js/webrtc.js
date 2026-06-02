class WebRTCManager {
  constructor(socket, roomId) {
    this.socket = socket;
    this.roomId = roomId;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.iceCandidateBuffer = [];
    this.remoteDescSet = false;
    this.isMuted = false;
    this.isCameraOff = false;

    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onIceCandidateError = null;
    this.onScreenShareEnded = null;
    this.currentVideoTrack = null;
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({ iceServers: TOSTREAM_CONFIG.ICE_SERVERS });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', { roomId: this.roomId, candidate: event.candidate });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      
      this.remoteStream.getTracks().forEach(track => {
        track.onunmute = () => {
          if (window.playSound) window.playSound('micon');
        };
      });

      this.remoteStream.onaddtrack = (e) => {
        e.track.onunmute = () => {
          if (window.playSound) window.playSound('micon');
        };
      };

      if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (this.onConnectionStateChange) this.onConnectionStateChange(state);
      if (state === 'failed') this.handleConnectionFailed();
      if (state === 'disconnected') this.handleConnectionDropped();
    };

    this.peerConnection.onicecandidateerror = (event) => {
      console.warn('[WebRTC] ICE candidate error:', event.errorCode, event.errorText);
    };
  }

  async startLocalStream(constraints) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentVideoTrack = this.localStream.getVideoTracks()[0];
      return this.localStream;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('PERMISSION_DENIED');
      } else if (err.name === 'NotFoundError') {
        throw new Error('DEVICE_NOT_FOUND');
      } else {
        throw err;
      }
    }
  }

  addLocalStreamToPeer() {
    if (!this.localStream || !this.peerConnection) return;
    this.localStream.getAudioTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    if (this.currentVideoTrack) {
      this.peerConnection.addTrack(this.currentVideoTrack, this.localStream);
    } else {
      this.peerConnection.addTransceiver('video', { direction: 'sendrecv', streams: [this.localStream] });
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit('offer', { roomId: this.roomId, offer });
  }

  async handleOffer(offer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    this.remoteDescSet = true;
    await this.flushIceCandidateBuffer();
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socket.emit('answer', { roomId: this.roomId, answer });
  }

  async handleAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    this.remoteDescSet = true;
    await this.flushIceCandidateBuffer();
  }

  async addIceCandidate(candidate) {
    if (this.remoteDescSet) {
      try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (err) { console.warn('[WebRTC] addIceCandidate error:', err); }
    } else {
      this.iceCandidateBuffer.push(candidate);
    }
  }

  async flushIceCandidateBuffer() {
    while (this.iceCandidateBuffer.length > 0) {
      const candidate = this.iceCandidateBuffer.shift();
      try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (err) { console.warn('[WebRTC] buffered ICE candidate error:', err); }
    }
  }

  toggleMute() {
    if (!this.localStream) return this.isMuted;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
    }
    return this.isMuted;
  }

  async toggleCamera() {
    if (!this.localStream) return this.isCameraOff;
    
    if (this.isCameraOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = stream.getVideoTracks()[0];
        this.localStream.addTrack(newTrack);
        this.isCameraOff = false;
        
        document.getElementById('local-video').srcObject = this.localStream;
        await this.replaceVideoTrack(newTrack);
      } catch (err) {
        console.warn('Failed to restart camera:', err);
      }
    } else {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
        this.currentVideoTrack = null;
        if (this.peerConnection) {
          const transceiver = this.peerConnection.getTransceivers().find(t => t.receiver.track && t.receiver.track.kind === 'video');
          if (transceiver && transceiver.sender) transceiver.sender.replaceTrack(null);
        }
      }
      this.isCameraOff = true;
    }
    return this.isCameraOff;
  }

  async replaceAudioTrack(newTrack) {
    const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
    if (sender) await sender.replaceTrack(newTrack);
  }

  async replaceVideoTrack(newTrack) {
    this.currentVideoTrack = newTrack;
    if (this.peerConnection) {
      const transceiver = this.peerConnection.getTransceivers().find(t => t.receiver.track && t.receiver.track.kind === 'video');
      if (transceiver && transceiver.sender) await transceiver.sender.replaceTrack(newTrack);
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];
      await this.replaceVideoTrack(videoTrack);
      videoTrack.onended = () => {
        this.stopScreenShare();
        if (this.onScreenShareEnded) this.onScreenShareEnded();
      };
      return screenStream;
    } catch (err) {
      if (err.name === 'NotAllowedError') throw new Error('SCREEN_SHARE_DENIED');
      throw err;
    }
  }

  async stopScreenShare() {
    let videoTrack = this.localStream && this.localStream.getVideoTracks()[0];
    if (!videoTrack && this.isCameraOff) {
       videoTrack = null;
    }
    await this.replaceVideoTrack(videoTrack);
  }

  handleConnectionFailed() {
    showToast('Connection failed. Your network may be blocking video. Try a different network or refresh.', 'error');
  }

  handleConnectionDropped() {
    showToast('Connection dropped. Attempting to recover...', 'warning');
  }

  destroy() {
    if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
    if (this.peerConnection) this.peerConnection.close();
    this.localStream = null;
    this.peerConnection = null;
    this.remoteStream = null;
    this.iceCandidateBuffer = [];
    this.remoteDescSet = false;
  }
}
