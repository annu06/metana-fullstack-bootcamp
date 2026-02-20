# Deployment Testing Checklist

Use this checklist to validate your Module 11 deployment meets the assignment requirements.

## 1) EC2 + Network
- [ ] EC2 instance (Ubuntu 22.04) is running
- [ ] Security Group has inbound 80, 443 open (0.0.0.0/0) and SSH restricted
- [ ] Elastic IP attached (optional, recommended)

## 2) OS + Users
- [ ] Non-root sudo user created (e.g., ubuntu/appuser)
- [ ] Key-based SSH works for the user
- [ ] Password authentication disabled

## 3) Software Installed
- [ ] Node.js installed via NVM (node --version shows LTS)
- [ ] Git installed and configured (git --version)
- [ ] Nginx installed and active (systemctl status nginx)
- [ ] PM2 installed globally (pm2 --version)

## 4) App Deployment
- [ ] Repo cloned to /var/www/html/myapp (or your chosen path)
- [ ] Dependencies installed (npm ci / npm install)
- [ ] .env created with production values (no secrets in git)
- [ ] Build completed (npm run build if applicable)

## 5) Process Manager
- [ ] PM2 process online (pm2 status shows "online")
- [ ] pm2 save executed
- [ ] pm2 startup configured and enabled

## 6) Reverse Proxy
- [ ] Nginx site enabled under /etc/nginx/sites-enabled/myapp
- [ ] nginx -t passes; systemctl reload nginx succeeds
- [ ] HTTP GET http://SERVER/health returns 200

## 7) Domain + SSL
- [ ] Domain A record points to server IP
- [ ] Certbot obtained certificate for domain + www
- [ ] HTTPS works with valid certificate
- [ ] HTTP -> HTTPS redirect works

## 8) Security
- [ ] UFW enabled with only 22/80/443 (or custom SSH port)
- [ ] Fail2Ban installed and running (optional bonus)
- [ ] SSH hardened per docs (root login disabled, key-only)

## 9) Monitoring + Logs
- [ ] pm2 logs show no critical errors
- [ ] Nginx access/error logs reviewed
- [ ] health-check.sh returns healthy

## 10) Evidence
- [ ] Live URL included in README
- [ ] Screenshots or short video: HTTP and HTTPS access
- [ ] Cross-browser test screenshots (Chrome/Firefox/Safari/Edge)

Notes:
- Use scripts in scripts/ for deployment and monitoring.
- See docs/ for troubleshooting tips.
