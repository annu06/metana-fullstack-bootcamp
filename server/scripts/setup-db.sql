-- Database setup SQL script
-- This is a placeholder for Module 6 backend integration

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;

-- Use the database
USE portfolio_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    preview TEXT,
    author_id INT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_categories junction table
CREATE TABLE IF NOT EXISTS blog_categories (
    blog_id INT,
    category_id INT,
    PRIMARY KEY (blog_id, category_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert default admin user (password should be hashed in real implementation)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@example.com', 'hashed_password_here', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Technology', 'Posts about technology and programming'),
('Tutorial', 'Step-by-step guides and tutorials'),
('Personal', 'Personal thoughts and experiences')
ON DUPLICATE KEY UPDATE name=name;