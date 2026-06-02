const socket = io(TOSTREAM_CONFIG.SERVER_URL, {
  autoConnect: false,
  auth: { token: getToken() },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 10000
});

socket.on('connect', function() {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('connect_error', function(err) {
  console.error('[Socket] Connection error:', err.message);
  if (err.message === 'Authentication required' || err.message === 'Authentication failed' || err.message === 'User not found') {
    removeToken();
    window.location.href = '/login.html';
  }
});

socket.on('disconnect', function(reason) {
  console.log('[Socket] Disconnected:', reason);
  if (reason === 'io server disconnect') {
    showToast('Disconnected from server.', 'error');
  }
});

socket.on('reconnect', function(attemptNumber) {
  console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
  showToast('Reconnected!', 'success');
});

socket.on('reconnect_attempt', function() {
  showToast('Reconnecting...', 'warning');
});

socket.on('reconnect_failed', function() {
  showToast('Could not reconnect. Please refresh the page.', 'error');
});

function connectSocket() {
  socket.auth.token = getToken();
  socket.connect();
}

function disconnectSocket() {
  socket.disconnect();
}
