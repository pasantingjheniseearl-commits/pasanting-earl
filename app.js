// ============================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL770lpgNi7ToyeMyX5sDvHJ0htociqwo",
  authDomain: "earlyang-c019a.firebaseapp.com",
  databaseURL: "https://earlyang-c019a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "earlyang-c019a",
  storageBucket: "earlyang-c019a.firebasestorage.app",
  messagingSenderId: "1037271423078",
  appId: "1:1037271423078:web:1ba8571f859151f6b7b5a7",
  measurementId: "G-VNQBBV3F75"
};

// Initialize Firebase
let app, auth, database, analytics;
function initializeFirebase(config) {
  try {
    app = firebase.initializeApp(config);
    auth = firebase.auth();
    database = firebase.database();

    // Initialize analytics (optional)
    if (typeof firebase.analytics !== 'undefined') {
      analytics = firebase.analytics();
    }

    console.log('✓ Firebase initialized successfully');
    console.log('✓ Project:', config.projectId);
    console.log('✓ Auth enabled');
    console.log('✓ Database:', config.databaseURL ? 'Realtime DB' : 'Not configured');
    return true;
  } catch (error) {
    console.warn('Firebase initialization error:', error.message);
    return false;
  }
}

// Auto-initialize Firebase with config
initializeFirebase(firebaseConfig);

// ============================================================
// DEMO USER DATABASE (fallback mode)
// ============================================================

const demoUsers = {
  'admin@stock.com': { password: 'admin123', name: 'Admin User' },
  'user@stock.com': { password: 'user123', name: 'Regular User' }
};

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

// Check if user is logged in
function checkAuth() {
  const user = sessionStorage.getItem('currentUser');
  if (!user && window.location.pathname.includes('index.html')) {
    window.location.href = 'login.html';
  }
}

// Firebase authentication
async function firebaseLogin(email, password) {
  if (!auth) throw new Error('Firebase not initialized');

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return {
      email: userCredential.user.email,
      name: userCredential.user.displayName || 'User',
      uid: userCredential.user.uid,
      isFirebase: true
    };
  } catch (error) {
    throw error;
  }
}

// Demo mode authentication
function demoLogin(email, password) {
  if (demoUsers[email] && demoUsers[email].password === password) {
    return {
      email: email,
      name: demoUsers[email].name,
      isDemo: true
    };
  }
  return null;
}

// Main login handler
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value.trim() || '';
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const loginSuccess = document.getElementById('login-success');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  console.log('🔐 Login attempt:', email);

  // Clear messages
  [loginError, loginSuccess, emailError, passwordError].forEach(el => {
    if (el) {
      el.style.display = 'none';
      el.textContent = '';
    }
  });

  // Validate inputs
  if (!email) {
    if (emailError) {
      emailError.textContent = 'Email is required';
      emailError.style.display = 'block';
    }
    return;
  }

  if (!password) {
    if (passwordError) {
      passwordError.textContent = 'Password is required';
      passwordError.style.display = 'block';
    }
    return;
  }

  // Show loading state
  if (loginBtn) {
    loginBtn.classList.add('loading');
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
  }

  // Try demo mode first (most reliable)
  console.log('📋 Checking demo credentials...');
  const demoUser = demoLogin(email, password);

  if (demoUser) {
    console.log('✓ Demo login successful');
    completeLogin(demoUser, loginSuccess, loginBtn, '(Demo Mode)');
    return;
  }

  // Try Firebase if available
  if (typeof firebase !== 'undefined' && auth) {
    console.log('🔥 Attempting Firebase login...');
    firebaseLogin(email, password)
      .then(user => {
        console.log('✓ Firebase login successful');
        completeLogin(user, loginSuccess, loginBtn);
      })
      .catch(error => {
        console.warn('✗ Firebase login failed:', error.message);
        if (loginError) {
          loginError.textContent = 'Invalid email or password. Try admin@stock.com / admin123 (Demo Mode)';
          loginError.style.display = 'block';
        }

        if (loginBtn) {
          loginBtn.classList.remove('loading');
          loginBtn.textContent = 'Log In';
          loginBtn.disabled = false;
        }

        const passwordField = document.getElementById('password');
        if (passwordField) passwordField.value = '';
      });
  } else {
    // Firebase not available
    console.log('ℹ Firebase not available, demo mode is active');
    if (loginError) {
      loginError.textContent = 'Invalid email or password. Try admin@stock.com / admin123';
      loginError.style.display = 'block';
    }

    if (loginBtn) {
      loginBtn.classList.remove('loading');
      loginBtn.textContent = 'Log In';
      loginBtn.disabled = false;
    }
  }
}

