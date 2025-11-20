# Deployment

## Server Requirements

### Minimum Specifications

- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 50 GB SSD
- **OS:** Ubuntu 20.04 LTS or higher

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Nginx 1.18+
- PostgreSQL 14+ (can be container)
- Certbot (for SSL)

---

## Server Preparation

### 1. Update the System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker at startup
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## DNS Configuration

Configure the following DNS records:

| Type | Name | Value | TTL |
|------|--------|-------|-----|
| A | `api.cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |
| A | `cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |
| A | `docs.cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |

---

## Deployment with Docker

### File Structure

```
/opt/crudcloud/
├── docker-compose.yml
├── .env
├── backend/
│   └── Dockerfile
├── nginx/
│   └── conf.d/
│       ├── backend.conf
│       └── frontend.conf
└── ssl/
    └── (SSL certificates)
```

### Docker Compose

Create `/opt/crudcloud/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: crudcloud-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - crudcloud-network
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    container_name: crudcloud-backend
    restart: unless-stopped
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_URL=jdbc:postgresql://postgres:5432/${DB_NAME}
      - DB_USERNAME=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MERCADOPAGO_TOKEN=${MERCADOPAGO_TOKEN}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - FRONTEND_URL=https://cold-brew.crudzaso.com
    depends_on:
      - postgres
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - crudcloud-network
    ports:
      - "8080:8080"

volumes:
  postgres_data:

networks:
  crudcloud-network:
    driver: bridge
```

### .env File

Create `/opt/crudcloud/.env`:

```bash
# Database
DB_NAME=crudcloud
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your-256-bit-secret-key-here-min-32-chars

# Mercado Pago
MERCADOPAGO_TOKEN=APP-your-production-token

# Email
MAIL_USERNAME=noreply@crudcloud.com
MAIL_PASSWORD=your-app-password

# Application
SPRING_PROFILES_ACTIVE=prod
```

⚠️ **Important:** Generate secure passwords and never commit them to the repository.

---

## Nginx Configuration

### Backend (API)

Create `/etc/nginx/sites-available/backend`:

```nginx
upstream backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name api.cold-brew.crudzaso.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cold-brew.crudzaso.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.cold-brew.crudzaso.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cold-brew.crudzaso.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/backend-access.log;
    error_log /var/log/nginx/backend-error.log;

    # Max body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (si es necesario)
        add_header Access-Control-Allow-Origin "https://cold-brew.crudzaso.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /actuator/health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

### Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificates

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain Certificates

```bash
# Backend
sudo certbot --nginx -d api.cold-brew.crudzaso.com

# Frontend
sudo certbot --nginx -d cold-brew.crudzaso.com

# Docs
sudo certbot --nginx -d docs.cold-brew.crudzaso.com
```

### Automatic Renewal

```bash
# Certbot installs a cron automatically
# Verify:
sudo certbot renew --dry-run
```

---

## Application Deployment

### 1. Clone the Repository

```bash
cd /opt/crudcloud
git clone https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew.git backend
```

### 2. Configure Environment Variables

Edit `/opt/crudcloud/.env` with production values.

### 3. Build and Start Services

```bash
cd /opt/crudcloud
docker-compose up -d --build
```

### 4. Verify Status

```bash
# View logs
docker-compose logs -f backend

# Check containers
docker-compose ps

# Health check
curl https://api.cold-brew.crudzaso.com/actuator/health
```

---

## Database Initialization

### Create Default Plans

```bash
# Connect to the database
docker exec -it crudcloud-postgres psql -U postgres -d crudcloud

# Insert plans
INSERT INTO plans (name, max_instances, price, currency) VALUES
('FREE', 2, 0, 'USD'),
('STANDARD', 5, 19.99, 'USD'),
('PREMIUM', 10, 49.99, 'USD');
```

---

## Monitoring and Logs

### View Real-Time Logs

```bash
# Backend
docker-compose logs -f backend

# PostgreSQL
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/backend-access.log

# Error logs
sudo tail -f /var/log/nginx/backend-error.log
```

### Log Rotation

Nginx rotates logs automatically. For Docker:

```bash
# Configure in docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec crudcloud-postgres pg_dump -U postgres crudcloud > backup_$(date +%Y%m%d).sql

# Automatic backup (crontab)
0 2 * * * docker exec crudcloud-postgres pg_dump -U postgres crudcloud > /backups/crudcloud_$(date +\%Y\%m\%d).sql
```

### Restore Backup

```bash
# Restore from backup
cat backup_20250115.sql | docker exec -i crudcloud-postgres psql -U postgres -d crudcloud
```

---

## Updates

### Update the Backend

```bash
cd /opt/crudcloud/backend
git pull origin main
cd ..
docker-compose up -d --build backend
```

### Rollback

```bash
cd /opt/crudcloud/backend
git checkout <previous-commit>
cd ..
docker-compose up -d --build backend
```

---

## Troubleshooting

### Backend won't start

```bash
# View detailed logs
docker-compose logs backend

# Check PostgreSQL connectivity
docker exec crudcloud-backend nc -zv postgres 5432

# Check environment variables
docker exec crudcloud-backend env | grep DB_
```

### Docker permission error

```bash
# Verify user is in docker group
groups

# Restart session if needed
sudo usermod -aG docker $USER
```

### DB containers won't create

```bash
# Verify Docker socket is mounted
docker exec crudcloud-backend ls -l /var/run/docker.sock

# Check permissions
ls -l /var/run/docker.sock
```

---

## Security

### Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Update Dependencies

```bash
# Backend
cd /opt/crudcloud/backend
./mvnw versions:display-dependency-updates

# System
sudo apt update && sudo apt upgrade -y
```

### Docker Hardening

```bash
# Don't expose Docker socket without protection
# Use Docker context instead of mounting socket (advanced)
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] DNS configured and propagated
- [ ] SSL certificates obtained
- [ ] Existing data backed up
- [ ] Rollback plan defined

### Deployment
- [ ] Code cloned and updated
- [ ] Docker images built
- [ ] Services started correctly
- [ ] Nginx configured and restarted
- [ ] Health checks passing

### Post-Deployment
- [ ] Smoke tests executed
- [ ] Create test instance
- [ ] Verify emails working
- [ ] Monitoring configured
- [ ] Documentation updated

---

## Next Steps

- [Architecture](./architecture.md)
- [API Reference](./api-reference.md)
