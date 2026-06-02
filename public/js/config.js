const TOSTREAM_CONFIG = {
  SERVER_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://YOUR_RENDER_APP_NAME.onrender.com',

  TOKEN_KEY: 'tostream_token',
  USER_KEY: 'tostream_user',
  ROOM_KEY: 'tostream_current_room',

  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};
