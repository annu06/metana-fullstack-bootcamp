# Module 6 - PostgreSQL Backend API

A Node.js backend API using PostgreSQL for structured data storage and relational queries. This project implements a complete CRUD system for Users and Blogs with proper foreign key relationships.

## 🏗️ Project Structure

```
module-6/
├── db/
│   ├── blogQueries.js   # Blog CRUD operations
│   ├── dbconn.js        # Database connection setup
│   └── userQueries.js   # User CRUD operations
├── routes/
│   ├── blogsRouter.js   # Blog API routes
│   └── userRouter.js    # User API routes
├── scripts/
│   ├── initDb.js        # Database initialization script
│   ├── seedDb.js        # Database seeding script
│   └── setup-db.sql     # SQL schema definitions
├── .gitignore
├── config.js            # Configuration management
├── example.env          # Environment variables template
├── .env                 # Environment variables (local)
├── index.js             # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd module-6
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp example.env .env
   ```
   
   Edit `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=module6_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

4. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE module6_db;
   ```

5. **Initialize the database:**
   ```bash
   npm run db:init
   ```

6. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

7. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Blogs Table
```sql
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Users API (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/:id/blogs` | Get user with their blogs |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

#### Create User Example:
```json
POST /api/users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Blogs API (`/api/blogs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs?published=true` | Get published blogs only |
| GET | `/api/blogs?author=1` | Get blogs by author ID |
| GET | `/api/blogs?search=term` | Search blogs by title/content |
| GET | `/api/blogs/:id` | Get blog by ID |
| POST | `/api/blogs` | Create new blog |
| PUT | `/api/blogs/:id` | Update blog |
| PATCH | `/api/blogs/:id/publish` | Toggle publish status |
| DELETE | `/api/blogs/:id` | Delete blog |

#### Create Blog Example:
```json
POST /api/blogs
{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "author_id": 1,
  "published": true
}
```

## 🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run db:init` - Initialize database with tables
- `npm run db:seed` - Seed database with sample data

## 🔧 Configuration

The application uses environment variables for configuration. See `example.env` for all available options:

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 🔍 Key Features

- **Relational Database Design**: Proper foreign key relationships between Users and Blogs
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **SQL Queries**: Efficient PostgreSQL queries with JOINs
- **Error Handling**: Comprehensive error handling and validation
- **Database Triggers**: Automatic timestamp updates
- **Search Functionality**: Full-text search for blogs
- **Data Integrity**: Foreign key constraints and cascading deletes
- **Connection Pooling**: Efficient database connection management

## 🧪 Testing the API

You can test the API using tools like:

- **Postman**: Import the endpoints and test manually
- **curl**: Command-line testing
- **Browser**: For GET endpoints

### Example curl commands:

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Get all published blogs
curl http://localhost:3000/api/blogs?published=true
```

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in `.env` file
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

3. **Permission Errors**:
   - Ensure PostgreSQL user has proper permissions
   - Check database ownership

## 🔮 Future Enhancements

- Authentication and authorization
- Password hashing
- Input validation middleware
- Rate limiting
- API documentation with Swagger
- Unit and integration tests
- Docker containerization

## 📝 Notes

- This backend is designed to work with a React frontend (Module 8)
- All responses follow a consistent JSON format
- Database relationships ensure data integrity
- Prepared statements prevent SQL injection
- Connection pooling optimizes performance

---

**Module 6 Assignment - PostgreSQL Integration Complete** ✅