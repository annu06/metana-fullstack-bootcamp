# Security Hardening Guide

This guide covers implementing comprehensive security measures for your deployed application, including server hardening, application security, and monitoring.

## Prerequisites

- EC2 instance with Ubuntu 22.04 LTS
- Application deployed and running
- Nginx configured with SSL/HTTPS
- Basic understanding of Linux security concepts

## Step 1: SSH Hardening and Key-Based Authentication

### 1.1 Disable Password Authentication and Configure Trusted IPs

```bash
# Backup original SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Create hardened SSH configuration
sudo tee /etc/ssh/sshd_config << 'EOF'
# SSH Hardening Configuration for Assignment M11

# Basic Settings
Port 22
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Authentication
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Security Restrictions
AllowUsers ubuntu admin  # Add specific users only
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

# Trusted IP restrictions (ASSIGNMENT REQUIREMENT)
# Replace with your actual IP addresses
# Example: AllowUsers ubuntu@192.168.1.100 ubuntu@203.0.113.0/24
# For specific IPs only:
# Match Address 203.0.113.10,203.0.113.20
#   AllowUsers ubuntu admin
# Match Address 192.168.1.0/24
#   AllowUsers ubuntu

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Subsystem for SFTP
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

# Restart SSH service
sudo systemctl restart sshd
sudo systemctl status sshd
```

### 1.2 Configure Trusted IP Access (Assignment Requirement)

The assignment requires: "Close unnecessary ports and SSH should only be accessible from trusted IPs"

#### Method 1: SSH Config with Match Blocks

```bash
# Edit SSH config to allow specific IPs only
sudo nano /etc/ssh/sshd_config

# Add these lines (replace with your actual IPs):
# For office/home IP ranges
Match Address 203.0.113.0/24,192.168.1.0/24
    AllowUsers ubuntu admin
    PasswordAuthentication no

# For specific trusted IPs
Match Address 203.0.113.10,203.0.113.20,198.51.100.50
    AllowUsers ubuntu

# Block all other IPs (this goes at the end)
Match Address *
    DenyUsers *
```

#### Method 2: UFW Firewall Rules for SSH

```bash
# Remove default SSH rule
sudo ufw delete allow ssh

# Allow SSH only from trusted IPs (replace with your IPs)
sudo ufw allow from 203.0.113.10 to any port 22 comment 'SSH from office'
sudo ufw allow from 203.0.113.20 to any port 22 comment 'SSH from home'
sudo ufw allow from 192.168.1.0/24 to any port 22 comment 'SSH from local network'

# Enable firewall
sudo ufw enable
```

#### Method 3: AWS Security Group (Recommended)

```bash
# Get your current public IP
MY_IP=$(curl -s https://ipecho.net/plain)
echo "Your current IP: $MY_IP"

# Using AWS CLI to update security group (replace sg-xxxxx with your SG ID)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32 \
    --description "SSH from my current IP"

# Remove the default 0.0.0.0/0 SSH rule
aws ec2 revoke-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0
```

### 1.3 SSH Key Management Best Practices

```bash
# Generate strong SSH key pair (if not already done)
ssh-keygen -t ed25519 -b 4096 -f ~/.ssh/id_ed25519_aws -C "aws-ec2-$(date +%Y%m%d)"

# Copy public key to server (from your local machine)
ssh-copy-id -i ~/.ssh/id_ed25519_aws.pub ubuntu@YOUR_EC2_IP

# On the server, secure the authorized_keys file
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R $USER:$USER ~/.ssh

# Verify key-based login works before disabling passwords
ssh -i ~/.ssh/id_ed25519_aws ubuntu@YOUR_EC2_IP
```

### 1.4 Additional SSH Security Measures

```bash
# Change SSH port (optional, for security through obscurity)
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Install and configure SSH banner
sudo tee /etc/ssh/banner << 'EOF'
***************************************************************************
                            AUTHORIZED ACCESS ONLY
This system is for authorized users only. All activities are monitored
and logged. Unauthorized access will be prosecuted to the full extent
of the law.
***************************************************************************
EOF

# Add banner to SSH config
echo "Banner /etc/ssh/banner" | sudo tee -a /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd
```

### 1.5 SSH Security Verification Script

Create this script to verify SSH security:

