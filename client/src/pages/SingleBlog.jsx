import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById } from "../api/blogs";

export default function SingleBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBlog() {
      try {
        const data = await getBlogById(id);
        setBlog(data);
      } catch (err) {
        setError("Failed to load blog post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      loadBlog();
    }
  }, [id]);

  if (loading) return <div className="text-center">Loading blog post...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!blog) return <div className="text-center">Blog post not found</div>;

  return (
    <article className="max-w-4xl mx-auto">
      <Link to="/blogs" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Blogs
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        <div className="text-gray-600 mb-4">
          <span>Published on {blog.date}</span>
          {blog.author && <span> by {blog.author}</span>}
        </div>
        {blog.tags && (
          <div className="flex gap-2 mb-4">
            {blog.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose max-w-none">
        {blog.content ? (
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        ) : (
          <p className="text-gray-700">
            This is a sample blog post. In a real application, this would contain 
            the full content of the blog post fetched from your backend API.
          </p>
        )}
      </div>
    </article>
  );
}