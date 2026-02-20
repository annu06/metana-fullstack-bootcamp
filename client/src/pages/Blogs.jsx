import { useEffect, useState } from "react";
import { getAllBlogs } from "../api/blogs";
import { Link } from "react-router-dom";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await getAllBlogs();
        setBlogs(data);
      } catch (err) {
        setError("Failed to load blogs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) return <div className="text-center">Loading blogs...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>
      {blogs.length === 0 ? (
        <p className="text-gray-500">No blog posts available yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {blogs.map(blog => (
            <div key={blog.id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{blog.date}</p>
              <p className="text-gray-700 mb-3">{blog.preview}</p>
              <Link to={`/blogs/${blog.id}`} className="text-blue-600 hover:underline">
                Read More
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}