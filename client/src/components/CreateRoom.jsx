import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, PlaySquare } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(Math.random().toString(36).substring(2, 9));
  const [secretCode, setSecretCode] = useState('');
  
  const handleCreate = (e) => {
    e.preventDefault();
    if (!secretCode) return;
    
    // We navigate to the room with the intent to create it.
    // The Room component will handle the socket connection and creation.
    navigate(`/room/${roomId}?code=${secretCode}&action=create`);
  };

  return (
    <div className="create-room-card glass-panel animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create a Watch Room</h2>
      
      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label>Room ID</label>
          <input 
            type="text" 
            className="input-field" 
            value={roomId} 
            readOnly
            style={{ opacity: 0.7 }}
          />
        </div>

        <div className="form-group">
          <label>Secret Code</label>
          <div style={{ position: 'relative' }}>
            <KeyRound size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter a secret code for viewers" 
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          <PlaySquare size={20} />
          Start Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
