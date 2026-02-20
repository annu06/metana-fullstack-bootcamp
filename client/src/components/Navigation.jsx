import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <h1 className="text-xl font-bold">My Portfolio</h1>
      <ul className="flex gap-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/blogs">Blog</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/admin-dash">Admin</Link></li>
      </ul>
    </nav>
  );
}