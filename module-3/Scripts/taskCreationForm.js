// Initialize Task Creation Form
function initializeTaskCreationForm() {
  createTaskFormDialog();
}

// Create the task creation form dialog
function createTaskFormDialog() {
  // Create dialog if it doesn't exist
  if (!document.getElementById('task-creation-dialog')) {
    const dialog = document.createElement('div');
    dialog.id = 'task-creation-dialog';
    dialog.className = 'dialog-overlay';
    dialog.innerHTML = `
      <div class="dialog-content">
        <form class="task-form" id="create-task-form">
          <h2>Create New Task</h2>
          <div class="form-group">
            <label for="task-title">Task Title</label>
            <input type="text" id="task-title" required>
            <div class="error-message" id="title-error"></div>
          </div>
          <div class="form-group">
            <label for="task-duration">Duration (minutes)</label>
            <input type="number" id="task-duration" min="1" required>
            <div class="error-message" id="duration-error"></div>
          </div>
          <div class="form-group">
            <label for="task-due-date">Due Date</label>
            <input type="datetime-local" id="task-due-date" required>
            <div class="error-message" id="due-date-error"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn">Create Task</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Set up event listeners
    document.getElementById('cancel-btn').addEventListener('click', () => {
      dialog.style.display = 'none';
      resetTaskForm();
    });
    
    document.getElementById('create-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      createTask();
    });
    
    // Set default due date to current time + 1 hour
    setDefaultDueDate();
  }
}

// Set default due date to current time + 1 hour
function setDefaultDueDate() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const formattedDate = now.toISOString().slice(0, 16);
  document.getElementById('task-due-date').value = formattedDate;
}

// Reset the task creation form
function resetTaskForm() {
  document.getElementById('create-task-form').reset();
  document.getElementById('title-error').textContent = '';
  document.getElementById('duration-error').textContent = '';
  document.getElementById('due-date-error').textContent = '';
  setDefaultDueDate();
}

// Create a new task
function createTask() {
  const title = document.getElementById('task-title').value.trim();
  const duration = document.getElementById('task-duration').value;
  const dueDate = document.getElementById('task-due-date').value;
  
  // Validate form
  let isValid = true;
  
  if (!title) {
    document.getElementById('title-error').textContent = 'Title is required';
    isValid = false;
  } else {
    document.getElementById('title-error').textContent = '';
  }
  
  if (!duration || duration < 1) {
    document.getElementById('duration-error').textContent = 'Valid duration is required';
    isValid = false;
  } else {
    document.getElementById('duration-error').textContent = '';
  }
  
  if (!dueDate) {
    document.getElementById('due-date-error').textContent = 'Due date is required';
    isValid = false;
  } else {
    document.getElementById('due-date-error').textContent = '';
  }
  
  if (!isValid) return;
  
  // Create new task object
  const newTask = {
    id: generateUniqueId(),
    title: title,
    duration: duration,
    dueDate: new Date(dueDate).toISOString(),
    completed: false
  };
  
  // Get existing tasks from localStorage
  const tasks = getTasksFromLocalStorage();
  
  // Add new task
  tasks.push(newTask);
  
  // Save to localStorage
  saveTasksToLocalStorage(tasks);
  
  // Add task to DOM
  addTaskToDOM(newTask);
  
  // Update task count
  const incompleteTasks = tasks.filter(task => !task.completed);
  document.querySelector('.tasks-header p').textContent = 
    `You have ${incompleteTasks.length} tasks planned for today`;
  
  // Hide dialog and reset form
  document.getElementById('task-creation-dialog').style.display = 'none';
  resetTaskForm();
  
  // Show success message
  showToast('Task created successfully');
}

// Generate a unique ID for tasks
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}