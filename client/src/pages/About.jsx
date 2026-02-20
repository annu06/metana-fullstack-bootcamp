export default function About() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">About Me</h2>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Background</h3>
          <p className="text-gray-700 mb-4">
            I'm a passionate full-stack developer with over 3 years of experience in creating 
            web applications. I specialize in modern JavaScript frameworks and have a strong 
            foundation in both frontend and backend technologies.
          </p>
          <p className="text-gray-700">
            My journey in programming started with curiosity about how websites work, and it 
            has evolved into a career where I get to solve complex problems and build solutions 
            that make a difference.
          </p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Experience</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Senior Developer</h4>
              <p className="text-gray-600">Tech Company | 2022 - Present</p>
              <p className="text-gray-700">Leading development of web applications using React and Node.js</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Frontend Developer</h4>
              <p className="text-gray-600">Startup Inc | 2020 - 2022</p>
              <p className="text-gray-700">Built responsive user interfaces and improved user experience</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Education</h3>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold">Bachelor of Computer Science</h4>
            <p className="text-gray-600">University Name | 2016 - 2020</p>
            <p className="text-gray-700">Graduated with honors, specialized in software engineering</p>
          </div>
        </div>
      </div>
    </section>
  );
}