# SSL/HTTPS Setup Guide with Let's Encrypt

This guide covers setting up SSL certificates using Let's Encrypt and configuring HTTPS for your application.

## Prerequisites

- Domain name pointing to your EC2 instance
- Nginx configured and running
- Certbot installed
- Port 80 and 443 open in security groups
- Application accessible via HTTP

## Step 1: Domain Configuration

### 1.1 Verify Domain Setup

```bash
# Check if domain points to your server
nslookup your-domain.com
dig your-domain.com

# Verify HTTP access
curl http://your-domain.com
```

### 1.2 Update Nginx Configuration for Domain

```bash
# Edit your Nginx configuration
sudo nano /etc/nginx/sites-available/myapp
```

**Update server_name directive**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # ... rest of configuration ...
}
```

```bash
# Test and reload configuration
sudo nginx -t
sudo systemctl reload nginx
```

## Step 2: Install and Configure Certbot

### 2.1 Install Certbot (if not already installed)

```bash
# Install snapd (usually pre-installed on Ubuntu)
sudo apt update
sudo apt install -y snapd

# Install certbot via snap
sudo snap install --classic certbot

# Create symlink
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Verify installation
certbot --version
```

### 2.2 Install Nginx Plugin

```bash
# Install Nginx plugin for certbot
sudo snap install certbot-dns-cloudflare  # if using Cloudflare
# or
sudo apt install python3-certbot-nginx   # alternative method
```

## Step 3: Obtain SSL Certificate

### 3.1 Method 1: Automatic Configuration (Recommended)

```bash
# Obtain certificate and auto-configure Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# 1. Enter email address for notifications
# 2. Agree to terms of service
# 3. Choose whether to share email with EFF
# 4. Select redirect option (recommended: redirect HTTP to HTTPS)
```

### 3.2 Method 2: Manual Certificate Generation

```bash
# Generate certificate only (manual Nginx configuration)
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Or use webroot method
sudo certbot certonly --webroot -w /var/www/html/myapp/public -d your-domain.com -d www.your-domain.com
```

### 3.3 Verify Certificate Installation

```bash
# Check certificate files
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# Test HTTPS connection
curl -I https://your-domain.com

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

## Step 4: Manual HTTPS Configuration (if needed)

### 4.1 Create HTTPS Server Block

If certbot didn't automatically configure Nginx, create the HTTPS configuration:

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/myapp
```

**Complete configuration with HTTPS**:
```nginx
# HTTP server block - redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html/myapp/public;
    }
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL certificate configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Root directory
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API routes
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
        proxy_read_timeout 86400;
    }
    
    # Static files
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
    
    # Health check
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
    access_log /var/log/nginx/myapp_ssl_access.log;
    error_log /var/log/nginx/myapp_ssl_error.log;
}
```

### 4.2 Test and Reload Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 5: Advanced SSL Configuration

### 5.1 Generate Strong DH Parameters

```bash
# Generate DH parameters (this may take a while)
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048

# Add to Nginx configuration
sudo nano /etc/nginx/sites-available/myapp
```

**Add to HTTPS server block**:
```nginx
server {
    # ... other configuration ...
    
    # DH parameters
    ssl_dhparam /etc/nginx/dhparam.pem;
    
    # ... rest of configuration ...
}
```

### 5.2 Configure OCSP Stapling

```nginx
server {
    # ... other configuration ...
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # ... rest of configuration ...
}
```

### 5.3 HTTP/2 Configuration

```nginx
server {
    listen 443 ssl http2;  # Enable HTTP/2
    
    # ... rest of configuration ...
}
```

## Step 6: Set Up Automatic Certificate Renewal

### 6.1 Test Renewal Process

```bash
# Test certificate renewal (dry run)
sudo certbot renew --dry-run

# Check renewal configuration
sudo certbot certificates
```

### 6.2 Configure Automatic Renewal

```bash
# Check if systemd timer is enabled (usually automatic)
sudo systemctl status snap.certbot.renew.timer

# Enable if not already enabled
sudo systemctl enable snap.certbot.renew.timer
sudo systemctl start snap.certbot.renew.timer
```

### 6.3 Manual Cron Setup (Alternative)

```bash
# Edit crontab
crontab -e

# Add renewal check twice daily
0 12 * * * /usr/bin/certbot renew --quiet
0 0 * * * /usr/bin/certbot renew --quiet
```

### 6.4 Post-Renewal Hook

```bash
# Create renewal hook script
sudo nano /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
```

```bash
#!/bin/bash
# Reload Nginx after certificate renewal
systemctl reload nginx
```

```bash
# Make script executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
```

## Step 7: Security Testing and Validation

### 7.1 Test SSL Configuration

```bash
# Test HTTPS connection
curl -I https://your-domain.com

# Test HTTP to HTTPS redirect
curl -I http://your-domain.com

