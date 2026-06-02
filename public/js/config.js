const TOSTREAM_CONFIG = {
  SERVER_URL: window.location.origin,

  TOKEN_KEY: 'tostream_token',
  USER_KEY: 'tostream_user',
  ROOM_KEY: 'tostream_current_room',

  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: '240a091f42e6992f1ae1b188',
      credential: 'N9LnldFl4IVh6jhY',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: '240a091f42e6992f1ae1b188',
      credential: 'N9LnldFl4IVh6jhY',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: '240a091f42e6992f1ae1b188',
      credential: 'N9LnldFl4IVh6jhY',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: '240a091f42e6992f1ae1b188',
      credential: 'N9LnldFl4IVh6jhY',
    }
  ]
};
