class VideoSyncManager {
  constructor(socket, roomId, videoElement) {
    this.socket = socket;
    this.roomId = roomId;
    this.videoElement = videoElement;
    
    // Initialize Plyr for YouTube and raw video support
    this.player = new Plyr(this.videoElement, {
      youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
    });
    
    if (this.player.elements.container) {
      this.player.elements.container.classList.add('hidden');
    }

    this.isLocalAction = true;
    this.syncThreshold = 2.0; 

    this.setupListeners();
  }

  setupListeners() {
    this.player.on('play', () => {
      if (this.isLocalAction) {
        this.socket.emit('video-sync', {
          roomId: this.roomId,
          event: 'play',
          currentTime: this.player.currentTime
        });
      }
    });

    this.player.on('pause', () => {
      if (this.isLocalAction) {
        this.socket.emit('video-sync', {
          roomId: this.roomId,
          event: 'pause',
          currentTime: this.player.currentTime
        });
      }
    });

    this.player.on('seeked', () => {
      if (this.isLocalAction) {
        this.socket.emit('video-sync', {
          roomId: this.roomId,
          event: 'seek',
          currentTime: this.player.currentTime
        });
      }
    });
  }

  handleRemoteSync(data) {
    this.isLocalAction = false;
    const { event, currentTime, videoUrl } = data;

    if (event === 'change-url') {
      this._setSource(videoUrl);
      this.player.once('ready', () => {
        this.player.play().catch(e => console.warn('Auto-play prevented'));
      });
    } else {
      if (Math.abs(this.player.currentTime - currentTime) > this.syncThreshold) {
        this.player.currentTime = currentTime;
      }

      if (event === 'play' && !this.player.playing) {
        this.player.play().catch(e => console.warn('Auto-play prevented'));
      } else if (event === 'pause' && this.player.playing) {
        this.player.pause();
      } else if (event === 'seek') {
        this.player.currentTime = currentTime;
      }
    }

    setTimeout(() => { this.isLocalAction = true; }, 100);
  }

  changeVideo(url) {
    this._setSource(url);
    this.player.once('ready', () => {
      this.player.play().catch(e => console.warn('Auto-play prevented'));
    });
    
    this.socket.emit('video-sync', {
      roomId: this.roomId,
      event: 'change-url',
      videoUrl: url,
      currentTime: 0
    });
  }

  _setSource(url) {
    const placeholder = document.getElementById('video-placeholder');
    if (placeholder) placeholder.classList.add('hidden');
    
    if (this.player.elements.container) {
      this.player.elements.container.classList.remove('hidden');
    }
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTube) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else {
        try {
          const urlParams = new URLSearchParams(new URL(url).search);
          videoId = urlParams.get('v');
        } catch(e) {
          videoId = '';
        }
      }
      if (videoId) {
        this.player.source = {
          type: 'video',
          sources: [
            { src: videoId, provider: 'youtube' }
          ]
        };
      }
    } else {
      this.player.source = {
        type: 'video',
        sources: [
          { src: url, type: 'video/mp4' }
        ]
      };
    }
  }
}
