document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const activeTab = params.get('tab') === 'register' ? 'register' : 'login';
  switchTab(activeTab);

  document.getElementById('tab-login').onclick = () => switchTab('login');
  document.getElementById('tab-register').onclick = () => switchTab('register');
  document.getElementById('login-form').onsubmit = handleLogin;
  document.getElementById('register-form').onsubmit = handleRegister;
});

function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function showError(formId, msg) {
  const el = document.getElementById(`${formId}-error`);
  el.textContent = msg;
  el.classList.add('show');
}
function clearError(formId) { document.getElementById(`${formId}-error`)?.classList.remove('show'); }

async function handleLogin(e) {
  e.preventDefault();
  clearError('login');
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Signing in...';
  try {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setAuth(data.token, data.user);
    location.href = '/';
  } catch (e) {
    showError('login', e.message);
    btn.disabled = false; btn.textContent = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearError('register');
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  if (password.length < 6) { showError('register', 'Password must be at least 6 characters'); return; }
  const btn = document.getElementById('register-btn');
  btn.disabled = true; btn.textContent = 'Creating account...';
  try {
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    setAuth(data.token, data.user);
    location.href = '/';
  } catch (e) {
    showError('register', e.message);
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}
