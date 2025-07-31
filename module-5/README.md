# Module 5 - Backend API with Node.js and MongoDB

A functional backend API built with Node.js, Express.js, and MongoDB that implements CRUD operations for Users and Blogs.

## Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **CRUD operations** for Users and Blogs
- **Data validation** and error handling
- **Environment configuration** with dotenv
- **Request logging** with Morgan
- **CORS** enabled for cross-origin requests
- **Database seeding** with sample data

## Project Structure

```
module-5/
├── db/
│   ├── blogQueries.js   # Blog CRUD functions
│   ├── dbconn.js        # Database connection
│   └── userQueries.js   # User CRUD functions
├── routes/
│   ├── blogsRouter.js   # Blog API routes
│   └── userRouter.js    # User API routes
├── scripts/
│   └── seedDb.js        # Database seeding script
├── models/
│   ├── Blog.js          # Blog Mongoose model
│   └── User.js          # User Mongoose model
├── .gitignore
├── config.js            # Environment configuration
├── example.env          # Environment variables template
├── .env                 # Environment variables (not in repo)
├── index.js             # Main server file
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd module-5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `example.env` to `.env`
   - Update the MongoDB connection string in `.env`
   ```bash
   cp example.env .env
   ```

4. **Configure MongoDB**
   - Create a MongoDB Atlas account or install MongoDB locally
   - Update the `MONGODB_URI` in your `.env` file

## Usage

### Start the Server

```bash
# Development mode with nodemon
npm start

# Or directly with node
node index.js
```

The server will start on `http://localhost:3000`

### Seed the Database

```bash
npm run db:seed
```

This will populate the database with sample users and blogs.

## API Endpoints

### Users API (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user by ID |
| DELETE | `/api/users/:id` | Delete user by ID |

#### User Schema
```json
{
  "name": "string (required, 2-50 chars)",
  "email": "string (required, unique, valid email)"
}
```

### Blogs API (`/api/blogs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs?userId=<id>` | Get blogs by user ID |
| GET | `/api/blogs/:id` | Get blog by ID |
| POST | `/api/blogs` | Create new blog |
| PUT | `/api/blogs/:id` | Update blog by ID |
| DELETE | `/api/blogs/:id` | Delete blog by ID |

#### Blog Schema
```json
{
  "title": "string (required, 5-100 chars)",
  "content": "string (required, 10-5000 chars)",
  "user": "ObjectId (required, reference to User)"
}
```

## Testing with Postman

### Create User
```
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Create Blog
```
POST http://localhost:3000/api/blogs
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post...",
  "user": "USER_ID_HERE"
}
```

### Get All Users
```
GET http://localhost:3000/api/users
```

### Get All Blogs
```
GET http://localhost:3000/api/blogs
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/module5_db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Dependencies

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling
- **dotenv**: Environment variable management
- **body-parser**: Parse incoming request bodies
- **morgan**: HTTP request logger
- **cors**: Enable CORS
- **nodemon**: Development dependency for auto-restart

## Error Handling

The API includes comprehensive error handling:
- **Validation errors**: 400 Bad Request
- **Not found errors**: 404 Not Found
- **Server errors**: 500 Internal Server Error
- **Duplicate email**: 400 Bad Request

## Data Validation

- **User validation**: Name (2-50 chars), valid email format
- **Blog validation**: Title (5-100 chars), content (10-5000 chars), valid user reference
- **Mongoose built-in validation** with custom error messages

## Development

### File Structure Guidelines
- **Models**: Define in `/models` directory
- **Routes**: Define in `/routes` directory
- **Database queries**: Define in `/db` directory
- **Scripts**: Define in `/scripts` directory

### Best Practices Implemented
- Separation of concerns
- Environment-based configuration
- Comprehensive error handling
- Input validation
- Request logging
- CORS configuration
- Database connection management

## License

This project is part of the Metana Full Stack Bootcamp curriculum.