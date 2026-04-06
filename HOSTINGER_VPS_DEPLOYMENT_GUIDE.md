# Moaser Dental Clinic - Hostinger VPS Deployment Guide

## Overview

This guide walks you through deploying the Moaser Dental Clinic application on a Hostinger VPS with Ubuntu and CloudPanel.

**Deployment Architecture:**
- Frontend (React/Vite): Ports 80/443 (served via Nginx reverse proxy, SSL enabled)
- Backend (Node.js/Express): Port 5000 (internal, behind Nginx reverse proxy)
- Database: SQLite (file-based, in `/root/moaser-clinic/server/`)
- Domain: yourdomain.com (configured in CloudPanel with SSL via Let's Encrypt)

---

## Prerequisites

- Hostinger VPS with Ubuntu 20.04+ and CloudPanel installed
- SSH access to your VPS
- Domain name configured to point to your VPS IP
- Basic Linux command knowledge

---

## Step 1: Connect to Your VPS via SSH

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Example:
ssh root@192.168.1.100
```

---

## Step 2: Update System and Install Dependencies

```bash
# Update package manager
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nodejs npm nginx

# Verify Node.js installation
node --version  # Should be v18+ 
npm --version   # Should be v9+

# If older version, install newer Node.js:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

---

## Step 3: Clone Your Repository

```bash
# Navigate to your web root directory (CloudPanel default)
cd /root

# Clone your repository
git clone https://github.com/yourname/moaser-clinic.git
cd moaser-clinic

# Install dependencies
npm install

# Rebuild native modules
npm rebuild
```

---

## Step 4: Configure Environment Variables for Production

Create a production `.env` file:

```bash
nano .env
```

Paste the following configuration:

```env
# Server Configuration (PRODUCTION)
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Frontend Configuration
VITE_API_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com

# JWT Configuration - CHANGE THIS!
JWT_SECRET=your-super-secure-random-string-min-32-characters-change-this
JWT_EXPIRY=24h

# Database Configuration
DATABASE_PATH=./server/evaluations.db

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Admin Credentials - CHANGE THESE!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-very-secure-password-here
ADMIN_EMAIL=your-email@yourdomain.com
```

**Replace:**
- `yourdomain.com` with your actual domain
- `JWT_SECRET` with a strong random string (generate one: `openssl rand -base64 32`)
- `ADMIN_PASSWORD` with a strong password

Save the file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Initialize Admin User

```bash
# Initialize the default admin user with your credentials
npm run init-admin

# You should see: "✓ Admin user created successfully"
```

---

## Step 6: Build Frontend

```bash
# Build the React/Vite application for production
npm run build

# This creates a `dist/` folder with optimized static files
```

---

## Step 7: Install PM2 for Process Management

PM2 keeps your Node.js backend running 24/7 and auto-restarts it if it crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend server using the ecosystem config
pm2 start ecosystem.config.js

# Make PM2 start automatically on reboot
pm2 startup
pm2 save

# Verify it's running
pm2 status
pm2 logs moaser-clinic
```

---

## Step 8: Configure Nginx Reverse Proxy (CloudPanel)

### Option A: Using CloudPanel Dashboard (Recommended)

1. **Login to CloudPanel** (usually https://your-vps-ip:8443)
2. Go to **Websites** → **Add Website**
3. Enter your domain name
4. Select **Custom** or **Node.js** as application type
5. Set to serve static files from: `/root/moaser-clinic/dist/` on ports 80/443
6. Create the website and enable SSL

### Option B: Manual Nginx Configuration

If CloudPanel doesn't support Node.js, create a custom Nginx config:

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/yourdomain.com.conf
```

Paste this configuration:

```nginx
# Upstream for Node.js backend
upstream moaser_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate paths (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory for static files (built frontend)
    root /root/moaser-clinic/dist;

    # Main location - serve React frontend
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API routes - proxy to Node.js backend
    location /api {
        proxy_pass http://moaser_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://moaser_backend;
        access_log off;
    }

    # Deny access to sensitive files
    location ~ /\.env {
        deny all;
    }

    location ~ /server {
        deny all;
    }

    # Log files
    access_log /var/log/nginx/yourdomain.com-access.log;
    error_log /var/log/nginx/yourdomain.com-error.log;
}
```

Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/yourdomain.com.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 9: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will ask for your email - use a real email for renewal reminders
# Certificates are saved to /etc/letsencrypt/live/yourdomain.com/

# Auto-renew SSL (certbot auto-renewal is usually enabled by default)
# Check if renewal is set:
systemctl status certbot.timer

# If not active, enable it:
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Step 10: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS traffic
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 5000/tcp   # Backend (internal only if needed)

# Enable firewall
ufw enable

# Verify rules
ufw status
```

---

## Step 11: Monitor and Maintain

### Check Application Status

```bash
# View PM2 process status
pm2 status

# View backend logs
pm2 logs moaser-clinic

# View specific log file
tail -f /root/moaser-clinic/server.log

# Nginx logs
tail -f /var/log/nginx/yourdomain.com-access.log
tail -f /var/log/nginx/yourdomain.com-error.log
```

### Database Backups

Create a backup script:

```bash
nano /root/moaser-clinic/backup.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/root/moaser-clinic/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="/root/moaser-clinic/server/evaluations.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/evaluations_$TIMESTAMP.db

# Keep only last 30 backups
cd $BACKUP_DIR
ls -t evaluations_*.db | tail -n +31 | xargs rm -f

echo "Backup created: evaluations_$TIMESTAMP.db"
```

Make it executable and schedule it:

```bash
chmod +x /root/moaser-clinic/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * /root/moaser-clinic/backup.sh
```

---

## Step 12: Verify Everything Works

### Check Backend

```bash
# Test backend is running
curl http://localhost:5000/health

# Should return:
# {"status":"ok"}
```

### Check Frontend Build

```bash
# Check if dist folder exists
ls -la /root/moaser-clinic/dist/

# Should see: index.html and other assets
```

### Test Your Domain

```bash
# HTTP should redirect to HTTPS
curl -I http://yourdomain.com

# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/

# HTTPS should work
curl -I https://yourdomain.com

# Should return: HTTP/2 200
```

---

## Step 13: Access Your Application

1. **Frontend**: https://yourdomain.com
2. **Admin Dashboard**: https://yourdomain.com/admin
3. **API Documentation**: Endpoints listed in `/server/README.md`

### First Login

- **Username**: `admin` (from .env)
- **Password**: Your admin password (from .env)
- **⚠️ Change password immediately after first login**

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs moaser-clinic

# Restart backend
pm2 restart moaser-clinic

# Check if port 5000 is in use
lsof -i :5000

# Check Node.js errors
node server/index.js
```

### Nginx 502 Bad Gateway

```bash
# Verify backend is running
pm2 status

# Check Nginx logs
tail -f /var/log/nginx/yourdomain.com-error.log

# Verify proxy configuration
nginx -t
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew --dry-run

# Renew certificate (if needed)
certbot renew
```

### High Memory Usage

```bash
# Monitor processes
top

# Check PM2 memory usage
pm2 monit

# If backend uses too much memory, increase Node.js limit
NODE_MAX_OLD_SPACE_SIZE=512 pm2 start ecosystem.config.js
```

---

## Performance Optimization

### 1. Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. Add Caching Headers

Already included in the Nginx config above for static files.

### 3. Enable HTTP/2

Already enabled in the Nginx config (http2).

### 4. Monitor Performance

```bash
# Check response times
tail -f /var/log/nginx/yourdomain.com-access.log | grep -oP 'upstream_response_time \K[^ ]*'

# Monitor CPU/Memory
top
htop  # (if installed)
```

---

## Update Application (After Changes)

```bash
# Pull latest changes
cd /root/moaser-clinic
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild frontend
npm run build

# Restart backend
pm2 restart moaser-clinic

# Verify logs
pm2 logs moaser-clinic
```

---

## Security Best Practices

✅ **Implemented:**
- [x] JWT authentication with 24-hour expiration
- [x] Password hashing with bcryptjs
- [x] Rate limiting on all endpoints
- [x] Input validation on all requests
- [x] CORS configured for specific domain
- [x] HTTPS/SSL enabled
- [x] Security headers configured

✅ **Additional Steps You Should Take:**
- [ ] Change default admin credentials immediately
- [ ] Use a strong JWT_SECRET (40+ random characters)
- [ ] Enable database backups (automated script provided)
- [ ] Monitor logs for suspicious activity
- [ ] Keep Node.js and dependencies updated: `npm update`
- [ ] Set up uptime monitoring (e.g., Uptimerobot.com)
- [ ] Regular security audits: `npm audit`

---

## Useful CloudPanel Commands

```bash
# Access CloudPanel
https://your-vps-ip:8443

# Useful paths in CloudPanel:
/etc/nginx/sites-available/   # Nginx configs
/home/*/public_html/          # Website files
/var/log/nginx/               # Nginx logs

# Restart services via SSH
systemctl restart nginx
systemctl restart php-fpm
systemctl status mysql
```

---

## Quick Reference: Common Tasks

### Restart Application
```bash
pm2 restart moaser-clinic
pm2 status
```

### View Logs
```bash
pm2 logs moaser-clinic --lines 100
pm2 monit
```

### Stop Application
```bash
pm2 stop moaser-clinic
pm2 delete moaser-clinic
```

### Emergency Restart Everything
```bash
pm2 kill
npm run server &
# Wait for "Server is running on port 5000"
pm2 start ecosystem.config.js
```

### Database Backup/Restore
```bash
# Backup
cp /root/moaser-clinic/server/evaluations.db /root/moaser-clinic/backups/backup_$(date +%s).db

# Restore (if needed)
cp /root/moaser-clinic/backups/backup_timestamp.db /root/moaser-clinic/server/evaluations.db
pm2 restart moaser-clinic
```

---

## Support & Additional Help

- **Node.js/npm docs**: https://nodejs.org/docs/
- **Nginx docs**: https://nginx.org/en/docs/
- **PM2 docs**: https://pm2.io/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **CloudPanel docs**: https://docs.cloudpanel.io/

---

## Summary Checklist

- [ ] VPS connected via SSH
- [ ] Dependencies installed (Node.js, npm, nginx)
- [ ] Repository cloned
- [ ] .env configured with production values
- [ ] Admin user initialized
- [ ] Frontend built (`npm run build`)
- [ ] PM2 started (`pm2 start ecosystem.config.js`)
- [ ] Nginx configured and restarted
- [ ] SSL certificate obtained via Certbot
- [ ] Firewall configured
- [ ] Domain resolves to HTTPS://yourdomain.com
- [ ] Admin can login with credentials from .env
- [ ] Backups automated via cron

**Status**: ✅ Ready for Production!

