const express = require('express');
const router = express.Router();

// Mock data for demonstration
const mockBlogs = [
  {
    id: 1,
    title: 'Getting Started with React Hooks',
    excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your components.',
    content: 'React Hooks revolutionized the way we write React components...',
    author: 'John Doe',
    category: 'web-development',
    tags: ['react', 'hooks', 'javascript'],
    publishedAt: '2024-01-15T10:00:00Z',
    featured: true,
    views: 1250,
    comments: 23
  },
  {
    id: 2,
    title: 'Building RESTful APIs with Node.js',
    excerpt: 'A comprehensive guide to creating robust APIs using Node.js and Express.',
    content: 'Building APIs is a crucial skill for modern web developers...',
    author: 'Jane Smith',
    category: 'programming',
    tags: ['nodejs', 'api', 'express'],
    publishedAt: '2024-01-10T14:30:00Z',
    featured: false,
    views: 890,
    comments: 15
  },
  {
    id: 3,
    title: 'Advanced JavaScript Concepts',
    excerpt: 'Dive deep into closures, prototypes, and asynchronous programming.',
    content: 'JavaScript is a powerful language with many advanced features...',
    author: 'Mike Johnson',
    category: 'programming',
    tags: ['javascript', 'advanced', 'concepts'],
    publishedAt: '2024-01-05T09:15:00Z',
    featured: true,
    views: 2100,
    comments: 45
  }
];

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    bio: 'Full-stack developer with 5+ years of experience',
    avatar: null,
    joinedAt: '2023-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'author',
    bio: 'Frontend specialist and UI/UX enthusiast',
    avatar: null,
    joinedAt: '2023-03-20T14:30:00Z'
  }
];

const mockProjects = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'A full-stack e-commerce solution built with React and Node.js',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    category: 'web-development',
    featured: true,
    githubUrl: 'https://github.com/example/ecommerce',
    liveUrl: 'https://ecommerce-demo.com',
    imageUrl: null,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates',
    technologies: ['Vue.js', 'Socket.io', 'PostgreSQL'],
    category: 'productivity',
    featured: false,
    githubUrl: 'https://github.com/example/taskmanager',
    liveUrl: 'https://taskmanager-demo.com',
    imageUrl: null,
    createdAt: '2023-12-15T00:00:00Z'
  }
];

// Blog Routes
router.get('/blogs', (req, res) => {
  try {
    const { category, search, limit } = req.query;
    let filteredBlogs = [...mockBlogs];

    if (category) {
      filteredBlogs = filteredBlogs.filter(blog => blog.category === category);
    }

    if (search) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (limit) {
      filteredBlogs = filteredBlogs.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: filteredBlogs,
      total: filteredBlogs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

router.get('/blogs/:id', (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const blog = mockBlogs.find(b => b.id === blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
});

router.post('/blogs', (req, res) => {
  try {
    const { title, excerpt, content, category, tags, featured } = req.body;
    
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, excerpt, content, category'
      });
    }

    const newBlog = {
      id: mockBlogs.length + 1,
      title,
      excerpt,
      content,
      category,
      tags: tags || [],
      featured: featured || false,
      author: 'Admin User',
      publishedAt: new Date().toISOString(),
      views: 0,
      comments: 0
    };

    mockBlogs.push(newBlog);

    res.status(201).json({
      success: true,
      data: newBlog,
      message: 'Blog created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
});

// User Routes
router.get('/users', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.get('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Project Routes
router.get('/projects', (req, res) => {
  try {
    const { category, featured } = req.query;
    let filteredProjects = [...mockProjects];

    if (category) {
      filteredProjects = filteredProjects.filter(project => project.category === category);
    }

    if (featured === 'true') {
      filteredProjects = filteredProjects.filter(project => project.featured);
    }

    res.json({
      success: true,
      data: filteredProjects,
      total: filteredProjects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

router.get('/projects/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = mockProjects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;