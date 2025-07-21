// Import all component scripts
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initializeTasksComponent();
  initializeSuggestedTaskComponent();
  initializeTaskCreationForm();
  initializeMoodSelector();
  initializeLoginForm();
  
  // Set up UI interactions
  setupUIInteractions();
  
  // Check if user is logged in and update UI
  updateUserUI();
});

// Set up UI interactions for buttons and components
function setupUIInteractions() {
  const addTaskBtn = document.querySelector('.task-controls .btn');
  const profileBtn = document.querySelector('.icon-btn:nth-child(3)');
  const moodBtn = document.querySelector('.mood-btn');
  
  // Add Task button opens task creation form
  addTaskBtn.addEventListener('click', () => {
    showDialog('task-creation-dialog');
  });
  
  // Profile button opens login/edit profile form
  profileBtn.addEventListener('click', () => {
    const user = getUserFromLocalStorage();
    if (user) {
      // User exists, show edit profile form
      showEditProfileForm(user);
    } else {
      // No user, show login form
      showDialog('login-dialog');
    }
  });
  
  // Mood button opens mood selector
  moodBtn.addEventListener('click', () => {
    showDialog('mood-dialog');
  });
  
  // Close dialog when clicking outside content
  document.querySelectorAll('.dialog-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
}

// Show a dialog by ID
function showDialog(dialogId) {
  document.getElementById(dialogId).style.display = 'flex';
}

// Hide a dialog by ID
function hideDialog(dialogId) {
  document.getElementById(dialogId).style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
  
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  document.body.appendChild(toast);
  toast.style.display = 'block';
  
  // Auto hide after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Get user from localStorage
function getUserFromLocalStorage() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Update UI based on user login status
function updateUserUI() {
  const user = getUserFromLocalStorage();
  const welcomeText = document.querySelector('.user-info h3');
  const emailText = document.querySelector('.user-info p');
  
  if (user) {
    welcomeText.textContent = `Welcome, ${user.name}`;
    emailText.textContent = user.email;
  } else {
    welcomeText.textContent = 'Welcome, Guest';
    emailText.textContent = '';
  }
}