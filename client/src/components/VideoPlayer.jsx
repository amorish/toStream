import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, socket, roomId }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // To prevent echo loops: track if the current change was triggered by a remote socket event
  const remoteActionRef = useRef(false);

  useEffect(() => {
    if (!socket || !url) return;

    const handleVideoAction = ({ action, payload, from }) => {
      if (!playerRef.current) return;
      
      remoteActionRef.current = true;
      
      switch (action) {
        case 'play':
          if (Math.abs(playerRef.current.getCurrentTime() - payload) > 1) {
            playerRef.current.seekTo(payload, 'seconds');
          }
          setIsPlaying(true);
          break;
        case 'pause':
          playerRef.current.seekTo(payload, 'seconds');
          setIsPlaying(false);
          break;
        case 'seek':
          playerRef.current.seekTo(payload, 'seconds');
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
    if (!socket || !playerRef.current) return;
    
    socket.emit('video-action', {
      roomId,
      action,
      payload
    });
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!playerRef.current) return;
    emitAction('play', playerRef.current.getCurrentTime());
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (!playerRef.current) return;
    emitAction('pause', playerRef.current.getCurrentTime());
  };

  const handleSeek = (e) => {
    // e is the time in seconds
    emitAction('seek', e);
  };

  if (!url) {
    return (
      <div className="video-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3 className="display-font">No stream selected</h3>
        <p>Paste a YouTube link, Twitch link, or direct video URL above to start watching.</p>
      </div>
    );
  }

  return (
    <div className="video-container animate-fade-in" style={{ paddingTop: '56.25%', position: 'relative' }}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        className="video-element"
        style={{ position: 'absolute', top: 0, left: 0 }}
        width="100%"
        height="100%"
        controls
        playing={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default VideoPlayer;
