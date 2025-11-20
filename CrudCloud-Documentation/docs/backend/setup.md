# Installation and Configuration

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose
- PostgreSQL 14+
- Mercado Pago account (for payments)

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew.git
cd CrudCloud-Backend-ColdBrew
```

### 2. Configure Environment Variables

Create an `application-dev.properties` file in `src/main/resources/`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/crudcloud
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key-here-min-256-bits
jwt.expiration=86400000

# Docker
docker.host=unix:///var/run/docker.sock
docker.registry.username=
docker.registry.password=

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Mercado Pago
mercadopago.access-token=TEST-your-access-token
mercadopago.webhook-secret=your-webhook-secret

# Frontend URL (for CORS)
app.frontend.url=http://localhost:3000
```

### 3. Initialize the Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE crudcloud;"

# Run migrations (if using Flyway)
mvn flyway:migrate
```

### 4. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run -Dspring.profiles.active=dev
```

The API will be available at `http://localhost:8080`

## Configuration with Docker

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: crudcloud
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_URL=jdbc:postgresql://postgres:5432/crudcloud
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
    depends_on:
      - postgres
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

volumes:
  postgres_data:
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## Project Structure

```
src/main/java/com/riwi/CrudCloud/
├── auth/                  # Authentication module
│   ├── controller/
│   ├── service/
│   ├── dto/
│   └── config/
├── database/              # Instance module
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
├── payment/               # Payment module
│   ├── controller/
│   ├── service/
│   └── webhook/
├── plan/                  # Plan module
│   ├── controller/
│   ├── service/
│   └── model/
└── common/                # Shared components
    ├── exception/
    ├── config/
    └── util/
```

## Installation Verification

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Create Test User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User",
    "userType": "INDIVIDUAL"
  }'
```

## Production Environment Variables

For production, configure these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://db:5432/crudcloud` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | Secret key for JWT (min 256 bits) | `your-256-bit-secret` |
| `MERCADOPAGO_TOKEN` | Mercado Pago token | `APP-xxx` |
| `MAIL_USERNAME` | Email for notifications | `noreply@crudcloud.com` |
| `MAIL_PASSWORD` | Email password | `app-password` |
| `FRONTEND_URL` | Frontend URL (CORS) | `https://cold-brew.crudzaso.com` |

## Troubleshooting

### Error: Cannot connect to Docker daemon

Make sure Docker is running and the user has permissions:

```bash
# Linux/Mac
sudo usermod -aG docker $USER
# Restart session

# Verify
docker ps
```

### Error: Database connection refused

Verify that PostgreSQL is running:

```bash
# Check status
docker ps | grep postgres

# View logs
docker logs crudcloud-postgres
```

### Error: Port already in use

Change the port in `application.properties`:

```properties
server.port=8081
```

## Next Steps

- [System Architecture](./architecture.md)
- [API Reference](./api-reference.md)
- [Production Deployment](./deployment.md)
