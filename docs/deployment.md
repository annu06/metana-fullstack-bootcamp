# Application Deployment Guide

This guide covers deploying your full-stack application to the EC2 instance, including cloning the repository, installing dependencies, and configuring the production environment.

## Prerequisites

- EC2 instance with Ubuntu 22.04 LTS
- Node.js and npm installed via NVM (run `scripts/setup-server.sh` to automate)
- Git configured with SSH keys
- Nginx installed and running
- PM2 installed globally for your deploy user

## Step 1: Prepare Deployment Environment

### 1.1 Create Application Directory

```bash
# Navigate to web directory
cd /var/www/html

# Create application directory
sudo mkdir -p myapp
sudo chown -R $USER:$USER myapp
cd myapp
```

### 1.2 Set Up Environment Variables

```bash
# Create environment file
nano .env
```

**Example .env file**:
```env
# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration (adjust based on your setup)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_production
DB_USER=myapp_user
DB_PASSWORD=secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# API Configuration
API_BASE_URL=https://yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com

# Email Configuration (if applicable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload Configuration
UPLOAD_DIR=/var/www/html/myapp/uploads
MAX_FILE_SIZE=10485760

# Redis Configuration (if applicable)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/app
```

### 1.3 Secure Environment File

```bash
# Set proper permissions
chmod 600 .env

# Verify permissions
ls -la .env
```

## Step 2: Clone Your Repository

### 2.1 Clone via SSH (Recommended)

```bash
# Clone your repository
git clone git@github.com:yourusername/your-repo-name.git .

# Or if cloning to a specific directory
git clone git@github.com:yourusername/your-repo-name.git /var/www/html/myapp
```

### 2.2 Clone via HTTPS (Alternative)

```bash
# Clone using HTTPS
git clone https://github.com/yourusername/your-repo-name.git .

# Configure Git credentials (if needed)
git config credential.helper store
```

### 2.3 Verify Repository

```bash
# Check repository status
git status

# View repository structure
ls -la

# Check current branch
git branch
```

## Step 3: Install Dependencies

### 3.1 Backend Dependencies

```bash
# Navigate to backend directory (adjust path as needed)
cd /var/www/html/myapp

# Install production dependencies
npm ci --only=production

# Or if you need dev dependencies for building
npm install
```

### 3.2 Frontend Dependencies (if separate)

```bash
# Navigate to frontend directory
cd frontend  # or client, or wherever your frontend code is

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to appropriate location
sudo cp -r build/* /var/www/html/
# Or configure Nginx to serve from build directory
```

### 3.3 Handle Build Process

```bash
# If you have a build script in package.json
npm run build

# If you need to compile TypeScript
npm run compile

# If you have database migrations
npm run migrate

# If you need to seed the database
npm run seed
```

## Step 4: Database Setup (if applicable)

### 4.1 PostgreSQL Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE myapp_production;
CREATE USER myapp_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE myapp_production TO myapp_user;
\q

# Test connection
psql -h localhost -U myapp_user -d myapp_production
```

### 4.2 Run Database Migrations

```bash
# Run migrations (adjust command based on your setup)
npm run migrate

# Or using a specific migration tool
npx sequelize-cli db:migrate
# or
npx prisma migrate deploy
# or
npm run knex migrate:latest
```

### 4.3 Seed Database (if needed)

```bash
# Seed with initial data
npm run seed

# Or using specific seeding commands
npx sequelize-cli db:seed:all
```

## Step 5: Test Application Locally

### 5.1 Start Application in Development Mode

```bash
# Start the application (behind Nginx reverse proxy on port 80/443)
npm start

# Or if you have a dev script
npm run dev

# Check if application is running
curl http://localhost:3000
```

### 5.2 Test API Endpoints

```bash
# Test health check endpoint
curl http://localhost:3000/health

# Test API endpoints
curl http://localhost:3000/api/users

# Test with authentication (if applicable)
curl -H "Authorization: Bearer your_token" http://localhost:3000/api/protected
```

### 5.3 Check Logs

```bash
# View application logs
tail -f logs/app.log

