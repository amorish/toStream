const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Rooms store: roomId -> { code, host, users, videoState }
const rooms = new Map();

// Proxy endpoint to bypass iframe restrictions (X-Frame-Options, etc.)
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL is required');
  
  try {
    const fetch = (await import('node-fetch')).default || globalThis.fetch;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // If it's not HTML, just redirect to the original URL or pipe it
      return res.redirect(targetUrl);
    }

    let html = await response.text();
    
    // Inject <base> tag to fix relative URLs
    try {
      const origin = new URL(targetUrl).origin;
      html = html.replace('<head>', `<head><base href="${origin}/">`);
    } catch(e) {}

    // Special bypass for cxfoot and similar sites that check domain and redirect to telegram
    html = html.replace(
      /<script\s+src=["'][^"']*configurecxf\.js["']><\/script>/gi, 
      '<script>window.DOMAIN_CONFIG = { allowedDomains: [window.location.hostname, "cxfoot.pages.dev"] }; window.TELEGRAM_CONFIG = { popupChannel: "" };</script>'
    );

    // Copy safe headers
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['x-frame-options', 'content-security-policy', 'content-security-policy-report-only', 'transfer-encoding', 'content-encoding', 'content-length'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    res.send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error proxying URL');
  }
});

app.get('/health', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ roomId, secretCode }) => {
    if (rooms.has(roomId)) {
      socket.emit('error', 'Room already exists');
      return;
    }
    
    rooms.set(roomId, {
      code: secretCode,
      host: socket.id,
      users: new Set([socket.id]),
      videoState: {
        url: '',
        playing: false,
        time: 0,
        updatedAt: Date.now()
      }
    });

    socket.join(roomId);
    socket.emit('room-created', { roomId });
    console.log(`Room ${roomId} created by ${socket.id}`);
  });

  socket.on('join-room', ({ roomId, secretCode }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    
    if (room.code !== secretCode) {
      socket.emit('error', 'Invalid secret code');
      return;
    }

    room.users.add(socket.id);
    socket.join(roomId);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
    
    // Send current state to the new user
    socket.emit('room-joined', {
      roomId,
      host: room.host,
      users: Array.from(room.users),
      videoState: room.videoState
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // WebRTC Signaling
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', {
      from: socket.id,
      signal
    });
  });

  // Video State Sync
  socket.on('video-action', ({ roomId, action, payload }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Optional: Only allow host to control, or allow anyone? Let's allow host for now, or anyone if host delegates.
    // For simplicity, we'll allow anyone who is in the room to sync the video, but the client can restrict UI.
    
    switch (action) {
      case 'url':
        room.videoState.url = payload;
        break;
      case 'play':
        room.videoState.playing = true;
        room.videoState.time = payload;
        room.videoState.updatedAt = Date.now();
        break;
      case 'pause':
        room.videoState.playing = false;
        room.videoState.time = payload;
        room.videoState.updatedAt = Date.now();
        break;
      case 'seek':
        room.videoState.time = payload;
        room.videoState.updatedAt = Date.now();
        break;
    }

    // Broadcast to everyone else in the room
    socket.to(roomId).emit('video-action', { action, payload, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from any rooms they were in
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        
        // If host leaves, maybe reassign host or close room.
        // For now, if room is empty, delete it.
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted because it is empty`);
        } else if (room.host === socket.id) {
          // Reassign host to the first remaining user
          const nextHost = Array.from(room.users)[0];
          room.host = nextHost;
          io.to(roomId).emit('host-changed', nextHost);
        }
      }
    });
  });
});

// For any other routes, serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
