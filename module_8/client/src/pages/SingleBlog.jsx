import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogById } from '../api/blogs';

const SingleBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  // Mock data for demonstration (replace with actual API call)
  const mockBlogs = [
    {
      id: 1,
      title: 'Getting Started with React Hooks',
      excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components. This comprehensive guide covers useState, useEffect, and custom hooks.',
      content: `
        <h2>Introduction to React Hooks</h2>
        <p>React Hooks revolutionized the way we write React components by allowing us to use state and other React features in functional components. Before hooks, we had to use class components for any stateful logic.</p>
        
        <h3>What are React Hooks?</h3>
        <p>Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don't work inside classes — they let you use React without classes.</p>
        
        <h3>The useState Hook</h3>
        <p>The useState hook is the most commonly used hook. It allows you to add state to functional components:</p>
        <pre><code>import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}</code></pre>
        
        <h3>The useEffect Hook</h3>
        <p>The useEffect hook lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React classes:</p>
        <pre><code>import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}</code></pre>
        
        <h3>Custom Hooks</h3>
        <p>Custom hooks are a mechanism to reuse stateful logic between React components. A custom hook is a JavaScript function whose name starts with "use" and that may call other hooks:</p>
        <pre><code>import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}</code></pre>
        
        <h3>Best Practices</h3>
        <ul>
          <li>Only call hooks at the top level of your React function</li>
          <li>Only call hooks from React function components or custom hooks</li>
          <li>Use the ESLint plugin for hooks to enforce these rules</li>
          <li>Extract component logic into custom hooks when it becomes complex</li>
        </ul>
        
        <h3>Conclusion</h3>
        <p>React Hooks provide a more direct API to the React concepts you already know. They offer a powerful and flexible way to compose component logic, making your code more reusable and easier to test.</p>
      `,
      author: 'John Doe',
      category: 'web-development',
      tags: ['React', 'JavaScript', 'Hooks'],
      publishedAt: '2024-01-15',
      updatedAt: '2024-01-16',
      readTime: 8,
      image: 'from-blue-400 to-blue-600',
      featured: true
    },
    {
      id: 2,
      title: 'Building RESTful APIs with Node.js and Express',
      excerpt: 'A step-by-step guide to creating robust RESTful APIs using Node.js and Express framework. Includes authentication, validation, and best practices.',
      content: `
        <h2>Introduction to RESTful APIs</h2>
        <p>REST (Representational State Transfer) is an architectural style for designing networked applications. In this guide, we'll build a complete RESTful API using Node.js and Express.</p>
        
        <h3>Setting Up the Project</h3>
        <p>First, let's initialize our Node.js project and install the necessary dependencies:</p>
        <pre><code>npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors helmet</code></pre>
        
        <h3>Creating the Express Server</h3>
        <p>Let's create a basic Express server:</p>
        <pre><code>const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});</code></pre>
        
        <h3>Implementing CRUD Operations</h3>
        <p>Let's implement the basic CRUD operations for a blog API:</p>
        <pre><code>// GET all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single blog
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});</code></pre>
        
        <h3>Authentication and Authorization</h3>
        <p>Implementing JWT-based authentication for protected routes:</p>
        <pre><code>const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};</code></pre>
        
        <h3>Best Practices</h3>
        <ul>
          <li>Use proper HTTP status codes</li>
          <li>Implement input validation</li>
          <li>Handle errors gracefully</li>
          <li>Use environment variables for sensitive data</li>
          <li>Implement rate limiting</li>
          <li>Add comprehensive logging</li>
        </ul>
      `,
      author: 'Jane Smith',
      category: 'programming',
      tags: ['Node.js', 'Express', 'API'],
      publishedAt: '2024-01-10',
      updatedAt: '2024-01-11',
      readTime: 12,
      image: 'from-green-400 to-green-600',
      featured: false
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox: When to Use Which',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox, and knowing when to use each layout method for optimal web design.',
      content: `
        <h2>CSS Grid vs Flexbox: The Ultimate Guide</h2>
        <p>Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes. Understanding when to use each one is crucial for effective web design.</p>
        
        <h3>What is Flexbox?</h3>
        <p>Flexbox is a one-dimensional layout method for laying out items in rows or columns. Items flex to fill additional space and shrink to fit into smaller spaces.</p>
        
        <h3>What is CSS Grid?</h3>
        <p>CSS Grid is a two-dimensional layout system that can handle both columns and rows. It's designed for larger scale layouts and gives you precise control over both dimensions.</p>
        
        <h3>When to Use Flexbox</h3>
        <ul>
          <li>Navigation bars</li>
          <li>Centering content</li>
          <li>Card layouts</li>
          <li>Media objects</li>
          <li>Form controls</li>
        </ul>
        
        <h3>When to Use CSS Grid</h3>
        <ul>
          <li>Page layouts</li>
          <li>Complex grid systems</li>
          <li>Overlapping elements</li>
          <li>Asymmetrical layouts</li>
        </ul>
        
        <h3>Practical Examples</h3>
        <p>Here's a simple flexbox example for centering content:</p>
        <pre><code>.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}</code></pre>
        
        <p>And here's a CSS Grid example for a basic page layout:</p>
        <pre><code>.grid-container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 200px 1fr;
  min-height: 100vh;
}</code></pre>
      `,
      author: 'Mike Johnson',
      category: 'web-development',
      tags: ['CSS', 'Grid', 'Flexbox'],
      publishedAt: '2024-01-08',
      updatedAt: '2024-01-08',
      readTime: 6,
      image: 'from-purple-400 to-purple-600',
      featured: true
    }
  ];

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // Try to fetch from API, fallback to mock data
        try {
          const response = await getBlogById(id);
          setBlog(response.data || response);
        } catch (apiError) {
          console.log('API not available, using mock data');
          const mockBlog = mockBlogs.find(blog => blog.id === parseInt(id));
          if (mockBlog) {
            setBlog(mockBlog);
          } else {
            setError('Blog not found');
          }
        }
      } catch (err) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  useEffect(() => {
    if (blog) {
      // Get related blogs (same category, excluding current blog)
      const related = mockBlogs
        .filter(b => b.category === blog.category && b.id !== blog.id)
        .slice(0, 3);
      setRelatedBlogs(related);
    }
  }, [blog]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blogs"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${blog.image} text-white py-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center justify-center space-x-2 text-primary-100">
                <li>
                  <Link to="/" className="hover:text-white transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <Link to="/blogs" className="hover:text-white transition-colors duration-200">
                    Blog
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li className="text-white">{blog.title}</li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {blog.title}
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
              {blog.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center space-x-6 text-primary-100">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">
                    {blog.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{blog.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={createMarkup(blog.content)}
              className="blog-content"
            />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full hover:bg-primary-200 transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary-700 text-xl font-semibold">
                  {blog.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{blog.author}</h3>
                <p className="text-gray-600">Full-stack Developer & Technical Writer</p>
                <p className="text-sm text-gray-500 mt-1">
                  Published on {formatDate(blog.publishedAt)}
                  {blog.updatedAt !== blog.publishedAt && (
                    <span> • Updated on {formatDate(blog.updatedAt)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <Link
                to="/blogs"
                className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                All Blogs
                <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Articles
              </h2>
              <p className="text-lg text-gray-600">
                You might also be interested in these articles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  to={`/blogs/${relatedBlog.id}`}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`h-48 bg-gradient-to-r ${relatedBlog.image} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="font-semibold">Article</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {relatedBlog.excerpt.length > 100 
                        ? `${relatedBlog.excerpt.substring(0, 100)}...` 
                        : relatedBlog.excerpt
                      }
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
                        {relatedBlog.readTime} min read
                      </span>
                      <span className="text-primary-600 text-sm font-semibold group-hover:text-primary-700">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom Styles for Blog Content */}
      <style jsx>{`
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: #4b5563;
        }
        .blog-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .blog-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .blog-content code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default SingleBlog;