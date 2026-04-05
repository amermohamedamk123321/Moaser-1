# CloudPanel Quick Start - Moaser Clinic Deployment

## Overview
This guide is optimized for Hostinger VPS with CloudPanel installed.

## Port Configuration

- **Backend (Node.js)**: Port 5000 (internal, behind Nginx proxy)
- **Frontend (Nginx)**: Port 8081 (standard web traffic via Nginx reverse proxy)
- **CloudPanel Dashboard**: Port 8443 (https://your-vps-ip:8443)

---

## 5-Minute Quick Start

### 1. SSH to Your VPS
```bash
ssh root@your-vps-ip
```

### 2. Clone and Install
```bash
cd /root
git clone https://github.com/yourname/moaser-clinic.git
cd moaser-clinic
npm install
npm rebuild
```

### 3. Configure Environment
```bash
cp .env.hostinger .env
nano .env

# Update:
# - yourdomain.com → your actual domain
# - JWT_SECRET → run: openssl rand -base64 32
# - ADMIN_PASSWORD → strong password
```

### 4. Deploy
```bash
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh

# Follow the on-screen instructions
```

### 5. Configure Nginx in CloudPanel
1. Login to CloudPanel: `https://your-vps-ip:8443`
2. Go to **Websites** → **Add Website**
3. Add your domain
4. Choose **Custom Nginx Configuration**
5. Add the configuration from the "Nginx Config for CloudPanel" section below
6. Enable and save

---

## Nginx Config for CloudPanel

This is the exact Nginx configuration to use in CloudPanel:

```nginx
# CloudPanel: Copy this to your domain's Nginx config

# Backend upstream
upstream moaser_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Frontend static files location
root /root/moaser-clinic/dist;

# Main location - React frontend with SPA fallback
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
}

# Health check endpoint
location /health {
    proxy_pass http://moaser_backend;
    access_log off;
}

# Deny access to sensitive files/folders
location ~ /\.env {
    deny all;
}

location ~ /server {
    deny all;
}

location ~ /backups {
    deny all;
}
```

---

## CloudPanel Features to Use

### 1. SSL Certificate
- In CloudPanel: **Websites** → Your Domain → **SSL**
- Click "Install Let's Encrypt Certificate" (free, auto-renews)
- Ensure it covers both `yourdomain.com` and `www.yourdomain.com`

### 2. Monitor Your Application
```bash
# Via SSH:
pm2 status           # See if backend is running
pm2 logs moaser      # View live logs
pm2 monit           # Monitor CPU/Memory
```

### 3. Restart Application (if needed)
```bash
pm2 restart moaser-clinic
pm2 status
```

### 4. View Nginx Errors
In CloudPanel or via SSH:
```bash
# SSH:
tail -f /var/log/nginx/yourdomain.com_error.log
tail -f /var/log/nginx/yourdomain.com_access.log
```

---

## Verify Everything Works

```bash
# SSH to VPS

# 1. Check backend health
curl http://localhost:5000/health
# Should return: {"status":"ok"}

# 2. Check frontend files exist
ls -la /root/moaser-clinic/dist/
# Should see: index.html and other assets

# 3. Check PM2 status
pm2 status
# Should show: moaser-clinic online

# 4. Test HTTPS from your computer
curl -I https://yourdomain.com
# Should return: HTTP/2 200
```

---

## Access Your Application

| URL | Purpose |
|-----|---------|
| `https://yourdomain.com` | Main website |
| `https://yourdomain.com/admin` | Admin dashboard |
| `https://yourdomain.com/api/health` | Backend health check |

**Default Login:**
- Username: `admin` (from .env)
- Password: Your admin password (from .env)

⚠️ **Change these credentials immediately after first login!**

---

## CloudPanel Specific Tips

### File Management
- Website files: `/root/moaser-clinic/`
- Database file: `/root/moaser-clinic/server/evaluations.db`
- Logs: `/var/log/nginx/yourdomain.com_*`

### Service Management (CloudPanel Dashboard)
- PHP/FastCGI: ✓ Not needed for this app (it's Node.js)
- Nginx: ✓ Handles reverse proxy (CloudPanel manages this)
- MySQL: ✓ Not used (we use SQLite)

### Restart Services in CloudPanel
If you need to restart services:
1. Login to CloudPanel
2. Go to **Services** (or use SSH)
3. Restart Nginx

Or via SSH:
```bash
systemctl restart nginx
pm2 restart moaser-clinic
```

---

## Database & Backups

### Where is the Database?
```bash
/root/moaser-clinic/server/evaluations.db
```

### Manual Backup
```bash
cp /root/moaser-clinic/server/evaluations.db /root/moaser-clinic/backups/backup_$(date +%s).db
```

### Auto Backup (Cron)
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * cp /root/moaser-clinic/server/evaluations.db /root/moaser-clinic/backups/backup_$(date +\%s).db

# Keep only 30 backups:
0 3 * * * find /root/moaser-clinic/backups -name 'backup_*.db' -mtime +30 -delete
```

---

## Troubleshooting in CloudPanel

### Issue: Website shows error
```bash
# Check logs
tail -f /var/log/nginx/yourdomain.com_error.log

# Check backend
pm2 logs moaser-clinic

# Restart
pm2 restart moaser-clinic
systemctl restart nginx
```

### Issue: Backend not responding
```bash
# Check if running
pm2 status

# Check logs
pm2 logs moaser-clinic

# Restart
pm2 restart moaser-clinic

# Check port
lsof -i :5000
```

### Issue: SSL certificate issue
```bash
# In CloudPanel: Websites → Domain → SSL
# Click "Install Let's Encrypt Certificate"

# Or via SSH:
certbot certificates
certbot renew --dry-run
certbot renew
```

### Issue: Performance slow
```bash
# Check CPU/Memory
pm2 monit

# Check disk space
df -h

# Check database size
du -h /root/moaser-clinic/server/evaluations.db

# Check logs for errors
pm2 logs moaser-clinic | grep -i error
```

---

## Update Application

```bash
# Pull latest changes
cd /root/moaser-clinic
git pull origin main

# Install new packages (if any)
npm install

# Rebuild frontend
npm run build

# Restart backend
pm2 restart moaser-clinic

# Verify
pm2 logs moaser-clinic
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (40+ random characters)
- [ ] SSL certificate installed and active
- [ ] Firewall enabled (SSH, HTTP, HTTPS open)
- [ ] Database backups automated
- [ ] Admin email configured correctly
- [ ] LOG_LEVEL set to 'info' (not 'debug')
- [ ] .env file is NOT in git repository

---

## Performance Settings

For optimal performance in CloudPanel:

### Nginx Caching (add to Nginx config)
```nginx
# Cache static assets for 1 day
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1d;
    add_header Cache-Control "public, immutable";
}
```

### Gzip Compression (CloudPanel usually has this enabled)
```bash
# Check if enabled
curl -I https://yourdomain.com | grep -i 'content-encoding'
# Should show: gzip
```

### Database Optimization
```bash
# Vacuum database to reclaim space
sqlite3 /root/moaser-clinic/server/evaluations.db "VACUUM;"

# Check database size
sqlite3 /root/moaser-clinic/server/evaluations.db ".databases"
```

---

## Support Resources

- **CloudPanel Docs**: https://docs.cloudpanel.io/
- **Node.js**: https://nodejs.org/
- **PM2**: https://pm2.io/
- **Nginx**: https://nginx.org/
- **Let's Encrypt**: https://letsencrypt.org/

---

## Next Steps

1. ✅ Complete the 5-Minute Quick Start above
2. ✅ Configure Nginx in CloudPanel
3. ✅ Install SSL certificate
4. ✅ Test your domain: `https://yourdomain.com`
5. ✅ Login to admin dashboard and change password
6. ✅ Set up automated backups
7. ✅ Monitor logs for first week

**Status**: 🎉 **Ready for Production!**

For detailed information, see: `HOSTINGER_VPS_DEPLOYMENT_GUIDE.md`