```bash
#!/bin/bash
# ssh-security-check.sh

echo "=== SSH Security Audit ==="
echo

echo "1. SSH Configuration Check:"
echo "  - Root login disabled: $(sudo grep "^PermitRootLogin no" /etc/ssh/sshd_config && echo "✅ YES" || echo "❌ NO")"
echo "  - Password auth disabled: $(sudo grep "^PasswordAuthentication no" /etc/ssh/sshd_config && echo "✅ YES" || echo "❌ NO")"
echo "  - Key auth enabled: $(sudo grep "^PubkeyAuthentication yes" /etc/ssh/sshd_config && echo "✅ YES" || echo "❌ NO")"

echo
echo "2. SSH Port and Protocol:"
sudo grep "^Port\|^Protocol" /etc/ssh/sshd_config

echo
echo "3. Active SSH Sessions:"
who | grep pts

echo
echo "4. Recent SSH Login Attempts:"
sudo tail -10 /var/log/auth.log | grep sshd

echo
echo "5. Firewall SSH Rules:"
sudo ufw status | grep 22

echo
echo "6. Fail2Ban SSH Protection:"
sudo fail2ban-client status sshd 2>/dev/null || echo "Fail2Ban not configured for SSH"
```

Make it executable:

```bash
chmod +x ssh-security-check.sh
./ssh-security-check.sh
```

### 1.2 Create SSH Banner

```bash
# Create warning banner
sudo nano /etc/ssh/banner
```

```
***************************************************************************
                            NOTICE TO USERS

This computer system is the private property of its owner, whether
individual, corporate or government. It is for authorized use only.
Users (authorized or unauthorized) have no explicit or implicit
expectation of privacy.

Any or all uses of this system and all files on this system may be
intercepted, monitored, recorded, copied, audited, inspected, and
disclosed to your employer, to authorized site, government, and law
enforcement personnel, as well as authorized officials of government
agencies, both domestic and foreign.

By using this system, the user consents to such interception, monitoring,
recording, copying, auditing, inspection, and disclosure at the
discretion of such personnel or officials. Unauthorized or improper use
of this system may result in civil and criminal penalties and
administrative or disciplinary action, as appropriate. By continuing to
use this system you indicate your awareness of and consent to these terms
and conditions of use. LOG OFF IMMEDIATELY if you do not agree to the
conditions stated in this warning.
***************************************************************************
```

### 1.3 Apply SSH Configuration

```bash
# Test SSH configuration
sudo sshd -t

# Restart SSH service
sudo systemctl restart sshd

# Verify SSH is running on new port (if changed)
sudo netstat -tulpn | grep :2222
```

### 1.4 Update Security Group (if port changed)

```bash
# If you changed SSH port, update AWS Security Group:
# 1. Go to EC2 Console → Security Groups
# 2. Edit inbound rules
# 3. Change SSH rule from port 22 to 2222
# 4. Remove old port 22 rule
```

## Step 2: Firewall Configuration

### 2.1 Configure UFW (Uncomplicated Firewall)

```bash
# Reset UFW to default settings
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if changed)
sudo ufw allow 2222/tcp  # or 22 if using default

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific IPs only for SSH (recommended)
# Replace YOUR_IP with your actual IP address
sudo ufw allow from YOUR_IP to any port 2222

# Enable UFW
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 2.2 Advanced UFW Rules

```bash
# Rate limiting for SSH
sudo ufw limit ssh

# Allow specific application profiles
sudo ufw allow 'Nginx Full'

# Block specific countries (using iptables)
# Install xtables-addons for country blocking
sudo apt install -y xtables-addons-common

# Deny access from specific IP ranges
sudo ufw deny from 192.168.1.0/24

# Log denied connections
sudo ufw logging on
```

### 2.3 Monitor Firewall Logs

```bash
# View UFW logs
sudo tail -f /var/log/ufw.log

# Create log monitoring script
cat > ~/monitor-firewall.sh << 'EOF'
#!/bin/bash
echo "=== Recent UFW Blocks ==="
sudo grep "\[UFW BLOCK\]" /var/log/ufw.log | tail -10
echo
echo "=== Top Blocked IPs ==="
sudo grep "\[UFW BLOCK\]" /var/log/ufw.log | awk '{print $12}' | sort | uniq -c | sort -nr | head -10
EOF

chmod +x ~/monitor-firewall.sh
```

## Step 3: Fail2Ban Installation and Configuration

### 3.1 Install Fail2Ban

```bash
# Install Fail2Ban
sudo apt update
sudo apt install -y fail2ban

# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo systemctl status fail2ban
```

### 3.2 Configure Fail2Ban

```bash
# Create local configuration file
sudo nano /etc/fail2ban/jail.local
```

**Fail2Ban configuration**:

```ini
[DEFAULT]
# Ban time (in seconds)
bantime = 3600

# Find time window (in seconds)
findtime = 600

# Number of failures before ban
maxretry = 3

