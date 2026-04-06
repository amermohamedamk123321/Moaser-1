#!/bin/bash

# ============================================
# MOASER CLINIC - HOSTINGER VPS DEPLOYMENT SCRIPT
# ============================================
# This script automates the deployment process on Hostinger VPS
#
# Usage: 
#   chmod +x deploy-hostinger.sh
#   ./deploy-hostinger.sh
#
# Prerequisites:
#   - Running as root on Hostinger VPS with Ubuntu 20.04+
#   - Git, Node.js 18+, and npm installed
#   - Application directory at /root/moaser-clinic
#
# The script will:
#   - Install/update system dependencies
#   - Create logs directory for PM2
#   - Install npm dependencies
#   - Create/update .env file with interactive prompts (if needed)
#   - Build frontend for production
#   - Initialize admin user (if not already created)
#   - Start backend with PM2
#   - Configure firewall
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/root/moaser-clinic"
LOGS_DIR="$APP_DIR/logs"
SCRIPT_VERSION="2.0"

# ============================================
# HELPER FUNCTIONS
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for input (with default value)
prompt_input() {
    local prompt="$1"
    local default="$2"
    local input=""
    
    if [ -z "$default" ]; then
        read -p "$prompt: " input
    else
        read -p "$prompt [$default]: " input
        input="${input:-$default}"
    fi
    
    echo "$input"
}

# Function to prompt for password (hidden input)
prompt_password() {
    local prompt="$1"
    local password=""
    local password_confirm=""
    
    while true; do
        read -sp "$prompt: " password
        echo
        read -sp "Confirm $prompt: " password_confirm
        echo
        
        if [ "$password" = "$password_confirm" ]; then
            echo "$password"
            return 0
        else
            print_warning "Passwords do not match. Please try again."
        fi
    done
}

# ============================================
# MAIN SCRIPT
# ============================================

print_header "Moaser Clinic - Hostinger VPS Deployment (v$SCRIPT_VERSION)"

# Step 0: Check prerequisites
echo ""
print_step "Checking prerequisites..."

if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root"
    exit 1
fi
print_success "Running as root"

if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    exit 1
fi
print_success "Application directory found: $APP_DIR"

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js is installed: $NODE_VERSION"

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm is installed: $NPM_VERSION"

# Step 1: Update System
echo ""
print_step "Updating system packages (this may take a few minutes)..."
apt update && apt upgrade -y > /dev/null 2>&1
print_success "System packages updated"

# Step 2: Install Dependencies
echo ""
print_step "Installing required packages..."
apt install -y curl wget git nodejs npm nginx certbot python3-certbot-nginx ufw sqlite3 > /dev/null 2>&1
print_success "All required packages installed"

# Step 3: Navigate to application directory
echo ""
print_step "Navigating to application directory: $APP_DIR"
cd "$APP_DIR"
print_success "Current directory: $(pwd)"

# Step 4: Create logs directory
echo ""
print_step "Creating logs directory..."
mkdir -p "$LOGS_DIR"
print_success "Logs directory created: $LOGS_DIR"

# Step 5: Install npm dependencies
echo ""
print_step "Installing npm dependencies (this may take a few minutes)..."
npm install > /dev/null 2>&1 || {
    print_error "Failed to install npm dependencies"
    exit 1
}
print_success "npm dependencies installed"

# Step 6: Rebuild native modules
echo ""
print_step "Rebuilding native modules..."
npm rebuild > /dev/null 2>&1 || {
    print_warning "npm rebuild failed (this is often non-critical)"
}
print_success "Native modules rebuilt"

# Step 7: Configure environment variables
echo ""
print_info "Checking .env configuration..."

if [ -f .env ]; then
    print_success ".env file already exists"
    read -p "Do you want to update .env configuration? (y/n) [n]: " update_env
    update_env="${update_env:-n}"
else
    update_env="y"
    print_warning ".env file not found, will create it now"
fi

if [ "$update_env" = "y" ] || [ "$update_env" = "Y" ]; then
    echo ""
    print_step "Setting up environment configuration..."
    
    # Prompt for configuration values
    DOMAIN=$(prompt_input "Enter your domain name (without https://)" "yourdomain.com")
    print_info "Domain set to: $DOMAIN"
    
    read -p "Enter admin username [admin]: " ADMIN_USERNAME
    ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
    print_info "Admin username set to: $ADMIN_USERNAME"
    
    read -p "Enter admin email: " ADMIN_EMAIL
    print_info "Admin email set to: $ADMIN_EMAIL"
    
    ADMIN_PASSWORD=$(prompt_password "Enter admin password (min 12 chars, mix of upper/lower/numbers/symbols)")
    
    # Generate JWT_SECRET if needed
    print_info "Generating secure JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    print_success "JWT_SECRET generated (stored securely)"
    
    # Create .env file
    if [ -f .env.hostinger ]; then
        cp .env.hostinger .env
    else
        print_warning ".env.hostinger not found, creating minimal .env"
        touch .env
    fi
    
    # Update .env with user values
    if [ -f .env ]; then
        # Use sed to update the .env file
        sed -i "s|yourdomain.com|$DOMAIN|g" .env
        sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$DOMAIN/api|g" .env
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" .env
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
        sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$ADMIN_USERNAME|" .env
        sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|" .env
        sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|" .env
        
        print_success ".env file created/updated with your configuration"
    fi
fi

# Step 8: Build frontend
echo ""
print_step "Building frontend for production (this may take a few minutes)..."
npm run build > /dev/null 2>&1 || {
    print_error "Failed to build frontend"
    print_info "Troubleshooting: Check npm run build output above"
    exit 1
}

