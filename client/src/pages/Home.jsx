export default function Home() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Welcome to My Portfolio</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">About Me</h3>
          <p className="text-gray-700 mb-4">
            I'm a passionate developer with expertise in modern web technologies.
            I love creating beautiful, functional applications that solve real-world problems.
          </p>
          <p className="text-gray-700">
            This portfolio showcases my work and thoughts through my blog posts and projects.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'Node.js', 'JavaScript', 'TailwindCSS', 'Express', 'MongoDB'].map(skill => (
              <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}