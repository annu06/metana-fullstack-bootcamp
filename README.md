# Module 8: React Frontend Integration

## Assignment Overview

This project implements the frontend of a personal portfolio application using React, integrating with backend APIs and implementing UI/UX designs. Built as part of the Metana Full-Stack Bootcamp Module 8 assignment.

## Assignment Objectives Completed

✅ Built React frontend implementing UI/UX designs from Module 7  
✅ Integrated React components with backend API for dynamic data  
✅ Implemented state management for data flow between components  
✅ Set up React Router for navigation between different views  
✅ Connected frontend to Node.js backend from Module 6

## Folder Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── blogs.js
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   └── Navigation.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Blogs.jsx
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   ├── Projects.jsx
│   │   ├── SingleBlog.jsx
│   │   ├── NotFound.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupProxy.js
│   └── setupTests.js
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── tailwind.config.js

server/
├── db/
│   ├── blogQueries.js
│   ├── dbconn.js
│   └── userQueries.js
├── routes/
│   ├── blogsRouter.js
│   └── userRouter.js
├── scripts/
│   ├── initDb.js
│   ├── seedDb.js
│   └── setup-db.sql
├── .gitignore
├── config.js
├── example.env
├── index.js
├── package.json
└── package-lock.json
```

## React Components and Pages

### Pages (with exact routes as specified)

- **Homepage** (`/`) - Implements all sections from Module 7 design
- **Blogs** (`/blogs`) - Displays all blog posts with API integration
- **Projects** (`/projects`) - Showcases portfolio projects
- **About** (`/about`) - Personal background and experience
- **Contact** (`/contact`) - Contact form and details
- **Single Blog** (`/blogs/:id`) - Individual blog post view
- **Admin Dashboard** (`/admin-dash`) - Blog management interface
- **Not Found** (`*`) - 404 page for unknown routes

### Components

- **Navigation.jsx** - Main navigation bar with links to all pages
- **Header.jsx** - Page header with logo and title
- **Footer.jsx** - Site footer with copyright and links
- **Layout.jsx** - Wrapper component ensuring consistent structure

## Backend Integration

### API Functions (`src/api/blogs.js`)

- `getAllBlogs()` - Fetches all blog posts from `/api/blogs`
- `getBlogById(id)` - Fetches specific blog post from `/api/blogs/:id`

### Proxy Configuration

- **setupProxy.js** - Uses `http-proxy-middleware` to forward API calls
- All `/api` requests proxied to `http://localhost:3000`
- Package.json includes proxy configuration

## Technologies Used

### Frontend

- React 19.2.0 (created with create-react-app)
- React Router DOM for navigation
- Axios for API requests
- TailwindCSS for styling
- HTTP Proxy Middleware for API forwarding

### Backend

- Node.js with Express.js
- Modular route structure (blogsRouter, userRouter)
- Database abstraction layer (ready for Module 6 integration)
- Production build serving capability

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm package manager

### Installation

1. Navigate to the module-8 directory
2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```
3. Install server dependencies:
   ```bash
   cd ../server
   npm install
   ```

### Development Setup

#### Running with Concurrently (Recommended)

The frontend includes a `dev` script that runs both client and server simultaneously:

```bash
cd client
npm run dev
```

This will start:

- Backend server on `http://localhost:3000`
- Frontend development server on `http://localhost:3001`

#### Running Separately

**Start the backend:**

```bash
cd server
npm start
```

**Start the frontend (in another terminal):**

```bash
cd client
npm start
```

### Production Build

#### Frontend Build

```bash
cd client
npm run build
```

#### Production Deployment

The backend includes scripts for production:

```bash
cd server
npm run prod
```

This will:

1. Build the frontend (`npm run build:frontend`)
2. Set NODE_ENV to production
3. Serve the React build files through Express

## API Integration

### Proxy Configuration

- `setupProxy.js` forwards all `/api` requests to backend
- Frontend package.json includes proxy: `"http://localhost:3000"`
- Uses `http-proxy-middleware` for development

### API Endpoints

- `GET /api/blogs` - Retrieve all blog posts
- `GET /api/blogs/:id` - Retrieve specific blog post
- `POST /api/blogs` - Create new blog post
- `GET /api/health` - Server health check

## State Management

- React's built-in useState and useEffect hooks
- Axios for HTTP requests and data fetching
- Component-level state management
- Props for data flow between components

## Routing Implementation

React Router DOM setup with exact routes:

- `/` → Home page
- `/blogs` → Blog listing
- `/projects` → Projects showcase
- `/about` → About page
- `/contact` → Contact form
- `/blogs/:id` → Individual blog view
- `/admin-dash` → Admin dashboard
- `*` → 404 Not Found

## Module 6 Integration Notes

This frontend is designed to integrate with the backend developed in Module 6:

- Database queries abstracted in `/server/db/` folder
- Router modules ready for database connection
- Configuration setup for environment variables
- Placeholder structure matching Module 6 specifications

## Assignment Deliverables Completed

✅ React app with all components integrated with backend  
✅ Complete folder structure following specifications  
✅ Fully functional pages with proper routing  
✅ GitHub repository with detailed documentation  
✅ Concurrently setup for development workflow  
✅ Production build configuration  
✅ API integration with Axios  
✅ Proxy middleware configuration

## Development Notes

- TailwindCSS configured for styling consistency
- Error handling implemented for API failures
- Responsive design for mobile compatibility
- Modular component architecture for maintainability

## Submission Information

- **Repository**: metana-fullstack-bootcamp/module-8
- **Branch**: main
- **Completed**: October 2025
- **Assignment**: Module 8 - React Frontend Integration
