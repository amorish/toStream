const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');

module.exports = function initSignaling(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) return next(new Error('User not found'));

      socket.user = { id: user._id.toString(), username: user.username };
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.username} [${socket.id}]`);

    socket.on('join-room', async ({ roomId, password }) => {
      try {
        const room = await Room.findActiveByRoomId(roomId);
        
        if (!room) {
          socket.emit('room-error', { message: 'Room not found or expired.' });
          return;
        }

        if (room.isExpired()) {
          socket.emit('room-error', { message: 'Room has expired.' });
          return;
        }

        if (room.isFull() && !room.hasParticipant(socket.user.id)) {
          socket.emit('room-error', { message: 'Room is full.' });
          return;
        }

        if (room.roomPassword && !room.hasParticipant(socket.user.id)) {
          if (!password) {
            socket.emit('room-error', { message: 'Wrong room password.' });
            return;
          }
          const isMatch = await bcrypt.compare(password, room.roomPassword);
          if (!isMatch) {
            socket.emit('room-error', { message: 'Wrong room password.' });
            return;
          }
        }

        const participantIndex = room.participants.findIndex(p => p.userId.toString() === socket.user.id);
        if (participantIndex === -1) {
          room.participants.push({ userId: socket.user.id, socketId: socket.id, joinedAt: new Date() });
        } else {
          room.participants[participantIndex].socketId = socket.id;
        }

        await room.save();
        socket.join(roomId);
        socket.currentRoom = roomId;

        const others = room.participants.filter(p => p.userId.toString() !== socket.user.id);
        let existingUser = null;
        if (others.length > 0) {
           const otherId = others[0].userId;
           const userObj = await User.findById(otherId).select('username');
           if (userObj) {
               existingUser = { username: userObj.username };
           }
        }
        
        socket.emit('room-joined', { 
          roomId, 
          participants: room.participants.length, 
          mode: room.mode, 
          videoUrl: room.videoUrl, 
          videoState: room.videoState,
          existingUser 
        });
        
        socket.to(roomId).emit('user-joined', { userId: socket.user.id, username: socket.user.username });

        if (room.participants.length === 2) {
          const firstJoiner = room.participants.reduce((a, b) => a.joinedAt < b.joinedAt ? a : b);
          try {
             io.to(firstJoiner.socketId).emit('start-call');
          } catch(e) {}
        }
      } catch (err) {
        console.error(err);
        socket.emit('room-error', { message: 'Failed to join room.' });
      }
    });

    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.user.id });
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.user.id });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.user.id });
    });

    socket.on('video-sync', async ({ roomId, event, currentTime, videoUrl }) => {
      try {
        socket.to(roomId).emit('video-sync', { event, currentTime, videoUrl, from: socket.user.id });
        
        if (event === 'play' || event === 'pause' || event === 'change-url') {
          const room = await Room.findOne({ roomId });
          if (room) {
            if (event === 'change-url') room.videoUrl = videoUrl;
            room.videoState = {
              playing: event === 'play',
              currentTime,
              lastUpdated: new Date()
            };
            await room.save();
          }
        }
      } catch (err) {
        // ignore errors silently
      }
    });

    socket.on('mode-change', async ({ roomId, mode }) => {
      try {
        if (!['camera', 'url-video', 'music'].includes(mode)) return;
        
        await Room.findOneAndUpdate({ roomId }, { mode });
        socket.to(roomId).emit('mode-changed', { mode, by: socket.user.username });
      } catch (err) {}
    });

    socket.on('media-state', ({ roomId, audio, video }) => {
      socket.to(roomId).emit('media-state-changed', { userId: socket.user.id, audio, video });
    });

    socket.on('leave-room', async ({ roomId }) => {
      await handleLeave(socket, roomId, io);
    });

    socket.on('disconnect', async (reason) => {
      console.log(`Socket disconnected: ${socket.user.username} reason: ${reason}`);
      if (socket.currentRoom) {
        await handleLeave(socket, socket.currentRoom, io);
      }
    });
  });
};

async function handleLeave(socket, roomId, io) {
  try {
    socket.leave(roomId);
    const room = await Room.findOne({ roomId });
    if (room) {
      // Remove only this specific socket connection
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      
      if (room.participants.length === 0) {
        room.isActive = false;
      }
      await room.save();
      
      // Check if this user still has another socket connection in the room (e.g. they refreshed and quickly rejoined)
      const hasOtherConnection = room.participants.some(p => p.userId.toString() === socket.user.id);
      if (!hasOtherConnection) {
        socket.to(roomId).emit('user-left', { userId: socket.user.id, username: socket.user.username });
      }
    }
  } catch (err) {
    console.error('Error in handleLeave:', err);
  }
}
