-- PostgreSQL Database Setup for Module 6
-- This script creates the Users and Blogs tables with foreign key relationships

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create Blogs table with foreign key relationship to Users
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Setup complete!