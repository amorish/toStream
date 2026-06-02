document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (password !== confirmPassword) {
        return showToast('Passwords do not match', 'error');
      }

      btn.disabled = true;
      btn.textContent = 'Signing up...';

      try {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, confirmPassword })
        });

        if (data && data.success) {
          setToken(data.token);
          setUser(data.user);
          window.location.href = '/dashboard.html';
        } else if (data) {
          let msg = data.message;
          if (data.errors && data.errors.length > 0) msg = data.errors[0].message;
          showToast(msg || 'Registration failed', 'error');
        }
      } catch (err) {
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign Up';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      btn.disabled = true;
      btn.textContent = 'Logging in...';

      try {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        if (data && data.success) {
          setToken(data.token);
          setUser(data.user);
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          window.location.href = redirect ? decodeURIComponent(redirect) : '/dashboard.html';
        } else if (data) {
          let msg = data.message;
          if (data.errors && data.errors.length > 0) msg = data.errors[0].message;
          showToast(msg || 'Login failed', 'error');
        }
      } catch (err) {
      } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  }
});