// Helper: Attempt demo login
function attemptDemoLogin(email, password, loginError, loginSuccess, loginBtn) {
  const user = demoLogin(email, password);

  if (user) {
    completeLogin(user, loginSuccess, loginBtn, '(Demo Mode)');
  } else {
    if (loginError) {
      loginError.textContent = 'Invalid email or password. Try admin@stock.com / admin123';
      loginError.style.display = 'block';
    }

    if (loginBtn) {
      loginBtn.classList.remove('loading');
      loginBtn.textContent = 'Log In';
      loginBtn.disabled = false;
    }

    const passwordField = document.getElementById('password');
    if (passwordField) passwordField.value = '';
  }
}

// Helper: Complete login process
function completeLogin(user, loginSuccess, loginBtn, mode = '') {
  if (loginSuccess) {
    loginSuccess.textContent = `Login successful! ${mode} Redirecting...`;
    loginSuccess.style.display = 'block';
  }

  // Store session
  sessionStorage.setItem('currentUser', JSON.stringify({
    email: user.email,
    name: user.name,
    uid: user.uid || null,
    isFirebase: user.isFirebase || false,
    isDemo: user.isDemo || false,
    loginTime: new Date().toISOString()
  }));

  // Redirect after short delay
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Logout function
function logout() {
  showConfirm('Are you sure you want to log out?').then(confirmed => {
    if (!confirmed) return;

    sessionStorage.removeItem('currentUser');

    // Firebase logout if initialized
    if (typeof firebase !== 'undefined' && auth) {
      auth.signOut().catch(err => console.warn('Logout error:', err));
    }

    window.location.href = 'login.html';
  });
}

// Get current user
function getCurrentUser() {
  const user = sessionStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Display user info in navbar
function displayUserInfo() {
  const user = getCurrentUser();
  if (user) {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      userDisplay.textContent = `Welcome, ${user.name}!`;
    }

    // Show admin panel for admin users
    if (user.name === 'Admin User') {
      const adminPanel = document.getElementById('admin-panel');
      if (adminPanel) {
        adminPanel.style.display = 'block';
      }
      console.log('⚙️ Admin panel enabled for:', user.name);
    }

    // Show welcome transition
    showWelcomeTransition(user.name);
  }
}

// Show welcome transition animation
function showWelcomeTransition(userName) {
  const overlay = document.getElementById('welcome-overlay');
  const usernameDisplay = document.getElementById('welcome-username');

  if (overlay && usernameDisplay) {
    // Set username
    usernameDisplay.textContent = userName;

    // Show overlay
    overlay.style.display = 'flex';
    console.log('👋 Welcome transition shown for:', userName);

    // Auto-close after 4 seconds
    setTimeout(() => {
      closeWelcomeOverlay();
    }, 4000);
  }
}

// Close welcome overlay with fade animation
function closeWelcomeOverlay() {
  const overlay = document.getElementById('welcome-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOutOverlay 0.5s ease-out forwards';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.animation = 'fadeInOverlay 0.3s ease-out';
    }, 500);
    console.log('✓ Welcome transition closed');
  }
}

// ============================================================
// BARCODE SCANNER FUNCTIONALITY
// ============================================================

// Barcode scanner configuration
const barcodeConfig = {
  enabled: false,
  inputBuffer: '',
  timeout: null,
  timeoutDelay: 100, // 100ms - adjust based on scanner speed
  prefix: null // Will be set to 'a-' or 'w-' based on active form
};