# Check certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 7.2 Online SSL Testing

Use online tools to test your SSL configuration:

1. **SSL Labs Test**: https://www.ssllabs.com/ssltest/
2. **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
3. **Security Headers**: https://securityheaders.com/

### 7.3 Check Security Headers

```bash
# Test security headers
curl -I https://your-domain.com

# Should include headers like:
# Strict-Transport-Security
# X-Frame-Options
# X-Content-Type-Options
# X-XSS-Protection
```

## Step 8: Monitoring and Maintenance

### 8.1 Certificate Monitoring Script

```bash
# Create certificate monitoring script
cat > ~/check-ssl.sh << 'EOF'
#!/bin/bash

DOMAIN="your-domain.com"
THRESHOLD=30  # Days before expiration to alert

# Get certificate expiration date
EXP_DATE=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)

# Convert to epoch time
EXP_EPOCH=$(date -d "$EXP_DATE" +%s)
CURRENT_EPOCH=$(date +%s)

# Calculate days until expiration
DAYS_LEFT=$(( (EXP_EPOCH - CURRENT_EPOCH) / 86400 ))

echo "SSL Certificate for $DOMAIN expires in $DAYS_LEFT days"

if [ $DAYS_LEFT -lt $THRESHOLD ]; then
    echo "WARNING: Certificate expires soon!"
    # Add notification logic here (email, Slack, etc.)
fi
EOF

chmod +x ~/check-ssl.sh
```

### 8.2 SSL Log Monitoring

```bash
# Monitor SSL-related errors
sudo tail -f /var/log/nginx/myapp_ssl_error.log

# Check for SSL handshake errors
sudo grep -i ssl /var/log/nginx/error.log
```

### 8.3 Certificate Information Script

```bash
# Create certificate info script
cat > ~/ssl-info.sh << 'EOF'
#!/bin/bash

DOMAIN="your-domain.com"

echo "=== SSL Certificate Information ==="
echo "Domain: $DOMAIN"
echo

# Certificate details
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -text | grep -E "(Subject:|Issuer:|Not Before|Not After)"

echo
echo "=== Certificate Chain ==="
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -showcerts 2>/dev/null | grep -E "(s:|i:)"

echo
echo "=== SSL Test ==="
curl -I https://$DOMAIN 2>/dev/null | head -1
EOF

chmod +x ~/ssl-info.sh
```

## Step 9: Troubleshooting

### 9.1 Common SSL Issues

1. **Certificate not found**
   ```bash
   # Check certificate files
   sudo ls -la /etc/letsencrypt/live/your-domain.com/
   
   # Verify paths in Nginx config
   sudo nginx -t
   ```

2. **Mixed content warnings**
   ```bash
   # Ensure all resources use HTTPS
   # Check browser console for mixed content errors
   # Update application to use relative URLs or HTTPS
   ```

3. **Certificate validation errors**
   ```bash
   # Check domain DNS
   nslookup your-domain.com
   
   # Verify domain accessibility
   curl http://your-domain.com/.well-known/acme-challenge/
   ```

4. **Renewal failures**
   ```bash
   # Check renewal logs
   sudo journalctl -u snap.certbot.renew
   
   # Manual renewal test
   sudo certbot renew --dry-run
   ```

### 9.2 SSL Debugging Commands

```bash
# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate chain
openssl s_client -connect your-domain.com:443 -showcerts

# Verify certificate
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt /etc/letsencrypt/live/your-domain.com/cert.pem

# Check cipher suites
nmap --script ssl-enum-ciphers -p 443 your-domain.com
```

### 9.3 Performance Testing

```bash
# Test HTTPS performance
time curl -o /dev/null -s https://your-domain.com

# Load testing with HTTPS
ab -n 100 -c 10 https://your-domain.com/

# Check HTTP/2 support
curl -I --http2 https://your-domain.com
```

## Step 10: Additional Security Measures

### 10.1 Certificate Transparency Monitoring

```bash
# Monitor certificate transparency logs
# Use tools like:
# - crt.sh
# - Facebook Certificate Transparency Monitoring
# - Google Certificate Transparency
```

### 10.2 HSTS Preload

1. Add your domain to HSTS preload list: https://hstspreload.org/
2. Ensure HSTS header includes `preload` directive
3. Wait for browser updates to include your domain

### 10.3 Certificate Pinning (Advanced)

```nginx
# Add public key pinning (use with caution)
add_header Public-Key-Pins 'pin-sha256="base64+primary+key+hash"; pin-sha256="base64+backup+key+hash"; max-age=5184000; includeSubDomains';
```

## Next Steps

Once SSL/HTTPS is configured:

1. Proceed to [Security Hardening Guide](security.md)
2. Implement additional security measures
3. Set up monitoring and alerting
4. Configure backup and disaster recovery

---

**Next**: [Security Hardening Guide](security.md)