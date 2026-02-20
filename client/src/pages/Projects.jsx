export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "A full-stack e-commerce solution built with React and Node.js",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      link: "#"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A productivity app for managing tasks and projects",
      technologies: ["React", "Firebase", "TailwindCSS"],
      link: "#"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Real-time weather information with interactive charts",
      technologies: ["React", "D3.js", "Weather API"],
      link: "#"
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">My Projects</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
            <p className="text-gray-700 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map(tech => (
                <span key={tech} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {tech}
                </span>
              ))}
            </div>
            <a 
              href={project.link} 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Project
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}