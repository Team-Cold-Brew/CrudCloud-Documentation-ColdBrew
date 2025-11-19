# Deployment

## Requisitos del Servidor

### Especificaciones Mínimas

- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 50 GB SSD
- **OS:** Ubuntu 20.04 LTS o superior

### Software Necesario

- Docker 20.10+
- Docker Compose 2.0+
- Nginx 1.18+
- PostgreSQL 14+ (puede ser contenedor)
- Certbot (para SSL)

---

## Preparación del Servidor

### 1. Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Habilitar Docker al inicio
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Configuración de DNS

Configura los siguientes registros DNS:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `api.cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |
| A | `cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |
| A | `docs.cold-brew.crudzaso.com` | `IP_DEL_SERVIDOR` | 300 |

---

## Deployment con Docker

### Estructura de Archivos

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
    └── (certificados SSL)
```

### Docker Compose

Crea `/opt/crudcloud/docker-compose.yml`:

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

### Archivo .env

Crea `/opt/crudcloud/.env`:

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

⚠️ **Importante:** Genera contraseñas seguras y nunca las commits al repositorio.

---

## Configuración de Nginx

### Backend (API)

Crea `/etc/nginx/sites-available/backend`:

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

### Habilitar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Certificados SSL

### Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtener Certificados

```bash
# Backend
sudo certbot --nginx -d api.cold-brew.crudzaso.com

# Frontend
sudo certbot --nginx -d cold-brew.crudzaso.com

# Docs
sudo certbot --nginx -d docs.cold-brew.crudzaso.com
```

### Renovación Automática

```bash
# Certbot instala un cron automáticamente
# Verificar:
sudo certbot renew --dry-run
```

---

## Despliegue de la Aplicación

### 1. Clonar el Repositorio

```bash
cd /opt/crudcloud
git clone https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew.git backend
```

### 2. Configurar Variables de Entorno

Edita `/opt/crudcloud/.env` con los valores de producción.

### 3. Construir y Levantar los Servicios

```bash
cd /opt/crudcloud
docker-compose up -d --build
```

### 4. Verificar el Estado

```bash
# Ver logs
docker-compose logs -f backend

# Verificar contenedores
docker-compose ps

# Health check
curl https://api.cold-brew.crudzaso.com/actuator/health
```

---

## Inicialización de la Base de Datos

### Crear Planes por Defecto

```bash
# Conectar a la base de datos
docker exec -it crudcloud-postgres psql -U postgres -d crudcloud

# Insertar planes
INSERT INTO plans (name, max_instances, price, currency) VALUES
('FREE', 2, 0, 'USD'),
('STANDARD', 5, 19.99, 'USD'),
('PREMIUM', 10, 49.99, 'USD');
```

---

## Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Backend
docker-compose logs -f backend

# PostgreSQL
docker-compose logs -f postgres

# Todos los servicios
docker-compose logs -f
```

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/backend-access.log

# Error logs
sudo tail -f /var/log/nginx/backend-error.log
```

### Rotación de Logs

Nginx rota logs automáticamente. Para Docker:

```bash
# Configurar en docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Backup y Recuperación

### Backup de Base de Datos

```bash
# Crear backup
docker exec crudcloud-postgres pg_dump -U postgres crudcloud > backup_$(date +%Y%m%d).sql

# Backup automático (crontab)
0 2 * * * docker exec crudcloud-postgres pg_dump -U postgres crudcloud > /backups/crudcloud_$(date +\%Y\%m\%d).sql
```

### Restaurar Backup

```bash
# Restaurar desde backup
cat backup_20250115.sql | docker exec -i crudcloud-postgres psql -U postgres -d crudcloud
```

---

## Actualizaciones

### Actualizar el Backend

```bash
cd /opt/crudcloud/backend
git pull origin main
cd ..
docker-compose up -d --build backend
```

### Rollback

```bash
cd /opt/crudcloud/backend
git checkout <commit-anterior>
cd ..
docker-compose up -d --build backend
```

---

## Troubleshooting

### Backend no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar conectividad a PostgreSQL
docker exec crudcloud-backend nc -zv postgres 5432

# Verificar variables de entorno
docker exec crudcloud-backend env | grep DB_
```

### Error de permisos con Docker

```bash
# Verificar que el usuario está en el grupo docker
groups

# Reiniciar sesión si es necesario
sudo usermod -aG docker $USER
```

### Contenedores de BD no se crean

```bash
# Verificar que Docker socket está montado
docker exec crudcloud-backend ls -l /var/run/docker.sock

# Verificar permisos
ls -l /var/run/docker.sock
```

---

## Seguridad

### Firewall

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Actualizar Dependencias

```bash
# Backend
cd /opt/crudcloud/backend
./mvnw versions:display-dependency-updates

# Sistema
sudo apt update && sudo apt upgrade -y
```

### Hardening de Docker

```bash
# No exponer Docker socket sin protección
# Usar Docker context en lugar de montar socket (avanzado)
```

---

## Checklist de Deployment

### Pre-Deployment
- [ ] Variables de entorno configuradas
- [ ] DNS configurado y propagado
- [ ] Certificados SSL obtenidos
- [ ] Backup de datos existentes
- [ ] Plan de rollback definido

### Deployment
- [ ] Código clonado y actualizado
- [ ] Docker images construidas
- [ ] Servicios iniciados correctamente
- [ ] Nginx configurado y reiniciado
- [ ] Health checks pasando

### Post-Deployment
- [ ] Smoke tests ejecutados
- [ ] Crear instancia de prueba
- [ ] Verificar emails funcionando
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

## Próximos Pasos

- [Arquitectura](./architecture.md)
- [API Reference](./api-reference.md)
