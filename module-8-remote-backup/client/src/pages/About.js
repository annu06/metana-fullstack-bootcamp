import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About Me</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate full-stack developer with a love for creating innovative web solutions
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="bg-gray-200 w-80 h-80 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Professional Photo</span>
            </div>
          </div>

          {/* About Text */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Hello, I'm [Your Name]</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                I'm a passionate full-stack developer with over [X] years of experience creating 
                web applications that make a difference. My journey in technology began with a 
                curiosity about how things work and has evolved into a career dedicated to 
                building innovative solutions.
              </p>
              <p>
                I specialize in modern JavaScript frameworks and have extensive experience with 
                React, Node.js, and various database technologies. I'm particularly interested 
                in creating user-friendly interfaces and scalable backend systems.
              </p>
              <p>
                When I'm not coding, you can find me exploring new technologies, contributing to 
                open-source projects, or sharing knowledge through my blog and community involvement.
              </p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Skills & Technologies</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Frontend Development</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>React.js</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>JavaScript</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>CSS/Tailwind</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>HTML5</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Backend Development</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Node.js</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Express.js</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>MongoDB</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>SQL</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Tools & Others</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Git/GitHub</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>VS Code</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Docker</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>AWS</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Timeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Full Stack Developer</h3>
                    <p className="text-gray-600">Tech Company Inc.</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">2022 - Present</span>
                </div>
                <ul className="text-gray-600 space-y-2">
                  <li>• Developed and maintained multiple web applications using React and Node.js</li>
                  <li>• Collaborated with cross-functional teams to deliver high-quality software solutions</li>
                  <li>• Implemented responsive designs and optimized application performance</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Frontend Developer</h3>
                    <p className="text-gray-600">Startup Solutions</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">2020 - 2022</span>
                </div>
                <ul className="text-gray-600 space-y-2">
                  <li>• Built user interfaces for various client projects using modern JavaScript frameworks</li>
                  <li>• Worked closely with designers to implement pixel-perfect designs</li>
                  <li>• Improved application performance and user experience</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Let's Work Together</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            I'm always interested in new opportunities and exciting projects. 
            Let's discuss how we can bring your ideas to life!
          </p>
          <div className="space-x-4">
            <a 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get In Touch
            </a>
            <a 
              href="/projects" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition duration-300"
            >
              View My Work
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;