function getToken() {
  return localStorage.getItem(TOSTREAM_CONFIG.TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOSTREAM_CONFIG.TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOSTREAM_CONFIG.TOKEN_KEY);
  localStorage.removeItem(TOSTREAM_CONFIG.USER_KEY);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(TOSTREAM_CONFIG.USER_KEY));
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem(TOSTREAM_CONFIG.USER_KEY, JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

function redirectIfNotLoggedIn() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
    return true;
  }
  return false;
}

function redirectIfLoggedIn(to) {
  if (isLoggedIn()) {
    window.location.href = to || '/dashboard.html';
    return true;
  }
  return false;
}

async function apiFetch(endpoint, options = {}) {
  const url = TOSTREAM_CONFIG.SERVER_URL + endpoint;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken(),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login.html';
      return null;
    }
    return await response.json();
  } catch (err) {
    showToast('Cannot connect to server. Check your internet.', 'error');
    throw err;
  }
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = escapeHtml(message);
  container.appendChild(toast);

  if (container.children.length > 3) {
    container.removeChild(container.firstChild);
  }

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 400);
  }, 3500);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

function getRoomIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
