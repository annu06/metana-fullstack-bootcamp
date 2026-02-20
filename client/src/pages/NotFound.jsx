import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-4">Page Not Found</h3>
      <p className="text-gray-700 mb-6">
        Sorry, the page you are looking for doesn't exist.
      </p>
      <Link 
        to="/" 
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}