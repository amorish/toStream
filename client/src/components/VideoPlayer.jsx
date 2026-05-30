import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ url, socket, roomId }) => {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  
  // To prevent echo loops: track if the current change was triggered by a remote socket event
  const remoteActionRef = useRef(false);

  useEffect(() => {
    if (!socket || !url) return;

    const handleVideoAction = ({ action, payload, from }) => {
      if (!videoRef.current) return;
      
      remoteActionRef.current = true;
      
      switch (action) {
        case 'play':
          if (Math.abs(videoRef.current.currentTime - payload) > 1) {
            videoRef.current.currentTime = payload;
          }
          videoRef.current.play().catch(e => console.error("Play failed", e));
          break;
        case 'pause':
          videoRef.current.currentTime = payload;
          videoRef.current.pause();
          break;
        case 'seek':
          videoRef.current.currentTime = payload;
          break;
      }
      
      // Reset after a short delay
      setTimeout(() => {
        remoteActionRef.current = false;
      }, 100);
    };

    socket.on('video-action', handleVideoAction);
    
    return () => {
      socket.off('video-action', handleVideoAction);
    };
  }, [socket, url]);

  const emitAction = (action, payload) => {
    if (remoteActionRef.current) return; // Don't echo back what we just received
    if (!socket) return;
    
    socket.emit('video-action', {
      roomId,
      action,
      payload
    });
  };

  const handlePlay = () => {
    if (!videoRef.current) return;
    emitAction('play', videoRef.current.currentTime);
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    emitAction('pause', videoRef.current.currentTime);
  };

  const handleSeek = () => {
    if (!videoRef.current) return;
    emitAction('seek', videoRef.current.currentTime);
  };

  if (!url) {
    return (
      <div className="video-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>No video selected</h3>
        <p>The host needs to provide a video URL to start watching.</p>
      </div>
    );
  }

  return (
    <div className="video-container animate-fade-in">
      <video
        ref={videoRef}
        src={url}
        className="video-element"
        controls
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeek}
        onCanPlay={() => setIsReady(true)}
      />
    </div>
  );
};

export default VideoPlayer;
