import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      {/* Blog Image */}
      <div className="bg-gray-200 h-48 flex items-center justify-center">
        {blog.image_url ? (
          <img 
            src={blog.image_url} 
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Blog Image</span>
        )}
      </div>

      {/* Blog Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>By {blog.author}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(blog.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition duration-300">
          <Link to={`/blog/${blog.id}`}>
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt || blog.content.substring(0, 150) + '...'}
        </p>

        {/* Read More Link */}
        <Link 
          to={`/blog/${blog.id}`}
          className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition duration-300"
        >
          Read More
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;