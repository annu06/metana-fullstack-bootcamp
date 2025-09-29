import React from 'react';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with React frontend, Node.js backend, and Stripe payment integration. Features include user authentication, product catalog, shopping cart, and order management.",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe", "JWT"],
      image: "/images/project1.jpg",
      liveDemo: "https://demo1.example.com",
      github: "https://github.com/yourname/ecommerce-platform",
      featured: true
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features. Built with modern React and Socket.io for real-time communication.",
      technologies: ["React", "Socket.io", "Node.js", "PostgreSQL", "Tailwind CSS"],
      image: "/images/project2.jpg",
      liveDemo: "https://demo2.example.com",
      github: "https://github.com/yourname/task-manager",
      featured: true
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "A responsive weather dashboard that displays current weather conditions and forecasts. Features location-based weather data, interactive charts, and favorite locations management.",
      technologies: ["React", "Chart.js", "Weather API", "Local Storage"],
      image: "/images/project3.jpg",
      liveDemo: "https://demo3.example.com",
      github: "https://github.com/yourname/weather-dashboard",
      featured: false
    },
    {
      id: 4,
      title: "Blog Platform",
      description: "A modern blog platform with content management system, markdown support, and comment functionality. Includes admin dashboard for content management and user engagement analytics.",
      technologies: ["React", "Node.js", "Express", "SQLite", "Markdown"],
      image: "/images/project4.jpg",
      liveDemo: "https://demo4.example.com",
      github: "https://github.com/yourname/blog-platform",
      featured: false
    },
    {
      id: 5,
      title: "Portfolio Website",
      description: "A responsive portfolio website showcasing projects and skills. Features smooth animations, contact form integration, and optimized performance for fast loading times.",
      technologies: ["React", "Tailwind CSS", "Framer Motion", "EmailJS"],
      image: "/images/project5.jpg",
      liveDemo: "https://demo5.example.com",
      github: "https://github.com/yourname/portfolio",
      featured: false
    },
    {
      id: 6,
      title: "Chat Application",
      description: "Real-time chat application with private messaging, group chats, and file sharing capabilities. Built with Socket.io for instant messaging and JWT for secure authentication.",
      technologies: ["React", "Socket.io", "Node.js", "Express", "MongoDB"],
      image: "/images/project6.jpg",
      liveDemo: "https://demo6.example.com",
      github: "https://github.com/yourname/chat-app",
      featured: false
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">My Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A collection of projects that showcase my skills in full-stack development, 
            from concept to deployment.
          </p>
        </div>

        {/* Featured Projects */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Featured Projects</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <span className="text-gray-500">Project Preview</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                  
                  {/* Technologies */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Technologies Used:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <a 
                      href={project.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                      Live Demo
                    </a>
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:border-gray-400 transition duration-300"
                    >
                      View Code
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Projects */}
        <section>
          <h2 className="text-2xl font-semibold mb-8">Other Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <span className="text-gray-500">Project Preview</span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  {/* Technologies - Compact View */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Compact */}
                  <div className="flex space-x-2">
                    <a 
                      href={project.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition duration-300 flex-1 text-center"
                    >
                      Demo
                    </a>
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-semibold hover:border-gray-400 transition duration-300 flex-1 text-center"
                    >
                      Code
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Interested in Working Together?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            I'm always open to discussing new projects and opportunities. 
            Let's create something amazing together!
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get In Touch
            </a>
            <a 
              href="/blog" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition duration-300"
            >
              Read My Blog
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;