// Toggle barcode scanner mode
function toggleBarcodeMode(type) {
  const btn = document.getElementById(`${type}-barcode-btn`);
  const statusSpan = document.getElementById(`${type}-scanner-status`);

  barcodeConfig.enabled = !barcodeConfig.enabled;
  barcodeConfig.prefix = type === 'add' ? 'a-' : 'w-';
  barcodeConfig.inputBuffer = '';

  if (barcodeConfig.enabled) {
    btn?.classList.add('active');
    if (statusSpan) {
      statusSpan.textContent = '⚡ Scanner Active - Ready to scan';
      statusSpan.style.color = '#38ef7d';
    }
    console.log(`✓ Barcode scanner active for ${type} form`);

    // Focus on the hidden scanner input
    const scanInput = document.getElementById(`${type}-scanner-input`);
    if (scanInput) scanInput.focus();
  } else {
    btn?.classList.remove('active');
    if (statusSpan) {
      statusSpan.textContent = '○ Scanner Inactive';
      statusSpan.style.color = '#666';
    }
    console.log('✓ Barcode scanner disabled');
  }
}

// Handle barcode scanner input
function handleBarcodeInput(event) {
  if (!barcodeConfig.enabled) return;

  const char = event.key;
  const input = event.target;

  // Ignore non-character events
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  // Prevent default behavior for scanner input
  event.preventDefault();

  // Store input temporarily
  barcodeConfig.inputBuffer += char;

  // Clear previous timeout
  clearTimeout(barcodeConfig.timeout);

  // Wait for scanner to finish (usually ends with Enter key)
  barcodeConfig.timeout = setTimeout(() => {
    if (barcodeConfig.inputBuffer.trim()) {
      const barcode = barcodeConfig.inputBuffer.trim();

      // Set the SKU field
      const skuField = document.getElementById(barcodeConfig.prefix + 'sku');
      if (skuField) {
        skuField.value = barcode;
        skuField.focus();

        // Show visual feedback
        skuField.classList.add('input-scanned');
        setTimeout(() => skuField.classList.remove('input-scanned'), 500);

        console.log(`✓ Barcode scanned: ${barcode}`);

        // Move focus to quantity field
        const qtyField = document.getElementById(barcodeConfig.prefix + 'qty');
        if (qtyField) {
          qtyField.focus();
        }
      }
    }

    // Reset buffer
    barcodeConfig.inputBuffer = '';
  }, barcodeConfig.timeoutDelay);
}

// Process barcode directly (alternative method)
function processBarcodeInput(type, barcode) {
  const prefix = type === 'add' ? 'a-' : 'w-';
  const skuField = document.getElementById(prefix + 'sku');

  if (skuField) {
    skuField.value = barcode.trim();
    skuField.classList.add('input-scanned');
    setTimeout(() => skuField.classList.remove('input-scanned'), 500);
  }
}

// ============================================================
// SECURITY & DATA PROTECTION
// ============================================================