# Ignore local IPs
ignoreip = 127.0.0.1/8 ::1 YOUR_IP_ADDRESS

# Email notifications (optional)
# destemail = your-email@example.com
# sendername = Fail2Ban
# mta = sendmail

[sshd]
enabled = true
port = 2222  # Change if you modified SSH port
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

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 7200
```

### 3.3 Create Custom Filters

```bash
# Create filter for application-specific attacks
sudo nano /etc/fail2ban/filter.d/nginx-botsearch.conf
```

```ini
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*(\.|%2e)(\.|%2e)(\.|%2e)(\.|%2e).*" 404.*$
            ^<HOST> -.*"(GET|POST).*(etc/passwd|proc/self/environ|usr/bin/id|bin/echo).*" 404.*$
            ^<HOST> -.*"(GET|POST).*(\\x|\\\\|\\u00).*" 404.*$

ignoreregex =
```

### 3.4 Test and Start Fail2Ban

```bash
# Test configuration
sudo fail2ban-client -t

# Restart Fail2Ban
sudo systemctl restart fail2ban

# Check jail status
sudo fail2ban-client status

# Check specific jail
sudo fail2ban-client status sshd
```

## Step 4: System Updates and Package Management

### 4.1 Configure Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades apt-listchanges

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Edit configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

**Recommended settings**:

```bash
// Automatically upgrade packages from these origins
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

// Remove unused automatically installed kernel-related packages
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";

// Remove unused dependencies
Unattended-Upgrade::Remove-Unused-Dependencies "true";

// Automatically reboot if required
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";

// Email notifications
// Unattended-Upgrade::Mail "your-email@example.com";
```

### 4.2 Package Security Monitoring

```bash
# Install security monitoring tools
sudo apt install -y debsums rkhunter chkrootkit

# Create package verification script
cat > ~/check-packages.sh << 'EOF'
#!/bin/bash
echo "=== Package Integrity Check ==="
sudo debsums -c

echo "\n=== Rootkit Check ==="
sudo rkhunter --check --skip-keypress

echo "\n=== Available Security Updates ==="
apt list --upgradable | grep -i security
EOF

chmod +x ~/check-packages.sh
```

## Step 5: Application Security

### 5.1 Environment Variables Security

```bash
# Secure environment file
chmod 600 /var/www/html/myapp/.env
chown $USER:$USER /var/www/html/myapp/.env

