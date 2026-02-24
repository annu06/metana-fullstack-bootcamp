#!/bin/bash

# Server Setup and Provisioning Script
# This script automates the initial setup of an Ubuntu server for Node.js application deployment

set -e  # Exit on any error

# Configuration
NODE_VERSION="lts"  # 'lts' or a specific version like '18'
USERNAME="ubuntu"
SSH_PORT="22"
TRUSTED_IPS=""  # Comma-separated list of trusted IPs for SSH access (assignment requirement)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    export DEBIAN_FRONTEND=noninteractive
    
    apt-get update
    apt-get upgrade -y
    
    # Install essential packages
    apt-get install -y \
        curl \
        wget \
        gnupg \
        lsb-release \
        ca-certificates \
        apt-transport-https \
        software-properties-common \
        build-essential \
        git \
        unzip \
        htop \
        tree \
        vim \
        ufw \
        fail2ban \
        logrotate \
        cron
    
    log_success "System packages updated"
}

# Create non-root user
setup_user() {
    log "Setting up user account..."
    
    # Check if user already exists
    if id "$USERNAME" &>/dev/null; then
        log_warning "User $USERNAME already exists"
    else
        # Create user with home directory
        useradd -m -s /bin/bash "$USERNAME"
        
        # Add user to sudo group
        usermod -aG sudo "$USERNAME"
        
        log_success "User $USERNAME created and added to sudo group"
    fi
    
    # Setup SSH directory for user
    USER_HOME="/home/$USERNAME"
    SSH_DIR="$USER_HOME/.ssh"
    
    if [ ! -d "$SSH_DIR" ]; then
        mkdir -p "$SSH_DIR"
        chmod 700 "$SSH_DIR"
        chown "$USERNAME:$USERNAME" "$SSH_DIR"
        log_success "SSH directory created for $USERNAME"
    fi
    
    # Copy root's authorized_keys to user (if exists)
    if [ -f "/root/.ssh/authorized_keys" ] && [ ! -f "$SSH_DIR/authorized_keys" ]; then
        cp /root/.ssh/authorized_keys "$SSH_DIR/authorized_keys"
        chmod 600 "$SSH_DIR/authorized_keys"
        chown "$USERNAME:$USERNAME" "$SSH_DIR/authorized_keys"
        log_success "SSH keys copied to $USERNAME"
    fi
}

