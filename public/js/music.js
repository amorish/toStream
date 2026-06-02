class MusicMixer {
  constructor(localStream) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.localStream = localStream;
    this.destination = this.audioContext.createMediaStreamDestination();
    
    this.micSource = null;
    this.fileSource = null;
    this.mixedStream = null;

    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      this.micSource = this.audioContext.createMediaStreamSource(this.localStream);
      this.micSource.connect(this.destination);
    }
  }

  async playFile(file) {
    if (this.fileSource) {
      this.fileSource.disconnect();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.fileSource = this.audioContext.createBufferSource();
    this.fileSource.buffer = audioBuffer;
    
    this.fileSource.connect(this.destination);
    this.fileSource.connect(this.audioContext.destination); // Play locally too
    
    this.fileSource.start();
    
    return this.destination.stream.getAudioTracks()[0];
  }
  
  stopFile() {
    if (this.fileSource) {
      this.fileSource.stop();
      this.fileSource.disconnect();
      this.fileSource = null;
    }
  }
  
  getMixedAudioTrack() {
    return this.destination.stream.getAudioTracks()[0];
  }
}