# Verify permissions
ls -la /var/www/html/myapp/.env
```

### 5.2 File Permissions Hardening

```bash
# Set secure permissions for application files
sudo chown -R $USER:www-data /var/www/html/myapp
sudo chmod -R 750 /var/www/html/myapp
sudo chmod -R 755 /var/www/html/myapp/public
sudo chmod 644 /var/www/html/myapp/public/*

# Secure log files
sudo chown -R $USER:adm /var/log/app
sudo chmod -R 640 /var/log/app

# Create permission check script
cat > ~/check-permissions.sh << 'EOF'
#!/bin/bash
echo "=== Application File Permissions ==="
ls -la /var/www/html/myapp/
echo
echo "=== Environment File Security ==="
ls -la /var/www/html/myapp/.env
echo
echo "=== Log File Permissions ==="
ls -la /var/log/app/
EOF

chmod +x ~/check-permissions.sh
```

### 5.3 Database Security

```bash
# PostgreSQL security (if using PostgreSQL)
sudo -u postgres psql << 'EOF'
-- Remove default postgres user password
ALTER USER postgres PASSWORD NULL;

-- Create application-specific user with limited privileges
CREATE USER app_readonly WITH PASSWORD 'secure_readonly_password';
GRANT CONNECT ON DATABASE myapp_production TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- Set connection limits
ALTER USER myapp_user CONNECTION LIMIT 10;

\q
EOF

# Configure PostgreSQL authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Secure pg_hba.conf settings**:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    myapp_production myapp_user     127.0.0.1/32           md5
host    all             all             127.0.0.1/32           reject
```

## Step 6: Monitoring and Intrusion Detection

### 6.1 Install and Configure AIDE

```bash
# Install AIDE (Advanced Intrusion Detection Environment)
sudo apt install -y aide

# Initialize AIDE database
sudo aideinit

# Move database to proper location
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Create AIDE check script
cat > ~/aide-check.sh << 'EOF'
#!/bin/bash
echo "=== AIDE Integrity Check ==="
sudo aide --check

# Update database after legitimate changes
# sudo aide --update
# sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
EOF

chmod +x ~/aide-check.sh
```

### 6.2 Log Monitoring Setup

```bash
# Install logwatch
sudo apt install -y logwatch

# Configure logwatch
sudo nano /etc/logwatch/conf/logwatch.conf
```

**Logwatch configuration**:

```
LogDir = /var/log
TmpDir = /var/cache/logwatch
Output = mail
Format = html
Encode = none
MailTo = your-email@example.com
MailFrom = logwatch@your-domain.com
Subject = Logwatch Report
Detail = Med
Service = All
Range = yesterday
```

### 6.3 Real-time Log Monitoring

```bash
# Create comprehensive log monitoring script
cat > ~/monitor-security.sh << 'EOF'
#!/bin/bash

echo "=== Security Monitoring Report ==="
echo "Generated: $(date)"
echo

echo "=== Failed SSH Attempts ==="
sudo grep "Failed password" /var/log/auth.log | tail -10
echo

echo "=== Successful SSH Logins ==="
sudo grep "Accepted publickey" /var/log/auth.log | tail -5
echo

echo "=== Fail2Ban Status ==="
sudo fail2ban-client status
echo

echo "=== UFW Recent Blocks ==="
sudo grep "\[UFW BLOCK\]" /var/log/ufw.log | tail -5
echo

echo "=== Nginx Error Log ==="
sudo tail -5 /var/log/nginx/error.log
echo

echo "=== System Load ==="
uptime
echo

echo "=== Disk Usage ==="
df -h
echo

echo "=== Memory Usage ==="
free -h
echo

echo "=== Active Connections ==="
ss -tuln
EOF

chmod +x ~/monitor-security.sh
```

## Step 7: Backup and Recovery Security

### 7.1 Secure Backup Script

```bash
# Create secure backup script
cat > ~/secure-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/$USER/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
ENCRYPTION_KEY="/home/$USER/.backup_key"

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate encryption key if it doesn't exist
if [ ! -f $ENCRYPTION_KEY ]; then
    openssl rand -base64 32 > $ENCRYPTION_KEY
    chmod 600 $ENCRYPTION_KEY
fi

# Backup application files
tar -czf - -C /var/www/html myapp | openssl enc -aes-256-cbc -salt -pass file:$ENCRYPTION_KEY > $BACKUP_DIR/app_$DATE.tar.gz.enc

# Backup database
pg_dump -h localhost -U myapp_user myapp_production | openssl enc -aes-256-cbc -salt -pass file:$ENCRYPTION_KEY > $BACKUP_DIR/db_$DATE.sql.enc

# Backup configuration files
tar -czf - /etc/nginx/sites-available /etc/ssl /home/$USER/.ssh | openssl enc -aes-256-cbc -salt -pass file:$ENCRYPTION_KEY > $BACKUP_DIR/config_$DATE.tar.gz.enc

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "*.enc" -mtime +7 -delete

echo "Secure backup completed: $DATE"
EOF

chmod +x ~/secure-backup.sh
```

### 7.2 Backup Verification Script

```bash
# Create backup verification script
cat > ~/verify-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/$USER/backups"
ENCRYPTION_KEY="/home/$USER/.backup_key"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/app_*.tar.gz.enc | head -1)

if [ -f "$LATEST_BACKUP" ]; then
    echo "Verifying backup: $LATEST_BACKUP"

    # Test decryption
    openssl enc -aes-256-cbc -d -salt -pass file:$ENCRYPTION_KEY -in "$LATEST_BACKUP" | tar -tzf - > /dev/null

    if [ $? -eq 0 ]; then
        echo "Backup verification successful"
    else
        echo "Backup verification failed!"
        exit 1
    fi
else
    echo "No backup files found"
    exit 1
fi
EOF

chmod +x ~/verify-backup.sh
```

## Step 8: Network Security

### 8.1 Network Monitoring

```bash
# Install network monitoring tools
sudo apt install -y netstat-nat iftop nethogs

# Create network monitoring script
cat > ~/monitor-network.sh << 'EOF'
#!/bin/bash

echo "=== Active Network Connections ==="
ss -tuln
echo

echo "=== Listening Services ==="
sudo netstat -tlnp
echo

echo "=== Network Statistics ==="
ss -s
echo

echo "=== Recent Network Activity ==="
sudo journalctl -u systemd-networkd --since "1 hour ago" | tail -10
EOF

chmod +x ~/monitor-network.sh
```

### 8.2 Port Scanning Detection

```bash
# Install portsentry
sudo apt install -y portsentry

# Configure portsentry
sudo nano /etc/portsentry/portsentry.conf
```

**Key portsentry settings**:

```
# Block scans
BLOCK_UDP="1"
BLOCK_TCP="1"

# Kill route (blocks the IP)
KILL_ROUTE="/sbin/iptables -I INPUT -s $TARGET$ -j DROP"

# Ports to monitor
TCP_PORTS="1,7,9,11,15,70,79,80,109,110,111,119,138,139,143,512,513,514,515,540,635,1080,1524,2000,2001,4000,4001,5742,6000,6001,6667,12345,12346,20034,27665,31337,32771,32772,32773,32774,40421,49724,54320"
UDP_PORTS="1,7,9,69,161,162,513,635,640,641,700,32770,32771,32772,32773,32774,31337,54321"
```

## Step 9: Application-Level Security

### 9.1 Node.js Security Headers

**Add to your Express application**:

```javascript
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);

// Strict rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use("/api/auth/", authLimiter);
```

### 9.2 Input Validation and Sanitization

```javascript
const validator = require("validator");
const xss = require("xss");

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize all string inputs
  for (let key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = xss(req.body[key]);
      req.body[key] = validator.escape(req.body[key]);
    }
  }
  next();
};

app.use(validateInput);
```

## Step 10: Compliance and Auditing

### 10.1 Security Audit Script

```bash
# Create comprehensive security audit script
cat > ~/security-audit.sh << 'EOF'
#!/bin/bash

echo "=== SECURITY AUDIT REPORT ==="
echo "Generated: $(date)"
echo "Host: $(hostname)"
echo "User: $(whoami)"
echo

echo "=== System Information ==="
uname -a
echo

echo "=== SSH Configuration ==="
echo "SSH Port: $(sudo grep "^Port" /etc/ssh/sshd_config || echo "22 (default)")"
echo "Root Login: $(sudo grep "^PermitRootLogin" /etc/ssh/sshd_config)"
echo "Password Auth: $(sudo grep "^PasswordAuthentication" /etc/ssh/sshd_config)"
echo

echo "=== Firewall Status ==="
sudo ufw status
echo

echo "=== Fail2Ban Status ==="
sudo fail2ban-client status
echo

echo "=== Listening Services ==="
sudo netstat -tlnp
echo

echo "=== User Accounts ==="
cut -d: -f1 /etc/passwd | sort
echo

echo "=== Sudo Users ==="
grep -Po '^\K[^:]*(?=.*sudo)' /etc/group
echo

echo "=== File Permissions Check ==="
find /var/www/html -type f -perm /o+w 2>/dev/null | head -10
echo

echo "=== Recent Logins ==="
last -10
echo

echo "=== System Updates ==="
apt list --upgradable 2>/dev/null | wc -l
echo " packages available for update"
echo

echo "=== Disk Usage ==="
df -h
echo

echo "=== Memory Usage ==="
free -h
echo

echo "=== Load Average ==="
uptime
EOF

chmod +x ~/security-audit.sh
```

### 10.2 Automated Security Checks

```bash
# Schedule security checks
crontab -e

# Add these lines:
# Daily security audit at 6 AM
0 6 * * * /home/ubuntu/security-audit.sh > /var/log/security-audit.log 2>&1

# Weekly backup verification
0 7 * * 0 /home/ubuntu/verify-backup.sh >> /var/log/backup-verification.log 2>&1

# Daily AIDE check
0 5 * * * /home/ubuntu/aide-check.sh >> /var/log/aide-check.log 2>&1
```

## Troubleshooting Security Issues

### Common Security Problems

1. **SSH connection refused**

   ```bash
   # Check SSH service status
   sudo systemctl status sshd

   # Check SSH configuration
   sudo sshd -t

   # Check firewall rules
   sudo ufw status
   ```

2. **Fail2Ban not working**

   ```bash
   # Check Fail2Ban status
   sudo fail2ban-client status

   # Check logs
   sudo tail -f /var/log/fail2ban.log

   # Restart Fail2Ban
   sudo systemctl restart fail2ban
   ```

3. **Certificate issues**

   ```bash
   # Check certificate validity
   openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

   # Test SSL configuration
   sudo nginx -t
   ```

### Security Monitoring Commands

```bash
# Monitor failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check for suspicious network activity
sudo netstat -an | grep :80 | wc -l

# Monitor file changes
sudo find /var/www/html -type f -mtime -1

# Check system integrity
sudo debsums -c | head -10
```

## Next Steps

Once security hardening is complete:

1. Proceed to [Troubleshooting Guide](troubleshooting.md)
2. Set up monitoring and alerting
3. Create incident response procedures
4. Regular security assessments

---

**Next**: [Troubleshooting Guide](troubleshooting.md)
