#!/bin/bash

# ============================================
# MOASER CLINIC - HOSTINGER VPS DEPLOYMENT SCRIPT
# ============================================
# This script automates the deployment process
# Usage: chmod +x deploy-hostinger.sh && ./deploy-hostinger.sh

set -e  # Exit on error

echo "========================================="
echo "Moaser Clinic - Hostinger VPS Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Step 1: Update System
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install Dependencies
echo -e "${YELLOW}Step 2: Installing required packages...${NC}"
apt install -y curl wget git nodejs npm nginx certbot python3-certbot-nginx ufw

# Verify Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"

# Step 3: Navigate to application directory
cd /root/moaser-clinic || { echo "Application directory not found"; exit 1; }

# Step 4: Install npm dependencies
echo -e "${YELLOW}Step 3: Installing npm dependencies...${NC}"
npm install

# Step 5: Rebuild native modules
echo -e "${YELLOW}Step 4: Rebuilding native modules...${NC}"
npm rebuild

# Step 6: Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Step 5: Creating .env file...${NC}"
    
    if [ -f .env.hostinger ]; then
        cp .env.hostinger .env
        echo -e "${YELLOW}Copied .env.hostinger to .env${NC}"
        echo -e "${RED}⚠️  Please edit .env and update:${NC}"
        echo "   - yourdomain.com with your actual domain"
        echo "   - JWT_SECRET with a strong random string"
        echo "   - ADMIN_PASSWORD with a secure password"
        echo ""
        echo -e "${YELLOW}Edit with: nano .env${NC}"
        exit 1
    else
        echo -e "${RED}✗ .env.hostinger not found${NC}"
        exit 1
    fi
fi

# Step 7: Build frontend
echo -e "${YELLOW}Step 6: Building frontend...${NC}"
npm run build

# Step 8: Install PM2
echo -e "${YELLOW}Step 7: Installing PM2...${NC}"
npm install -g pm2

# Step 9: Initialize admin user
echo -e "${YELLOW}Step 8: Initializing admin user...${NC}"
npm run init-admin

# Step 10: Start backend with PM2
echo -e "${YELLOW}Step 9: Starting backend server with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

# Make PM2 auto-start on reboot
pm2 startup

# Step 11: Configure firewall
echo -e "${YELLOW}Step 10: Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Step 12: Instructions for manual steps
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Deployment preparation complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps (manual):${NC}"
echo ""
echo "1. Configure Nginx:"
echo "   - Copy Nginx config from HOSTINGER_VPS_DEPLOYMENT_GUIDE.md"
echo "   - Replace yourdomain.com with your domain"
echo "   - Save to: /etc/nginx/sites-available/yourdomain.com.conf"
echo "   - Run: ln -s /etc/nginx/sites-available/yourdomain.com.conf /etc/nginx/sites-enabled/"
echo "   - Run: nginx -t && systemctl reload nginx"
echo ""
echo "2. Setup SSL Certificate:"
echo "   - Run: certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "3. Verify Application:"
echo "   - Check backend: curl http://localhost:5000/health"
echo "   - Check PM2: pm2 status"
echo "   - Check logs: pm2 logs moaser-clinic"
echo ""
echo "4. Access your application:"
echo "   - https://yourdomain.com"
echo "   - Admin login at: https://yourdomain.com/admin"
echo ""
echo -e "${GREEN}For detailed guide, see: HOSTINGER_VPS_DEPLOYMENT_GUIDE.md${NC}"
echo ""

# Display current status
echo -e "${YELLOW}Current Status:${NC}"
echo ""
pm2 status
echo ""
echo -e "${GREEN}✓ Ready for next steps!${NC}"
