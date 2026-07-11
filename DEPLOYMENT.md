# YOU VS YOU — Deployment Guide

Complete guide to deploy the YOU VS YOU application to production.

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Gmail account with App Password

---

## 🔧 Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Django Settings
DJANGO_SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (PostgreSQL)
DB_NAME=habit_db
DB_USER=habit_user
DB_PASSWORD=<secure-password>
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=<gmail-app-password>
DEFAULT_FROM_EMAIL=Your App <your-email@gmail.com>
SERVER_EMAIL=your-email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_SECRET=<your-client-secret>

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>
VITE_RAZORPAY_KEY_ID=<your-key-id>
```

---

## 🐘 Database Setup

```bash
# Create PostgreSQL database and user
sudo -u postgres psql

CREATE DATABASE habit_db;
CREATE USER habit_user WITH PASSWORD 'secure-password';
ALTER ROLE habit_user SET client_encoding TO 'utf8';
ALTER ROLE habit_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE habit_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE habit_db TO habit_user;
\q
```

---

## 🚀 Backend Deployment

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py migrate
```

### 3. Create Superuser

```bash
python manage.py createsuperuser
```

### 4. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 5. Start Gunicorn (Production Server)

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Or use systemd service (recommended):

Create `/etc/systemd/system/habit-backend.service`:

```ini
[Unit]
Description=YOU VS YOU Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable habit-backend
sudo systemctl start habit-backend
```

### 6. Start Celery Workers

Create `/etc/systemd/system/habit-celery-worker.service`:

```ini
[Unit]
Description=YOU VS YOU Celery Worker
After=network.target redis.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/celery -A workers.celery_app worker --loglevel=info

[Install]
WantedBy=multi-user.target
```

### 7. Start Celery Beat (Scheduler)

Create `/etc/systemd/system/habit-celery-beat.service`:

```ini
[Unit]
Description=YOU VS YOU Celery Beat
After=network.target redis.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/celery -A workers.celery_app beat --loglevel=info

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable habit-celery-worker habit-celery-beat
sudo systemctl start habit-celery-worker habit-celery-beat
```

---

## 🎨 Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build for Production

```bash
npm run build
```

### 3. Serve Static Files

Serve the `dist/` folder using Nginx, Vercel, Netlify, or any static hosting service.

**Nginx Configuration** (`/etc/nginx/sites-available/habit-frontend`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/habit-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate (HTTPS)

Use Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal is configured automatically.

---

## 📧 Email Configuration

### Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate password for "Mail"
5. Copy password to `EMAIL_HOST_PASSWORD` in `.env`

### Email Templates

All email templates are in `backend/templates/emails/`:
- `welcome.html` — New user welcome
- `trial_started.html` — Trial activation
- `trial_reminder.html` — Trial ending reminder
- `trial_expired.html` — Trial ended
- `subscription_activated.html` — Subscription activated
- `payment_success.html` — Payment confirmation
- `daily_motivation.html` — Daily morning email
- `weekly_summary.html` — Weekly progress
- `monthly_report.html` — Monthly analytics

All templates are production-ready with responsive design.

---

## 💳 Payment Gateway (Razorpay)

### Setup

1. Sign up at https://razorpay.com/
2. Get API keys from Dashboard → Settings → API Keys
3. Add keys to backend `.env`
4. Configure webhook URL: `https://api.yourdomain.com/api/v1/subscriptions/webhook/`
5. Add webhook secret to `.env`

### Testing

Use test keys for development:
- Key ID: `rzp_test_...`
- Key Secret: `<test-secret>`

Use live keys for production.

---

## 🔍 Health Checks

### Backend Health

```bash
curl https://api.yourdomain.com/api/v1/health/
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

### Celery Status

```bash
celery -A workers.celery_app inspect active
```

### Database Connection

```bash
python manage.py dbshell
```

---

## 📊 Monitoring

### Application Logs

```bash
# Backend logs
sudo journalctl -u habit-backend -f

# Celery worker logs
sudo journalctl -u habit-celery-worker -f

# Celery beat logs
sudo journalctl -u habit-celery-beat -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Performance

```bash
# Check active connections
psql -U habit_user -d habit_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -U habit_user -d habit_db -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Redis Monitoring

```bash
redis-cli INFO
redis-cli MONITOR
```

---

## 🔄 Updates & Maintenance

### Update Backend Code

```bash
cd backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart habit-backend habit-celery-worker habit-celery-beat
```

### Update Frontend Code

```bash
cd frontend
git pull origin main
npm install
npm run build
# Nginx will serve the new dist/ files automatically
```

### Database Backup

```bash
# Create backup
pg_dump -U habit_user habit_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U habit_user habit_db < backup_20260710.sql
```

---

## 🆘 Troubleshooting

### Emails Not Sending

1. Check Gmail App Password is correct
2. Verify `EMAIL_HOST_USER` matches Gmail account
3. Check Celery worker is running
4. View Celery logs: `sudo journalctl -u habit-celery-worker -f`

### Database Connection Errors

1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check credentials in `.env`
3. Test connection: `psql -U habit_user -d habit_db`

### Celery Tasks Not Running

1. Check Redis is running: `redis-cli ping`
2. Verify Celery beat is running: `sudo systemctl status habit-celery-beat`
3. Check Celery worker logs

### Payment Webhook Failing

1. Verify webhook URL in Razorpay dashboard
2. Check webhook secret matches `.env`
3. View backend logs for webhook errors

---

## 🔐 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `DJANGO_SECRET_KEY` generated
- [ ] Database password is strong
- [ ] Gmail App Password configured (not regular password)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] CORS origins restricted to production domains
- [ ] Razorpay webhook secret configured
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular database backups scheduled
- [ ] Application logs monitored

---

## 📚 Additional Resources

- Django Deployment Checklist: https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/
- Gunicorn Documentation: https://docs.gunicorn.org/
- Celery Documentation: https://docs.celeryproject.org/
- Nginx Documentation: https://nginx.org/en/docs/

---

**Deployment Complete!** Your YOU VS YOU application is now live.
