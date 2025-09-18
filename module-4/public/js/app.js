// Profile Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profile-button');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.getElementById('profile-modal-close');
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
        addTaskButton.addEventListener('click', () => {
            addTaskModal.style.display = 'block';
        });
        
        // Add task form submission
        addTaskForm.addEventListener('submit', event => {
            event.preventDefault();
            const title = document.getElementById('task-title').value;
            const duration = document.getElementById('task-duration').value;
            const time = document.getElementById('task-time').value;
            
            addTask(title, duration, time);
            addTaskModal.style.display = 'none';
            addTaskForm.reset();
        });
        
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
        
        // Task completion toggle
        document.addEventListener('click', event => {
            if (event.target.classList.contains('task-complete-button') || 
                event.target.parentElement.classList.contains('task-complete-button')) {
                const button = event.target.classList.contains('task-complete-button') ? 
                              event.target : event.target.parentElement;
                const taskId = button.getAttribute('data-id');
                toggleTaskStatus(taskId);
            } else if (event.target.classList.contains('task-uncomplete-button') || 
                       event.target.parentElement.classList.contains('task-uncomplete-button')) {
                const button = event.target.classList.contains('task-uncomplete-button') ? 
                              event.target : event.target.parentElement;
                const taskId = button.getAttribute('data-id');
                toggleTaskStatus(taskId);
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
        
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.task) {
                // Add new task to the UI
                const taskElement = createTaskElement(data.task);
                taskList.appendChild(taskElement);
                
                // Update task count
                updateTaskCount();
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    }
    
    function toggleTaskStatus(taskId) {
        fetch(`/api/tasks/${taskId}/toggle`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.task) {
                // Update UI based on task status
                const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
                
                if (data.task.status === 'completed') {
                    // Move to completed list
                    taskItem.remove();
                    const completedTaskElement = createCompletedTaskElement(data.task);
                    completedTaskList.appendChild(completedTaskElement);
                    
                    // Update task count
                    updateTaskCount();
                    
                    // Show completed tasks container if it's hidden
                    if (completedTasksContainer.style.display === 'none') {
                        completedTasksContainer.style.display = 'block';
                        showCompletedButton.textContent = 'Hide Completed';
                    }
                } else {
                    // Move back to task list (from completed to backlog)
                    taskItem.remove();
                    const taskElement = createTaskElement(data.task);
                    taskList.appendChild(taskElement);
                    
                    // Update task count
                    updateTaskCount();
                    
                    // Hide completed tasks container if it's empty
                    if (completedTaskList.children.length === 0) {
                        completedTasksContainer.style.display = 'none';
                        showCompletedButton.textContent = 'Show Completed';
                    }
                }
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
        taskElement.className = 'task-item';
        taskElement.setAttribute('data-id', task.id);
        
        taskElement.innerHTML = `
            <button class="task-complete-button" data-id="${task.id}">
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
        `;
        
        return taskElement;
    }
    
    function createCompletedTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item completed';
        taskElement.setAttribute('data-id', task.id);
        
        taskElement.innerHTML = `
            <button class="task-uncomplete-button" data-id="${task.id}">
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
        `;
        
        return taskElement;
    }
});