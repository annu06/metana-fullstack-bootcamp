// Profile Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profile-button');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.getElementById('profile-modal-close');
    const profileForm = document.getElementById('profile-form');
    
    // Load saved user name from localStorage
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        updateGuestName(savedName);
    }
    
    if (profileBtn && profileModal && profileModalClose) {
        profileBtn.addEventListener('click', function() {
            profileModal.style.display = 'flex';
        });
        
        profileModalClose.addEventListener('click', function() {
            profileModal.style.display = 'none';
        });
        
        profileModal.addEventListener('click', function(e) {
            if (e.target === profileModal) {
                profileModal.style.display = 'none';
            }
        });
    }
    
    // Handle form submission
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('user-name');
            const emailInput = document.getElementById('user-email');
            const passwordInput = document.getElementById('user-password');
            const rememberMe = document.getElementById('remember-me');
            
            const userName = nameInput.value.trim();
            const userEmail = emailInput.value.trim();
            const userPassword = passwordInput.value.trim();
            
            if (userName && userEmail && userPassword) {
                // Save user data if remember me is checked
                if (rememberMe.checked) {
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('userEmail', userEmail);
                }
                
                // Update the guest name display
                updateGuestName(userName);
                
                // Close the modal
                profileModal.style.display = 'none';
                
                // Show success message (optional)
                alert('Welcome, ' + userName + '!');
                
                // Clear the form
                profileForm.reset();
            }
        });
    }
    
    function updateGuestName(name) {
        const guestNameElement = document.querySelector('.header-left p');
        if (guestNameElement) {
            guestNameElement.textContent = name + '.';
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const weatherButton = document.getElementById('weather-button');
    const weatherModal = document.getElementById('weather-modal');
    const weatherInfo = document.getElementById('weather-info');
    const moodButton = document.getElementById('mood-button');
    const moodModal = document.getElementById('mood-modal');
    const moodOptions = document.querySelectorAll('.mood-option');
    const addTaskButton = document.getElementById('add-task-button');
    const addTaskModal = document.getElementById('add-task-modal');
    const addTaskForm = document.getElementById('add-task-form');
    const editTaskModal = document.getElementById('edit-task-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const showCompletedButton = document.getElementById('show-completed-button');
    const completedTasksContainer = document.getElementById('completed-tasks-container');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const suggestedTaskList = document.getElementById('suggested-task-list');
    const closeButtons = document.querySelectorAll('.close-button');
    
    // State
    let currentMood = 'happy';
    let weatherData = null;
    let suggestedTasks = [];
    
    // Initialize
    init();
    
    function init() {
        // Get user's location and fetch weather data
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(latitude, longitude);
            }, error => {
                console.error('Error getting location:', error);
                // Use default location if geolocation fails
                fetchWeatherData(40.7128, -74.0060); // New York coordinates
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
            // Use default location if geolocation is not supported
            fetchWeatherData(40.7128, -74.0060); // New York coordinates
        }
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Weather modal
        weatherButton.addEventListener('click', () => {
            weatherModal.style.display = 'block';
        });
        
        // Close weather modal when clicking the close button
        const weatherModalCloseButton = weatherModal.querySelector('.close-button');
        weatherModalCloseButton.addEventListener('click', () => {
            weatherModal.style.display = 'none';
        });
        
        // Close weather modal when clicking outside the modal content
        window.addEventListener('click', (event) => {
            if (event.target === weatherModal) {
                weatherModal.style.display = 'none';
            }
        });
        
        // Mood modal
        moodButton.addEventListener('click', () => {
            moodModal.style.display = 'block';
        });
        
        // Mood selection
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                const mood = option.getAttribute('data-mood');
                setMood(mood);
                moodModal.style.display = 'none';
                updateSuggestedTasks();
            });
        });
        
        // Add task modal
        if (addTaskButton && addTaskModal) {
            addTaskButton.addEventListener('click', () => {
                console.log('Add task button clicked');
                addTaskModal.style.display = 'block';
            });
        } else {
            console.error('Add task button or modal not found');
        }
        
        // Close add task modal
        const addTaskModalClose = document.querySelector('#add-task-modal .close-button');
        if (addTaskModalClose) {
            addTaskModalClose.addEventListener('click', () => {
                addTaskModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        if (addTaskModal) {
            addTaskModal.addEventListener('click', (e) => {
                if (e.target === addTaskModal) {
                    addTaskModal.style.display = 'none';
                }
            });
        }
        
        // Add task form submission
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', event => {
                event.preventDefault();
                console.log('Add task form submitted');
                
                const title = document.getElementById('task-title').value;
                const duration = document.getElementById('task-duration').value;
                const time = document.getElementById('task-time').value;
                
                console.log('Task data:', { title, duration, time });
                
                addTask(title, duration, time);
                addTaskModal.style.display = 'none';
                addTaskForm.reset();
            });
        } else {
            console.error('Add task form not found');
        }
        
        // Edit task modal
        const editTaskModalClose = document.getElementById('edit-modal-close');
        if (editTaskModalClose && editTaskModal) {
            editTaskModalClose.addEventListener('click', () => {
                editTaskModal.style.display = 'none';
            });
        }
        
        // Close edit modal when clicking outside
        if (editTaskModal) {
            editTaskModal.addEventListener('click', (e) => {
                if (e.target === editTaskModal) {
                    editTaskModal.style.display = 'none';
                }
            });
        }
        
        // Edit task form submission
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', event => {
                event.preventDefault();
                const id = document.getElementById('edit-task-id').value;
                const title = document.getElementById('edit-task-title').value;
                const duration = document.getElementById('edit-task-duration').value;
                const time = document.getElementById('edit-task-time').value;
                
                updateTask(id, title, duration, time);
                editTaskModal.style.display = 'none';
            });
        }
        
        // Complete all tasks
        const completeAllButton = document.querySelector('.complete-all-button');
        if (completeAllButton) {
            completeAllButton.addEventListener('click', () => {
                const taskButtons = document.querySelectorAll('.task-list .task-item .task-complete-button');
                taskButtons.forEach(button => {
                    const taskId = button.getAttribute('data-id');
                    toggleTaskStatus(taskId);
                });
            });
        }
        
        // Show/hide completed tasks
        showCompletedButton.addEventListener('click', () => {
            // Only toggle if there are completed tasks
            if (completedTaskList.children.length > 0) {
                if (completedTasksContainer.style.display === 'none') {
                    completedTasksContainer.style.display = 'block';
                    showCompletedButton.textContent = 'Hide Completed';
                } else {
                    completedTasksContainer.style.display = 'none';
                    showCompletedButton.textContent = 'Show Completed';
                }
            } else {
                // Show a message if there are no completed tasks
                alert('No completed tasks yet!');
            }
        });
        
        // Initialize completed tasks container as hidden
        completedTasksContainer.style.display = 'none';
        
        // Initialize task count
        updateTaskCount();
        
        // Close buttons for modals
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', event => {
            if (event.target === weatherModal) {
                weatherModal.style.display = 'none';
            } else if (event.target === moodModal) {
                moodModal.style.display = 'none';
            } else if (event.target === addTaskModal) {
                addTaskModal.style.display = 'none';
            }
        });
        
        // Delegated task action handler (complete/uncomplete/edit)
        document.addEventListener('click', event => {
            const target = event.target;

            // helper to find the actionable button element even if clicking an inner element
            function findButtonWithClass(el, className) {
                if (!el) return null;
                if (el.classList && el.classList.contains(className)) return el;
                if (el.parentElement && el.parentElement.classList && el.parentElement.classList.contains(className)) return el.parentElement;
                return null;
            }

            // Handle complete/uncomplete
            const completeButton = findButtonWithClass(target, 'task-complete-button') || findButtonWithClass(target, 'task-uncomplete-button');
            if (completeButton) {
                const taskId = completeButton.getAttribute('data-id');
                if (taskId) toggleTaskStatus(taskId);
                return;
            }

            // Handle edit button (delegated so server-rendered items work)
            const editButton = findButtonWithClass(target, 'edit-task-button');
            if (editButton) {
                const taskId = editButton.getAttribute('data-id');
                // Try to read task fields from the DOM for server-rendered items
                const taskItem = editButton.closest('.task-item');
                const title = taskItem ? (taskItem.querySelector('.task-info h3') ? taskItem.querySelector('.task-info h3').textContent : '') : '';
                const duration = taskItem ? (taskItem.querySelector('.task-details span') ? taskItem.querySelector('.task-details span').textContent : '') : '';
                const time = taskItem ? (taskItem.querySelector('.task-time') ? taskItem.querySelector('.task-time').textContent : '') : '';

                openEditModal({ id: taskId, title, duration, time });
                return;
            }

            // Handle delete button
            const deleteButton = findButtonWithClass(target, 'delete-task-button');
            if (deleteButton) {
                const taskId = deleteButton.getAttribute('data-id');
                if (taskId && confirm('Delete this task?')) {
                    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(() => refreshTasks())
                        .catch(err => console.error('Error deleting task:', err));
                }
                return;
            }
        });
    }
    
    function fetchWeatherData(lat, lon) {
        fetch(`/api/weather?lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
                weatherData = data.weather;
                suggestedTasks = data.suggestedTasks;
                updateWeatherUI();
                updateSuggestedTasks();
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    // Re-render all tasks from server to keep UI in sync
    function refreshTasks() {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(payload => {
                const items = payload && payload.data ? payload.data : [];
                renderTaskLists(items);
                updateTaskCount();
            })
            .catch(err => console.error('Error refreshing tasks:', err));
    }

    function renderTaskLists(items) {
        if (!Array.isArray(items)) return;
        // Clear lists
        if (taskList) taskList.innerHTML = '';
        if (completedTaskList) completedTaskList.innerHTML = '';

        let hasCompleted = false;
        items.forEach(task => {
            if (task.status === 'completed') {
                hasCompleted = true;
                completedTaskList.appendChild(createTaskElement({ ...task, status: 'completed' }));
            } else {
                taskList.appendChild(createTaskElement({ ...task, status: 'backlog' }));
            }
        });

        // Toggle completed container visibility based on items
        if (hasCompleted) {
            completedTasksContainer.style.display = 'block';
            if (showCompletedButton) showCompletedButton.textContent = 'Hide Completed';
        } else {
            completedTasksContainer.style.display = 'none';
            if (showCompletedButton) showCompletedButton.textContent = 'Show Completed';
        }
    }
    
    function updateWeatherUI() {
        if (!weatherData) return;
        
        const { temperature, condition, humidity, icon, feelsLike, windSpeed, pressure, visibility, location } = weatherData;
        
        // Update weather modal
        const weatherIconElement = weatherInfo.querySelector('.weather-icon-large');
        const temperatureElement = weatherInfo.querySelector('.temperature');
        const conditionElement = weatherInfo.querySelector('.condition');
        const humidityElement = weatherInfo.querySelector('.humidity');
        
        // Update additional weather details
        const feelsLikeElement = document.getElementById('feels-like');
        const windSpeedElement = document.getElementById('wind-speed');
        const pressureElement = document.getElementById('pressure');
        const visibilityElement = document.getElementById('visibility');
        
        // Update location information
        const locationNameElement = document.querySelector('.location-name');
        const locationCountryElement = document.querySelector('.location-country');
        
        weatherIconElement.innerHTML = `<img src="${icon}" alt="${condition}">`;
        temperatureElement.textContent = `${temperature}°C`;
        conditionElement.textContent = condition;
        humidityElement.textContent = `Humidity: ${humidity}%`;
        
        // Update additional weather details
        feelsLikeElement.textContent = `${feelsLike}°C`;
        windSpeedElement.textContent = `${windSpeed} km/h`;
        pressureElement.textContent = `${pressure} hPa`;
        visibilityElement.textContent = `${visibility} km`;
        
        // Update location information
        if (location) {
            locationNameElement.textContent = location.name;
            locationCountryElement.textContent = location.country;
        }
        
        // Update weather button icon
        weatherButton.innerHTML = `<img src="${icon}" alt="${condition}" style="width: 24px; height: 24px;">`;
    }
    
    function setMood(mood) {
        currentMood = mood;
        
        // Update mood button icon
        let moodIcon = '😊'; // default
        
        switch (mood) {
            case 'happy':
                moodIcon = '😊';
                break;
            case 'neutral':
                moodIcon = '😐';
                break;
            case 'sad':
                moodIcon = '😔';
                break;
            case 'excited':
                moodIcon = '😃';
                break;
            case 'tired':
                moodIcon = '😴';
                break;
        }
        
        moodButton.innerHTML = `<span class="mood-icon">${moodIcon}</span>`;
        
        // Update selected mood in modal
        moodOptions.forEach(option => {
            if (option.getAttribute('data-mood') === mood) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    function updateSuggestedTasks() {
        // Clear current suggested tasks
        suggestedTaskList.innerHTML = '';
        
        // Update weather indicator
        const weatherIndicator = document.getElementById('weather-indicator');
        if (weatherData) {
            weatherIndicator.innerHTML = `<img src="${weatherData.icon}" alt="${weatherData.condition}" width="20" height="20">`;
        }
        
        // Update mood indicator
        const moodIndicator = document.getElementById('mood-indicator');
        let moodIcon = '😊';
        switch (currentMood) {
            case 'happy': moodIcon = '😊'; break;
            case 'neutral': moodIcon = '😐'; break;
            case 'sad': moodIcon = '😔'; break;
            case 'excited': moodIcon = '😃'; break;
            case 'tired': moodIcon = '😴'; break;
        }
        moodIndicator.innerHTML = `<span>${moodIcon}</span>`;
        
        // Fetch mood-based suggestions
        fetchMoodSuggestions(currentMood).then(moodSuggestions => {
            // Combine weather and mood suggestions
            const weatherTasks = suggestedTasks || [];
            const moodTasks = moodSuggestions || [];
            
            // Take 3 weather-based and 3 mood-based suggestions
            const combinedTasks = [
                ...weatherTasks.slice(0, 3).map(task => ({ task, type: 'weather' })),
                ...moodTasks.slice(0, 3).map(task => ({ task, type: 'mood' }))
            ];
            
            // Shuffle the combined tasks for variety
            const shuffledTasks = combinedTasks.sort(() => Math.random() - 0.5);
            
            // Display the tasks
            shuffledTasks.forEach((taskObj, index) => {
                const now = new Date();
                const hours = now.getHours();
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedHours = hours % 12 || 12;
                const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
                
                const isWeatherBased = taskObj.type === 'weather';
                const duration = isWeatherBased ? '15 mins' : '30 mins';
                
                const taskElement = document.createElement('div');
                taskElement.className = 'suggested-task-item';
                taskElement.innerHTML = `
                    <div class="suggestion-icon ${isWeatherBased ? 'weather-based' : 'mood-based'}">
                        ${isWeatherBased ? '<img src="/images/weather-icon.svg" width="15" height="15" alt="Weather">' : moodIcon}
                    </div>
                    <div class="suggested-task-info">
                        <h3>${taskObj.task}</h3>
                        <div class="suggested-task-details">
                            <span>${duration}</span>
                        </div>
                    </div>
                    <div class="task-time">
                        ${formattedTime}
                    </div>
                    <div class="suggestion-source">
                        <span>Based on</span>
                        <span>${isWeatherBased ? 'Weather - ' + (weatherData ? weatherData.condition : 'Unknown') : 'Mood'}</span>
                    </div>
                `;
                
                // Add click event listener to add task
                taskElement.addEventListener('click', () => {
                    addTask(taskObj.task, duration, formattedTime);
                    // Visual feedback
                    taskElement.style.opacity = '0.5';
                    taskElement.style.pointerEvents = 'none';
                    setTimeout(() => {
                        taskElement.style.opacity = '1';
                        taskElement.style.pointerEvents = 'auto';
                    }, 1000);
                });
                
                suggestedTaskList.appendChild(taskElement);
            });
        });
    }
    
    function fetchMoodSuggestions(mood) {
        return fetch(`/api/mood-suggestions?mood=${mood}`)
            .then(response => response.json())
            .then(data => data.suggestedTasks)
            .catch(error => {
                console.error('Error fetching mood suggestions:', error);
                return [];
            });
    }
    
    function addTask(title, duration, time) {
        console.log('addTask function called with:', { title, duration, time });
        
        // Format time if not provided
        if (!time) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            time = `${formattedHours}:${minutes} ${ampm}`;
        }
        
        const taskData = {
            title,
            duration: duration || '30 mins',
            time: time
        };
        
        console.log('Sending task data:', taskData);
        
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            const created = data && data.data;
            if (created) {
                // Refresh from server to avoid mismatches
                refreshTasks();
            } else {
                console.error('No task data received');
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    }
    
    function toggleTaskStatus(taskId) {
        // Determine current UI status and flip
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (!taskItem) return;

        const isCompleted = taskItem.classList.contains('completed');
        const newStatus = isCompleted ? 'backlog' : 'completed';

        fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            const updated = data && data.data;
            if (updated) {
                refreshTasks();
            }
        })
        .catch(error => {
            console.error('Error toggling task status:', error);
        });
    }
    
    function updateTaskCount() {
        const taskCount = document.querySelector('.task-count');
        const count = document.querySelectorAll('.task-list .task-item').length;
        taskCount.textContent = `You have ${count} tasks planned for today`;
    }
    
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        taskElement.setAttribute('data-id', task.id);

        const isCompleted = task.status === 'completed';

        taskElement.innerHTML = `
            <button class="${isCompleted ? 'task-uncomplete-button' : 'task-complete-button'}" data-id="${task.id}">
                <span class="checkmark">✓</span>
            </button>
            <div class="task-info">
                <h3>${task.title}</h3>
                <div class="task-details">
                    <span>${task.duration}</span>
                </div>
            </div>
            <div class="task-time">
                ${task.time}
            </div>
            <div class="task-actions">
                ${!isCompleted ? `
                <button class="edit-task-button" data-id="${task.id}" title="Edit Task">
                    <span>✏️</span>
                </button>` : ''}
                <button class="delete-task-button" data-id="${task.id}" title="Delete Task">
                    <span>🗑️</span>
                </button>
            </div>
        `;
        
        return taskElement;
    }

    function createCompletedTaskElement(task) {
        return createTaskElement({ ...task, status: 'completed' });
    }
    
    function openEditModal(task) {
        console.log('Opening edit modal for task:', task);
        
        if (!editTaskModal) {
            console.error('Edit task modal not found');
            return;
        }
        
        // Populate the edit form with current task data
        const idField = document.getElementById('edit-task-id');
        const titleField = document.getElementById('edit-task-title');
        const durationField = document.getElementById('edit-task-duration');
        const timeField = document.getElementById('edit-task-time');
        
        if (idField) idField.value = task.id;
        if (titleField) titleField.value = task.title;
        if (durationField) durationField.value = task.duration;
        if (timeField) timeField.value = task.time;
        
        // Show the edit modal
        editTaskModal.style.display = 'block';
    }
    
    function updateTask(id, title, duration, time) {
        const taskData = {
            title,
            duration: duration || '30 mins',
            time: time
        };
        
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            const updated = data && data.data;
            if (updated) {
                // Find and update the task element in the UI
                const oldTaskElement = document.querySelector(`.task-item[data-id="${id}"]`);
                if (oldTaskElement) {
                    // Safer: refresh lists to avoid stale nodes
                    refreshTasks();
                }
            }
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
    }
});