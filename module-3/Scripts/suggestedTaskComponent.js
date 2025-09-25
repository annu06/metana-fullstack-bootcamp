// Initialize Suggested Task Component
function initializeSuggestedTaskComponent() {
  loadSuggestedTasks();
}

// Load suggested tasks based on mood and time of day
function loadSuggestedTasks() {
  const suggestedTasksContainer = document.querySelector('.suggested-tasks');
  const suggestedTasksList = suggestedTasksContainer.querySelector('div:not(h3)');
  
  // Clear existing suggested tasks if there's any content after the h3
  if (suggestedTasksList) {
    suggestedTasksList.innerHTML = '';
  }
  
  // Get user's current mood from localStorage
  const userMood = localStorage.getItem('userMood') || '🙂';
  
  // Get suggested tasks based on mood
  const suggestedTasks = getSuggestedTasksForMood(userMood);
  
  // Display suggested tasks
  suggestedTasks.forEach(task => {
    addSuggestedTaskToDOM(task, userMood);
  });
}

// Add a suggested task to the DOM
function addSuggestedTaskToDOM(task, mood) {
  const suggestedTasksContainer = document.querySelector('.suggested-tasks');
  
  const suggestedCard = document.createElement('div');
  suggestedCard.className = 'suggested-card';
  suggestedCard.dataset.id = task.id;
  
  // Get current weather (in a real app, this would come from a weather API)
  const weather = '☀️'; // Placeholder for weather
  
  suggestedCard.innerHTML = `
    <div>
      <h4><a href="#">${task.title}</a></h4>
      <p>${task.duration} mins</p>
      <strong>${formatTime(task.dueDate)}</strong>
    </div>
    <div class="mood-weather">
      <div>${mood} ${weather}</div>
      <small>Based on<br><a href="#">Mood & Weather</a></small>
      <span class="checkmark">✔</span>
      <button class="edit-btn" title="Edit Suggested Task">✎</button>
      <button class="delete-btn" title="Delete Suggested Task">🗑</button>
    </div>
  `;
  
  // Add event listener to add this suggested task to regular tasks
  suggestedCard.querySelector('.checkmark').addEventListener('click', () => {
    addSuggestedTaskToTasks(task);
  });
  // Add event listener for the task title link
  suggestedCard.querySelector('h4 a').addEventListener('click', (e) => {
    e.preventDefault();
    addSuggestedTaskToTasks(task);
  });
  // Edit button event
  suggestedCard.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showEditTaskDialog(task);
  });
  // Delete button event
  suggestedCard.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    suggestedCard.remove();
    // Optionally, remove from localStorage if needed
  });
  suggestedTasksContainer.appendChild(suggestedCard);
}

// Add a suggested task to the regular tasks list
function addSuggestedTaskToTasks(suggestedTask) {
  // Get existing tasks
  const tasks = getTasksFromLocalStorage();
  
  // Create a new task based on the suggested task
  const newTask = {
    id: generateUniqueId(),
    title: suggestedTask.title,
    duration: suggestedTask.duration,
    dueDate: suggestedTask.dueDate,
    completed: false
  };
  
  // Add to tasks array
  tasks.push(newTask);
  
  // Save to localStorage
  saveTasksToLocalStorage(tasks);
  
  // Update UI
  addTaskToDOM(newTask);
  
  // Update task count
  const incompleteTasks = tasks.filter(task => !task.completed);
  document.querySelector('.tasks-header p').textContent = 
    `You have ${incompleteTasks.length} tasks planned for today`;
  
  // Show success message
  showToast('Suggested task added to your list');
}

// Get suggested tasks based on mood
function getSuggestedTasksForMood(mood) {
  // In a real app, these would be more sophisticated and possibly come from a backend
  const suggestedTasksByMood = {
    '😀': [
      { id: 's1', title: 'Go for a run', duration: 30, dueDate: setTimeForToday(18, 0) },
      { id: 's2', title: 'Call a friend', duration: 20, dueDate: setTimeForToday(19, 0) }
    ],
    '🙂': [
      { id: 's3', title: 'Read a book', duration: 45, dueDate: setTimeForToday(17, 30) },
      { id: 's4', title: 'Take a walk', duration: 30, dueDate: setTimeForToday(18, 15) }
    ],
    '😐': [
      { id: 's5', title: 'Meditate', duration: 15, dueDate: setTimeForToday(19, 30) },
      { id: 's6', title: 'Journal writing', duration: 20, dueDate: setTimeForToday(20, 0) }
    ],
    '😔': [
      { id: 's7', title: 'Listen to uplifting music', duration: 30, dueDate: setTimeForToday(18, 0) },
      { id: 's8', title: 'Take a relaxing bath', duration: 40, dueDate: setTimeForToday(20, 30) }
    ],
    '😢': [
      { id: 's9', title: 'Call a supportive friend', duration: 30, dueDate: setTimeForToday(19, 0) },
      { id: 's10', title: 'Watch a funny movie', duration: 120, dueDate: setTimeForToday(20, 0) }
    ]
  };
  
  // Return tasks for the given mood, or default to neutral mood if not found
  return suggestedTasksByMood[mood] || suggestedTasksByMood['🙂'];
}

// Helper function to set a specific time for today
function setTimeForToday(hours, minutes) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

// Generate a unique ID for tasks
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}