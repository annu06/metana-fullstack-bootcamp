# Mood-Based Todo App

A web application that helps users manage tasks based on their mood and current weather conditions. This application integrates with a weather API to provide real-time weather information and suggests tasks accordingly.

## Features

- Task management with ability to add, complete, and uncomplete tasks
- Completed tasks section with toggle visibility
- Weather integration showing current weather conditions with detailed information in a modal
- Mood selection to personalize the experience
- Task suggestions based on weather and mood
- Responsive design for desktop, tablet, and mobile devices
- Handlebars templating for dynamic content rendering

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Templating**: Handlebars
- **API Integration**: Weather API (weatherapi.com)

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mood-based-todo-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   WEATHER_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual API key from [weatherapi.com](https://www.weatherapi.com/).

4. Start the server:
   ```
   node app.js
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── app.js                 # Main server file
├── package.json           # Project dependencies
├── .env                   # Environment variables (create this file)
├── public/                # Static assets
│   ├── css/               # CSS stylesheets
│   │   └── styles.css     # Main stylesheet
│   ├── js/                # JavaScript files
│   │   └── app.js         # Main client-side JavaScript
│   └── images/            # Image assets
└── views/                 # Handlebars templates
    ├── layouts/           # Layout templates
    │   └── main.handlebars # Main layout template
    ├── partials/          # Partial templates
    └── home.handlebars    # Home page template
```

## API Endpoints

- `GET /`: Home page
- `GET /api/weather?lat=<latitude>&lon=<longitude>`: Get weather data for the specified coordinates
- `POST /api/tasks`: Add a new task
- `POST /api/tasks/:id/toggle`: Toggle task status between backlog and completed

## Weather API Integration

This application uses the Weather API from [weatherapi.com](https://www.weatherapi.com/) to fetch real-time weather data. You need to sign up for an API key and add it to your `.env` file.

## Responsive Design

The application is designed to be responsive and work well on various screen sizes:
- Desktop: Full layout with side-by-side sections
- Tablet: Adjusted layout with some stacked elements
- Mobile: Fully stacked layout with optimized controls

## Future Enhancements

- User authentication and personalized task lists
- Task categories and priorities
- Calendar integration
- More detailed weather forecasts
- Additional mood-based suggestions

## License

MIT