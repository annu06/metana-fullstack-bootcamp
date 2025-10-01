// Initialize Tasks Component
function initializeTasksComponent() {
  loadTasks();
  setupTaskControls();
}

// Load tasks from localStorage and display them
function loadTasks() {
  const tasks = getTasksFromLocalStorage();
  const tasksList = document.querySelector('.tasks-list');
  const taskCount = document.querySelector('.tasks-header p');
  
  // Clear existing tasks
  tasksList.innerHTML = '';
  
  // Update task count
  const incompleteTasks = tasks.filter(task => !task.completed);
  taskCount.textContent = `You have ${incompleteTasks.length} tasks planned for today`;
  
  // Display tasks
  if (tasks.length === 0) {
    tasksList.innerHTML = '<p class="no-tasks">No tasks yet. Add a task to get started!</p>';
    return;
  }
  
  tasks.forEach(task => {
    addTaskToDOM(task);
  });
}

// Add a single task to the DOM
function addTaskToDOM(task) {
  const tasksList = document.querySelector('.tasks-list');
  const taskCard = document.createElement('div');
  taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
  taskCard.dataset.id = task.id;
  
  taskCard.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.duration} mins</p>
    <strong>${formatTime(task.dueDate)}</strong>
    <span class="checkmark">${task.completed ? '✓' : '✔'}</span>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;
  
  // Add event listeners
  taskCard.querySelector('.checkmark').addEventListener('click', () => toggleTaskCompletion(task.id));
  taskCard.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent task edit dialog from opening
    deleteTask(task.id);
  });
  taskCard.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card click
    showEditTaskDialog(task);
  });
  // Open edit task dialog when clicking on the task (except on checkmark, delete, or edit button)
  taskCard.addEventListener('click', (e) => {
    if (!e.target.classList.contains('checkmark') && !e.target.classList.contains('delete-btn') && !e.target.classList.contains('edit-btn')) {
      showEditTaskDialog(task);
    }
  });
  
  // Remove no-tasks message if present
  const noTasksMsg = tasksList.querySelector('.no-tasks');
  if (noTasksMsg) noTasksMsg.remove();
  tasksList.appendChild(taskCard);
}

// Set up task control buttons
function setupTaskControls() {
  const completeAllBtn = document.querySelector('.btn.green:nth-child(2)');
  const showCompletedBtn = document.querySelector('.btn.green:nth-child(3)');
  
  completeAllBtn.addEventListener('click', completeAllTasks);
  
  // Toggle between showing all tasks and hiding completed tasks
  let showingCompleted = true;
  showCompletedBtn.addEventListener('click', () => {
    showingCompleted = !showingCompleted;
    showCompletedBtn.textContent = showingCompleted ? 'Hide Completed' : 'Show Completed';
    
    document.querySelectorAll('.task-card.completed').forEach(card => {
      card.style.display = showingCompleted ? 'block' : 'none';
    });
  });
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
  const tasks = getTasksFromLocalStorage();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasksToLocalStorage(tasks);
    
    // Update UI
    const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (tasks[taskIndex].completed) {
      taskCard.classList.add('completed');
      taskCard.querySelector('.checkmark').textContent = '✓';
    } else {
      taskCard.classList.remove('completed');
      taskCard.querySelector('.checkmark').textContent = '✔';
    }
    
    // Update task count
    const incompleteTasks = tasks.filter(task => !task.completed);
    document.querySelector('.tasks-header p').textContent = 
      `You have ${incompleteTasks.length} tasks planned for today`;
  }
}

// Complete all tasks
function completeAllTasks() {
  const tasks = getTasksFromLocalStorage();
  
  // Mark all tasks as completed
  tasks.forEach(task => {
    task.completed = true;
  });
  
  saveTasksToLocalStorage(tasks);
  loadTasks(); // Reload tasks to update UI
  showToast('All tasks marked as completed');
}

