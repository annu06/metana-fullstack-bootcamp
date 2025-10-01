# Troubleshooting Guide

This comprehensive guide covers common issues you might encounter during deployment and their solutions.

## Table of Contents

1. [EC2 Instance Issues](#ec2-instance-issues)
2. [SSH Connection Problems](#ssh-connection-problems)
3. [Application Deployment Issues](#application-deployment-issues)
4. [Nginx Configuration Problems](#nginx-configuration-problems)
5. [SSL/HTTPS Issues](#sslhttps-issues)
6. [PM2 Process Management Issues](#pm2-process-management-issues)
7. [Database Connection Problems](#database-connection-problems)
8. [Performance Issues](#performance-issues)
9. [Security and Firewall Issues](#security-and-firewall-issues)
10. [Monitoring and Logging](#monitoring-and-logging)

## EC2 Instance Issues

### Issue: Cannot Connect to EC2 Instance

**Symptoms:**
- Connection timeout when trying to SSH
- "Connection refused" error
- Instance appears to be running but unreachable

**Solutions:**

1. **Check Instance Status**
   ```bash
   # In AWS Console, verify:
   # - Instance State: running
   # - Status Checks: 2/2 checks passed
   # - System reachability: passed
   # - Instance reachability: passed
   ```

2. **Verify Security Group Rules**
   ```bash
   # Ensure SSH (port 22) is open:
   # Type: SSH
   # Protocol: TCP
   # Port Range: 22
   # Source: 0.0.0.0/0 (or your IP)
   ```

3. **Check Network ACLs**
   ```bash
   # Verify subnet's Network ACL allows:
   # - Inbound: SSH (22), HTTP (80), HTTPS (443)
   # - Outbound: All traffic
   ```

4. **Verify Key Pair**
   ```bash
   # Ensure you're using the correct private key
   ssh -i /path/to/your-key.pem ubuntu@your-instance-ip
   
   # Check key permissions
   chmod 400 /path/to/your-key.pem
   ```

### Issue: Instance Running Slowly

**Symptoms:**
- High CPU usage
- Memory exhaustion
- Slow response times

**Solutions:**

1. **Check Resource Usage**
   ```bash
   # CPU usage
   top
   htop
   
   # Memory usage
   free -h
   
   # Disk usage
   df -h
   
   # I/O statistics
   iostat -x 1
   ```

2. **Identify Resource-Heavy Processes**
   ```bash
   # Top CPU consumers
   ps aux --sort=-%cpu | head -10
   
   # Top memory consumers
   ps aux --sort=-%mem | head -10
   ```

3. **Optimize Instance Size**
   ```bash
   # Consider upgrading instance type:
   # t3.micro → t3.small → t3.medium
   # Monitor CloudWatch metrics for guidance
   ```

## SSH Connection Problems

### Issue: Permission Denied (publickey)

**Symptoms:**
- "Permission denied (publickey)" error
- Cannot authenticate with key

**Solutions:**

1. **Check Key File Permissions**
   ```bash
   # Set correct permissions
   chmod 400 ~/.ssh/your-key.pem
   
   # Verify ownership
   ls -la ~/.ssh/your-key.pem
   ```

2. **Verify SSH Command**
   ```bash
   # Correct format
   ssh -i ~/.ssh/your-key.pem ubuntu@your-instance-ip
   
   # Enable verbose output for debugging
   ssh -v -i ~/.ssh/your-key.pem ubuntu@your-instance-ip
   ```

3. **Check SSH Agent**
   ```bash
   # Add key to SSH agent
   ssh-add ~/.ssh/your-key.pem
   
   # List loaded keys
   ssh-add -l
   ```

### Issue: SSH Connection Drops Frequently

**Solutions:**

1. **Configure SSH Keep-Alive**
   ```bash
   # Edit local SSH config
   nano ~/.ssh/config
   
   # Add:
   Host *
       ServerAliveInterval 60
       ServerAliveCountMax 3
   ```

2. **Server-Side Configuration**
   ```bash
   # On EC2 instance
   sudo nano /etc/ssh/sshd_config
   
   # Add/modify:
   ClientAliveInterval 60
   ClientAliveCountMax 3
   
   # Restart SSH
   sudo systemctl restart sshd
   ```

## Application Deployment Issues

### Issue: npm install Fails

**Symptoms:**
- Package installation errors
- Permission denied errors
- Network timeout errors

**Solutions:**

1. **Check Node.js Version**
   ```bash
   # Verify Node.js version
   node --version
   npm --version
   
   # Update if necessary
   nvm install --lts
   nvm use --lts
   ```

2. **Clear npm Cache**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Reinstall
   npm install
   ```

3. **Fix Permission Issues**
   ```bash
   # Change npm global directory
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   
   # Add to ~/.bashrc
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

4. **Network Issues**
   ```bash
   # Use different registry
   npm install --registry https://registry.npmjs.org/
   
   # Increase timeout
   npm install --timeout=60000
   ```

### Issue: Application Won't Start

**Symptoms:**
- "Cannot find module" errors
- Port already in use
- Environment variable errors

**Solutions:**

1. **Check Dependencies**
   ```bash
   # Verify all dependencies are installed
   npm list --depth=0
   
   # Install missing dependencies
   npm install
   
   # Check for peer dependencies
   npm ls --depth=0 2>&1 | grep "UNMET PEER DEPENDENCY"
   ```

2. **Environment Variables**
   ```bash
   # Check .env file exists and has correct permissions
   ls -la .env
   
   # Verify environment variables are loaded
   node -e "console.log(process.env.NODE_ENV)"
   
   # Test with explicit environment
   NODE_ENV=production npm start
   ```

3. **Port Conflicts**
   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :3000
   
   # Kill process using the port
   sudo kill -9 $(sudo lsof -t -i:3000)
   
   # Use different port
   PORT=3001 npm start
   ```

### Issue: Build Process Fails

**Solutions:**

1. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 node_modules/.bin/webpack
   
   # Or set environment variable
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Add Swap Space**
   ```bash
   # Create swap file
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # Make permanent
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

## Nginx Configuration Problems

### Issue: Nginx Won't Start

**Symptoms:**
- "nginx: [emerg]" errors
- Configuration test failures
- Service fails to start

**Solutions:**

1. **Test Configuration**
   ```bash
   # Test nginx configuration
   sudo nginx -t
   
   # Check for syntax errors
   sudo nginx -T
   ```

2. **Common Configuration Errors**
   ```bash
   # Check for:
   # - Missing semicolons
   # - Incorrect file paths
   # - Invalid directives
   # - Port conflicts
   
   # View error details
   sudo systemctl status nginx
   sudo journalctl -u nginx
   ```

3. **Port Conflicts**
   ```bash
   # Check what's using port 80
   sudo netstat -tlnp | grep :80
   
   # Stop conflicting service
   sudo systemctl stop apache2  # if Apache is running
   ```

### Issue: 502 Bad Gateway Error

**Symptoms:**
- Nginx returns 502 error
- Cannot reach backend application

**Solutions:**

1. **Check Backend Application**
   ```bash
   # Verify app is running
   pm2 status
   
   # Check app logs
   pm2 logs
   
   # Test direct connection
   curl http://localhost:3000
   ```

2. **Check Nginx Configuration**
   ```bash
   # Verify proxy_pass URL
   sudo nano /etc/nginx/sites-available/myapp
   
   # Should be:
   proxy_pass http://localhost:3000;
   # Not:
   proxy_pass http://localhost:3000/;
   ```

3. **Check Nginx Error Logs**
   ```bash
   # View error logs
   sudo tail -f /var/log/nginx/error.log
   
   # Common issues:
   # - Connection refused (app not running)
   # - Permission denied (SELinux/AppArmor)
   # - Timeout (app too slow)
   ```

### Issue: Static Files Not Serving

**Solutions:**

1. **Check File Permissions**
   ```bash
   # Verify nginx can read files
   sudo chown -R www-data:www-data /var/www/html/myapp/public
   sudo chmod -R 755 /var/www/html/myapp/public
   ```

2. **Verify Nginx Configuration**
   ```nginx
   # Correct static file configuration
   location /static/ {
       alias /var/www/html/myapp/public/;
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## SSL/HTTPS Issues

### Issue: Let's Encrypt Certificate Failed

**Symptoms:**
- Certbot fails to obtain certificate
- Domain validation errors
- Rate limit exceeded

**Solutions:**

1. **Check Domain Configuration**
   ```bash
   # Verify domain points to your server
   nslookup your-domain.com
   dig your-domain.com
   
   # Test HTTP access first
   curl -I http://your-domain.com
   ```

2. **Firewall Issues**
   ```bash
   # Ensure ports 80 and 443 are open
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Rate Limiting**
   ```bash
   # If rate limited, wait or use staging
   certbot certonly --staging --nginx -d your-domain.com
   
   # Check rate limits
   # https://letsencrypt.org/docs/rate-limits/
   ```

4. **Manual Certificate Request**
   ```bash
   # Try manual verification
   sudo certbot certonly --manual -d your-domain.com
   
   # Or use DNS challenge
   sudo certbot certonly --manual --preferred-challenges dns -d your-domain.com
   ```

### Issue: SSL Certificate Errors

**Solutions:**

1. **Check Certificate Validity**
   ```bash
   # Test SSL certificate
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   
   # Check certificate details
   openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
   ```

2. **Certificate Chain Issues**
   ```bash
   # Verify certificate chain
   openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt /etc/letsencrypt/live/your-domain.com/cert.pem
   
   # Use fullchain in nginx
   ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
   ```

## PM2 Process Management Issues

### Issue: PM2 Process Keeps Crashing

**Symptoms:**
- Application restarts frequently
- PM2 shows "errored" status
- High restart count

**Solutions:**

1. **Check Application Logs**
   ```bash
   # View PM2 logs
   pm2 logs
   pm2 logs app-name
   
   # View specific log files
   pm2 logs app-name --lines 100
   ```

2. **Check Memory Usage**
   ```bash
   # Monitor PM2 processes
   pm2 monit
   
   # Check memory limits
   pm2 show app-name
   
   # Increase memory limit
   pm2 start ecosystem.config.js --max-memory-restart 500M
   ```

3. **Application Errors**
   ```bash
   # Check for uncaught exceptions
   # Add to your app.js:
   process.on('uncaughtException', (err) => {
     console.error('Uncaught Exception:', err);
     process.exit(1);
   });
   
   process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     process.exit(1);
   });
   ```

### Issue: PM2 Not Starting on Boot

**Solutions:**

1. **Setup PM2 Startup**
   ```bash
   # Generate startup script
   pm2 startup
   
   # Follow the instructions to run the generated command
   # Usually something like:
   sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.17.0/bin /home/ubuntu/.nvm/versions/node/v18.17.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
   
   # Save current PM2 processes
   pm2 save
   ```

2. **Verify Startup Configuration**
   ```bash
   # Check if PM2 service is enabled
   sudo systemctl status pm2-ubuntu
   
   # Test reboot
   sudo reboot
   
   # After reboot, check PM2 status
   pm2 status
   ```

## Database Connection Problems

### Issue: Cannot Connect to Database

**Symptoms:**
- "Connection refused" errors
- Authentication failures
- Timeout errors

**Solutions:**

1. **Check Database Service**
   ```bash
   # PostgreSQL
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   
   # MongoDB
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

2. **Verify Connection Parameters**
   ```bash
   # Test database connection
   # PostgreSQL
   psql -h localhost -U username -d database_name
   
   # MongoDB
   mongo mongodb://username:password@localhost:27017/database_name
   ```

3. **Check Firewall Rules**
   ```bash
   # Allow database ports
   sudo ufw allow 5432  # PostgreSQL
   sudo ufw allow 27017  # MongoDB
   ```

### Issue: Database Performance Issues

**Solutions:**

1. **Monitor Database Performance**
   ```bash
   # PostgreSQL
   sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
   
   # Check slow queries
   sudo -u postgres psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   ```

2. **Optimize Database Configuration**
   ```bash
   # PostgreSQL tuning
   sudo nano /etc/postgresql/14/main/postgresql.conf
   
   # Key settings:
   shared_buffers = 256MB
   effective_cache_size = 1GB
   work_mem = 4MB
   maintenance_work_mem = 64MB
   ```

## Performance Issues

### Issue: Slow Application Response

**Solutions:**

1. **Enable Compression**
   ```nginx
   # In nginx configuration
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **Optimize Static File Serving**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
       access_log off;
   }
   ```

3. **Application-Level Optimizations**
   ```javascript
   // Enable compression in Express
   const compression = require('compression');
   app.use(compression());
   
   // Add caching headers
   app.use('/static', express.static('public', {
     maxAge: '1y',
     etag: false
   }));
   ```

### Issue: High Memory Usage

**Solutions:**

1. **Monitor Memory Usage**
   ```bash
   # Check memory usage by process
   ps aux --sort=-%mem | head -10
   
   # Monitor in real-time
   htop
   
   # Check for memory leaks
   pm2 monit
   ```

2. **Optimize Node.js Memory**
   ```bash
   # Set memory limits in PM2
   pm2 start app.js --max-memory-restart 500M
   
   # Or in ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'myapp',
       script: 'app.js',
       max_memory_restart: '500M'
     }]
   };
   ```

## Security and Firewall Issues

### Issue: Blocked by Firewall

**Solutions:**

1. **Check UFW Status**
   ```bash
   # Check firewall status
   sudo ufw status verbose
   
   # Allow specific ports
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 22
   ```

2. **Check iptables Rules**
   ```bash
   # View iptables rules
   sudo iptables -L -n
   
   # Flush rules if needed (be careful!)
   sudo iptables -F
   ```

### Issue: Fail2Ban Blocking Legitimate Traffic

**Solutions:**

1. **Check Fail2Ban Status**
   ```bash
   # Check banned IPs
   sudo fail2ban-client status sshd
   
   # Unban IP
   sudo fail2ban-client set sshd unbanip YOUR_IP
   
   # Whitelist IP permanently
   sudo nano /etc/fail2ban/jail.local
   # Add to ignoreip = 127.0.0.1/8 ::1 YOUR_IP
   ```

## Monitoring and Logging

### Issue: Missing or Incomplete Logs

**Solutions:**

1. **Configure Application Logging**
   ```javascript
   // Use winston for structured logging
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: '/var/log/app/error.log', level: 'error' }),
       new winston.transports.File({ filename: '/var/log/app/combined.log' })
     ]
   });
   ```

2. **Configure Log Rotation**
   ```bash
   # Create logrotate configuration
   sudo nano /etc/logrotate.d/myapp
   
   /var/log/app/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 ubuntu ubuntu
       postrotate
           pm2 reloadLogs
       endscript
   }
   ```

### Useful Debugging Commands

```bash
# System information
uname -a
df -h
free -h
uptime

