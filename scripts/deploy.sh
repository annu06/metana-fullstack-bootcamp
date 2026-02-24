#!/bin/bash

# Full-Stack Application Deployment Script
# This script automates the deployment process for a Node.js application on AWS EC2

set -e  # Exit on any error

# Configuration
APP_NAME="myapp"
APP_DIR="/var/www/html/$APP_NAME"
REPO_URL="https://github.com/yourusername/your-repo.git"
NODE_VERSION="18"
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check if required commands exist
check_dependencies() {
    log "Checking dependencies..."
    
    local deps=("git" "node" "npm" "nginx" "pm2")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log "Please run the server provisioning script first"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Create application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    if [ ! -d "$APP_DIR" ]; then
        sudo mkdir -p "$APP_DIR"
        sudo chown $USER:$USER "$APP_DIR"
        log_success "Created application directory: $APP_DIR"
    else
        log_warning "Application directory already exists: $APP_DIR"
    fi
}

# Clone or update repository
setup_repository() {
    log "Setting up repository..."
    
    if [ ! -d "$APP_DIR/.git" ]; then
        log "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        log_success "Repository cloned successfully"
    else
        log "Updating existing repository..."
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/main
        log_success "Repository updated successfully"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing application dependencies..."
    
    cd "$APP_DIR"
    
    # Backend dependencies
    if [ -f "package.json" ]; then
        log "Installing backend dependencies..."
        npm ci --production
        log_success "Backend dependencies installed"
    fi
    
    # Frontend dependencies (if separate)
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        log "Installing frontend dependencies..."
        cd client
        npm ci
        npm run build
        cd ..
        log_success "Frontend dependencies installed and built"
    fi
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    cd "$APP_DIR"
    
    if [ ! -f ".env" ]; then
        log "Creating .env file..."
        cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
EOF
        chmod 600 .env
        log_warning "Please update the .env file with your actual configuration"
    else
        log_warning ".env file already exists, skipping creation"
    fi
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    cd "$APP_DIR"
    
    # Check if database setup script exists
    if [ -f "scripts/setup-db.js" ]; then
        log "Running database setup..."
        node scripts/setup-db.js
        log_success "Database setup completed"
    elif [ -f "migrations" ] || [ -d "migrations" ]; then
        log "Running database migrations..."
        npm run migrate 2>/dev/null || npx sequelize-cli db:migrate 2>/dev/null || log_warning "No migration command found"
        log_success "Database migrations completed"
    else
        log_warning "No database setup found, skipping"
    fi
}

# Configure PM2
setup_pm2() {
    log "Configuring PM2..."
    
    cd "$APP_DIR"
    
    # Create ecosystem file if it doesn't exist
    if [ ! -f "ecosystem.config.js" ]; then
        log "Creating PM2 ecosystem file..."
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
        log_success "PM2 ecosystem file created"
    fi
    
    # Create PM2 log directory
    sudo mkdir -p /var/log/pm2
    sudo chown $USER:$USER /var/log/pm2
    
    # Stop existing process if running
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # Start application with PM2
    log "Starting application with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    log_success "Application started with PM2"
}

# Configure Nginx
setup_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files
    location /static/ {
        alias $APP_DIR/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Nginx configured and reloaded"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log_error "Certbot is not installed. Please install it first."
        return 1
    fi
    
    # Obtain SSL certificate
    log "Obtaining SSL certificate for $DOMAIN..."
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect
    
    if [ $? -eq 0 ]; then
        log_success "SSL certificate obtained and configured"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        log_success "SSL auto-renewal configured"
    else
        log_warning "SSL certificate setup failed. You can set it up manually later."
    fi
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Configure UFW
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH, HTTP, and HTTPS
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Enable firewall
    sudo ufw --force enable
    
    log_success "Firewall configured"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check PM2 status
    if pm2 list | grep -q "$APP_NAME.*online"; then
        log_success "PM2 process is running"
    else
        log_error "PM2 process is not running"
        return 1
    fi
    
    # Check Nginx status
    if sudo systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
        return 1
    fi
    
    # Check application response
    sleep 5  # Give the app time to start
    if curl -f http://localhost:3000/health &>/dev/null || curl -f http://localhost:3000 &>/dev/null; then
        log_success "Application is responding"
    else
        log_warning "Application health check failed"
    fi
    
    # Check external access
    if curl -f "http://$DOMAIN/health" &>/dev/null || curl -f "http://$DOMAIN" &>/dev/null; then
        log_success "External access is working"
    else
        log_warning "External access check failed"
    fi
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    cd "$APP_DIR"
    
    # Remove development dependencies
    npm prune --production
    
    # Clear npm cache
    npm cache clean --force
    
    # Remove unnecessary files
    rm -rf .git/hooks .git/logs
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment of $APP_NAME..."
    
    check_root
    check_dependencies
    setup_app_directory
    setup_repository
    install_dependencies
    setup_environment
    setup_database
    setup_pm2
    setup_nginx
    setup_firewall
    
    # SSL setup (optional, might fail if domain not properly configured)
    if [ "$DOMAIN" != "your-domain.com" ]; then
        setup_ssl || log_warning "SSL setup skipped or failed"
    else
        log_warning "SSL setup skipped - please configure DOMAIN variable"
    fi
    
    cleanup
    health_check
    
    log_success "Deployment completed successfully!"
    log "Application URL: http://$DOMAIN"
    log "PM2 status: pm2 status"
    log "Application logs: pm2 logs $APP_NAME"
    log "Nginx logs: sudo tail -f /var/log/nginx/error.log"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -n, --app-name      Application name (default: myapp)"
    echo "  -r, --repo-url      Git repository URL"
    echo "  -d, --domain        Domain name"
    echo "  -e, --email         Email for SSL certificate"
    echo "  --skip-ssl          Skip SSL setup"
    echo "  --skip-firewall     Skip firewall setup"
    echo ""
    echo "Example:"
    echo "  $0 -n myapp -r https://github.com/user/repo.git -d example.com -e admin@example.com"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -n|--app-name)
            APP_NAME="$2"
            shift 2
            ;;
        -r|--repo-url)
            REPO_URL="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        --skip-firewall)
            SKIP_FIREWALL=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ "$REPO_URL" = "https://github.com/yourusername/your-repo.git" ]; then
    log_error "Please specify a valid repository URL with -r or --repo-url"
    exit 1
fi

# Run main function
main