// Sanitize user input to prevent XSS attacks
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validate and sanitize transaction data
function validateTransactionData(sku, qty, description) {
  const errors = [];

  // SKU validation (alphanumeric, length 1-50, no special chars except hyphen/underscore)
  if (!sku || sku.length === 0) {
    errors.push('SKU is required');
  } else if (sku.length > 50) {
    errors.push('SKU must be 50 characters or less');
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(sku)) {
    errors.push('SKU can only contain alphanumeric characters, hyphens, and underscores');
  }

  // Quantity validation (positive integer)
  if (!qty || isNaN(qty)) {
    errors.push('Quantity must be a valid number');
  } else if (parseInt(qty) <= 0) {
    errors.push('Quantity must be greater than 0');
  } else if (parseInt(qty) > 999999) {
    errors.push('Quantity cannot exceed 999,999');
  }

  // Description validation (optional, max 200 chars)
  if (description && description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Secure data clearance with admin confirmation
function secureDataClearance() {
  const user = getCurrentUser();

  // Only allow admin to clear data
  if (!user || user.name !== 'Admin User') {
    showToast('Only administrators can clear transaction history', 'error');
    console.warn('⛔ Unauthorized access to data clearance attempted');
    return false;
  }

  // Double confirmation
  const confirmed1 = confirm('⚠️ WARNING: This will delete ALL transaction history permanently!\n\nAre you sure you want to continue? (Click OK to proceed)');
  if (!confirmed1) return false;

  const adminPassword = prompt('🔐 Enter admin password to confirm deletion:');
  if (!adminPassword) return false;

  // Verify admin password (demo: admin123)
  if (adminPassword !== 'admin123') {
    showToast('Incorrect password. Data clearance cancelled.', 'error');
    console.warn('⛔ Failed password verification for data clearance');
    return false;
  }

  const confirmed2 = confirm('⚠️ FINAL WARNING: This action CANNOT be undone!\n\nAll ${logs.length} transactions will be permanently deleted.\n\nType "DELETE" in the next prompt to confirm.');
  if (!confirmed2) return false;

  const finalConfirm = prompt('Type DELETE to confirm complete data removal:');
  if (finalConfirm !== 'DELETE') {
    showToast('Data clearance cancelled - confirmation text did not match.', 'info');
    return false;
  }

  return true;
}

// Clear all transaction data
function clearAllTransactions() {
  if (!secureDataClearance()) {
    return;
  }

  try {
    // Get count before deletion
    const logs = JSON.parse(localStorage.getItem('stock-logs') || '[]');
    const count = logs.length;

    // Clear localStorage
    localStorage.removeItem('stock-logs');

    // Clear the table UI
    const tbody = document.getElementById('history-log');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No transaction history</td></tr>';
    }

    // Log the deletion action
    logAuditEvent('DATA_CLEARANCE', `Deleted ${count} transactions`, true);

    console.log(`🗑️ ALL DATA CLEARED: ${count} transactions deleted`);
    showToast(`Successfully deleted ${count} transaction records.`, 'success');

    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    logAuditEvent('DATA_CLEARANCE_FAILED', error.message, false);
    showToast('Error clearing data: ' + error.message, 'error');
    return false;
  }
}

// Reset all data to zero (wipe everything)
function resetToZero() {
  if (!secureDataClearance()) {
    return;
  }

  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Refresh page
    console.log('🔄 COMPLETE SYSTEM RESET');
    logAuditEvent('SYSTEM_RESET', 'Complete system reset to zero', true);

    showToast('System has been reset to zero. Redirecting to login page...', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    console.error('❌ Error during reset:', error);
    showToast('Error during system reset: ' + error.message, 'error');
  }
}

// Audit logging for security events
function logAuditEvent(eventType, details, success = true) {
  const auditLog = JSON.parse(localStorage.getItem('audit-log') || '[]');
  const user = getCurrentUser();

  const auditEntry = {
    timestamp: new Date().toISOString(),
    eventType: eventType,
    details: details,
    user: user ? user.name : 'Unknown',
    email: user ? user.email : 'unknown',
    success: success,
    ipAddress: 'N/A' // Would need server for real IP
  };

  auditLog.push(auditEntry);

  // Keep only last 1000 audit logs
  if (auditLog.length > 1000) {
    auditLog.shift();
  }

  localStorage.setItem('audit-log', JSON.stringify(auditLog));

  console.log(`📋 [${eventType}] ${details} - ${success ? '✓' : '✗'}`);
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<strong>${message}</strong>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(4px)';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

function showConfirm(message) {
  return new Promise(resolve => {
    const wrapper = document.getElementById('custom-modal-wrapper');
    if (!wrapper) {
      console.warn('Modal wrapper not found');
      resolve(window.confirm(message));
      return;
    }

    wrapper.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="custom-modal" role="dialog" aria-modal="true" aria-label="Confirmation">
        <div class="modal-hero">${message}</div>
        <div class="modal-actions">
          <button class="btn btn-outline-light btn-sm" id="cancel-action">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirm-action">Confirm</button>
        </div>
      </div>
    `;

    const cleanup = (result) => {
      wrapper.innerHTML = '';
      resolve(result);
    };

    wrapper.querySelector('#cancel-action')?.addEventListener('click', () => cleanup(false));
    wrapper.querySelector('#confirm-action')?.addEventListener('click', () => cleanup(true));
    wrapper.querySelector('.modal-backdrop')?.addEventListener('click', () => cleanup(false));
  });
}

function showPrompt(message, defaultValue = '') {
  return new Promise(resolve => {
    const wrapper = document.getElementById('custom-modal-wrapper');
    if (!wrapper) {
      resolve(window.prompt(message, defaultValue));
      return;
    }

    wrapper.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="custom-modal" role="dialog" aria-modal="true" aria-label="Prompt">
        <div class="modal-hero">${message}</div>
        <input id="prompt-input" class="form-control" value="${defaultValue}">
        <div class="modal-actions">
          <button class="btn btn-outline-light btn-sm" id="cancel-action">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirm-action">Submit</button>
        </div>
      </div>
    `;

    const cleanup = (value) => {
      wrapper.innerHTML = '';
      resolve(value);
    };

    wrapper.querySelector('#cancel-action')?.addEventListener('click', () => cleanup(null));
    wrapper.querySelector('#confirm-action')?.addEventListener('click', () => {
      const value = wrapper.querySelector('#prompt-input')?.value;
      cleanup(value ?? null);
    });
    wrapper.querySelector('.modal-backdrop')?.addEventListener('click', () => cleanup(null));
  });
}

// View audit log (admin only)
function viewAuditLog() {
  const user = getCurrentUser();

  if (!user || user.name !== 'Admin User') {
    showToast('Only administrators can view the audit log', 'error');
    return;
  }

  const auditLog = JSON.parse(localStorage.getItem('audit-log') || '[]');

  if (auditLog.length === 0) {
    showToast('Audit log is empty, no security events recorded yet', 'info');
    return;
  }

  // Format audit log for display
  let logText = '📋 SECURITY AUDIT LOG\n';
  logText += '═'.repeat(60) + '\n\n';

  auditLog.slice(-20).reverse().forEach((entry, idx) => {
    logText += `${idx + 1}. [${entry.eventType}]\n`;
    logText += `   Time: ${new Date(entry.timestamp).toLocaleString()}\n`;
    logText += `   User: ${entry.user} (${entry.email})\n`;
    logText += `   Details: ${entry.details}\n`;
    logText += `   Status: ${entry.success ? '✓ Success' : '✗ Failed'}\n\n`;
  });

  // Show in a way that works in browser
  console.log(logText);

  // Create a simple alert or text area window
  const preview = window.open('', 'Audit Log', 'width=800,height=600');
  preview.document.write('<pre style="font-family: monospace; white-space: pre-wrap;">' +
    logText +
    '\n\nTotal Events: ' + auditLog.length +
    '</pre>');
  preview.document.close();
}

// Toggle dark mode
function toggleMode() {
  const isDark = document.body.classList.toggle('dark');
  const btn = document.getElementById('theme-toggle');

  if (btn) {
    btn.innerHTML = isDark ? '<i data-feather="sun"></i>' : '<i data-feather="moon"></i>';
    btn.className = isDark ? 'btn btn-outline-light btn-sm me-2 btn-icon' : 'btn btn-outline-dark btn-sm me-2 btn-icon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    feather.replace();
  }
}

// Process stock transactions
function processStock(type) {
  const prefix = type === 'add' ? 'a-' : 'w-';
  const sku = document.getElementById(prefix + 'sku')?.value.trim() || '';
  const qty = document.getElementById(prefix + 'qty')?.value || '';
  const desc = document.getElementById(prefix + 'desc')?.value.trim() || '';

  // Validate input data
  const validation = validateTransactionData(sku, qty, desc);
  if (!validation.isValid) {
    showToast('Input validation failed: ' + validation.errors.join(', '), 'error');
    console.warn('Input validation failed:', validation.errors);
    return;
  }

  // Sanitize inputs to prevent XSS
  const sanitizedSku = sanitizeInput(sku);
  const sanitizedDesc = sanitizeInput(desc);
  const sanitizedQty = parseInt(qty);

  // Get user info
  const user = getCurrentUser();
  const username = user ? user.name : 'Unknown';

  // Update UI
  updateTransactionHistory(sanitizedSku, sanitizedQty, sanitizedDesc, type, username);

  // Log transaction
  logTransaction({
    type: type === 'add' ? 'Added' : 'Withdrawn',
    sku: sanitizedSku,
    quantity: sanitizedQty,
    description: sanitizedDesc,
    user: username,
    timestamp: new Date().toISOString()
  });

  // Audit log
  logAuditEvent('TRANSACTION_CREATED', `${type === 'add' ? 'Added' : 'Withdrawn'} ${sanitizedQty} units of ${sanitizedSku}`, true);

  // Clear form
  document.getElementById(prefix + 'sku').value = '';
  document.getElementById(prefix + 'qty').value = '';
  document.getElementById(prefix + 'desc').value = '';

  // Success message
  showToast(`Stock ${type === 'add' ? 'added' : 'withdrawn'} successfully! (${sanitizedSku} x${sanitizedQty})`, 'success');
}

// Update transaction history table
function updateTransactionHistory(sku, qty, desc, type, username) {
  const tbody = document.getElementById('history-log');
  if (!tbody) return;

  const row = document.createElement('tr');
  const changeClass = type === 'add' ? 'text-success' : 'text-danger';
  const symbol = type === 'add' ? '+' : '-';

  row.innerHTML = `
    <td><strong>${sku}</strong><br><small class="text-muted">${desc || 'No remarks'}</small></td>
    <td class="${changeClass}"><strong>${symbol}${qty}</strong></td>
    <td>${new Date().toLocaleDateString()}</td>
    <td><small>${username}</small></td>
  `;

  // Make row read-only (add data attribute to prevent editing)
  row.setAttribute('data-readonly', 'true');
  row.style.cursor = 'default';

  tbody.prepend(row);
}

// Load all transactions from localStorage on page load
function loadTransactionHistory() {
  const tbody = document.getElementById('history-log');
  if (!tbody) return;

  // Get saved transactions
  const logs = JSON.parse(localStorage.getItem('stock-logs') || '[]');

  console.log(`📋 Loading ${logs.length} transactions from storage...`);

  tbody.innerHTML = '';

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="4">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6v12"/><path d="M16 6v12"/><path d="M3 18h18"/></svg>
            <div>No transactions yet. Add or withdraw stock to get started.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Add each transaction to the table (newest first)
  logs.reverse().forEach(transaction => {
    const row = document.createElement('tr');
    const changeClass = transaction.type === 'Added' ? 'text-success' : 'text-danger';
    const symbol = transaction.type === 'Added' ? '+' : '-';

    row.innerHTML = `
      <td><strong>${transaction.sku}</strong><br><small class="text-muted">${transaction.description || 'No remarks'}</small></td>
      <td class="${changeClass}"><strong>${symbol}${transaction.quantity}</strong></td>
      <td>${new Date(transaction.timestamp).toLocaleDateString()}</td>
      <td><small>${transaction.user}</small></td>
    `;

    // Mark as immutable (read-only)
    row.setAttribute('data-readonly', 'true');
    row.setAttribute('data-timestamp', transaction.timestamp);
    row.style.cursor = 'default';
    row.style.opacity = '0.9';

    tbody.appendChild(row);
  });

  if (logs.length > 0) {
    console.log(`✓ ${logs.length} transactions restored`);
  }
}

// Prevent editing of transaction records
function protectTransactionHistory() {
  const tbody = document.getElementById('history-log');
  if (!tbody) return;

  // Prevent right-click on transaction rows
  tbody.addEventListener('contextmenu', (e) => {
    if (e.target.closest('tr[data-readonly="true"]')) {
      e.preventDefault();
      console.warn('⛔ Transaction records are read-only');
      showToast('Transaction records cannot be edited', 'info');
    }
  });

  // Prevent double-click editing
  tbody.addEventListener('dblclick', (e) => {
    if (e.target.closest('tr[data-readonly="true"]')) {
      e.preventDefault();
      showToast('Transaction records are permanent and cannot be modified', 'info');
    }
  });
}

// Log transaction to storage and Firebase
function logTransaction(transaction) {
  // Store locally first
  const logs = JSON.parse(localStorage.getItem('stock-logs') || '[]');
  logs.push(transaction);
  localStorage.setItem('stock-logs', JSON.stringify(logs));

  // Sync to Firebase if available and user is authenticated
  if (typeof firebase !== 'undefined' && database && auth?.currentUser) {
    try {
      const user = getCurrentUser();
      const userId = auth.currentUser.uid || 'demo-user';
      const transactionId = new Date().getTime();

      // Save to Firebase Realtime Database
      database.ref(`transactions/${userId}/${transactionId}`).set({
        ...transaction,
        userId: userId,
        email: user?.email || 'unknown',
        syncTime: firebase.database.ServerValue.TIMESTAMP,
        deviceTime: new Date().toISOString()
      }).then(() => {
        console.log('✓ Transaction synced to Firebase');
      }).catch(error => {
        console.warn('Firebase sync failed (using local storage):', error.message);
      });
    } catch (error) {
      console.warn('Error syncing transaction:', error.message);
    }
  } else {
    console.log('ℹ Transaction saved locally (Firebase not available)');
  }
}

// Load saved theme preference
function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
  }
}

