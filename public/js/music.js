class MusicMixer {
  constructor(localStream) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.localStream = localStream;
    this.destination = this.audioContext.createMediaStreamDestination();
    
    this.micSource = null;
    this.mixedStream = null;

    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      this.micSource = this.audioContext.createMediaStreamSource(this.localStream);
      this.micSource.connect(this.destination);
    }
    
    // Set up the HTML5 audio element source
    this.audioEl = document.getElementById('music-player');
    if (this.audioEl) {
      this.fileSource = this.audioContext.createMediaElementSource(this.audioEl);
      this.fileSource.connect(this.destination); // Route to WebRTC
      this.fileSource.connect(this.audioContext.destination); // Route to local speakers
    }
  }

  async playFile(file) {
    if (this.audioEl) {
      const url = URL.createObjectURL(file);
      this.audioEl.src = url;
      this.audioEl.classList.remove('hidden');
      await this.audioEl.play();
    }
    return this.destination.stream.getAudioTracks()[0];
  }
  
  stopFile() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl.classList.add('hidden');
    }
  }
  
  getMixedAudioTrack() {
    return this.destination.stream.getAudioTracks()[0];
  }
}
