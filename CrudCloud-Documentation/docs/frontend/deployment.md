# Deployment

## Production Preparation

### Optimized Build

```bash
# Production build
npm run build

# Verify output
ls -lh dist/
```

### Bundle Analysis

```bash
# Install analysis tool
npm install -D rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})

# Generate report
npm run build
```

---

## Deployment with Docker

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css text/javascript application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router (History API)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Build and Run

```bash
# Build image
docker build -t crudcloud-frontend .

# Run container
docker run -d \
  -p 80:80 \
  --name crudcloud-frontend \
  crudcloud-frontend

# Verify
curl http://localhost
```

---

## VPS Deployment

### 1. Prepare Server

```bash
# Connect to server
ssh user@api.cold-brew.crudzaso.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Nginx
sudo apt install nginx -y
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/Team-Cold-Brew/CrudCloud-Frontend.git
cd CrudCloud-Frontend
```

### 3. Configure Environment Variables

```bash
# Create .env.production file
sudo nano .env.production
```

```env
VITE_API_URL=https://api.cold-brew.crudzaso.com/api
VITE_ENV=production
```

### 4. Build and Deploy

```bash
# Build with Docker
sudo docker build -t crudcloud-frontend .

# Run container
sudo docker run -d \
  -p 3000:80 \
  --name crudcloud-frontend \
  --restart unless-stopped \
  crudcloud-frontend
```

---

## Nginx Configuration (Reverse Proxy)

### Frontend

Create `/etc/nginx/sites-available/frontend`:

```nginx
upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name cold-brew.crudzaso.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cold-brew.crudzaso.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/cold-brew.crudzaso.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cold-brew.crudzaso.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/frontend-access.log;
    error_log /var/log/nginx/frontend-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        proxy_pass http://frontend;
        proxy_cache_valid 200 1y;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Certificados SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d cold-brew.crudzaso.com

# Automatic renewal
sudo certbot renew --dry-run
```

---

## Deployment con Docker Compose

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crudcloud-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    networks:
      - crudcloud-network

networks:
  crudcloud-network:
    external: true
```

### Execute

```bash
docker-compose up -d --build
```

---

## Production Optimizations

### 1. Code Splitting

```javascript
// App.jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const MyDatabases = lazy(() => import('./pages/MyDatabases'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/databases" element={<MyDatabases />} />
      </Routes>
    </Suspense>
  )
}
```

### 2. Preload Critical Resources

```html
<!-- index.html -->
<head>
  <link rel="preload" href="/assets/logo.svg" as="image">
  <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" crossorigin>
</head>
```

### 3. Service Worker (PWA)

```bash
# Install PWA plugin
npm install -D vite-plugin-pwa
```

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CrudCloud',
        short_name: 'CrudCloud',
        description: 'Cloud Database Management Platform',
        theme_color: '#6366F1',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
```

---

## Monitoring and Analytics

### Google Analytics

```javascript
// src/utils/analytics.js
export const initGA = () => {
  if (import.meta.env.VITE_GA_ID) {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`
    script.async = true
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', import.meta.env.VITE_GA_ID)
  }
}

// main.jsx
import { initGA } from './utils/analytics'

initGA()
```

### Error Tracking (Sentry)

```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV,
    tracesSampleRate: 1.0,
  })
}
```

---

## CI/CD con GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npm run build

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/opt/crudcloud-frontend"

      - name: Restart container
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/crudcloud-frontend
            docker-compose down
            docker-compose up -d --build
```

---

## Rollback

### Manual

```bash
# View image history
docker images

# Revert to previous version
docker stop crudcloud-frontend
docker rm crudcloud-frontend
docker run -d -p 3000:80 --name crudcloud-frontend crudcloud-frontend:previous

# O usando Git
cd /opt/CrudCloud-Frontend
git log --oneline
git checkout <commit-hash>
docker-compose up -d --build
```

---

## Checklist de Deployment

### Pre-Deployment
- [ ] Tests pasando
- [ ] Build sin warnings
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL listos
- [ ] DNS configurado

### Deployment
- [ ] Production build created
- [ ] Docker images built
- [ ] Container running
- [ ] Nginx configurado
- [ ] SSL funcionando

### Post-Deployment
- [ ] Site accessible via HTTPS
- [ ] API connected correctly
- [ ] Authentication working
- [ ] All pages loading
- [ ] Responsive on mobile

---

## Troubleshooting

### Build falla

```bash
# Limpiar cache
rm -rf node_modules dist
npm install
npm run build
```

### Error 404 on routes

Make sure Nginx redirects to `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### API no conecta

Verifica CORS en el backend y la URL en `.env.production`.

---

## Next Steps

- [Componentes](./components.md)
- [Backend Deployment](../backend/deployment.md)