# Install Node.js via NVM for the non-root user
install_nodejs() {
        log "Installing Node.js via NVM for user $USERNAME..."

        USER_HOME="/home/$USERNAME"

        # Ensure curl is available (should be from update_system)
        if ! command -v curl >/dev/null 2>&1; then
                apt-get install -y curl
        fi

        # Install NVM and Node for the user
        sudo -u "$USERNAME" bash -lc '
                set -e
                export NVM_DIR="$HOME/.nvm"
                if [ ! -d "$NVM_DIR" ]; then
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                fi
                # shellcheck disable=SC1090
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                if [ "'$NODE_VERSION'" = "lts" ] || [ "'$NODE_VERSION'" = "LTS" ]; then
                    nvm install --lts
                    nvm use --lts
                    nvm alias default lts/*
                else
                    nvm install "'$NODE_VERSION'"
                    nvm use "'$NODE_VERSION'"
                    nvm alias default "'$NODE_VERSION'"
                fi
                node -v
                npm -v
                npm install -g npm@latest pm2
        '

        log_success "Node.js (via NVM) and PM2 installed for $USERNAME"
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    # Install Nginx
    apt-get install -y nginx
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Create custom Nginx configuration
    cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
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
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # File Upload
    client_max_body_size 10M;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx installed and configured"
}

# Install and configure PostgreSQL
install_postgresql() {
    log "Installing PostgreSQL..."
    
    # Install PostgreSQL
    apt-get install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Configure PostgreSQL
    sudo -u postgres psql << 'EOF'
-- Create application database and user
CREATE DATABASE myapp_production;
CREATE USER myapp_user WITH ENCRYPTED PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE myapp_production TO myapp_user;
ALTER USER myapp_user CREATEDB;
\q
EOF
    
    log_success "PostgreSQL installed and configured"
    log_warning "Please change the default database password!"
}

# Install Certbot for SSL certificates
install_certbot() {
    log "Installing Certbot for SSL certificates..."
    
    # Install snapd if not present
    apt-get install -y snapd
    
    # Install certbot via snap
    snap install core; snap refresh core
    snap install --classic certbot
    
    # Create symlink
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    log_success "Certbot installed"
}

# Configure firewall
setup_firewall() {
    log "Configuring UFW firewall..."
    
    # Reset UFW to default settings
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Configure SSH access (assignment requirement: trusted IPs only)
    if [ -n "$TRUSTED_IPS" ]; then
        log "Configuring SSH access for trusted IPs only..."
        # Split trusted IPs and allow each one
        IFS=',' read -ra IP_ARRAY <<< "$TRUSTED_IPS"
        for ip in "${IP_ARRAY[@]}"; do
            ip=$(echo "$ip" | xargs)  # Trim whitespace
            if [ -n "$ip" ]; then
                ufw allow from "$ip" to any port $SSH_PORT comment "SSH from trusted IP"
                log "  Allowed SSH from: $ip"
            fi
        done
        log_success "SSH restricted to trusted IPs only"
    else
        log_warning "No trusted IPs specified. Allowing SSH from any IP (not recommended for production)"
        log_warning "Set TRUSTED_IPS variable or use --trusted-ips flag for security"
        ufw allow $SSH_PORT/tcp
    fi
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable UFW
    ufw --force enable
    
    log_success "UFW firewall configured and enabled"
}

# Configure SSH hardening (assignment requirement)
setup_ssh_hardening() {
    log "Configuring SSH hardening..."
    
    # Backup original SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Create hardened SSH configuration
    cat > /etc/ssh/sshd_config << 'EOF'
# SSH Hardening Configuration for Assignment M11

# Basic Settings
Port 22
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Authentication (assignment requirement: key-based only)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Security Restrictions
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable dangerous features
AllowAgentForwarding no
AllowTcpForwarding no
X11Forwarding no
PrintMotd no
PrintLastLog yes
TCPKeepAlive yes
Compression delayed

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Subsystem for SFTP
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

    # Restart SSH service
    systemctl restart sshd
    systemctl status sshd --no-pager
    
    log_success "SSH hardening configured"
    log_warning "IMPORTANT: Ensure you can login with SSH keys before logging out!"
}

# Configure Fail2Ban
setup_fail2ban() {
    log "Configuring Fail2Ban..."
    
    # Create local configuration
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
EOF
    
    # Start and enable Fail2Ban
    systemctl start fail2ban
    systemctl enable fail2ban
    
    log_success "Fail2Ban configured and started"
}

# Setup automatic security updates
setup_auto_updates() {
    log "Setting up automatic security updates..."
    
    # Install unattended-upgrades
    apt-get install -y unattended-upgrades apt-listchanges
    
    # Configure automatic updates
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF
    
    cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    
    log_success "Automatic security updates configured"
}

# Setup swap file
setup_swap() {
    log "Setting up swap file..."
    
    # Check if swap already exists
    if swapon --show | grep -q '/swapfile'; then
        log_warning "Swap file already exists"
        return
    fi
    
    # Create 2GB swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make swap permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Configure swappiness
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    
    log_success "2GB swap file created and configured"
}

# Setup log rotation
setup_logrotate() {
    log "Setting up log rotation..."
    
    # Create logrotate configuration for application logs
    cat > /etc/logrotate.d/nodejs-apps << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USERNAME $USERNAME
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}

/var/log/app/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USERNAME $USERNAME
}
EOF
    
    # Create application log directory
    mkdir -p /var/log/app
    chown $USERNAME:$USERNAME /var/log/app
    
    log_success "Log rotation configured"
}

# Setup system monitoring
setup_monitoring() {
    log "Setting up basic system monitoring..."
    
    # Install monitoring tools
    apt-get install -y htop iotop nethogs
    
    # Create system monitoring script
    cat > /usr/local/bin/system-status << 'EOF'
#!/bin/bash

echo "=== System Status Report ==="
echo "Generated: $(date)"
echo

echo "=== System Information ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo

echo "=== Memory Usage ==="
free -h
echo

echo "=== Disk Usage ==="
df -h
echo

echo "=== Network Connections ==="
ss -tuln | head -10
echo

echo "=== Top Processes by CPU ==="
ps aux --sort=-%cpu | head -6
echo

echo "=== Top Processes by Memory ==="
ps aux --sort=-%mem | head -6
echo

echo "=== Service Status ==="
echo "Nginx: $(systemctl is-active nginx)"
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo "Fail2Ban: $(systemctl is-active fail2ban)"
echo "UFW: $(ufw status | head -1)"
EOF
    
    chmod +x /usr/local/bin/system-status
    
    log_success "System monitoring tools installed"
}

# Create deployment user setup
setup_deployment_user() {
    log "Setting up deployment environment for $USERNAME..."
    
    USER_HOME="/home/$USERNAME"
    
    # Create application directories
    sudo -u "$USERNAME" mkdir -p "$USER_HOME/apps"
    sudo -u "$USERNAME" mkdir -p "$USER_HOME/backups"
    sudo -u "$USERNAME" mkdir -p "$USER_HOME/scripts"
    
    # Create PM2 log directory
    mkdir -p /var/log/pm2
    chown "$USERNAME:$USERNAME" /var/log/pm2
    
    # Setup PM2 for the user
    sudo -u "$USERNAME" bash -c '
        export PATH="$PATH:/usr/bin"
        pm2 startup systemd -u '$USERNAME' --hp '$USER_HOME'
    '
    
    # Create useful aliases
    cat >> "$USER_HOME/.bashrc" << 'EOF'

# Custom aliases for deployment
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias pm2-status='pm2 status'
alias pm2-logs='pm2 logs'
alias nginx-test='sudo nginx -t'
alias nginx-reload='sudo systemctl reload nginx'
alias system-status='/usr/local/bin/system-status'

# Environment variables
export NODE_ENV=production
export PATH="$PATH:/usr/bin"
EOF
    
    chown "$USERNAME:$USERNAME" "$USER_HOME/.bashrc"
    
    log_success "Deployment environment configured for $USERNAME"
}

# Final system optimization
optimize_system() {
    log "Applying system optimizations..."
    
    # Optimize kernel parameters
    cat >> /etc/sysctl.conf << 'EOF'

# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.core.netdev_max_backlog = 5000

# File system optimizations
fs.file-max = 65536

# Security optimizations
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
EOF
    
    # Apply sysctl settings
    sysctl -p
    
    # Set file limits
    cat >> /etc/security/limits.conf << 'EOF'

# Increase file limits for web applications
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF
    
    log_success "System optimizations applied"
}

# Cleanup and finalize
finalize_setup() {
    log "Finalizing server setup..."
    
    # Clean package cache
    apt-get autoremove -y
    apt-get autoclean
    
    # Update locate database if available
    if command -v updatedb >/dev/null 2>&1; then
        updatedb || true
    fi
    
    # Generate SSH host keys if needed
    ssh-keygen -A
    
    log_success "Server setup finalized"
}

# Main setup function
main() {
    log "Starting server setup and provisioning..."
    
    check_root
    update_system
    setup_user
    install_nodejs
    install_nginx
    if [ -z "$SKIP_POSTGRESQL" ]; then
        install_postgresql
    else
        log_warning "Skipping PostgreSQL installation per flag"
    fi
    install_certbot
    setup_firewall
    setup_fail2ban
    setup_ssh_hardening
    setup_auto_updates
    if [ -z "$SKIP_SWAP" ]; then
        setup_swap
    else
        log_warning "Skipping swap setup per flag"
    fi
    setup_logrotate
    setup_monitoring
    setup_deployment_user
    optimize_system
    finalize_setup
    
    log_success "Server setup completed successfully!"
    echo
    log "Next steps:"
    echo "1. Switch to the $USERNAME user: sudo su - $USERNAME"
    echo "2. Run the deployment script: ./deploy.sh"
    echo "3. Configure your application environment variables"
    echo "4. Set up your domain DNS to point to this server"
    echo
    log "Useful commands:"
    echo "- Check system status: system-status"
    echo "- Monitor processes: htop"
    echo "- Check PM2 status: pm2 status"
    echo "- Check Nginx status: sudo systemctl status nginx"
    echo "- Check firewall: sudo ufw status"
    echo "- Check Fail2Ban: sudo fail2ban-client status"
    echo
    log_warning "SECURITY: Verify SSH key access works before logging out!"
}
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -u, --username      Username to create (default: ubuntu)"
    echo "  -n, --node-version  Node.js version to install (default: lts)"
    echo "  -p, --ssh-port      SSH port (default: 22)"
    echo "  -t, --trusted-ips   Comma-separated trusted IPs for SSH (assignment security requirement)"
    echo "  --skip-postgresql   Skip PostgreSQL installation"
    echo "  --skip-swap         Skip swap file creation"
    echo ""
    echo "Example:"
    echo "  $0 -u myuser -n 18 -p 2222 -t '203.0.113.10,192.168.1.0/24'"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -u|--username)
            USERNAME="$2"
            shift 2
            ;;
        -n|--node-version)
            NODE_VERSION="$2"
            shift 2
            ;;
        -p|--ssh-port)
            SSH_PORT="$2"
            shift 2
            ;;
        -t|--trusted-ips)
            TRUSTED_IPS="$2"
            shift 2
            ;;
        --skip-postgresql)
            SKIP_POSTGRESQL=true
            shift
            ;;
        --skip-swap)
            SKIP_SWAP=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main