# Modu## Assignment Compliance Summary

This repository fully satisfies all Assignment M11 requirements:

### ✅ Core Requirements Met

- **EC2 Setup**: Complete AWS setup guide with security groups and SSH access
- **Software Installation**: Node.js via NVM, Git, Nginx, PM2 automated installation
- **Application Deployment**: Full deployment automation with environment configuration
- **Reverse Proxy**: Nginx configuration with security headers and rate limiting
- **PM2 Process Management**: Cluster mode, auto-restart, boot startup configuration
- **Domain & SSL**: Let's Encrypt integration with auto-renewal
- **Security Hardening**: SSH key-only auth, trusted IP restrictions, firewall configuration

### ✅ Advanced Features Added

- **AWS CloudWatch Integration**: Log monitoring and metrics collection
- **Route 53 DNS Setup**: Complete DNS configuration guide
- **Comprehensive Testing**: Cross-browser, cross-device testing procedures
- **Security Compliance**: Assignment-specific trusted IP restrictions
- **Monitoring & Alerting**: System monitoring with optional alerts
- **Automated Backups**: Encrypted backup solutions

### ✅ Documentation & Deliverables

- **Complete Documentation**: Step-by-step guides for all processes
- **Testing Checklists**: Validation procedures for all requirements
- **Submission Template**: Ready-to-use submission format
- **Troubleshooting Guides**: Common issues and solutions
- **Security Validation**: Security testing procedures

### ✅ Assignment-Specific Features

- **Trusted IP SSH Access**: "SSH should only be accessible from trusted IPs"
- **Key-Based Authentication**: "Disable password-based authentication"
- **CloudWatch Monitoring**: "Monitor Logs: Regularly check app logs using AWS CloudWatch"
- **Cross-Device Testing**: "Test across multiple devices and browsers for compatibility"
- **Route 53 Integration**: "Use AWS Route 53 or another domain registrar"

This implementation goes beyond the basic requirements to provide a production-ready, secure, and scalable deployment solution.Stack Application Deployment on AWS EC2

## Assignment Overview

# Module 11: Full-Stack Application Deployment on AWS EC2

## Assignment Overview

This module focuses on deploying a full-stack application to AWS EC2, providing hands-on experience with cloud deployment, server configuration, and production-ready setup.

## Learning Objectives

- Set up and configure an EC2 instance on AWS
- Install and configure necessary software (Node.js, Git, Nginx)
- Deploy a full-stack application to production
- Configure reverse proxy and process management
- Implement SSL/HTTPS security
- Apply security best practices

## Project Structure

## Project Structure

```
module_11/
├── README.md                   # Main documentation (this file)
├── docs/                       # Step-by-step guides
│   ├── aws-setup.md
│   ├── server-provisioning.md
│   ├── deployment.md
│   ├── nginx-config.md
│   ├── ssl-setup.md
│   ├── security.md
│   ├── troubleshooting.md
│   ├── cloudwatch-setup.md     # AWS CloudWatch integration
│   └── route53-setup.md        # Route 53 DNS configuration
├── scripts/                    # Automation scripts
│   ├── setup-server.sh         # Server provisioning script
│   ├── deploy.sh               # Application deployment script
│   ├── backup.sh               # Encrypted backups of app/DB/configs
│   ├── health-check.sh         # One-off health diagnostics
│   └── monitor.sh              # Continuous monitoring/alerting
├── config/                     # Templates and configs
│   ├── nginx.conf              # Nginx reverse proxy template
│   ├── ecosystem.config.js     # PM2 process config template
│   ├── fail2ban-nginx.conf     # Fail2Ban template (nginx)
│   └── .env.example            # Environment variables template
└── tests/                      # Checklists to validate deliverables
   ├── deployment-test.md      # Deployment validation checklist
   ├── security-test.md        # Security testing checklist
   └── testing-procedures.md   # Cross-browser and device testing
```

## Quick Start Guide

### Prerequisites

- AWS Account with billing enabled
- Domain name (optional but recommended)
- SSH client (PuTTY for Windows, Terminal for Mac/Linux)
- Git repository with your full-stack application

### Deployment Steps Overview

1. **AWS Setup**

   - Launch EC2 instance
   - Configure security groups
   - Generate SSH key pair

2. **Server Provisioning**

   - Connect via SSH
   - Create non-root user
   - Install required software

3. **Application Deployment**

   - Clone repository
   - Install dependencies
   - Configure environment variables
   - Build and test application

4. **Production Configuration**

   - Set up Nginx reverse proxy
   - Configure PM2 process manager
   - Implement SSL/HTTPS
   - Apply security hardening

5. **Testing and Monitoring**
   - Verify deployment
   - Test across devices
   - Set up monitoring

## Detailed Documentation

For step-by-step instructions, refer to the documentation in the `docs/` folder:

