# Moaser Dental Clinic - Backend Setup Guide

## Overview

This is the Node.js/Express backend for the Moaser Dental Clinic website. It handles:
- Admin authentication with JWT tokens
- Appointment management
- Doctor evaluations
- SQLite database for data persistence

## Prerequisites

- Node.js 16+ (Node 18+ recommended)
- npm or yarn package manager

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Key variables to set:
- `JWT_SECRET`: Strong random string (at least 32 characters) for JWT signing
- `ADMIN_USERNAME`: Default admin username (change after first login)
- `ADMIN_PASSWORD`: Default admin password (change after first login)
- `FRONTEND_URL`: URL of your frontend application

### 3. Initialize Default Admin User

```bash
npm run init-admin
```

This creates a default admin user with credentials from your `.env` file.

### 4. Start the Server

```bash
npm run server
```

The server will start on `http://localhost:5000` by default.

## Database

### Schema

The SQLite database includes three tables:

#### `admin_users`
- Stores admin credentials
- Uses bcrypt hashing for passwords
- Includes user management fields (email, isActive, timestamps)

#### `appointments`
- Stores appointment requests from patients
- Fields: name, phone, service, date, time, notes, status
- Status can be: pending, confirmed, completed, cancelled

#### `doctor_evaluations`
- Stores feedback about doctors
- Fields: docKey, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments
- All ratings are: poor, average, excellent

### Creating the Database

The database is automatically created on first server startup. No manual setup needed.

## API Endpoints

### Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/change-password` - Change admin password (requires auth)

### Appointments (Admin only)

- `GET /api/appointments` - List all appointments
- `GET /api/appointments/:id` - Get single appointment
- `PATCH /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment
- `POST /api/appointments` - Create appointment (public)

### Doctor Evaluations

- `POST /api/evaluations` - Submit evaluation (public)
- `GET /api/evaluations` - List evaluations (admin only)
- `GET /api/evaluations/:id` - Get single evaluation (admin only)
- `DELETE /api/evaluations/:id` - Delete evaluation (admin only)

### Dashboard

- `GET /api/stats` - Get dashboard statistics (admin only)
- `GET /health` - Health check

## Data Migration

If you have existing data in localStorage, you can migrate it to the database:

### 1. Export localStorage Data

Open browser console and run:

```javascript
const data = {
  appointments: JSON.parse(localStorage.getItem('moaser_appointments') || '[]'),
  evaluations: JSON.parse(localStorage.getItem('moaser_evaluations') || '[]')
};
console.log(JSON.stringify(data));
```

Save the output to a file (e.g., `data-backup.json`).

### 2. Run Migration Script

```bash
npm run migrate-data ./data-backup.json
```

The script will import all data from the JSON file into the database.

## Security Features

- **JWT Authentication**: Stateless token-based auth for admin endpoints
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Rate Limiting**: 
  - Login: 5 attempts per 15 minutes
  - API: 100 requests per 15 minutes
  - Public endpoints: 200 requests per 15 minutes
- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS**: Configured to allow only your frontend URL
- **Security Headers**: Helmet.js for HTTP security headers

## Production Deployment

### On Hostinger VPS or Similar

#### 1. SSH into your server

```bash
ssh user@your-vps-ip
```

#### 2. Install Node.js and npm

```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Clone repository and setup

```bash
cd /home/username
git clone <your-repo-url>
cd moaser-clinic
npm install
```

#### 4. Configure environment

```bash
cp .env.example .env
nano .env  # Edit with your production values
```

**Important**: 
- Change `NODE_ENV` to `production`
- Set a strong `JWT_SECRET`
- Update `FRONTEND_URL` to your domain
- Change default admin credentials

#### 5. Initialize admin user

```bash
npm run init-admin
```

#### 6. Install PM2 globally

```bash
sudo npm install -g pm2
```

#### 7. Start application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 8. Setup reverse proxy (Nginx)

```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/moaser-clinic`:

```nginx
upstream moaser_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://moaser_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/moaser-clinic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. Setup SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 10. Monitor Application

Check logs:

```bash
pm2 logs moaser-clinic
```

Monitor status:

```bash
pm2 monit
```

## Troubleshooting

### Database Issues

- Delete `server/evaluations.db` to reset the database
- Ensure write permissions in the `server/` directory

### Port Already in Use

```bash
lsof -i :5000
kill -9 <PID>
```

Or change the PORT in `.env`.

### Connection Issues from Frontend

- Verify `VITE_API_URL` matches your backend URL
- Check CORS is properly configured
- Ensure firewall allows traffic on port 5000 (or proxy port)

### Authentication Errors

- Verify JWT_SECRET is set in `.env`
- Check token is being sent in Authorization header
- Ensure token hasn't expired (24 hours by default)

## Performance Optimization

For production:

1. **Database Optimization**:
   ```bash
   # Create indexes for frequently queried fields
   sqlite3 server/evaluations.db "CREATE INDEX idx_evaluations_docKey ON doctor_evaluations(docKey);"
   sqlite3 server/evaluations.db "CREATE INDEX idx_appointments_status ON appointments(status);"
   ```

2. **Enable Caching**:
   - Implement Redis for session management
   - Cache evaluation statistics

3. **Database Backups**:
   ```bash
   # Daily backup
   0 2 * * * cp /path/to/server/evaluations.db /backups/evaluations-$(date +\%Y\%m\%d).db
   ```

## Documentation

- API Documentation: See endpoint descriptions above
- Frontend Integration: Check `src/pages/AdminLogin.tsx` and components for examples
- Database Schema: See database initialization in `server/database.js`

## Support

For issues or questions:
1. Check logs: `pm2 logs moaser-clinic`
2. Verify `.env` configuration
3. Check database integrity: `sqlite3 server/evaluations.db ".tables"`
