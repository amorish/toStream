<div align="center">
  <img src="public/img/orglogo.webp" alt="toStream Logo" width="150" />
  <h1>toStream</h1>
</div>

Private streaming app for two friends. Built with Node.js, Express, Socket.io, WebRTC, and MongoDB.

## ✨ Features
- **Zero Servers**: WebRTC P2P connection ensures your video and audio never touch a server.
- **Premium Neo-morphic UI**: Beautiful, dark-themed responsive design featuring custom modals, interactive buttons, and tailored color palettes.
- **Watch Together**: Paste a raw video URL (e.g. .mp4) and watch perfectly in sync, featuring responsive Picture-in-Picture (PiP) layouts for both desktop and mobile.
- **Music Mixer**: Share local audio files mixed seamlessly with your microphone, complete with a native audio player for playback controls (Play, Pause, Seek).
- **Zero-Latency UI Sounds**: All interface sounds run instantly over the modern Web Audio API.
- **Secure**: Rooms are invite-only, optionally password protected, and automatically expire.

## 🚀 Setup
1. Clone this repository.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Run `npm run dev` to start the local server on port 3000.

## 🌐 Deployment
- **Backend (Render)**: Connect your repo, select Node, add environment variables from `.env`.
- **Frontend (Vercel)**: Connect your repo, set Output Directory to `public`. Update `public/js/config.js` with your Render backend URL.
