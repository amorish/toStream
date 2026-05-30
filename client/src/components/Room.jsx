import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Link, Check, AlertCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.origin.includes('5173') ? 'http://localhost:4000' : window.location.origin);

const isDirectVideo = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|m3u8)($|\?)/i) !== null;
};

const Room = () => {
  const { roomId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const isCreating = searchParams.get('action') === 'create';
  
  const [code, setCode] = useState(initialCode);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState('');
  
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  
  const [isMuted, setIsMuted] = useState(true);
  const [micStream, setMicStream] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const peersRef = useRef({}); // socketId -> Peer instance
  const audioRefs = useRef({}); // socketId -> Audio element

  useEffect(() => {
    // Only connect once we have the code and intend to join
    if (!code && !isCreating) return;
    if (hasJoined) return;
    if (isCreating && !initialCode) return; // Should not happen based on CreateRoom logic

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket', newSocket.id);
      if (isCreating) {
        newSocket.emit('create-room', { roomId, secretCode: code });
      } else {
        newSocket.emit('join-room', { roomId, secretCode: code });
      }
    });

    newSocket.on('room-created', () => {
      setHasJoined(true);
      setParticipants([newSocket.id]);
      // Remove action=create from URL
      setSearchParams({ code });
      setupMedia(newSocket);
    });

    newSocket.on('room-joined', ({ users, videoState }) => {
      setHasJoined(true);
      setParticipants(users);
      if (videoState.url) {
        setVideoUrl(videoState.url);
      }
      setupMedia(newSocket, users);
    });

    newSocket.on('user-joined', (userId) => {
      setParticipants(prev => [...prev, userId]);
      // The new user joined, so we (the existing user) need to initiate a peer connection to them
      if (micStreamRef.current) {
         createPeer(userId, newSocket.id, micStreamRef.current, newSocket);
      }
    });

    newSocket.on('user-left', (userId) => {
      setParticipants(prev => prev.filter(id => id !== userId));
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
      }
      if (audioRefs.current[userId]) {
        audioRefs.current[userId].remove();
        delete audioRefs.current[userId];
      }
    });

    newSocket.on('signal', ({ from, signal }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      } else {
        // Someone is sending us a signal, they must be the initiator. We need to answer.
        // We might receive a signal before our media is ready, so we need to ensure media is ready
        if (micStreamRef.current) {
          addPeer(signal, from, micStreamRef.current, newSocket);
        }
      }
    });

    newSocket.on('error', (msg) => {
      setError(msg);
      newSocket.disconnect();
    });

    return () => {
      newSocket.disconnect();
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, [code, isCreating, roomId, hasJoined]);

  // Handle stream state outside of stale closures
  const micStreamRef = useRef(null);
  
  const setupMedia = async (currentSocket, existingUsers = []) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicStream(stream);
      micStreamRef.current = stream;
      
      // Start muted by default
      stream.getAudioTracks()[0].enabled = false;
      
      // If there are existing users, we connect to them
      existingUsers.forEach(userId => {
        if (userId !== currentSocket.id) {
          createPeer(userId, currentSocket.id, stream, currentSocket);
        }
      });
      
    } catch (err) {
      console.error("Failed to get microphone", err);
      setError("Microphone access denied. Voice chat disabled.");
    }
  };

  const createPeer = (userToSignal, callerID, stream, currentSocket) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      currentSocket.emit('signal', { to: userToSignal, signal });
    });

    peer.on('stream', remoteStream => {
      playRemoteStream(userToSignal, remoteStream);
    });

    peersRef.current[userToSignal] = peer;
  };

  const addPeer = (incomingSignal, callerID, stream, currentSocket) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      currentSocket.emit('signal', { to: callerID, signal });
    });

    peer.on('stream', remoteStream => {
      playRemoteStream(callerID, remoteStream);
    });

    peer.signal(incomingSignal);
    peersRef.current[callerID] = peer;
  };

  const playRemoteStream = (userId, stream) => {
    if (!audioRefs.current[userId]) {
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audioRefs.current[userId] = audio;
      
      // We must append to document to play reliably on some browsers, or just keep it in memory
      // If we keep in memory, we just call .play()
      audio.play().catch(e => console.error("Audio auto-play prevented", e));
    }
  };

  const toggleMute = () => {
    if (micStream) {
      const audioTrack = micStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleUpdateUrl = (e) => {
    e.preventDefault();
    setVideoUrl(inputUrl);
    if (socket) {
      socket.emit('video-action', { roomId, action: 'url', payload: inputUrl });
    }
  };

  const copyInvite = () => {
    const link = `${window.location.origin}/room/${roomId}?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasJoined && !isCreating) {
    return (
      <div className="create-room-card glass-panel animate-fade-in">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Join Room</h2>
        {error && <div className="error-message"><AlertCircle size={16} style={{display:'inline', marginRight: '8px'}}/>{error}</div>}
        <div className="form-group">
          <label>Secret Code required</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter the room's secret code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          onClick={() => {
            if(code) {
              setSearchParams({ code });
              // The useEffect will trigger since code changed and we want to join
            }
          }}
        >
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div className="room-layout animate-fade-in">
      <div className="main-stage">
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <form onSubmit={handleUpdateUrl} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Paste video URL or Website Link (e.g. https://cxfoot...)" 
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">Set Stream</button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {videoUrl && isDirectVideo(videoUrl) ? (
          <VideoPlayer url={videoUrl} socket={socket} roomId={roomId} />
        ) : videoUrl ? (
          <div className="video-container animate-fade-in">
            <iframe 
              src={videoUrl} 
              className="video-element" 
              style={{ border: 'none', background: 'white' }} 
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media"
            />
          </div>
        ) : (
          <div className="video-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No stream selected</h3>
            <p>Paste a video URL or a Website link above to start watching.</p>
          </div>
        )}
      </div>

      <div className="sidebar glass-panel">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Room Details</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invite Link (includes secret code):</p>
          <button onClick={copyInvite} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            {copied ? <Check size={18} color="#10b981" /> : <Link size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="participants-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Participants
            <span style={{ fontSize: '0.8rem', background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>
              {participants.length}
            </span>
          </h3>
          <ul className="participants-list">
            {participants.map((id) => (
              <li key={id} className="participant-item">
                <div className="participant-avatar">
                  {id === socket?.id ? 'Me' : id.substring(0,2)}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  User_{id.substring(0,4)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="voice-controls" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <button 
            className={`btn ${isMuted ? 'btn-secondary' : 'btn-primary'}`} 
            style={{ width: '100%', background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'var(--primary)', color: isMuted ? '#ef4444' : 'white' }}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            {isMuted ? 'Microphone Muted' : 'Microphone Active'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
