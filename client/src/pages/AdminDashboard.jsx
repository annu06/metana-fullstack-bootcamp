import { useState } from "react";

export default function AdminDashboard() {
  const [blogs] = useState([
    { id: 1, title: "Getting Started with React", status: "Published", date: "2025-01-15" },
    { id: 2, title: "Advanced JavaScript Concepts", status: "Draft", date: "2025-01-10" },
    { id: 3, title: "Building REST APIs", status: "Published", date: "2025-01-05" }
  ]);

  const [newBlog, setNewBlog] = useState({
    title: '',
    content: '',
    status: 'Draft'
  });

  const handleInputChange = (e) => {
    setNewBlog({
      ...newBlog,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle blog creation here
    console.log('New blog:', newBlog);
    alert('Blog post created! (This is a demo)');
    setNewBlog({ title: '', content: '', status: 'Draft' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Blog List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Existing Blog Posts</h3>
          <div className="space-y-3">
            {blogs.map(blog => (
              <div key={blog.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold">{blog.title}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">{blog.date}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    blog.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {blog.status}
                  </span>
                </div>
                <div className="mt-3 space-x-2">
                  <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Blog */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Create New Blog Post</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newBlog.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={newBlog.content}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={newBlog.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Blog Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}