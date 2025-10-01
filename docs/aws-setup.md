# AWS EC2 Setup Guide

This guide walks you through setting up an AWS EC2 instance for deploying your full-stack application.

## Prerequisites

- AWS Account with billing enabled
- Basic understanding of AWS services
- SSH client installed on your local machine

## Step 1: Create AWS Account

1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add a payment method (required even for free tier)
5. Verify your identity

## Step 2: Launch EC2 Instance

### 2.1 Access EC2 Dashboard

1. Log into AWS Console
2. Search for "EC2" in the services search bar
3. Click on "EC2" to open the dashboard
4. Select your preferred region (e.g., us-east-1)

### 2.2 Launch Instance

1. Click "Launch Instance" button
2. Configure the following settings:

#### Name and Tags
- **Name**: `portfolio-app-server` (or your preferred name)
- **Tags**: Add any additional tags for organization

#### Application and OS Images (Amazon Machine Image)
- **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
- **Architecture**: 64-bit (x86)

#### Instance Type
- **Instance Type**: `t2.micro` (eligible for free tier)
- **vCPUs**: 1
- **Memory**: 1 GiB

#### Key Pair (Login)
- **Key pair name**: Create new key pair
  - Name: `portfolio-app-key` (or your preferred name)
  - Key pair type: RSA
  - Private key file format: .pem
- **Download** the .pem file and store it securely
- **Important**: You cannot download this file again!

#### Network Settings
- **VPC**: Default VPC
- **Subnet**: Default subnet
- **Auto-assign public IP**: Enable
- **Firewall (Security Groups)**: Create security group
  - **Security group name**: `portfolio-app-sg`
  - **Description**: Security group for portfolio application

#### Configure Storage
- **Root volume**: 8 GiB gp3 (default)
- **Encrypted**: No (for simplicity, but recommended for production)

### 2.3 Review and Launch

1. Review all settings
2. Click "Launch Instance"
3. Wait for instance to be in "Running" state

## Step 3: Configure Security Group

### 3.1 Edit Security Group Rules

1. Go to EC2 Dashboard → Security Groups
2. Select your security group (`portfolio-app-sg`)
3. Click "Edit inbound rules"
4. Add the following rules:

| Type  | Protocol | Port Range | Source    | Description           |
|-------|----------|------------|-----------|-----------------------|
| SSH   | TCP      | 22         | My IP     | SSH access            |
| HTTP  | TCP      | 80         | 0.0.0.0/0 | HTTP web traffic      |
| HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS web traffic     |
| Custom| TCP      | 3000       | 0.0.0.0/0 | Node.js app (temp)    |

### 3.2 Security Best Practices

- **SSH Access**: Restrict to "My IP" for better security
- **Temporary Rules**: Remove port 3000 rule after setting up reverse proxy
- **Regular Updates**: Review and update rules as needed

## Step 4: Connect to Your Instance

### 4.1 Get Connection Information

1. Go to EC2 Dashboard → Instances
2. Select your instance
3. Note the **Public IPv4 address**
4. Click "Connect" for connection instructions

### 4.2 SSH Connection

#### For Windows (using PuTTY)

1. **Convert .pem to .ppk**:
   - Download and install PuTTY
   - Open PuTTYgen
   - Load your .pem file
   - Save private key as .ppk file

2. **Connect with PuTTY**:
   - Host Name: `ubuntu@YOUR_PUBLIC_IP`
   - Port: 22
   - Connection Type: SSH
   - Auth → Private key file: Browse to your .ppk file
   - Click "Open"

#### For Windows (using PowerShell/WSL)

```powershell
# Set correct permissions (if using WSL)
chmod 400 path/to/your-key.pem

# Connect to instance
ssh -i "path/to/your-key.pem" ubuntu@YOUR_PUBLIC_IP
```

#### For Mac/Linux

```bash
# Set correct permissions
chmod 400 path/to/your-key.pem

# Connect to instance
ssh -i "path/to/your-key.pem" ubuntu@YOUR_PUBLIC_IP
```

### 4.3 First Connection

1. Accept the host key fingerprint when prompted
2. You should see the Ubuntu welcome message
3. You're now connected as the `ubuntu` user

## Step 5: Initial Server Setup

### 5.1 Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget unzip software-properties-common
```

### 5.2 Create Non-Root User

```bash
# Create new user (replace 'appuser' with your preferred username)
sudo adduser appuser

# Add user to sudo group
sudo usermod -aG sudo appuser

# Switch to new user
su - appuser
```

### 5.3 Set Up SSH for New User

```bash
# Create .ssh directory
mkdir ~/.ssh
chmod 700 ~/.ssh

# Copy authorized keys from ubuntu user
sudo cp /home/ubuntu/.ssh/authorized_keys ~/.ssh/
sudo chown appuser:appuser ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 6: Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Step 7: Verify Setup

### 7.1 Test SSH Connection with New User

```bash
# From your local machine
ssh -i "path/to/your-key.pem" appuser@YOUR_PUBLIC_IP
```

### 7.2 Test Sudo Access

```bash
# Should work without password prompt
sudo apt update
```

## Troubleshooting

### Common Issues

1. **Permission denied (publickey)**
   - Check key file permissions: `chmod 400 your-key.pem`
   - Verify correct username (ubuntu for Ubuntu AMI)
   - Ensure security group allows SSH from your IP

2. **Connection timeout**
   - Check security group rules
   - Verify instance is running
   - Confirm public IP address

3. **Instance not accessible**
   - Check instance state (should be "running")
   - Verify public IP assignment
   - Review security group settings

### Useful Commands

```bash
# Check instance metadata
curl http://169.254.169.254/latest/meta-data/

# View system information
uname -a
lsb_release -a

# Check available disk space
df -h

# Check memory usage
free -h

# View running processes
ps aux
```

## Next Steps

Once your EC2 instance is set up and accessible:

1. Proceed to [Server Provisioning Guide](server-provisioning.md)
2. Install Node.js, Git, and other required software
3. Clone your application repository
4. Configure the deployment environment

## Cost Management

### Free Tier Limits
- **EC2**: 750 hours per month of t2.micro instances
- **EBS**: 30 GB of storage
- **Data Transfer**: 15 GB outbound per month

### Cost Optimization Tips
- Stop instances when not in use
- Use t2.micro for development/testing
- Monitor usage in AWS Billing Dashboard
- Set up billing alerts

## Security Considerations

- **Key Management**: Store SSH keys securely
- **Access Control**: Limit SSH access to specific IPs
- **Regular Updates**: Keep system packages updated
- **Monitoring**: Enable CloudWatch for monitoring
- **Backup**: Consider EBS snapshots for data backup

---

**Next**: [Server Provisioning Guide](server-provisioning.md)