// Delete a task
function deleteTask(taskId) {
  const tasks = getTasksFromLocalStorage();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  
  saveTasksToLocalStorage(updatedTasks);
  
  // Remove task from DOM with animation
  const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
  taskCard.style.opacity = '0';
  taskCard.style.transform = 'scale(0.8)';
  
  setTimeout(() => {
    taskCard.remove();
    // Update task count
    const incompleteTasks = updatedTasks.filter(task => !task.completed);
    document.querySelector('.tasks-header p').textContent = 
      `You have ${incompleteTasks.length} tasks planned for today`;
    // Show empty message if no tasks left
    const tasksList = document.querySelector('.tasks-list');
    if (updatedTasks.length === 0) {
      tasksList.innerHTML = '<p class="no-tasks">No tasks yet. Add a task to get started!</p>';
    } else {
      // Remove no-tasks message if present
      const noTasksMsg = tasksList.querySelector('.no-tasks');
      if (noTasksMsg) noTasksMsg.remove();
    }
  }, 300);
  
  showToast('Task deleted successfully');
}

// Show edit task dialog
function showEditTaskDialog(task) {
  // Create dialog if it doesn't exist
  let editDialog = document.getElementById('edit-task-dialog');
  
  if (!editDialog) {
    editDialog = document.createElement('div');
    editDialog.id = 'edit-task-dialog';
    editDialog.className = 'dialog-overlay';
    editDialog.innerHTML = `
      <div class="dialog-content">
        <form class="task-form" id="edit-task-form">
          <h2>Edit Task</h2>
          <div class="form-group">
            <label for="edit-task-title">Task Title</label>
            <input type="text" id="edit-task-title" required>
            <div class="error-message" id="edit-title-error"></div>
          </div>
          <div class="form-group">
            <label for="edit-task-duration">Duration (minutes)</label>
            <input type="number" id="edit-task-duration" min="1" required>
            <div class="error-message" id="edit-duration-error"></div>
          </div>
          <div class="form-group">
            <label for="edit-task-due-date">Due Date</label>
            <input type="datetime-local" id="edit-task-due-date" required>
            <div class="error-message" id="edit-due-date-error"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" id="edit-cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(editDialog);
    
    // Set up event listeners
    document.getElementById('edit-cancel-btn').addEventListener('click', () => {
      editDialog.style.display = 'none';
    });
    
    document.getElementById('edit-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      updateTask();
    });
  }
  
  // Fill form with task data
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-duration').value = task.duration;
  
  // Format date for datetime-local input
  const dueDate = new Date(task.dueDate);
  const formattedDate = dueDate.toISOString().slice(0, 16);
  document.getElementById('edit-task-due-date').value = formattedDate;
  
  // Store task ID in the form
  document.getElementById('edit-task-form').dataset.taskId = task.id;
  
  // Show dialog
  editDialog.style.display = 'flex';
}

// Update task with edited data
function updateTask() {
  const form = document.getElementById('edit-task-form');
  const taskId = form.dataset.taskId;
  const title = document.getElementById('edit-task-title').value.trim();
  const duration = document.getElementById('edit-task-duration').value;
  const dueDate = document.getElementById('edit-task-due-date').value;
  
  // Validate form
  let isValid = true;
  
  if (!title) {
    document.getElementById('edit-title-error').textContent = 'Title is required';
    isValid = false;
  } else {
    document.getElementById('edit-title-error').textContent = '';
  }
  
  if (!duration || duration < 1) {
    document.getElementById('edit-duration-error').textContent = 'Valid duration is required';
    isValid = false;
  } else {
    document.getElementById('edit-duration-error').textContent = '';
  }
  
  if (!dueDate) {
    document.getElementById('edit-due-date-error').textContent = 'Due date is required';
    isValid = false;
  } else {
    document.getElementById('edit-due-date-error').textContent = '';
  }
  
  if (!isValid) return;
  
  // Update task in localStorage
  const tasks = getTasksFromLocalStorage();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].title = title;
    tasks[taskIndex].duration = duration;
    tasks[taskIndex].dueDate = new Date(dueDate).toISOString();
    
    saveTasksToLocalStorage(tasks);
    
    // Update UI
    const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
    taskCard.querySelector('h3').textContent = title;
    taskCard.querySelector('p').textContent = `${duration} mins`;
    taskCard.querySelector('strong').textContent = formatTime(new Date(dueDate).toISOString());
    
    // Hide dialog
    document.getElementById('edit-task-dialog').style.display = 'none';
    
    showToast('Task updated successfully');
  }
}

// Helper function to format time (e.g., "8:30 PM")
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Get tasks from localStorage
function getTasksFromLocalStorage() {
  const tasksJson = localStorage.getItem('tasks');
  return tasksJson ? JSON.parse(tasksJson) : [];
}

// Save tasks to localStorage
function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}