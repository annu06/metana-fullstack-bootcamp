# Security Testing Checklist

Run through these checks after deployment to validate hardening.

## SSH Hardening
- [ ] SSH root login disabled (PermitRootLogin no)
- [ ] PasswordAuthentication no; key-only enforced
- [ ] Custom SSH port (optional) reflected in security group
- [ ] AllowUsers includes only expected user(s)

## Firewall
- [ ] UFW active
- [ ] Only SSH, HTTP, HTTPS allowed
- [ ] SSH limited to your IP where possible

## Packages + Updates
- [ ] unattended-upgrades installed and configured
- [ ] `apt update && apt upgrade -y` runs cleanly

## Nginx Security
- [ ] server_tokens off
- [ ] Security headers present (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, HSTS on HTTPS)
- [ ] .env, dotfiles, backup files blocked

## TLS/SSL
- [ ] Valid cert; no mixed content in browser
- [ ] HTTP -> HTTPS redirect
- [ ] certbot renew --dry-run succeeds

## App Security
- [ ] .env has strong secrets and correct permissions (600)
- [ ] JWT/SESSION secrets length >= 32 chars
- [ ] CORS tightened to production domain(s)
- [ ] Rate limiting active at Nginx and/or app layer

## Logging/Monitoring
- [ ] PM2 logs rotate and are readable only by privileged users
- [ ] Nginx logs present and viewable
- [ ] health-check.sh returns HEALTHY
- [ ] monitor.sh running in screen/tmux/systemd (optional)

## Database (if used)
- [ ] Strong DB credentials; non-superuser role
- [ ] DB not exposed publicly; listen on localhost
- [ ] Migrations applied successfully

## Backups (optional bonus)
- [ ] backup.sh runs and produces encrypted artifacts
- [ ] Restore path documented

Notes:
- Consult docs/security.md for exact hardening steps and commands.
