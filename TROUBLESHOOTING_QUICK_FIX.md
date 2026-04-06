# Troubleshooting Quick Fix Guide - Moaser Clinic

**Last Updated**: 2024  
**Quick Reference**: Common issues and their fixes during deployment and production

---

## Table of Contents

1. [Deployment Script Issues](#deployment-script-issues)
2. [Backend Server Problems](#backend-server-problems)
3. [Frontend / Nginx Issues](#frontend--nginx-issues)
4. [Database Issues](#database-issues)
5. [SSL/HTTPS Issues](#sslhttps-issues)
6. [Performance Issues](#performance-issues)
7. [Admin Dashboard Issues](#admin-dashboard-issues)
8. [Quick Verification Checklist](#quick-verification-checklist)

---

## Deployment Script Issues

### Problem: Script fails at npm install
**Symptoms**: Error message about missing dependencies  
**Fix**:
```bash
cd /root/moaser-clinic
npm cache clean --force
npm install
```

### Problem: Permission denied when running deploy script
**Symptoms**: `chmod +x deploy-hostinger.sh` says permission denied  
**Fix**:
```bash
# Make script executable
chmod +x deploy-hostinger.sh

# Run with bash explicitly
bash deploy-hostinger.sh
```

### Problem: Script exits asking to edit .env
**Symptoms**: Script says "Please edit .env" and exits  
**Status**: This is normal behavior in the updated script - it now asks for configuration interactively  
**What to do**: Answer the prompts:
- Enter your domain name (e.g., dentalclinic.com)
- Enter admin username
- Enter admin email
- Enter admin password
- JWT_SECRET will be generated automatically

### Problem: npm: command not found
**Symptoms**: Error "npm: command not found"  
**Fix**:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

### Problem: Can't connect to database or logs permission denied
**Symptoms**: Error about logs directory or database file permissions  
**Fix**:
```bash
# Create logs directory with proper permissions
mkdir -p /root/moaser-clinic/logs
chmod 755 /root/moaser-clinic/logs

# Fix database permissions
chmod 644 /root/moaser-clinic/server/evaluations.db
```

---

## Backend Server Problems

### Problem: Backend won't start (PM2 shows offline)
**Symptoms**: `pm2 status` shows "moaser-clinic offline" or "stopped"  
**Diagnosis**:
```bash
# Check error logs
pm2 logs moaser-clinic

# Check if port 5000 is in use
lsof -i :5000

# Check Node.js version
node --version
```

**Fixes**:
```bash
# Restart PM2
pm2 restart moaser-clinic
pm2 status

# If that doesn't work, delete and restart
pm2 delete moaser-clinic
cd /root/moaser-clinic
npm rebuild
pm2 start ecosystem.config.js
```

### Problem: Backend crashes immediately
**Symptoms**: `pm2 status` shows "exited", PM2 logs show errors  
**Diagnosis**:
```bash
# View detailed error logs
pm2 logs moaser-clinic --lines 50

# Try running backend directly to see full error
cd /root/moaser-clinic
node server/index.js
```

**Common causes**:
- **Missing environment variables**: Check `.env` file exists and is complete
- **Port already in use**: Run `lsof -i :5000` to find what's using port 5000
- **Database locked**: Run `sqlite3 /root/moaser-clinic/server/evaluations.db "PRAGMA integrity_check;"` to verify database
- **Module not installed**: Run `npm install` again

**Fix**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm rebuild

# Restart
pm2 restart moaser-clinic
```

### Problem: Port 5000 is already in use
**Symptoms**: Error "EADDRINUSE :::5000" or "Address already in use"  
**Fix**:
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace 12345 with actual PID)
kill -9 12345

# Or stop PM2 completely
pm2 stop moaser-clinic
pm2 delete moaser-clinic
sleep 2
pm2 start ecosystem.config.js
```

### Problem: High memory usage, backend keeps dying
**Symptoms**: PM2 restarts process repeatedly, high memory in `top`  
**Cause**: Database locked or memory leak  
**Fix**:
```bash
# Stop PM2
pm2 stop moaser-clinic

# Vacuum/optimize database
sqlite3 /root/moaser-clinic/server/evaluations.db "VACUUM;"

# Restart with more memory allocation
NODE_MAX_OLD_SPACE_SIZE=512 pm2 start ecosystem.config.js

# Monitor
watch 'pm2 monit'
```

---

## Frontend / Nginx Issues

### Problem: 502 Bad Gateway error
**Symptoms**: Browser shows "502 Bad Gateway" when visiting domain  
**Diagnosis**:
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/yourdomain.com-error.log

# Test backend health
curl http://localhost:5000/health
```

**Fixes**:
```bash
# If backend is not running
pm2 restart moaser-clinic

# If backend is running but Nginx can't reach it
# Check Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Check if port 5000 is accessible
telnet localhost 5000
```

### Problem: Website shows "Cannot GET /" or blank page
**Symptoms**: Domain loads but shows error or no content  
**Cause**: Frontend files not built or Nginx misconfigured  
**Diagnosis**:
```bash
# Check if dist folder exists
ls -la /root/moaser-clinic/dist/

# Check if index.html is there
cat /root/moaser-clinic/dist/index.html | head -20
```

**Fix**:
```bash
# Rebuild frontend
cd /root/moaser-clinic
npm run build

# Verify it created dist/
ls -la dist/

# Reload Nginx
systemctl reload nginx
```

### Problem: Static assets not loading (404 errors on .js, .css files)
**Symptoms**: Page loads but stylesheets and scripts fail (404 errors)  
**Cause**: Nginx not serving static files correctly  
**Diagnosis**:
```bash
# Check Nginx access logs
tail -f /var/log/nginx/yourdomain.com-access.log | grep 404

# Check Nginx config
nginx -t
```

**Fix**:
```bash
# Ensure root path in Nginx config points to dist:
# root /root/moaser-clinic/dist;

# Check ownership
ls -la /root/moaser-clinic/dist/

# Rebuild if needed
cd /root/moaser-clinic
npm run build

# Reload Nginx
systemctl reload nginx
```

### Problem: API calls fail with CORS error
**Symptoms**: Browser console shows "CORS policy: No 'Access-Control-Allow-Origin'"  
**Cause**: CORS not configured or frontend URL wrong  
**Diagnosis**:
```bash
# Check backend is responding with CORS headers
curl -i http://localhost:5000/health

# Should show: Access-Control-Allow-Origin header
```

**Fix**:
```bash
# Check .env has correct FRONTEND_URL
grep FRONTEND_URL /root/moaser-clinic/.env
# Should be: FRONTEND_URL=https://yourdomain.com

# Update if wrong
nano /root/moaser-clinic/.env

# Restart backend
pm2 restart moaser-clinic
```

### Problem: Nginx won't start or reload
**Symptoms**: Error "failed to reload nginx" or "Cannot bind to port"  
**Diagnosis**:
```bash
# Test Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# Check logs
journalctl -u nginx -n 20
```

**Fix**:
```bash
# Find syntax errors (nginx -t shows line numbers)
nginx -t

# Common issues:
# - Missing semicolon at end of lines
# - Port already in use
# - Incorrect file paths

# After fixing config:
systemctl restart nginx
systemctl status nginx
```

---

## Database Issues

### Problem: Database locked or corrupted
**Symptoms**: Application won't start, error about database being locked  
**Diagnosis**:
```bash
# Check database integrity
sqlite3 /root/moaser-clinic/server/evaluations.db "PRAGMA integrity_check;"

# Should return: ok

# Check file permissions
ls -la /root/moaser-clinic/server/evaluations.db
```

**Fix**:
```bash
# Stop the application first
pm2 stop moaser-clinic

# Optimize database
sqlite3 /root/moaser-clinic/server/evaluations.db "VACUUM;"

# Verify integrity
sqlite3 /root/moaser-clinic/server/evaluations.db "PRAGMA integrity_check;"

# Fix permissions
chmod 644 /root/moaser-clinic/server/evaluations.db
chmod 755 /root/moaser-clinic/server/

# Restart
pm2 restart moaser-clinic
```

### Problem: Data lost after restart
**Symptoms**: Evaluations or appointments disappear after PM2 restart  
**Cause**: Database file permissions or location issue  
**Fix**:
```bash
# Verify database location in .env
grep DATABASE_PATH /root/moaser-clinic/.env
# Should be: DATABASE_PATH=./server/evaluations.db

# Verify file exists
ls -la /root/moaser-clinic/server/evaluations.db

# Verify PM2 runs from correct directory
pm2 describe moaser-clinic | grep cwd
# Should show: /root/moaser-clinic
```

### Problem: Database file size is huge
**Symptoms**: du shows database is 500MB+  
**Cause**: Lots of data accumulated, no cleanup  
**Fix**:
```bash
# Backup first
cp /root/moaser-clinic/server/evaluations.db /root/moaser-clinic/backups/evaluations_backup_$(date +%s).db

# Stop application
pm2 stop moaser-clinic

# Vacuum to reclaim space
sqlite3 /root/moaser-clinic/server/evaluations.db "VACUUM;"

# Check new size
du -h /root/moaser-clinic/server/evaluations.db

# Restart
pm2 restart moaser-clinic
```

---

## SSL/HTTPS Issues

### Problem: Certificate not showing or "Not Secure" warning
**Symptoms**: Browser shows "Not Secure", no HTTPS, or certificate error  
**Diagnosis**:
```bash
# Check if certificate exists
ls -la /etc/letsencrypt/live/yourdomain.com/

# Check certificate expiration
certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -tls1_2
```

**Fix**:
```bash
# If certificate doesn't exist, create it
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# If certificate exists but not working, renew
certbot renew --force-renewal

# Update Nginx config with certificate paths
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Reload Nginx
systemctl reload nginx

# Test
curl -I https://yourdomain.com
```

### Problem: Certificate renewal failing
**Symptoms**: Certbot error about renewal, certificate about to expire  
**Diagnosis**:
```bash
# Check renewal status
certbot renew --dry-run

# Check certbot logs
tail -f /var/log/letsencrypt/letsencrypt.log
```

**Fix**:
```bash
# Renew manually
certbot renew

# If that fails, try with nginx authenticator
certbot certonly --nginx -d yourdomain.com --expand

# Ensure auto-renewal is enabled
systemctl enable certbot.timer
systemctl status certbot.timer
```

### Problem: Mixed content warning (HTTPS page has HTTP resources)
**Symptoms**: Browser console shows "Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"  
**Cause**: API calls to HTTP instead of HTTPS  
**Fix**:
```bash
# Check .env VITE_API_URL
grep VITE_API_URL /root/moaser-clinic/.env
# Should start with: https://

# Update if wrong
nano /root/moaser-clinic/.env

# Rebuild frontend
npm run build

# Deploy
pm2 restart moaser-clinic
```

---

## Performance Issues

### Problem: Website is slow or timing out
**Symptoms**: Page takes 10+ seconds to load  
**Diagnosis**:
```bash
# Check system resources
top
free -h
df -h

# Check PM2 memory usage
pm2 monit

# Check response time in logs
tail -f /var/log/nginx/yourdomain.com-access.log | grep -o 'upstream_response_time [^ ]*'

# Measure from command line
time curl http://localhost:5000/health
```

**Fixes**:
```bash
# If CPU/Memory high:
pm2 stop moaser-clinic
sqlite3 /root/moaser-clinic/server/evaluations.db "VACUUM;"
pm2 start ecosystem.config.js

# If disk space low:
df -h
# Delete old backups or logs if needed
rm -f /root/moaser-clinic/backups/evaluations_backup_*.db  # keep recent ones!

# Enable Nginx caching (add to Nginx config):
# proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=my_cache:10m max_size=100m;
# proxy_cache my_cache;

# Or enable gzip compression
# gzip on;
# gzip_types text/plain text/css application/json;
```

### Problem: Nginx cache not working
**Symptoms**: Changes to frontend not showing, old files served  
**Fix**:
```bash
# Clear Nginx cache
rm -rf /tmp/nginx_cache/*

# Rebuild frontend
cd /root/moaser-clinic
npm run build

# Reload Nginx
systemctl reload nginx

# Optionally disable cache temporarily for testing
# In Nginx config, comment out proxy_cache lines
```

---

## Admin Dashboard Issues

### Problem: Can't login to admin dashboard
**Symptoms**: Admin page shows but credentials don't work, stuck on login  
**Diagnosis**:
```bash
# Check backend is running
pm2 status

# Check backend logs for auth errors
pm2 logs moaser-clinic | grep -i auth

# Verify admin user exists
sqlite3 /root/moaser-clinic/server/evaluations.db "SELECT * FROM admin_users;"
```

**Fixes**:
```bash
# If admin user doesn't exist:
cd /root/moaser-clinic
npm run init-admin

# If you forgot password, reset it:
# Edit the admin_users table directly (use with caution)
sqlite3 /root/moaser-clinic/server/evaluations.db
# Then in sqlite3 prompt:
# UPDATE admin_users SET password = '' WHERE username = 'admin';
# DELETE FROM admin_users;  # to reset all
# .exit

# Restart backend
pm2 restart moaser-clinic

# Then reinitialize
npm run init-admin
```

### Problem: Admin dashboard shows empty / no data
**Symptoms**: Admin page loads but appointments/evaluations list empty  
**Cause**: API not returning data or database empty  
**Diagnosis**:
```bash
# Check API endpoint
curl http://localhost:5000/api/admin/dashboard/stats

# Check database has data
sqlite3 /root/moaser-clinic/server/evaluations.db
# In sqlite3 prompt:
SELECT COUNT(*) FROM appointments;
SELECT COUNT(*) FROM doctor_evaluations;
# .exit
```

**Fix**:
```bash
# If API error, check logs
pm2 logs moaser-clinic

# If database empty, add test data via API or manually

# Restart if needed
pm2 restart moaser-clinic
```

### Problem: Admin password reset not working
**Symptoms**: Change password button doesn't work, stuck on same password  
**Fix**:
```bash
# Reset admin user completely
sqlite3 /root/moaser-clinic/server/evaluations.db
# DELETE FROM admin_users;
# .exit

# Reinitialize
npm run init-admin

# You'll be prompted for new password
```

---

## Quick Verification Checklist

Use this checklist to verify everything is working:

```bash
# 1. System Level
[ ] ps aux | grep -i node      # Backend process running?
[ ] pm2 status                  # PM2 shows moaser-clinic online?
[ ] top                         # CPU/Memory usage normal?

# 2. Backend
[ ] curl http://localhost:5000/health        # Returns {"status":"ok"}?
[ ] netstat -tulpn | grep 5000              # Port 5000 listening?
[ ] pm2 logs moaser-clinic --lines 5         # Any errors in logs?

# 3. Database
[ ] sqlite3 /root/moaser-clinic/server/evaluations.db "PRAGMA integrity_check;"  # Returns ok?
[ ] ls -lah /root/moaser-clinic/server/evaluations.db  # File exists and has size?

# 4. Frontend Build
[ ] ls -la /root/moaser-clinic/dist/ | head  # dist/ folder exists?
[ ] wc -l /root/moaser-clinic/dist/index.html  # index.html not empty?

# 5. Nginx
[ ] nginx -t                    # Configuration OK?
[ ] systemctl status nginx      # Nginx running?
[ ] curl -I http://localhost   # Returns 200 or 301 redirect?

# 6. SSL
[ ] certbot certificates        # Certificate exists and valid?
[ ] curl -I https://yourdomain.com  # Returns HTTP/2 200?

# 7. Domain
[ ] nslookup yourdomain.com    # Resolves to correct IP?
[ ] ping yourdomain.com         # Responds to ping?

# 8. Application
[ ] curl https://yourdomain.com                    # Returns HTML?
[ ] curl https://yourdomain.com/admin              # Admin page loads?
[ ] curl https://yourdomain.com/api/health         # API responds?
```

---

## Getting Help

If you're still stuck:

1. **Check detailed logs**:
   ```bash
   pm2 logs moaser-clinic --lines 100
   tail -f /var/log/nginx/yourdomain.com-error.log
   journalctl -u nginx -n 50
   ```

2. **Collect system information**:
   ```bash
   uname -a
   node --version
   npm --version
   nginx -v
   sqlite3 --version
   ```

3. **Check disk space**:
   ```bash
   df -h
   du -sh /root/moaser-clinic
   ```

4. **Review documentation**:
   - `HOSTINGER_VPS_DEPLOYMENT_GUIDE.md` - Full deployment guide
   - `CLOUDPANEL_QUICK_START.md` - CloudPanel specific steps
   - `TROUBLESHOOTING_QUICK_FIX.md` - This file

5. **Report issues with**:
   - Full error message
   - Output of `pm2 logs moaser-clinic --lines 20`
   - Output of `nginx -t`
   - Output of `pm2 status`

---

## Last Resort: Full Reset

If everything is broken and you need to start fresh:

```bash
# WARNING: This will stop your application and reset everything

# Stop PM2
pm2 stop all
pm2 delete all
pm2 kill

# Stop Nginx
systemctl stop nginx

# Delete application
rm -rf /root/moaser-clinic

# Clone fresh
cd /root
git clone https://github.com/yourname/moaser-clinic.git
cd moaser-clinic

# Start fresh deployment
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

---

**Remember**: Always backup your database before making changes!

```bash
cp /root/moaser-clinic/server/evaluations.db /root/moaser-clinic/backups/evaluations_$(date +%Y%m%d_%H%M%S).db
```