// Initialize barcode scanner event listeners
function initializeBarcodeScanner() {
  // Setup for Add form scanner
  const addScannerInput = document.getElementById('a-scanner-input');
  if (addScannerInput) {
    addScannerInput.addEventListener('keydown', handleBarcodeInput);
  }

  // Setup for Withdraw form scanner
  const withdrawScannerInput = document.getElementById('w-scanner-input');
  if (withdrawScannerInput) {
    withdrawScannerInput.addEventListener('keydown', handleBarcodeInput);
  }

  // Setup scanner toggle buttons
  const addBarcodeBtn = document.getElementById('a-barcode-btn');
  if (addBarcodeBtn) {
    addBarcodeBtn.addEventListener('click', () => toggleBarcodeMode('add'));
  }

  const withdrawBarcodeBtn = document.getElementById('w-barcode-btn');
  if (withdrawBarcodeBtn) {
    withdrawBarcodeBtn.addEventListener('click', () => toggleBarcodeMode('withdraw'));
  }

  // Block browser shortcuts when scanner is active
  document.addEventListener('keydown', blockBrowserShortcuts);

  console.log('✓ Barcode scanner initialized');
}

// Block Chrome find popup and other browser shortcuts when scanner is active
function blockBrowserShortcuts(event) {
  if (!barcodeConfig.enabled) return;

  // Prevent Ctrl+F (Find)
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    console.log('🚫 Blocked: Ctrl+F (Find)');
    return false;
  }

  // Prevent Ctrl+H (History)
  if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
    event.preventDefault();
    console.log('🚫 Blocked: Ctrl+H (History)');
    return false;
  }

  // Prevent Ctrl+P (Print)
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault();
    console.log('🚫 Blocked: Ctrl+P (Print)');
    return false;
  }

  // Prevent Ctrl+S (Save)
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    console.log('🚫 Blocked: Ctrl+S (Save)');
    return false;
  }

  // Prevent Ctrl+Shift+I (Dev Tools)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'i') {
    event.preventDefault();
    console.log('🚫 Blocked: Ctrl+Shift+I (Dev Tools)');
    return false;
  }

  // Prevent F3 (Find Next)
  if (event.key === 'F3') {
    event.preventDefault();
    console.log('🚫 Blocked: F3 (Find Next)');
    return false;
  }

  // Prevent Escape key from being processed (can trigger find close in some browsers)
  if (event.key === 'Escape') {
    event.preventDefault();
    console.log('⏸ Blocked: Escape key');
    return false;
  }
}

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) {
    feather.replace();
  }
  loadTheme();
  checkAuth();
  displayUserInfo();
  loadTransactionHistory();     // 🔄 Load saved transactions from localStorage
  protectTransactionHistory();  // 🔒 Prevent editing of transaction records
  initializeBarcodeScanner();
});