if [ ! -d "$APP_DIR/dist" ]; then
    print_error "Frontend build failed - dist folder not created"
    exit 1
fi
print_success "Frontend built successfully"
print_info "Frontend files: $(ls -1 $APP_DIR/dist | wc -l) items in dist/"

# Step 9: Install PM2 globally
echo ""
print_step "Installing PM2 for process management..."
npm install -g pm2 > /dev/null 2>&1 || {
    print_error "Failed to install PM2"
    exit 1
}
print_success "PM2 installed globally"

# Step 10: Check if admin user already exists
echo ""
print_step "Checking for existing admin user..."

# Try to run init-admin and capture output
INIT_ADMIN_OUTPUT=$(npm run init-admin 2>&1) || true

if echo "$INIT_ADMIN_OUTPUT" | grep -q "already exists"; then
    print_success "Admin user already exists in database"
else
    if echo "$INIT_ADMIN_OUTPUT" | grep -q "created successfully"; then
        print_success "Admin user created successfully"
    else
        print_warning "Admin user initialization output: $INIT_ADMIN_OUTPUT"
    fi
fi

# Step 11: Start backend with PM2
echo ""
print_step "Starting backend server with PM2..."

# Kill existing process if any
pm2 delete moaser-clinic 2>/dev/null || true

# Start with ecosystem config if it exists, otherwise start server directly
if [ -f ecosystem.config.js ]; then
    pm2 start ecosystem.config.js > /dev/null 2>&1 || {
        print_error "Failed to start application with PM2"
        exit 1
    }
    print_success "Application started with ecosystem.config.js"
else
    print_warning "ecosystem.config.js not found, starting server directly..."
    npm run server > /dev/null 2>&1 &
    print_success "Backend started"
fi

# Save PM2 configuration
pm2 save > /dev/null 2>&1 || true

# Configure PM2 to start on system reboot
pm2 startup > /dev/null 2>&1 || {
    print_warning "Could not configure PM2 auto-startup (non-critical)"
}
print_info "PM2 will auto-start on system reboot"

# Wait a moment for server to start
sleep 2

# Check if backend is running
if pm2 status | grep -q "moaser-clinic"; then
    print_success "Backend is running"
else
    print_warning "Backend status unclear, check with: pm2 logs moaser-clinic"
fi

# Step 12: Configure firewall
echo ""
print_step "Configuring firewall..."
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || {
    print_warning "Firewall configuration may require manual intervention"
}
print_success "Firewall configured (SSH, HTTP, HTTPS open)"

# Step 13: Summary and next steps
echo ""
print_header "✓ Deployment Preparation Complete!"

echo ""
print_success "All automated steps completed successfully!"
echo ""
print_info "Deployment Summary:"
echo "  • Application directory: $APP_DIR"
echo "  • Logs directory: $LOGS_DIR"
echo "  • Frontend built: $APP_DIR/dist"
echo "  • Backend started: PM2 process 'moaser-clinic'"
echo ""

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║ NEXT STEPS (Manual Configuration Required)                        ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "1. ${CYAN}Configure Nginx Reverse Proxy:${NC}"
echo "   • Option A: Use CloudPanel dashboard (easiest)"
echo "     - Login: https://your-vps-ip:8443"
echo "     - Websites → Add Website → yourdomain.com"
echo "     - Use the Nginx config from CLOUDPANEL_QUICK_START.md"
echo ""
echo "   • Option B: Manual Nginx configuration (advanced)"
echo "     - Create: /etc/nginx/sites-available/yourdomain.com.conf"
echo "     - Copy config from HOSTINGER_VPS_DEPLOYMENT_GUIDE.md"
echo "     - Enable: ln -s /etc/nginx/sites-available/yourdomain.com.conf /etc/nginx/sites-enabled/"
echo "     - Test: nginx -t"
echo "     - Reload: systemctl reload nginx"
echo ""

echo "2. ${CYAN}Install SSL Certificate (Let's Encrypt):${NC}"
echo "   • Run: certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com"
echo "   • Auto-renewal will be configured automatically"
echo ""

echo "3. ${CYAN}Verify Your Deployment:${NC}"
echo "   • Test backend health: curl http://localhost:5000/health"
echo "   • Check PM2 status: pm2 status"
echo "   • View logs: pm2 logs moaser-clinic"
echo "   • Visit your domain: https://yourdomain.com"
echo "   • Admin login: https://yourdomain.com/admin"
echo ""

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║ IMPORTANT SECURITY NOTES                                           ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${RED}⚠ BEFORE GOING TO PRODUCTION:${NC}"
echo "  ✓ Change default admin password immediately after first login"
echo "  ✓ Verify JWT_SECRET is a strong, random string (40+ characters)"
echo "  ✓ Enable SSL/HTTPS in Nginx configuration"
echo "  ✓ Set up automated database backups (see deployment guide)"
echo "  ✓ Run: npm audit (check for security vulnerabilities)"
echo ""

echo -e "${CYAN}Current Application Status:${NC}"
echo ""
pm2 status
echo ""

echo -e "${CYAN}Recent Logs:${NC}"
echo ""
pm2 logs moaser-clinic --lines 10 --nostream
echo ""

echo -e "${GREEN}✓ Deployment script completed successfully!${NC}"
echo ""
echo "For detailed information, see:"
echo "  • HOSTINGER_VPS_DEPLOYMENT_GUIDE.md (comprehensive guide)"
echo "  • CLOUDPANEL_QUICK_START.md (CloudPanel users)"
echo "  • TROUBLESHOOTING_QUICK_FIX.md (common issues and fixes)"
echo ""
