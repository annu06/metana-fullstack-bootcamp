# Server Provisioning Guide

This guide covers installing and configuring all necessary software on your EC2 instance for deploying a full-stack application.

## Prerequisites

- EC2 instance running Ubuntu 22.04 LTS
- SSH access to the instance
- Non-root user with sudo privileges
- Updated system packages
- Note: The automation script `scripts/setup-server.sh` installs Node.js via NVM for your user. You can either use that script or follow the manual steps below.

## Step 1: Install Node.js using NVM

### 1.1 Install Node Version Manager (NVM)

```bash
# Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell (NVM)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Verify NVM installation
nvm --version
```

### 1.2 Install Node.js

```bash
# Install latest LTS version of Node.js (or a specific version)
nvm install --lts

# Use the LTS version
nvm use --lts

# Set LTS as default
nvm alias default node

# Verify installation
node --version
npm --version
```

### 1.3 Configure npm

```bash
# Update npm to latest version
npm install -g npm@latest

# Set npm registry (optional)
npm config set registry https://registry.npmjs.org/

# Check npm configuration
npm config list
```

## Step 2: Install Git

### 2.1 Install Git Package

```bash
# Install Git
sudo apt install -y git

# Verify installation
git --version
```

### 2.2 Configure Git

```bash
# Set global configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Verify configuration
git config --list
```

### 2.3 Set Up SSH Keys for GitHub (Recommended)

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "your.email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Display public key (copy this to GitHub)
cat ~/.ssh/id_ed25519.pub
```

**Add the public key to GitHub**:
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste the public key content
4. Save the key

**Test SSH connection**:
```bash
ssh -T git@github.com
```

## Step 3: Install Additional Software

### 3.1 Install Build Tools

```bash
# Install build essentials
sudo apt install -y build-essential

# Install Python (required for some npm packages)
sudo apt install -y python3 python3-pip

# Create symlink for python (if needed)
sudo ln -sf /usr/bin/python3 /usr/bin/python
```

### 3.2 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Test Nginx (should show default page)
curl http://localhost
```

### 3.3 Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Set up PM2 startup script
pm2 startup
# Follow the instructions provided by the command
```

### 3.4 Install Certbot (for SSL certificates)

```bash
# Install snapd (if not already installed)
sudo apt install -y snapd

# Install certbot via snap
sudo snap install --classic certbot

# Create symlink
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Verify installation
certbot --version
```

## Step 4: Configure Firewall

### 4.1 Configure UFW (Uncomplicated Firewall)

```bash
# Check current status
sudo ufw status

# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Allow Nginx Full (HTTP and HTTPS)
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 4.2 Configure Nginx Firewall Profile

```bash
# List available profiles
sudo ufw app list

# Check Nginx profile
sudo ufw app info 'Nginx Full'
```

## Step 5: Create Application Directory Structure

### 5.1 Set Up Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/html
sudo chown -R $USER:$USER /var/www/html
sudo chmod -R 755 /var/www

# Create logs directory
sudo mkdir -p /var/log/app
sudo chown -R $USER:$USER /var/log/app
```

### 5.2 Set Up Environment Configuration

```bash
# Create environment directory
mkdir -p ~/app-config

# Create environment file template
cat > ~/app-config/.env.example << 'EOF'
# Application Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# API Keys
API_KEY=your_api_key_here

# Other Configuration
CORS_ORIGIN=https://yourdomain.com
EOF
```

## Step 6: System Optimization

### 6.1 Configure Swap (for t2.micro instances)

```bash
# Check current swap
sudo swapon --show
free -h

# Create swap file (1GB)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap
free -h
```

### 6.2 Configure System Limits

```bash
# Increase file descriptor limits
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf

# Configure kernel parameters
echo 'fs.file-max = 65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Step 7: Install Database (Optional)

### 7.1 Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE your_app_db;
CREATE USER your_app_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_app_db TO your_app_user;
\q
EOF
```

### 7.2 Install MongoDB (Alternative)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

## Step 8: Security Configuration

### 8.1 Configure SSH Security

```bash
# Backup SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

**Recommended SSH settings**:
```
# Disable password authentication
PasswordAuthentication no

# Disable root login
PermitRootLogin no

# Change default port (optional)
# Port 2222

# Limit login attempts
MaxAuthTries 3

# Set idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
# Restart SSH service
sudo systemctl restart sshd
```

### 8.2 Configure Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Check configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

## Step 9: Monitoring and Logging

### 9.1 Install Log Rotation

```bash
# Create logrotate configuration for application
sudo tee /etc/logrotate.d/app << 'EOF'
/var/log/app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 9.2 Set Up Basic Monitoring

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install netstat for network monitoring
sudo apt install -y net-tools

# Create monitoring script
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Status ==="
date
echo "\n=== CPU and Memory ==="
free -h
echo "\n=== Disk Usage ==="
df -h
echo "\n=== Network Connections ==="
netstat -tuln
echo "\n=== PM2 Status ==="
pm2 status
EOF

chmod +x ~/monitor.sh
```

## Step 10: Verification

### 10.1 Test All Installations

```bash
# Test Node.js and npm
node --version
npm --version

# Test Git
git --version

# Test Nginx
sudo nginx -t
curl http://localhost

# Test PM2
pm2 --version

# Test Certbot
certbot --version

# Test firewall
sudo ufw status

# Test system resources
free -h
df -h
```

### 10.2 Create System Information Script

```bash
# Create system info script
cat > ~/system-info.sh << 'EOF'
#!/bin/bash
echo "=== System Information ==="
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 --version)"
echo "Certbot: $(certbot --version)"
echo "\n=== System Resources ==="
echo "CPU: $(nproc) cores"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $2}')"
echo "\n=== Network ==="
echo "Public IP: $(curl -s ifconfig.me)"
echo "Private IP: $(hostname -I | awk '{print $1}')"
EOF

chmod +x ~/system-info.sh
./system-info.sh
```

## Troubleshooting

### Common Issues

1. **NVM not found after installation**
   ```bash
   # Reload bash profile
   source ~/.bashrc
   # Or logout and login again
   ```

2. **Permission denied for npm global installs**
   ```bash
   # Configure npm to use different directory
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Nginx fails to start**
   ```bash
   # Check configuration
   sudo nginx -t
   # Check logs
   sudo journalctl -u nginx
   ```

4. **Firewall blocking connections**
   ```bash
   # Check UFW status
   sudo ufw status verbose
   # Reset UFW if needed
   sudo ufw --force reset
   ```

### Useful Commands

```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status postgresql

# View logs
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log

# Check open ports
sudo netstat -tuln
sudo ss -tuln

# Monitor system resources
htop
iotop
```

## Next Steps

Once your server is provisioned:

1. Proceed to [Application Deployment Guide](deployment.md)
2. Clone your application repository
3. Configure environment variables
4. Build and test your application

---

**Next**: [Application Deployment Guide](deployment.md)