document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (user) {
    document.getElementById('welcome-text').textContent = `Hello, ${user.username}`;
  }

  document.getElementById('logout-btn').addEventListener('click', async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch(e) {}
    removeToken();
    window.location.href = '/index.html';
  });

  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('create-btn');
    const name = document.getElementById('room-name').value;
    const mode = document.getElementById('room-mode').value;
    const password = document.getElementById('room-password').value;

    btn.disabled = true;
    btn.textContent = 'Creating...';

    const data = await apiFetch('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify({ name, mode, password })
    });

    btn.disabled = false;
    btn.textContent = 'Create & Join';

    if (data && data.success) {
      window.location.href = `/room.html?id=${data.room.roomId}`;
    } else if (data) {
      showToast(data.message || 'Failed to create room', 'error');
    }
  });

  document.getElementById('join-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = document.getElementById('join-room-id').value;
    const password = document.getElementById('join-password').value;
    await attemptJoin(roomId, password);
  });

  await loadHistory();
});

async function loadHistory() {
  const list = document.getElementById('rooms-list');
  const data = await apiFetch('/api/rooms/history');
  
  if (data && data.success) {
    if (data.rooms.length === 0) {
      list.innerHTML = '<p class="text-muted">No rooms yet. Create one!</p>';
      return;
    }

    list.innerHTML = data.rooms.map(room => `
      <div class="room-card ${room.isExpired || !room.isActive ? 'expired' : ''}">
        <div class="room-info">
          <h4>${escapeHtml(room.name || 'Unnamed Room')}</h4>
          <span class="room-id">ID: ${room.roomId}</span>
          <span class="room-date">${formatDate(room.createdAt)}</span>
        </div>
        <div class="room-actions">
          ${room.isExpired || !room.isActive 
            ? '<span class="badge badge-expired">Expired</span>' 
            : `<button class="btn btn-outline btn-small" onclick="attemptJoin('${room.roomId}')">Join</button>`
          }
        </div>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<p class="text-error">Failed to load history</p>';
  }
}

async function attemptJoin(roomId, password = '') {
  const data = await apiFetch('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ roomId, password })
  });

  if (data && data.success) {
    window.location.href = `/room.html?id=${data.room.roomId}`;
  } else if (data) {
    if (data.message.includes('requires a password') || data.message.includes('Incorrect room password')) {
      document.getElementById('join-room-id').value = roomId;
      document.getElementById('join-modal').style.display = 'flex';
      if (password) showToast('Incorrect password', 'error');
    } else {
      showToast(data.message || 'Cannot join room', 'error');
    }
  }
}

window.onclick = function(event) {
  if (event.target.className === 'modal') {
    event.target.style.display = 'none';
  }
}
