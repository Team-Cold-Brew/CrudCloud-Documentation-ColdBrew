# Instalación y Configuración

## Requisitos Previos

- Java 17 o superior
- Maven 3.6+
- Docker y Docker Compose
- PostgreSQL 14+
- Cuenta de Mercado Pago (para pagos)

## Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Team-Cold-Brew/CrudCloud-Backend-ColdBrew.git
cd CrudCloud-Backend-ColdBrew
```

### 2. Configurar Variables de Entorno

Crea un archivo `application-dev.properties` en `src/main/resources/`:

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

### 3. Inicializar la Base de Datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE crudcloud;"

# Ejecutar migraciones (si usas Flyway)
mvn flyway:migrate
```

### 4. Compilar y Ejecutar

```bash
# Compilar el proyecto
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run -Dspring.profiles.active=dev
```

La API estará disponible en `http://localhost:8080`

## Configuración con Docker

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

### Ejecutar con Docker Compose

```bash
docker-compose up -d
```

## Estructura del Proyecto

```
src/main/java/com/riwi/CrudCloud/
├── auth/                  # Módulo de autenticación
│   ├── controller/
│   ├── service/
│   ├── dto/
│   └── config/
├── database/              # Módulo de instancias
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
├── payment/               # Módulo de pagos
│   ├── controller/
│   ├── service/
│   └── webhook/
├── plan/                  # Módulo de planes
│   ├── controller/
│   ├── service/
│   └── model/
└── common/                # Componentes compartidos
    ├── exception/
    ├── config/
    └── util/
```

## Verificación de la Instalación

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Crear Usuario de Prueba

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

## Variables de Entorno en Producción

Para producción, configura estas variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | URL de conexión a PostgreSQL | `jdbc:postgresql://db:5432/crudcloud` |
| `DB_USERNAME` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `secure_password` |
| `JWT_SECRET` | Clave secreta para JWT (min 256 bits) | `your-256-bit-secret` |
| `MERCADOPAGO_TOKEN` | Token de Mercado Pago | `APP-xxx` |
| `MAIL_USERNAME` | Email para notificaciones | `noreply@crudcloud.com` |
| `MAIL_PASSWORD` | Contraseña del email | `app-password` |
| `FRONTEND_URL` | URL del frontend (CORS) | `https://cold-brew.crudzaso.com` |

## Troubleshooting

### Error: Cannot connect to Docker daemon

Asegúrate de que Docker esté ejecutándose y que el usuario tenga permisos:

```bash
# Linux/Mac
sudo usermod -aG docker $USER
# Reiniciar sesión

# Verificar
docker ps
```

### Error: Database connection refused

Verifica que PostgreSQL esté ejecutándose:

```bash
# Verificar estado
docker ps | grep postgres

# Ver logs
docker logs crudcloud-postgres
```

### Error: Port already in use

Cambia el puerto en `application.properties`:

```properties
server.port=8081
```

## Próximos Pasos

- [Arquitectura del Sistema](./architecture.md)
- [Referencia de API](./api-reference.md)
- [Deployment en Producción](./deployment.md)
