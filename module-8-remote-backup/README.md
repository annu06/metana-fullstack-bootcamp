# Module 8 - React Frontend with Backend Integration

A full-stack portfolio application built with React frontend and Node.js backend, demonstrating complete integration of modern web technologies.

## 🎯 Project Overview

This project is a comprehensive portfolio and blog application that showcases:

- **Frontend**: React.js with React Router for navigation
- **Backend**: Node.js with Express.js API server
- **Database**: SQLite for data persistence
- **Styling**: TailwindCSS for modern, responsive design
- **Development**: Concurrent frontend/backend development setup

## ✨ Features

### Frontend Features

- **8 Complete Pages**: Homepage, About, Projects, Blog List, Blog Detail, Contact, Login, Admin Dashboard
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **React Router**: Client-side routing with proper navigation
- **API Integration**: Axios-based API calls to backend services
- **Component Architecture**: Reusable components (Header, Footer, BlogCard, ProjectCard)
- **Interactive Forms**: Contact form and admin login with validation

### Backend Features

- **RESTful API**: Complete CRUD operations for blogs and users
- **Database Integration**: SQLite with proper schema and sample data
- **CORS Support**: Cross-origin resource sharing enabled
- **Production Ready**: Serves React build in production mode
- **Error Handling**: Comprehensive error responses and logging

### Admin Dashboard

- **Blog Management**: Create, edit, and delete blog posts
- **User Management**: View and manage user accounts
- **Analytics Overview**: Dashboard with key metrics and statistics
- **Authentication**: Simple login system for demo purposes

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository and navigate to module-8**

   ```bash
   git clone <your-repo-url>
   cd module-8
   ```

2. **Install all dependencies**

   ```bash
   npm run install-deps
   ```

   This command installs dependencies for the root, server, and client directories.

3. **Start development servers**

   ```bash
   npm run dev
   ```

   This runs both frontend (React) and backend (Express) servers concurrently.

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
module-8/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── BlogCard.js
│   │   │   └── ProjectCard.js
│   │   ├── pages/         # Page components
│   │   │   ├── Homepage.js
│   │   │   ├── About.js
│   │   │   ├── Projects.js
│   │   │   ├── BlogList.js
│   │   │   ├── BlogDetail.js
│   │   │   ├── Contact.js
│   │   │   ├── Login.js
│   │   │   └── AdminDashboard.js
│   │   ├── utils/         # Utility functions
│   │   │   └── api.js     # API integration
│   │   ├── App.js         # Main app component with routing
│   │   └── setupProxy.js  # Development proxy configuration
├── server/                # Node.js backend application
│   ├── models/           # Database models and configuration
│   │   └── database.js   # SQLite database setup
│   ├── routes/           # API route handlers
│   │   ├── blogs.js      # Blog CRUD operations
│   │   └── users.js      # User management
│   ├── index.js          # Express server entry point
│   └── .env              # Environment variables
└── package.json          # Root package.json with scripts
```

## 🛠️ Available Scripts

### Root Directory Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the React frontend
- `npm run server` - Start only the Express backend
- `npm run build` - Build React app for production
- `npm start` - Start production server
- `npm run install-deps` - Install dependencies for all packages

### Client Scripts (from client/ directory)

- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Server Scripts (from server/ directory)

- `npm run dev` - Start server with nodemon (auto-restart)
- `npm start` - Start production server

## 🔌 API Endpoints

### Blog Endpoints

- `GET /api/blogs` - Get all blog posts
- `GET /api/blogs/:id` - Get single blog post
- `POST /api/blogs` - Create new blog post
- `PUT /api/blogs/:id` - Update blog post
- `DELETE /api/blogs/:id` - Delete blog post

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Health Check

- `GET /api/health` - Server health status

## 🎨 Tech Stack

### Frontend

- **React 18+** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing and navigation
- **Axios** - HTTP client for API requests
- **TailwindCSS** - Utility-first CSS framework
- **Create React App** - Build tooling and development server

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **SQLite3** - Lightweight, file-based database
- **CORS** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management

### Development Tools

- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Auto-restart server during development
- **HTTP Proxy Middleware** - Proxy API requests during development

## 🔐 Admin Access

For demonstration purposes, use these credentials:

- **Username**: admin
- **Password**: password

⚠️ **Note**: This is a demo authentication system. In production, implement proper password hashing and JWT tokens.

## 🌐 Production Deployment

1. **Build the React application**

   ```bash
   npm run build
   ```

2. **Set production environment**

   ```bash
   export NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

The Express server will serve the React build files and handle API requests.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
```

### Proxy Configuration

The client is configured to proxy API requests to the backend during development via `setupProxy.js`.

## 📝 Features Implemented

### Module 8 Requirements Checklist

- ✅ React frontend with 8 complete pages
- ✅ React Router for navigation and routing
- ✅ Component-based architecture with reusable components
- ✅ Backend API integration using Axios
- ✅ Express server with RESTful API endpoints
- ✅ Database integration with SQLite
- ✅ CRUD operations for blog management
- ✅ Admin dashboard for content management
- ✅ Responsive design with TailwindCSS
- ✅ Development and production configurations
- ✅ Concurrent frontend/backend development setup
- ✅ Production build and deployment setup

### Pages Implemented

1. **Homepage** - Hero section, featured projects, latest blogs
2. **About** - Personal information, skills, experience timeline
3. **Projects** - Project showcase with technologies and links
4. **Blog List** - All blog posts with pagination and search
5. **Blog Detail** - Individual blog post with full content
6. **Contact** - Contact form with validation and social links
7. **Login** - Admin authentication for dashboard access
8. **Admin Dashboard** - Blog management, user management, analytics

### Components Created

- **Header** - Navigation with responsive design
- **Footer** - Site information and social links
- **BlogCard** - Blog post preview component
- **ProjectCard** - Project showcase component

## 🚀 Future Enhancements

- Add JWT-based authentication
- Implement real-time notifications
- Add image upload functionality
- Integrate with external APIs
- Add comprehensive testing suite
- Implement progressive web app features
- Add search and filtering capabilities
- Integrate with a CMS for content management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Metana Full Stack Bootcamp Module 8 assignment.

## 🆘 Support

If you encounter any issues:

1. Check that all dependencies are installed
2. Ensure both frontend and backend servers are running
3. Verify API endpoints are accessible
4. Check browser console for any errors

For additional help, refer to the documentation or contact the development team.

---

**Built with ❤️ for Metana Full Stack Bootcamp - Module 8**
