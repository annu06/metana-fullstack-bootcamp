# Module 7 - Personal Portfolio & Blog Application

A responsive personal portfolio and blog application built with TailwindCSS and Express.js, designed to showcase developer skills and blog content.

## 🚀 Live Demo

The application is running on: `http://localhost:3001`

## 📁 Project Structure

```
module-7/
├── node_modules/
├── public/
│   ├── assets/
│   │   └── images/           # Image assets
│   ├── index.html           # Homepage
│   ├── blogs.html           # Blog list page
│   ├── singleBlog.html      # Individual blog post
│   └── adminDashboard.html  # Admin dashboard
├── server.js                # Express server configuration
├── figma_link.txt          # Figma design link
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 🎨 Design Decisions

### Color Scheme
- **Primary**: Blue (#3B82F6) - Professional and trustworthy
- **Secondary**: Dark Blue (#1E40AF) - For hover states and emphasis
- **Accent**: Amber (#F59E0B) - For highlights and call-to-action elements
- **Background**: Light gray (#F9FAFB) - Clean and modern

### Typography
- Clean, modern sans-serif fonts for readability
- Proper hierarchy with varying font weights and sizes
- Consistent spacing and line heights

### Layout Philosophy
- **Mobile-first approach**: Responsive design that works on all devices
- **Clean and minimal**: Focus on content without distractions
- **Professional aesthetic**: Suitable for a developer portfolio
- **Intuitive navigation**: Easy to find and access different sections

### Component Design
- **Reusable cards**: Consistent styling across blog posts and projects
- **Interactive elements**: Hover effects on buttons, links, and cards
- **Clear CTAs**: Prominent buttons and links for user actions
- **Accessible design**: Proper contrast ratios and semantic HTML

## 🛠️ Technologies Used

- **Frontend**: HTML5, TailwindCSS (via CDN)
- **Backend**: Node.js, Express.js
- **Styling**: TailwindCSS utility classes
- **Icons**: Heroicons (SVG icons)

## 📱 Pages Overview

### 1. Homepage (`index.html`)
- Hero section with personal introduction
- About Me section
- Skills/Tech Stack showcase
- Featured projects preview
- Blog posts preview
- Contact information

### 2. Blog List (`blogs.html`)
- Grid layout of blog posts
- Search and filter functionality
- Pagination for better performance
- Newsletter subscription
- Category filtering

### 3. Blog Detail (`singleBlog.html`)
- Full blog post content
- Author information
- Social sharing buttons
- Related articles
- Code syntax highlighting
- Reading time estimation

### 4. Admin Dashboard (`adminDashboard.html`)
- Overview statistics
- Blog post management
- User management
- Content creation interface
- Analytics dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd module_7
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3001`

## 🌐 Available Routes

- **Homepage**: `http://localhost:3001/`
- **Blog List**: `http://localhost:3001/blogs`
- **Single Blog**: `http://localhost:3001/blog/*`
- **Admin Dashboard**: `http://localhost:3001/admin`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile devices** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px and above)

### Breakpoints Used
- `sm:` 640px and up
- `md:` 768px and up
- `lg:` 1024px and up
- `xl:` 1280px and up

## 🎯 Key Features

### Interactive Elements
- Smooth hover transitions
- Responsive navigation menu
- Interactive buttons and links
- Card hover effects
- Form focus states

### Content Management
- Dummy blog data for demonstration
- Admin interface for content management
- User management system
- Analytics dashboard

### Performance Optimizations
- Minimal CSS framework usage
- Optimized images (SVG icons)
- Clean HTML structure
- Fast loading times

## 🔮 Future Enhancements (Module 8)

This static implementation will be converted to React components in Module 8:
- Component-based architecture
- State management
- Dynamic routing
- API integration
- Real-time updates

## 📝 Development Notes

### TailwindCSS Configuration
- Using CDN version for quick setup
- Custom color palette defined in script tag
- Utility-first approach for styling
- Responsive design utilities

### Express Server
- Serves static files from `public` directory
- Simple routing for different pages
- Error handling for 404 pages
- Development-friendly logging

## 🤝 Contributing

This is an educational project for Module 7 of the Metana Full-Stack Bootcamp. Future improvements and React integration will be implemented in subsequent modules.

## 📄 License

This project is part of the Metana Full-Stack Bootcamp curriculum.

---

**Note**: Remember to add your Figma design link to `figma_link.txt` before submission.