# Or check console output
# Application should be running without errors
```

## Step 6: Configure PM2 for Production

### 6.1 Create PM2 Ecosystem File

```bash
# Create PM2 configuration
nano ecosystem.config.js
```

**Example ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'myapp',
    script: './server.js', // or './dist/server.js' for TypeScript
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/app/err.log',
    out_file: '/var/log/app/out.log',
    log_file: '/var/log/app/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 6.2 Start Application with PM2

```bash
# Stop application if running
ctrl+c  # if running in foreground

# Start with PM2
pm2 start ecosystem.config.js --env production

# Or start directly
pm2 start server.js --name "myapp" --env production

# Check PM2 status
pm2 status

# View logs
pm2 logs myapp

# Monitor in real-time
pm2 monit
```

### 6.3 Configure PM2 Startup

```bash
# Generate startup script
pm2 startup

# Follow the instructions provided (usually run a sudo command)
# Example output:
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.17.0/bin /home/ubuntu/.nvm/versions/node/v18.17.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save current PM2 processes
pm2 save

# Test startup (optional)
sudo systemctl status pm2-ubuntu
```

## Step 7: Configure Static File Serving

### 7.1 Set Up Static Files Directory

```bash
# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create public assets directory
mkdir -p public
cp -r frontend/build/* public/  # if you have a separate frontend build
```

### 7.2 Configure Express for Static Files (if applicable)

**Example Express configuration**:
```javascript
// In your server.js or app.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React app (if single-page application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

## Step 8: Health Checks and Monitoring

### 8.1 Create Health Check Endpoint

**Example health check**:
```javascript
// Add to your Express app
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

### 8.2 Test Health Check

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return JSON with status information
```

### 8.3 Set Up Log Monitoring

```bash
# Create log monitoring script
cat > ~/check-app.sh << 'EOF'
#!/bin/bash
echo "=== Application Status ==="
pm2 status
echo "\n=== Recent Logs ==="
pm2 logs myapp --lines 10
echo "\n=== Health Check ==="
curl -s http://localhost:3000/health | jq .
EOF

chmod +x ~/check-app.sh
```

## Step 9: Performance Optimization

### 9.1 Configure Node.js Performance

```bash
# Set Node.js memory limits in PM2
pm2 delete myapp
pm2 start ecosystem.config.js --env production

# Or set environment variables
export NODE_OPTIONS="--max-old-space-size=1024"
```

### 9.2 Enable Compression

**Add to your Express app**:
```javascript
const compression = require('compression');
app.use(compression());
```

### 9.3 Configure Caching

```javascript
// Example Redis caching setup
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});
```

## Step 10: Security Configuration

### 10.1 Configure CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 10.2 Add Security Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// Or configure specific headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 10.3 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Step 11: Backup and Recovery

### 11.1 Create Backup Script

```bash
# Create backup script
cat > ~/backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www/html myapp

# Backup database (PostgreSQL example)
pg_dump -h localhost -U myapp_user myapp_production > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/backup-app.sh
```

### 11.2 Schedule Automated Backups

```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/ubuntu/backup-app.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check PM2 logs
   pm2 logs myapp
   
   # Check environment variables
   pm2 env 0
   
   # Restart application
   pm2 restart myapp
   ```

2. **Database connection errors**
   ```bash
   # Test database connection
   psql -h localhost -U myapp_user -d myapp_production
   
   # Check database service
   sudo systemctl status postgresql
   ```

3. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :3000
   
   # Kill process if needed
   sudo kill -9 PID
   ```

4. **Permission errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /var/www/html/myapp
   chmod -R 755 /var/www/html/myapp
   ```

### Useful Commands

```bash
# PM2 management
pm2 status
pm2 restart myapp
pm2 stop myapp
pm2 delete myapp
pm2 logs myapp --lines 50

# Application testing
curl http://localhost:3000/health
wget -qO- http://localhost:3000

# Process monitoring
ps aux | grep node
netstat -tulpn | grep :3000

# Log monitoring
tail -f /var/log/app/combined.log
journalctl -u pm2-ubuntu -f
```

## Next Steps

Once your application is deployed and running:

1. Proceed to [Nginx Configuration Guide](nginx-config.md)
2. Set up reverse proxy
3. Configure SSL/HTTPS
4. Implement security hardening

---

**Next**: [Nginx Configuration Guide](nginx-config.md)