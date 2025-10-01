# Module 6: PostgreSQL Database Integration

This project demonstrates a complete Node.js backend application with PostgreSQL database integration, featuring relational data models and advanced SQL queries.

## 🏗️ Project Structure

```
module-6/
├── db/
│   ├── blogQueries.js   # Blog CRUD operations with PostgreSQL
│   ├── dbconn.js        # PostgreSQL connection setup
│   └── userQueries.js   # User CRUD operations with PostgreSQL
├── routes/
│   ├── blogsRouter.js   # Blog API endpoints
│   └── userRouter.js    # User API endpoints
├── scripts/
│   ├── initDb.js        # Database initialization script
│   ├── seedDb.js        # Sample data seeding script
│   └── setup-db.sql     # SQL schema definition
├── .gitignore
├── config.js            # Environment configuration
├── example.env          # Environment variables template
├── index.js             # Main application entry point
├── package.json         # Node.js dependencies and scripts
└── README.md            # Project documentation
```

## 🚀 Features

### Database Schema

- **Users Table**: Stores user information with auto-incrementing IDs
- **Blogs Table**: Stores blog posts with foreign key relationships to users
- **Relational Integrity**: Foreign key constraints with CASCADE delete
- **Automatic Timestamps**: Created/updated timestamps with triggers
- **Performance Indexes**: Optimized queries with strategic indexing

### API Endpoints

#### Users API (`/api/users`)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user with blog count
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user details
- `PATCH /api/users/:id/password` - Update user password
- `DELETE /api/users/:id` - Delete user

#### Blogs API (`/api/blogs`)

- `GET /api/blogs` - Get all blogs with author info
- `GET /api/blogs/:id` - Get blog by ID
- `GET /api/blogs/stats` - Get blog statistics
- `GET /api/blogs/search?q=term` - Search blogs by title/content
- `GET /api/blogs/author/:authorId` - Get blogs by specific author
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Advanced Features

- **Password Hashing**: Secure bcrypt password encryption
- **Connection Pooling**: Efficient PostgreSQL connection management
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Input validation and sanitization
- **JOIN Queries**: Relational data fetching with SQL JOINs
- **Search Functionality**: Full-text search across blog content
- **Statistics**: Aggregated data queries for insights

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### 1. Database Setup

1. **Install PostgreSQL** locally and start the service
2. **Create Database**:
   ```bash
   createdb module6_db
   ```
3. **Configure Environment**:
   ```bash
   cp example.env .env
   # Edit .env with your PostgreSQL credentials
   ```

### 2. Application Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Initialize Database**:

   ```bash
   npm run db:init
   ```

3. **Seed Sample Data**:

   ```bash
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file based on `example.env`:

```env
# PostgreSQL Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=module6_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 📝 API Usage Examples

### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Create Blog

```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog",
    "content": "This is my first blog post content.",
    "author_id": 1
  }'
```

### Search Blogs

```bash
curl "http://localhost:3000/api/blogs/search?q=PostgreSQL"
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Blogs Table

```sql
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔍 Key PostgreSQL Features Used

1. **Serial Primary Keys**: Auto-incrementing unique identifiers
2. **Foreign Key Constraints**: Maintaining referential integrity
3. **CASCADE Delete**: Automatic cleanup of related records
4. **Indexes**: Performance optimization for frequent queries
5. **Triggers**: Automatic timestamp updates
6. **JOIN Queries**: Relational data retrieval
7. **Aggregate Functions**: COUNT, AVG for statistics
8. **Full-text Search**: ILIKE for case-insensitive search
9. **Connection Pooling**: Efficient connection management
10. **Parameterized Queries**: SQL injection prevention

## 🚀 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:init` - Initialize database tables
- `npm run db:seed` - Seed sample data

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Data type and format validation
- **Error Handling**: Secure error messages without data leakage
- **Connection Security**: Environment-based credentials

## 📊 Performance Optimizations

- **Connection Pooling**: Reusable database connections
- **Strategic Indexes**: Fast query execution
- **Efficient Queries**: Optimized SQL with JOINs
- **Connection Timeout**: Automatic cleanup of idle connections

## 🔗 Frontend Integration Ready

This backend is designed to integrate seamlessly with React frontends in Module 8:

- Standardized JSON responses
- RESTful API design
- CORS enabled
- Consistent error handling
- Comprehensive endpoint documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Module 6 Assignment**: ✅ Complete PostgreSQL Integration

- ✅ PostgreSQL database schema and setup
- ✅ Relational data models with foreign keys
- ✅ CRUD operations with SQL queries
- ✅ JOIN queries for related data
- ✅ Advanced features (search, statistics, validation)
- ✅ Production-ready backend API