# Network debugging
ss -tulpn
netstat -tulpn
curl -I http://localhost:3000

# Process debugging
ps aux | grep node
ps aux | grep nginx
ps aux | grep postgres

# Log monitoring
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
journalctl -u nginx -f
journalctl -u postgresql -f

# PM2 debugging
pm2 status
pm2 logs
pm2 monit
pm2 describe app-name

# SSL debugging
openssl s_client -connect your-domain.com:443
curl -I https://your-domain.com

# Database debugging
sudo -u postgres psql -c "\l"
sudo -u postgres psql -c "\du"
```

## Emergency Recovery Procedures

### Complete System Recovery

1. **Create Recovery Script**
   ```bash
   #!/bin/bash
   # emergency-recovery.sh
   
   echo "Starting emergency recovery..."
   
   # Stop all services
   sudo systemctl stop nginx
   pm2 stop all
   
   # Backup current state
   sudo cp -r /etc/nginx /etc/nginx.backup.$(date +%Y%m%d)
   pm2 save --force
   
   # Restore from backup
   # (implement your backup restoration logic here)
   
   # Restart services
   sudo systemctl start nginx
   pm2 resurrect
   
   echo "Recovery completed. Check service status."
   ```

2. **Health Check Script**
   ```bash
   #!/bin/bash
   # health-check.sh
   
   echo "=== System Health Check ==="
   
   # Check services
   echo "Nginx: $(sudo systemctl is-active nginx)"
   echo "PM2: $(pm2 jlist | jq length) processes"
   
   # Check connectivity
   echo "HTTP: $(curl -s -o /dev/null -w "%{http_code}" http://localhost)"
   echo "HTTPS: $(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com)"
   
   # Check resources
   echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
   echo "Memory: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
   echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
   ```

---

**Remember**: Always test changes in a staging environment first, keep regular backups, and document any custom configurations for future reference.

**Next**: [Automation Scripts](../scripts/) for deployment automation