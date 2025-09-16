const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Handlebars as the view engine
app.engine('handlebars', engine({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Import API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Sample tasks data (in a real app, this would be stored in a database)
let tasks = [
  { id: 1, title: 'Morning Run', duration: '20 mins', time: '06:00 AM', status: 'backlog' },
  { id: 2, title: 'Meditation', duration: '15 mins', time: '07:00 AM', status: 'backlog' },
  { id: 3, title: 'Read a Book', duration: '45 mins', time: '08:00 PM', status: 'backlog' }
];

// Weather-based task suggestions
const weatherSuggestions = {
  Clear: ['Go for a walk', 'Outdoor exercise', 'Picnic in the park', 'Garden work', 'Bike ride', 'Photography walk'],
  Clouds: ['Meditation', 'Read a book', 'Visit a museum', 'Indoor yoga', 'Creative writing', 'Learn something new'],
  Rain: ['Watch a movie', 'Read a book', 'Cook a new recipe', 'Indoor workout', 'Board games', 'Organize your space'],
  Snow: ['Build a snowman', 'Indoor workout', 'Hot chocolate time', 'Winter photography', 'Cozy reading', 'Plan next vacation'],
  Thunderstorm: ['Indoor workout', 'Read a book', 'Plan your week', 'Meditation', 'Listen to music', 'Journal writing']
};

// Mood-based task suggestions
const moodSuggestions = {
  happy: ['Dance to music', 'Call a friend', 'Try a new hobby', 'Go for a jog', 'Cook your favorite meal', 'Plan something fun'],
  neutral: ['Organize your space', 'Read a book', 'Take a walk', 'Learn something new', 'Listen to a podcast', 'Do some stretching'],
  sad: ['Listen to uplifting music', 'Watch a comedy', 'Take a warm bath', 'Call someone you love', 'Practice gratitude', 'Do gentle exercise'],
  excited: ['Start a new project', 'Learn a new skill', 'Plan an adventure', 'Exercise vigorously', 'Create something', 'Share your excitement'],
  tired: ['Take a nap', 'Do gentle stretching', 'Drink herbal tea', 'Listen to calming music', 'Take a warm shower', 'Practice deep breathing']
};

// Routes
app.get('/', (req, res) => {
  const backlogTasks = tasks.filter(task => task.status === 'backlog');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  res.render('home', {
    tasks: backlogTasks,
    completedTasks: completedTasks,
    helpers: {
      formatTime: function(time) {
        return time;
      }
    }
  });
});

// API endpoint to get weather data
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Replace with your actual API key from weatherapi.com
    const apiKey = process.env.WEATHER_API_KEY || 'your_api_key_here';
    
    // Check if API key is set to the default value
    if (apiKey === 'your_api_key_here') {
      console.log('Warning: Using default API key. Please set your actual WeatherAPI.com API key in the .env file.');
      
      // Return mock data for demonstration purposes
      const mockWeatherData = {
        temperature: 28,
        condition: 'Cloudy',
        humidity: 74,
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
        feelsLike: 30,
        windSpeed: 12,
        pressure: 1015,
        visibility: 10,
        location: {
          name: 'New York',
          country: 'United States of America'
        }
      };
      
      // Get suggested tasks based on mock weather
      const weatherType = 'Clouds';
      const suggestedTasks = weatherSuggestions[weatherType] || [];
      
      return res.json({ weather: mockWeatherData, suggestedTasks });
    }
    
    // Make the actual API call if a valid API key is provided
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`);
    
    const weatherData = {
      temperature: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      icon: response.data.current.condition.icon,
      feelsLike: response.data.current.feelslike_c,
      windSpeed: response.data.current.wind_kph,
      pressure: response.data.current.pressure_mb,
      visibility: response.data.current.vis_km,
      location: {
        name: response.data.location.name,
        country: response.data.location.country
      }
    };
    
    // Get suggested tasks based on weather
    let weatherType = 'Clouds'; // Default
    if (response.data.current.condition.text.includes('Clear') || 
        response.data.current.condition.text.includes('Sunny')) {
      weatherType = 'Clear';
    } else if (response.data.current.condition.text.includes('Rain') || 
               response.data.current.condition.text.includes('Drizzle')) {
      weatherType = 'Rain';
    } else if (response.data.current.condition.text.includes('Snow')) {
      weatherType = 'Snow';
    } else if (response.data.current.condition.text.includes('Thunder')) {
      weatherType = 'Thunderstorm';
    } else if (response.data.current.condition.text.includes('Cloud')) {
      weatherType = 'Clouds';
    }
    
    const suggestedTasks = weatherSuggestions[weatherType] || [];
    
    res.json({ weather: weatherData, suggestedTasks });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    
    // Return mock data in case of any error
    const mockWeatherData = {
      temperature: 28,
      condition: 'Cloudy',
      humidity: 74,
      icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
      feelsLike: 30,
      windSpeed: 12,
      pressure: 1015,
      visibility: 10,
      location: {
        name: 'New York',
        country: 'United States of America'
      }
    };
    
    // Get suggested tasks based on mock weather
    const weatherType = 'Clouds';
    const suggestedTasks = weatherSuggestions[weatherType] || [];
    
    res.json({ weather: mockWeatherData, suggestedTasks });
  }
});

// API endpoint to get mood-based suggestions
app.get('/api/mood-suggestions', (req, res) => {
  const { mood } = req.query;
  
  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }
  
  const suggestions = moodSuggestions[mood] || moodSuggestions['neutral'];
  res.json({ mood, suggestedTasks: suggestions });
});

// API endpoint to toggle task status
app.post('/api/tasks/:id/toggle', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  task.status = task.status === 'backlog' ? 'completed' : 'backlog';
  res.json({ task });
});

// API endpoint to add a new task
app.post('/api/tasks', (req, res) => {
  const { title, duration, time } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    duration: duration || '30 mins',
    time: time || '12:00 PM',
    status: 'backlog'
  };
  
  tasks.push(newTask);
  res.status(201).json({ task: newTask });
});

// Import error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});