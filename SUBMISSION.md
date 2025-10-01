# Module 11 Submission Template

Use this template to submit your assignment. Replace placeholders with your details and include it in your repo.

## 1) Live Application
- URL (HTTP): http://YOUR_DOMAIN_OR_IP
- URL (HTTPS): https://YOUR_DOMAIN

## 2) Repository
- GitHub repo URL: https://github.com/YOUR_ORG/YOUR_REPO
- Entry points: backend `server.js` (or `dist/server.js`), frontend (if separate): `client/`

## 3) Deployment Details
- EC2 AMI: Ubuntu 22.04 LTS
- Instance type: t2.micro (or other)
- Security Group: HTTP(80), HTTPS(443), SSH(22 or custom)
- Reverse proxy: Nginx
- Process manager: PM2
- Node installed via: NVM
- Database: PostgreSQL (if applicable)

## 4) SSL
- Certbot method: `--nginx` (auto) / `certonly --webroot`
- Date obtained: YYYY-MM-DD
- Renewal method: systemd timer / cron

## 5) Environment Variables
List non-sensitive keys only; mask secrets.
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://***
JWT_SECRET=***
CORS_ORIGIN=https://YOUR_DOMAIN
```

## 6) Screenshots / Video
Attach screenshots or link to a short video showing:
- HTTP access to site
- HTTPS access to site
- PM2 status
- Nginx config test (`nginx -t`)
- DNS A record pointing to EC2 IP

## 7) Post-Deployment Tests
- Followed `tests/deployment-test.md` and `tests/security-test.md`
- Notes on any issues and how you resolved them

## 8) Troubleshooting Notes
Add any gotchas you encountered (firewall rules, PM2 path, permissions, etc.)

## 9) Team / Ownership
- Deployed by: YOUR_NAME
- Date: YYYY-MM-DD
