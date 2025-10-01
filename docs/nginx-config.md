# Nginx Reverse Proxy Configuration Guide

This guide covers configuring Nginx as a reverse proxy to serve your Node.js application, including HTTP and HTTPS setup.

## Prerequisites

- Nginx installed and running
- Node.js application running on port 3000 (via PM2)
- Domain name configured (optional but recommended)
- Basic understanding of Nginx configuration

## Step 1: Understanding Nginx Configuration

### 1.1 Nginx Directory Structure

```bash
# Main configuration file
/etc/nginx/nginx.conf

# Site configurations
/etc/nginx/sites-available/    # Available site configs
/etc/nginx/sites-enabled/      # Enabled site configs (symlinks)

# Default configuration
/etc/nginx/sites-available/default

# Log files
/var/log/nginx/access.log
/var/log/nginx/error.log
```

### 1.2 Check Current Nginx Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# View current configuration
sudo nginx -T
```

## Step 2: Basic HTTP Configuration

### 2.1 Remove Default Configuration

```bash
# Disable default site
sudo unlink /etc/nginx/sites-enabled/default

# Or remove the default file
sudo rm /etc/nginx/sites-enabled/default
```

### 2.2 Create Application Configuration

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/myapp
```

**Basic HTTP configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    # For testing without domain, use:
    # server_name _;

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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Root directory for static files
    root /var/www/html/myapp/public;
    index index.html index.htm;

    # Main application proxy
    location / {
        try_files $uri $uri/ @nodejs;
    }

    # Proxy to Node.js application
    location @nodejs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # API routes (direct proxy)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Static files (uploads, assets)
    location /uploads {
        alias /var/www/html/myapp/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    # Logging
    access_log /var/log/nginx/myapp_access.log;
    error_log /var/log/nginx/myapp_error.log;
}
```

### 2.3 Enable the Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 2.4 Test HTTP Configuration

```bash
# Test with curl
curl http://your-domain.com
# Or if using IP
curl http://YOUR_EC2_PUBLIC_IP

# Test API endpoint
curl http://your-domain.com/api/health

# Check Nginx logs
sudo tail -f /var/log/nginx/myapp_access.log
sudo tail -f /var/log/nginx/myapp_error.log
```

## Step 3: Advanced Nginx Configuration

### 3.1 Load Balancing (Multiple Node.js Instances)

```nginx
# Add upstream configuration before server block
upstream nodejs_backend {
    least_conn;
    server localhost:3000 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:3001 weight=1 max_fails=3 fail_timeout=30s;
    server localhost:3002 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    # ... other configuration ...
    
    location @nodejs {
        proxy_pass http://nodejs_backend;
        # ... other proxy settings ...
    }
}
```

### 3.2 Rate Limiting

```nginx
# Add to http block in /etc/nginx/nginx.conf
http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # ... other configuration ...
}

# Add to server block
server {
    # ... other configuration ...
    
    # Rate limit API endpoints
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        # ... other proxy settings ...
    }
    
    # Strict rate limiting for login
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        # ... other proxy settings ...
    }
}
```

### 3.3 Caching Configuration

```nginx
# Add to http block
http {
    # Proxy cache configuration
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;
    
    # ... other configuration ...
}

