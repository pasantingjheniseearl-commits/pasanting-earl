// ============================================================
// AUTHENTICATION & LOGIN HANDLER
// ============================================================

// Demo user database (in production, use backend authentication)
const demoUsers = {
  'admin@stock.com': { password: 'admin123', name: 'Admin User' },
  'user@stock.com': { password: 'user123', name: 'Regular User' }
};

// Check if user is logged in
function checkAuth() {
  const user = sessionStorage.getItem('currentUser');
  if (!user && window.location.pathname.includes('index.html')) {
    window.location.href = 'login.html';
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const loginSuccess = document.getElementById('login-success');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  // Clear previous messages
  loginError.style.display = 'none';
  loginSuccess.style.display = 'none';
  emailError.style.display = 'none';
  passwordError.style.display = 'none';
  emailError.textContent = '';
  passwordError.textContent = '';

  // Validation
  if (!email) {
    emailError.textContent = 'Email is required';
    emailError.style.display = 'block';
    return;
  }

  if (!password) {
    passwordError.textContent = 'Password is required';
    passwordError.style.display = 'block';
    return;
  }

  // Simulate login process
  loginBtn.classList.add('loading');
  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  // Simulate network delay
  setTimeout(() => {
    // Check credentials
    if (demoUsers[email] && demoUsers[email].password === password) {
      // Successful login
      loginSuccess.textContent = 'Login successful! Redirecting...';
      loginSuccess.style.display = 'block';

      // Store user session
      sessionStorage.setItem('currentUser', JSON.stringify({
        email: email,
        name: demoUsers[email].name,
        loginTime: new Date().toISOString()
      }));

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      // Failed login
      loginError.textContent = 'Invalid email or password. Try admin@stock.com / admin123';
      loginError.style.display = 'block';

      // Reset button
      loginBtn.classList.remove('loading');
      loginBtn.textContent = 'Log In';
      loginBtn.disabled = false;

      // Clear password field
      document.getElementById('password').value = '';
    }
  }, 800);
}

// Handle logout
function logout() {
  if (confirm('Are you sure you want to log out?')) {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

// Get current logged-in user
function getCurrentUser() {
  const user = sessionStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Display current user info
function displayUserInfo() {
  const user = getCurrentUser();
  if (user) {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      userDisplay.textContent = `Welcome, ${user.name}!`;
    }
  }
}

// ============================================================
// STOCK MANAGEMENT
// ============================================================

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  displayUserInfo();
});

// Toggle dark mode
function toggleMode() {
  const isDark = document.body.classList.toggle('dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerText = isDark ? '☀️ Mode' : '🌙 Mode';
    btn.className = isDark ? 'btn btn-outline-light btn-sm me-2' : 'btn btn-outline-dark btn-sm me-2';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}

// Process stock withdrawal/addition
function processStock(type) {
  const prefix = type === 'add' ? 'a-' : 'w-';
  const sku = document.getElementById(prefix + 'sku').value.trim();
  const qty = document.getElementById(prefix + 'qty').value;
  const desc = document.getElementById(prefix + 'desc').value.trim();

  if (!sku) {
    alert('SKU is required.');
    return;
  }

  if (!qty || qty <= 0) {
    alert('Quantity must be greater than 0.');
    return;
  }

  const tbody = document.getElementById('history-log');
  if (!tbody) return;

  const row = document.createElement('tr');
  const changeClass = type === 'add' ? 'text-success' : 'text-danger';
  const symbol = type === 'add' ? '+' : '-';
  const action = type === 'add' ? 'Added' : 'Withdrawn';
  const user = getCurrentUser();
  const username = user ? user.name : 'Unknown';

  row.innerHTML = `
    <td><strong>${sku}</strong><br><small class="text-muted">${desc || 'No remarks'}</small></td>
    <td class="${changeClass}"><strong>${symbol}${qty}</strong></td>
    <td>${new Date().toLocaleDateString()}</td>
    <td><small>${username}</small></td>
  `;
  tbody.prepend(row);

  // Log to localStorage
  const logs = JSON.parse(localStorage.getItem('stock-logs') || '[]');
  logs.push({
    type: action,
    sku: sku,
    quantity: qty,
    description: desc,
    user: username,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('stock-logs', JSON.stringify(logs));

  // Clear form fields
  document.getElementById(prefix + 'sku').value = '';
  document.getElementById(prefix + 'qty').value = '';
  document.getElementById(prefix + 'desc').value = '';

  // Show success message
  alert(`Stock ${action.toLowerCase()} successfully!\nSKU: ${sku}\nQty: ${qty}`);
}

// Load previous theme
window.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
  }
});