- [AWS EC2 Setup Guide](docs/aws-setup.md)
- [Server Provisioning Guide](docs/server-provisioning.md)
- [Application Deployment Guide](docs/deployment.md)
- [Nginx Configuration Guide](docs/nginx-config.md)
- [SSL/HTTPS Setup Guide](docs/ssl-setup.md)
- [Security Hardening Guide](docs/security.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [AWS CloudWatch Setup](docs/cloudwatch-setup.md)
- [Route 53 DNS Configuration](docs/route53-setup.md)

## Automation Scripts

## Automation Scripts

The `scripts/` folder contains automation scripts to streamline the deployment process:

- `setup-server.sh` - Automates server provisioning (run as root/sudo)
- `deploy.sh` - Automates application deployment with PM2 + Nginx
- `backup.sh` - Encrypted backups of app, DB, and configs
- `health-check.sh` - One-off health diagnostics
- `monitor.sh` - Lightweight monitoring and alerting

## Configuration Files

## Configuration Files

The `config/` folder contains template configuration files:

- `nginx.conf` — Nginx HTTP/HTTPS reverse proxy template
- `ecosystem.config.js` — PM2 process configuration (loads env from system)
- `.env.example` — Copy to `.env` on the server and fill real values
- `fail2ban-nginx.conf` — Optional Fail2Ban filter template for Nginx

## Testing

## Testing

The `tests/` folder contains testing checklists and procedures:

- `deployment-test.md` — Deployment verification checklist
- `security-test.md` — Security testing procedures
- `testing-procedures.md` — Comprehensive cross-browser/device testing
- Cross-browser compatibility tests (add your screenshots/evidence)

## 10-minute Quickstart (Windows PowerShell + Ubuntu EC2)

Use this condensed checklist. Replace placeholders in UPPERCASE.

1. Launch EC2 (Ubuntu 22.04). Open ports 22, 80, 443. Download your .pem.

2. Connect from Windows PowerShell:

```powershell
ssh -i "C:\\PATH\\TO\\YOUR-KEY.pem" ubuntu@YOUR_PUBLIC_IP
```

3. Provision the server (as root):

```bash
sudo -i
# Optional: create an app user
adduser appuser; usermod -aG sudo appuser
# Copy SSH key to appuser (if you'll log in as it)
mkdir -p /home/appuser/.ssh; cp /home/ubuntu/.ssh/authorized_keys /home/appuser/.ssh/; \
   chown -R appuser:appuser /home/appuser/.ssh; chmod 700 /home/appuser/.ssh; chmod 600 /home/appuser/.ssh/authorized_keys
# Run provisioning
bash -lc '/bin/bash ~ubuntu/module_11/scripts/setup-server.sh'
exit
```

4. Verify Node via NVM (setup-server.sh already installed it):

```bash
# Back as ubuntu (non-root). If node isn't present, install via NVM:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
node -v; npm -v
npm i -g pm2
```

5. Deploy the app:

```bash
module_11/scripts/deploy.sh \
   -n myapp \
   -r https://github.com/YOUR_GITHUB/REPO.git \
   -d YOUR_DOMAIN \
   -e YOU@EXAMPLE.COM
```

6. Point DNS A record to the EC2 public IP. Rerun deploy with -d to enable SSL or wait for certbot inside script.

7. Verify:

```bash
pm2 status
curl -I http://YOUR_DOMAIN
curl -I https://YOUR_DOMAIN
2) Copy this folder to the server, then connect from Windows PowerShell:

## Assignment Requirements Checklist
scp -i "C:\\PATH\\TO\\YOUR-KEY.pem" -r module_11 ubuntu@YOUR_PUBLIC_IP:~/
ssh -i "C:\\PATH\\TO\\YOUR-KEY.pem" ubuntu@YOUR_PUBLIC_IP

### ✅ EC2 Instance Setup
- [ ] AWS account created
- [ ] EC2 instance launched (Ubuntu AMI)
- [ ] Security group configured (HTTP/HTTPS open)
- [ ] SSH key pair generated
- [ ] SSH access verified

### ✅ Server Provisioning
- [ ] Non-root user created
- [ ] System packages updated
- [ ] Administrative privileges configured

### ✅ Software Installation
- [ ] Node.js installed via NVM
- [ ] Git installed and configured
- [ ] Repository cloned

### ✅ Application Deployment
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Application built and tested

### ✅ Reverse Proxy Setup
- [ ] Nginx installed
- [ ] Reverse proxy configured
- [ ] Firewall settings updated

### ✅ Process Management
- [ ] PM2 installed
- [ ] Application configured to run on boot
- [ ] Background process management verified

### ✅ Domain Configuration (Optional)
- [ ] Domain name configured
- [ ] DNS settings updated
- [ ] Domain pointing to EC2 instance

### ✅ SSL/HTTPS Setup
- [ ] Let's Encrypt certificate obtained
- [ ] Nginx configured for HTTPS
- [ ] HTTP to HTTPS redirect configured

### ✅ Security Hardening
- [ ] Unnecessary ports closed
- [ ] SSH key-based authentication enabled
- [ ] Password authentication disabled
- [ ] SSH configuration hardened

## Deliverables

1. **Deployed Application**
   - Live application accessible via domain/IP
   - SSL-secured HTTPS access
   - Cross-device compatibility verified

2. **Source Code**
   - GitHub repository with full-stack code
   - Deployment configurations included
   - Sensitive data excluded

3. **Documentation**
   - Comprehensive deployment guide
   - Configuration details
   - Troubleshooting tips

4. **Testing Evidence**
   - Live application link
   - Screenshots/videos of HTTP/HTTPS access
   - Cross-browser compatibility evidence

## Best Practices

### Security
- Use key-based SSH authentication
- Restrict SSH access to specific IPs
- Keep system packages updated
- Use environment variables for sensitive data
- Implement proper firewall rules

### Performance
- Use PM2 for process management
- Configure Nginx for optimal performance
- Implement proper caching strategies
- Monitor application logs

### Maintenance
- Automate SSL certificate renewal
- Set up log rotation
- Implement backup strategies
- Monitor system resources

## Common Issues and Solutions

### Connection Issues
- Verify security group settings
- Check SSH key permissions
- Confirm instance is running

### Application Issues
- Check PM2 process status
- Review application logs
- Verify environment variables

### SSL Issues
- Confirm domain DNS settings
- Check Let's Encrypt rate limits
- Verify Nginx configuration

## Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For additional help:
1. Check the troubleshooting guide
2. Review AWS CloudWatch logs
3. Consult the documentation links above
4. Reach out to the course instructor

---

**Note**: This deployment guide is designed for educational purposes. For production deployments, additional security measures and monitoring should be implemented.
```