# Add to server block
server {
    # ... other configuration ...
    
    # Cache API responses
    location /api/public {
        proxy_cache app_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://localhost:3000;
        # ... other proxy settings ...
    }
}
```

## Step 4: WebSocket Support

### 4.1 Configure WebSocket Proxy

```nginx
server {
    # ... other configuration ...
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Generic WebSocket location
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

## Step 5: Security Enhancements

### 5.1 Hide Nginx Version

```bash
# Edit main Nginx configuration
sudo nano /etc/nginx/nginx.conf
```

```nginx
http {
    # Hide Nginx version
    server_tokens off;
    
    # ... other configuration ...
}
```

### 5.2 Additional Security Headers

```nginx
server {
    # ... other configuration ...
    
    # Enhanced security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # ... other configuration ...
}
```

### 5.3 Block Common Attacks

```nginx
server {
    # ... other configuration ...
    
    # Block SQL injection attempts
    location ~* (union|select|insert|delete|update|drop|create|alter|exec|script) {
        deny all;
    }
    
    # Block file injection attempts
    location ~* \.(php|asp|aspx|jsp)$ {
        deny all;
    }
    
    # Block access to backup files
    location ~* \.(bak|backup|old|orig|save|swo|swp|tmp)$ {
        deny all;
    }
    
    # Block user agent
    if ($http_user_agent ~* (nmap|nikto|wikto|sf|sqlmap|bsqlbf|w3af|acunetix|havij|appscan)) {
        return 444;
    }
    
    # ... other configuration ...
}
```

## Step 6: Performance Optimization

### 6.1 Enable Gzip Compression

```nginx
# Add to http block in /etc/nginx/nginx.conf
http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # ... other configuration ...
}
```

### 6.2 Configure Client Body Size

```nginx
http {
    # Increase client body size for file uploads
    client_max_body_size 100M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # ... other configuration ...
}
```

### 6.3 Optimize Timeouts

```nginx
http {
    # Timeout settings
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
    
    # ... other configuration ...
}
```

## Step 7: Logging and Monitoring

### 7.1 Custom Log Format

```nginx
http {
    # Custom log format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    # ... other configuration ...
}

server {
    # Use custom log format
    access_log /var/log/nginx/myapp_access.log main;
    
    # ... other configuration ...
}
```

### 7.2 Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/nginx-myapp
```

```
/var/log/nginx/myapp_*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## Step 8: Testing and Validation

### 8.1 Configuration Testing

```bash
# Test Nginx configuration
sudo nginx -t

# Test configuration with verbose output
sudo nginx -T

# Check Nginx status
sudo systemctl status nginx
```

### 8.2 Performance Testing

```bash
# Test with curl
curl -I http://your-domain.com

# Test compression
curl -H "Accept-Encoding: gzip" -I http://your-domain.com

# Test API endpoints
curl http://your-domain.com/api/health

# Load testing with ab (Apache Bench)
sudo apt install apache2-utils
ab -n 1000 -c 10 http://your-domain.com/
```

### 8.3 Monitor Logs

```bash
# Monitor access logs
sudo tail -f /var/log/nginx/myapp_access.log

# Monitor error logs
sudo tail -f /var/log/nginx/myapp_error.log

# Monitor all Nginx logs
sudo tail -f /var/log/nginx/*.log
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   ```bash
   # Check if Node.js app is running
   pm2 status
   
   # Check if port 3000 is listening
   sudo netstat -tulpn | grep :3000
   
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Configuration errors**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check syntax errors
   sudo nginx -T | grep -i error
   ```

3. **Permission issues**
   ```bash
   # Check file permissions
   ls -la /var/www/html/myapp/
   
   # Fix permissions if needed
   sudo chown -R www-data:www-data /var/www/html/myapp/public
   ```

4. **SSL/HTTPS issues** (covered in next guide)
   ```bash
   # Check SSL configuration
   sudo nginx -t
   
   # Test SSL connection
   openssl s_client -connect your-domain.com:443
   ```

### Useful Commands

```bash
# Nginx management
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# Configuration testing
sudo nginx -t
sudo nginx -s reload

# Log monitoring
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check listening ports
sudo netstat -tulpn | grep nginx
sudo ss -tulpn | grep nginx
```

## Next Steps

Once Nginx is configured and working:

1. Proceed to [SSL/HTTPS Setup Guide](ssl-setup.md)
2. Configure Let's Encrypt certificates
3. Set up HTTPS redirects
4. Implement additional security measures

---

**Next**: [SSL/HTTPS Setup Guide](ssl-setup.md)