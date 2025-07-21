// Initialize Login Form
function initializeLoginForm() {
  createLoginDialog();
}

// Create the login dialog
function createLoginDialog() {
  // Create dialog if it doesn't exist
  if (!document.getElementById('login-dialog')) {
    const dialog = document.createElement('div');
    dialog.id = 'login-dialog';
    dialog.className = 'dialog-overlay';
    dialog.innerHTML = `
      <div class="dialog-content">
        <form class="login-form" id="login-form">
          <h2>Login</h2>
          <div class="form-group">
            <label for="user-name">Name</label>
            <input type="text" id="user-name" required>
            <div class="error-message" id="name-error"></div>
          </div>
          <div class="form-group">
            <label for="user-email">Email</label>
            <input type="email" id="user-email" required>
            <div class="error-message" id="email-error"></div>
          </div>
          <div class="form-group">
            <label for="user-password">Password</label>
            <input type="password" id="user-password" required>
            <div class="error-message" id="password-error"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" id="login-cancel-btn">Cancel</button>
            <button type="submit" class="login-btn">Login</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Set up event listeners
    document.getElementById('login-cancel-btn').addEventListener('click', () => {
      dialog.style.display = 'none';
      resetLoginForm();
    });
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser();
    });
  }
}

// Create the edit profile dialog
function showEditProfileForm(user) {
  // Create or update edit profile dialog
  let editDialog = document.getElementById('edit-profile-dialog');
  
  if (!editDialog) {
    editDialog = document.createElement('div');
    editDialog.id = 'edit-profile-dialog';
    editDialog.className = 'dialog-overlay';
    editDialog.innerHTML = `
      <div class="dialog-content">
        <form class="login-form" id="edit-profile-form">
          <h2>Edit Profile</h2>
          <div class="form-group">
            <label for="edit-user-name">Name</label>
            <input type="text" id="edit-user-name" required>
            <div class="error-message" id="edit-name-error"></div>
          </div>
          <div class="form-group">
            <label for="edit-user-email">Email</label>
            <input type="email" id="edit-user-email" required>
            <div class="error-message" id="edit-email-error"></div>
          </div>
          <div class="form-group">
            <label for="edit-user-password">Password</label>
            <input type="password" id="edit-user-password" required>
            <div class="error-message" id="edit-password-error"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="logout-btn" id="logout-btn">Logout</button>
            <button type="submit" class="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(editDialog);
    
    // Set up event listeners
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      updateUserProfile();
    });
  }
  
  // Fill form with user data
  document.getElementById('edit-user-name').value = user.name;
  document.getElementById('edit-user-email').value = user.email;
  document.getElementById('edit-user-password').value = user.password;
  
  // Show dialog
  editDialog.style.display = 'flex';
}

// Reset the login form
function resetLoginForm() {
  document.getElementById('login-form').reset();
  document.getElementById('name-error').textContent = '';
  document.getElementById('email-error').textContent = '';
  document.getElementById('password-error').textContent = '';
}

// Login user
function loginUser() {
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  
  // Validate form
  let isValid = true;
  
  if (!name) {
    document.getElementById('name-error').textContent = 'Name is required';
    isValid = false;
  } else {
    document.getElementById('name-error').textContent = '';
  }
  
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email';
    isValid = false;
  } else {
    document.getElementById('email-error').textContent = '';
  }
  
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  } else if (password.length < 6) {
    document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
    isValid = false;
  } else {
    document.getElementById('password-error').textContent = '';
  }
  
  if (!isValid) return;
  
  // Create user object
  const user = {
    name,
    email,
    password
  };
  
  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update UI
  updateUserUI();
  
  // Hide dialog and reset form
  document.getElementById('login-dialog').style.display = 'none';
  resetLoginForm();
  
  // Show success message
  showToast('Login successful');
}

// Update user profile
function updateUserProfile() {
  const name = document.getElementById('edit-user-name').value.trim();
  const email = document.getElementById('edit-user-email').value.trim();
  const password = document.getElementById('edit-user-password').value;
  
  // Validate form
  let isValid = true;
  
  if (!name) {
    document.getElementById('edit-name-error').textContent = 'Name is required';
    isValid = false;
  } else {
    document.getElementById('edit-name-error').textContent = '';
  }
  
  if (!email) {
    document.getElementById('edit-email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(email)) {
    document.getElementById('edit-email-error').textContent = 'Please enter a valid email';
    isValid = false;
  } else {
    document.getElementById('edit-email-error').textContent = '';
  }
  
  if (!password) {
    document.getElementById('edit-password-error').textContent = 'Password is required';
    isValid = false;
  } else if (password.length < 6) {
    document.getElementById('edit-password-error').textContent = 'Password must be at least 6 characters';
    isValid = false;
  } else {
    document.getElementById('edit-password-error').textContent = '';
  }
  
  if (!isValid) return;
  
  // Update user object
  const user = {
    name,
    email,
    password
  };
  
  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Update UI
  updateUserUI();
  
  // Hide dialog
  document.getElementById('edit-profile-dialog').style.display = 'none';
  
  // Show success message
  showToast('Profile updated successfully');
}

// Logout user
function logoutUser() {
  // Remove user from localStorage
  localStorage.removeItem('user');
  
  // Update UI
  updateUserUI();
  
  // Hide edit profile dialog
  document.getElementById('edit-profile-dialog').style.display = 'none';
  
  // Show login dialog
  document.getElementById('login-dialog').style.display = 'flex';
  
  // Show success message
  showToast('Logged out successfully');
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}