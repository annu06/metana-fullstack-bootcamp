import React from 'react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Me
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Passionate developer, creative problem solver, and lifelong learner
            </p>
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image Placeholder */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg h-96 flex items-center justify-center">
                <div className="text-white text-center">
                  <svg className="h-24 w-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <p className="text-lg font-semibold">Profile Photo</p>
                </div>
              </div>
            </div>

            {/* About Text */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hello, I'm a Full Stack Developer
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  Welcome to my digital space! I'm a passionate full-stack developer with a love for creating 
                  innovative web applications that solve real-world problems. My journey in technology began 
                  several years ago, and I've been constantly learning and evolving ever since.
                </p>
                <p>
                  I specialize in modern web technologies including React, Node.js, and various databases. 
                  I believe in writing clean, maintainable code and creating user experiences that are both 
                  functional and delightful.
                </p>
                <p>
                  When I'm not coding, you can find me exploring new technologies, contributing to open-source 
                  projects, or sharing my knowledge through blog posts and tutorials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Skills & Expertise
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here are the technologies and tools I work with to bring ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Frontend Skills */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Frontend Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React.js & React Hooks</li>
                <li>• JavaScript (ES6+) & TypeScript</li>
                <li>• HTML5 & CSS3</li>
                <li>• Tailwind CSS & Styled Components</li>
                <li>• Responsive Web Design</li>
                <li>• State Management (Redux, Context API)</li>
              </ul>
            </div>

            {/* Backend Skills */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Backend Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js & Express.js</li>
                <li>• RESTful API Development</li>
                <li>• PostgreSQL & MongoDB</li>
                <li>• Authentication & Authorization</li>
                <li>• Server-side Validation</li>
                <li>• API Testing & Documentation</li>
              </ul>
            </div>

            {/* Tools & Others */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tools & Technologies</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Git & GitHub</li>
                <li>• VS Code & Development Tools</li>
                <li>• npm & Package Management</li>
                <li>• Postman & API Testing</li>
                <li>• Deployment & Hosting</li>
                <li>• Agile Development</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              My Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A timeline of my learning and professional development in web development.
            </p>
          </div>

          <div className="space-y-8">
            {/* Timeline Item 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white font-bold">
                  1
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900">Started Learning Web Development</h3>
                <p className="text-primary-600 font-medium">2022</p>
                <p className="text-gray-600 mt-2">
                  Began my journey with HTML, CSS, and JavaScript. Discovered my passion for creating 
                  interactive web experiences and decided to pursue web development seriously.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white font-bold">
                  2
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900">Mastered Frontend Frameworks</h3>
                <p className="text-primary-600 font-medium">2023</p>
                <p className="text-gray-600 mt-2">
                  Dove deep into React.js and modern frontend development. Built several projects 
                  and learned about state management, component architecture, and responsive design.
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white font-bold">
                  3
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900">Full Stack Development</h3>
                <p className="text-primary-600 font-medium">2024</p>
                <p className="text-gray-600 mt-2">
                  Expanded into backend development with Node.js and databases. Started building 
                  complete full-stack applications and learned about API design and server management.
                </p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white font-bold">
                  4
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900">Continuous Learning</h3>
                <p className="text-primary-600 font-medium">Present</p>
                <p className="text-gray-600 mt-2">
                  Currently focusing on advanced topics like performance optimization, testing, 
                  and exploring new technologies. Always excited to learn and grow as a developer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Interests */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beyond Coding
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              When I'm not writing code, here's what keeps me inspired and motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reading & Learning</h3>
              <p className="text-gray-600">
                I love reading tech blogs, documentation, and books about software development and emerging technologies.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                I enjoy participating in developer communities, attending meetups, and helping others learn to code.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                I'm always exploring new technologies and thinking about how they can be used to solve problems.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;