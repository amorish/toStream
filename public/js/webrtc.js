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
    this.isNegotiating = false;
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
          if (window.playSound && track.kind === 'audio') window.playSound('micon');
          if (track.kind === 'video' && this.onRemoteVideoUnmute) this.onRemoteVideoUnmute();
        };
        track.onmute = () => {
          if (track.kind === 'video' && this.onRemoteVideoMute) this.onRemoteVideoMute();
        };
      });

      this.remoteStream.onaddtrack = (e) => {
        e.track.onunmute = () => {
          if (window.playSound && e.track.kind === 'audio') window.playSound('micon');
          if (e.track.kind === 'video' && this.onRemoteVideoUnmute) this.onRemoteVideoUnmute();
        };
        e.track.onmute = () => {
          if (e.track.kind === 'video' && this.onRemoteVideoMute) this.onRemoteVideoMute();
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

    this.peerConnection.onsignalingstatechange = () => {
      this.isNegotiating = (this.peerConnection.signalingState !== 'stable');
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
    if (!this.peerConnection) return;
    if (!this.localStream) this.localStream = new MediaStream();
    
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      this.peerConnection.addTrack(audioTracks[0], this.localStream);
    } else {
      this.peerConnection.addTransceiver('audio', { direction: 'sendrecv', streams: [this.localStream] });
    }

    if (this.currentVideoTrack) {
      this.peerConnection.addTrack(this.currentVideoTrack, this.localStream);
    } else {
      this.peerConnection.addTransceiver('video', { direction: 'sendrecv', streams: [this.localStream] });
    }
  }

  async createOffer() {
    if (this.isNegotiating) return;
    this.isNegotiating = true;
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', { roomId: this.roomId, offer });
    } catch (e) {
      this.isNegotiating = false;
    }
  }

  async handleOffer(offer) {
    try {
      if (this.peerConnection.signalingState !== 'stable') {
        await Promise.all([
          this.peerConnection.setLocalDescription({type: 'rollback'}),
          this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        ]);
      } else {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      }
      this.remoteDescSet = true;
      await this.flushIceCandidateBuffer();
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit('answer', { roomId: this.roomId, answer });
    } catch (e) {
      console.warn('Error handling offer:', e);
    }
  }

  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.remoteDescSet = true;
      await this.flushIceCandidateBuffer();
    } catch (e) {
      console.warn('Error handling answer:', e);
    }
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

  async toggleMute() {
    if (!this.localStream) this.localStream = new MediaStream();

    let audioTrack = this.localStream.getAudioTracks()[0];
    
    if (this.isMuted) {
      if (!audioTrack) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioTrack = stream.getAudioTracks()[0];
          this.localStream.addTrack(audioTrack);
          await this.replaceAudioTrack(audioTrack);
        } catch (err) {
          console.warn('Failed to start mic:', err);
          throw err;
        }
      } else {
        audioTrack.enabled = true;
      }
      this.isMuted = false;
    } else {
      if (audioTrack) {
        audioTrack.enabled = false;
      }
      this.isMuted = true;
    }
    return this.isMuted;
  }

  async toggleCamera() {
    if (!this.localStream) this.localStream = new MediaStream();
    
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
        throw err;
      }
    } else {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
        this.currentVideoTrack = null;
        await this.replaceVideoTrack(null);
      }
      this.isCameraOff = true;
    }
    return this.isCameraOff;
  }

  async replaceAudioTrack(newTrack) {
    if (this.peerConnection) {
      const transceiver = this.peerConnection.getTransceivers().find(t => t.receiver.track && t.receiver.track.kind === 'audio');
      if (transceiver && transceiver.sender) {
        await transceiver.sender.replaceTrack(newTrack);
      } else {
        const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
        if (sender) await sender.replaceTrack(newTrack);
      }
    }
  }

  async replaceVideoTrack(newTrack) {
    this.currentVideoTrack = newTrack;
    if (this.peerConnection) {
      const transceiver = this.peerConnection.getTransceivers().find(t => t.receiver.track && t.receiver.track.kind === 'video');
      if (transceiver && transceiver.sender) {
        await transceiver.sender.replaceTrack(newTrack);
      } else {
        const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) await sender.replaceTrack(newTrack);
      }
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

  resetConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.iceCandidateBuffer = [];
    this.remoteDescSet = false;
    this.currentVideoTrack = null;
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
