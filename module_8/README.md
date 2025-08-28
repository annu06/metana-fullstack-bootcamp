# Module 8 - React Frontend with Backend Integration

A full-stack web application built with React frontend and Node.js backend, featuring a modern blog and portfolio website.

## 🚀 Features

### Frontend (React)
- **Modern React Application** with functional components and hooks
- **React Router** for client-side routing
- **Responsive Design** with Tailwind CSS
- **Component-based Architecture** with reusable components
- **API Integration** with Axios for backend communication
- **Proxy Configuration** for seamless development

### Backend (Node.js)
- **Express.js Server** with RESTful API endpoints
- **Static File Serving** for production React build
- **CORS Support** for cross-origin requests
- **Error Handling** middleware
- **Mock Data** for demonstration purposes

### Pages & Components
- **Homepage** - Hero section, featured content, and call-to-actions
- **Blog System** - Blog listing, single blog posts, and categories
- **Projects Portfolio** - Project showcase with filtering
- **About Page** - Personal information and skills
- **Contact Page** - Contact form and information
- **Admin Dashboard** - Content management interface
- **404 Page** - Custom not found page

## 📁 Project Structure

```
module_8/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API integration functions
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main App component with routing
│   │   └── index.js       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── server/                # Node.js backend
│   ├── routes/           # API route handlers
│   ├── index.js          # Express server setup
│   └── package.json      # Backend dependencies
├── package.json          # Root package.json for scripts
└── README.md            # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install all dependencies (root, client, and server)
npm run install-deps
```

### 2. Development Mode

```bash
# Run both frontend and backend simultaneously
npm run dev

# Or run them separately:
# Frontend only (http://localhost:3000)
npm run client

# Backend only (http://localhost:3000)
npm run server
```

### 3. Production Build

```bash
# Build React app for production
npm run build

# Start production server
NODE_ENV=production npm start
```

## 🔧 Available Scripts

### Root Level Scripts
- `npm run dev` - Run both frontend and backend in development mode
- `npm run client` - Run only the React frontend
- `npm run server` - Run only the Node.js backend
- `npm run build` - Build React app for production
- `npm run install-deps` - Install dependencies for all packages
- `npm start` - Start production server

### Client Scripts (cd client/)
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Server Scripts (cd server/)
- `npm start` - Start Express server
- `npm run dev` - Start with nodemon (auto-restart)

## 🌐 API Endpoints

### Blogs
- `GET /api/blogs` - Get all blogs (supports query params: category, search, limit)
- `GET /api/blogs/:id` - Get single blog by ID
- `POST /api/blogs` - Create new blog post

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user by ID

### Projects
- `GET /api/projects` - Get all projects (supports query params: category, featured)
- `GET /api/projects/:id` - Get single project by ID

### Health Check
- `GET /api/health` - API health status

## 🎨 Styling & UI

- **Tailwind CSS** for utility-first styling
- **Responsive Design** for mobile and desktop
- **Custom Color Palette** with primary and secondary colors
- **Modern Components** with hover effects and transitions
- **Consistent Typography** and spacing

## 🔄 Development Workflow

1. **Frontend Development**: Work in `client/` directory with hot reloading
2. **Backend Development**: Work in `server/` directory with nodemon
3. **API Integration**: Use proxy configuration for seamless API calls
4. **Production Deployment**: Build frontend and serve via Express

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile devices** (320px and up)
- **Tablets** (768px and up)
- **Desktop** (1024px and up)
- **Large screens** (1280px and up)

## 🚀 Deployment

### Production Setup
1. Build the React application: `npm run build`
2. Set environment variable: `NODE_ENV=production`
3. Start the server: `npm start`
4. The server will serve the React build and handle API requests

### Environment Variables
- `NODE_ENV` - Set to 'production' for production mode
- `PORT` - Server port (default: 3000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify that both frontend and backend are running
4. Check the API endpoints are responding correctly

---

**Happy Coding! 🎉**