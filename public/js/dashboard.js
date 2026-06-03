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
    const description = document.getElementById('room-description') ? document.getElementById('room-description').value : '';
    const mode = document.getElementById('room-mode').value;
    const password = document.getElementById('room-password').value;

    btn.disabled = true;
    btn.textContent = 'Creating...';

    const data = await apiFetch('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify({ name, mode, password, description })
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

  const urlParams = new URLSearchParams(window.location.search);
  const joinParam = urlParams.get('join');
  if (joinParam) {
    // Remove it from the URL so it doesn't trigger again on refresh
    window.history.replaceState({}, document.title, '/dashboard.html');
    await attemptJoin(joinParam);
  }
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
          ${room.description ? `<p class="text-sm text-on-surface-variant my-2">${escapeHtml(room.description)}</p>` : ''}
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

window.openCreateModal = function() {
  document.getElementById('create-modal').style.display = 'flex';
  const code = generateRoomCode();
  document.getElementById('room-password').value = code;
  
  const charsContainer = document.getElementById('room-code-chars');
  if (charsContainer) {
    charsContainer.innerHTML = '';
    for (let char of code) {
      const span = document.createElement('span');
      span.className = 'w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl neo-extruded font-mono font-bold text-xl md:text-2xl text-primary shadow-inner';
      span.textContent = char;
      charsContainer.appendChild(span);
    }
  }
};

window.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

window.copyRoomCode = function() {
  const code = document.getElementById('room-password').value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Room Code copied!', 'success');
    });
  } else {
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Room Code copied!', 'success');
  }
};

window.openSettingsModal = async function() {
  document.getElementById('settings-modal').style.display = 'flex';
  try {
    const data = await apiFetch('/api/auth/settings');
    if (data && data.success && data.settings) {
      document.getElementById('setting-auto-delete').checked = data.settings.autoDeleteHistory;
      document.getElementById('setting-max-history').value = data.settings.maxHistoryLength;
      document.getElementById('max-history-val').textContent = data.settings.maxHistoryLength;
      
      const maxHistoryContainer = document.getElementById('max-history-container');
      if (data.settings.autoDeleteHistory) {
        maxHistoryContainer.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        maxHistoryContainer.classList.add('opacity-50', 'pointer-events-none');
      }
    }
  } catch (err) {
    showToast('Failed to load settings', 'error');
  }
};

document.getElementById('setting-auto-delete').addEventListener('change', function(e) {
  const maxHistoryContainer = document.getElementById('max-history-container');
  if (e.target.checked) {
    maxHistoryContainer.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    maxHistoryContainer.classList.add('opacity-50', 'pointer-events-none');
  }
});

document.getElementById('setting-max-history').addEventListener('input', function(e) {
  document.getElementById('max-history-val').textContent = e.target.value;
});

document.getElementById('settings-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('save-settings-btn');
  const autoDeleteHistory = document.getElementById('setting-auto-delete').checked;
  const maxHistoryLength = parseInt(document.getElementById('setting-max-history').value, 10);
  
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  const data = await apiFetch('/api/auth/settings', {
    method: 'PUT',
    body: JSON.stringify({ autoDeleteHistory, maxHistoryLength })
  });
  
  btn.disabled = false;
  btn.textContent = 'Save Settings';
  
  if (data && data.success) {
    showToast('Settings saved successfully', 'success');
    document.getElementById('settings-modal').style.display = 'none';
  } else {
    showToast(data?.message || 'Failed to save settings', 'error');
  }
});

window.deleteAccount = async function() {
  if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
    try {
      const data = await apiFetch('/api/auth/delete', { method: 'DELETE' });
      if (data && data.success) {
        removeToken();
        window.location.href = '/index.html';
      } else {
        showToast(data?.message || 'Failed to delete account', 'error');
      }
    } catch (err) {
      showToast('Error deleting account', 'error');
    }
  }
};

// Custom Select Dropdown Logic
document.addEventListener('DOMContentLoaded', () => {
  const selectTrigger = document.getElementById('custom-select-trigger');
  const selectDropdown = document.getElementById('custom-select-dropdown');
  const selectArrow = document.getElementById('custom-select-arrow');
  const selectText = document.getElementById('custom-select-text');
  const hiddenInput = document.getElementById('room-mode');
  const options = document.querySelectorAll('.custom-option');

  if (selectTrigger) {
    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = selectDropdown.classList.contains('hidden');
      if (isHidden) {
        selectDropdown.classList.remove('hidden');
        // trigger animation slightly after display block
        setTimeout(() => {
          selectDropdown.classList.remove('opacity-0', 'scale-95');
          selectDropdown.classList.add('opacity-100', 'scale-100');
        }, 10);
        selectArrow.style.transform = 'rotate(180deg)';
      } else {
        closeCustomSelect();
      }
    });
  }

  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const value = option.getAttribute('data-value');
      const text = option.innerText.trim();
      
      hiddenInput.value = value;
      selectText.textContent = text;
      
      // Update styling
      options.forEach(opt => {
        opt.classList.remove('text-primary', 'font-bold', 'bg-white/5');
        opt.classList.add('text-on-surface-variant');
      });
      option.classList.remove('text-on-surface-variant');
      option.classList.add('text-primary', 'font-bold', 'bg-white/5');
      
      closeCustomSelect();
    });
  });

  function closeCustomSelect() {
    if (selectDropdown && !selectDropdown.classList.contains('hidden')) {
      selectDropdown.classList.remove('opacity-100', 'scale-100');
      selectDropdown.classList.add('opacity-0', 'scale-95');
      selectArrow.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        selectDropdown.classList.add('hidden');
      }, 200);
    }
  }

  document.addEventListener('click', (e) => {
    if (selectTrigger && !selectTrigger.contains(e.target) && !selectDropdown.contains(e.target)) {
      closeCustomSelect();
    }
  });
});
