# Referencia de API

## Base URL

- **Desarrollo:** `http://localhost:8080/api`
- **Producción:** `https://api.cold-brew.crudzaso.com/api`

## Autenticación

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication & User Management

### Register User

Registra un nuevo usuario en el sistema.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "userType": "INDIVIDUAL"
}
```

**Response:** `201 Created`
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "name": "John Doe",
  "userType": "INDIVIDUAL"
}
```

**Validation Rules:**
- Email: formato válido, único
- Password: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
- UserType: `INDIVIDUAL` o `ORGANIZATION`

---

### Login

Autentica un usuario y retorna un token JWT.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "INDIVIDUAL"
  },
  "plan": {
    "name": "FREE",
    "maxInstances": 2
  }
}
```

---

### Get Profile

Obtiene el perfil del usuario autenticado.

**Endpoint:** `GET /api/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "userType": "INDIVIDUAL",
  "plan": {
    "name": "FREE",
    "maxInstances": 2,
    "currentUsage": 1
  },
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## 📊 Database Engines

### List Available Engines

Lista todos los motores de bases de datos disponibles.

**Endpoint:** `GET /api/engines`

**Response:** `200 OK`
```json
[
  {
    "name": "MySQL",
    "version": "8.0",
    "port": 3306,
    "description": "Popular open-source relational database",
    "available": true
  },
  {
    "name": "PostgreSQL",
    "version": "14",
    "port": 5432,
    "description": "Advanced open-source relational database",
    "available": true
  },
  {
    "name": "MongoDB",
    "version": "6.0",
    "port": 27017,
    "description": "NoSQL document database",
    "available": true
  },
  {
    "name": "Redis",
    "version": "7.0",
    "port": 6379,
    "description": "In-memory data structure store",
    "available": true
  },
  {
    "name": "Cassandra",
    "version": "4.1",
    "port": 9042,
    "description": "Distributed NoSQL database",
    "available": true
  },
  {
    "name": "SQL Server",
    "version": "2022",
    "port": 1433,
    "description": "Microsoft's relational database",
    "available": true
  }
]
```

---

## 🗄️ Instance Management

### Create Instance

Crea una nueva instancia de base de datos.

**Endpoint:** `POST /api/databases`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "engine": "MySQL",
  "databaseName": "my_database"
}
```

**Notes:**
- En plan FREE, `databaseName` es opcional (se genera automáticamente)
- En planes STANDARD/PREMIUM, `databaseName` es requerido

**Response:** `201 Created`
```json
{
  "id": 1,
  "engine": "MySQL",
  "databaseName": "my_database",
  "status": "CREATING",
  "host": "api.cold-brew.crudzaso.com",
  "port": 33061,
  "username": "user_a1b2c3d4",
  "password": "X9mK2$pL7nQ4vR8t",
  "connectionString": "mysql://user_a1b2c3d4:X9mK2$pL7nQ4vR8t@api.cold-brew.crudzaso.com:33061/my_database",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

⚠️ **Importante:** La contraseña solo se muestra en esta respuesta. No se podrá recuperar después.

---

### List Instances

Lista todas las instancias del usuario autenticado.

**Endpoint:** `GET /api/databases`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "engine": "MySQL",
    "databaseName": "my_database",
    "status": "RUNNING",
    "host": "api.cold-brew.crudzaso.com",
    "port": 33061,
    "username": "user_a1b2c3d4",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:31:00Z"
  },
  {
    "id": 2,
    "engine": "PostgreSQL",
    "databaseName": "db_xyz789",
    "status": "SUSPENDED",
    "host": "api.cold-brew.crudzaso.com",
    "port": 54321,
    "username": "user_xyz789",
    "createdAt": "2025-01-14T15:20:00Z",
    "updatedAt": "2025-01-15T09:00:00Z"
  }
]
```

---

### Get Instance Details

Obtiene los detalles de una instancia específica.

**Endpoint:** `GET /api/databases/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "engine": "MySQL",
  "databaseName": "my_database",
  "status": "RUNNING",
  "host": "api.cold-brew.crudzaso.com",
  "port": 33061,
  "username": "user_a1b2c3d4",
  "connectionString": "mysql://user_a1b2c3d4@api.cold-brew.crudzaso.com:33061/my_database",
  "containerId": "crud_instance_1",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:31:00Z"
}
```

---

### Suspend Instance

Suspende una instancia en ejecución (detiene el contenedor).

**Endpoint:** `PUT /api/databases/{id}/suspend`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "SUSPENDED",
  "message": "Instance suspended successfully"
}
```

---

### Resume Instance

Reanuda una instancia suspendida (inicia el contenedor).

**Endpoint:** `PUT /api/databases/{id}/resume`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "RUNNING",
  "message": "Instance resumed successfully"
}
```

---

### Delete Instance

Elimina permanentemente una instancia (destruye el contenedor).

**Endpoint:** `DELETE /api/databases/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Instance deleted successfully"
}
```

---

### Rotate Password

Genera una nueva contraseña para la instancia.

**Endpoint:** `POST /api/databases/{id}/rotate-password`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "user_a1b2c3d4",
  "newPassword": "P5nQ8$mK3rL9vT2x",
  "connectionString": "mysql://user_a1b2c3d4:P5nQ8$mK3rL9vT2x@api.cold-brew.crudzaso.com:33061/my_database",
  "message": "Password rotated successfully"
}
```

⚠️ **Importante:** La nueva contraseña solo se muestra en esta respuesta.

---

### Download Credentials PDF

Genera y descarga un PDF con las credenciales de la instancia.

**Endpoint:** `GET /api/databases/{id}/credentials/pdf`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (application/pdf)

---

## 💳 Plans & Subscriptions

### List Plans

Lista todos los planes disponibles.

**Endpoint:** `GET /api/plans`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "FREE",
    "maxInstances": 2,
    "price": 0,
    "currency": "USD",
    "features": [
      "2 database instances",
      "Auto-generated database names",
      "Community support"
    ]
  },
  {
    "id": 2,
    "name": "STANDARD",
    "maxInstances": 5,
    "price": 19.99,
    "currency": "USD",
    "features": [
      "5 database instances",
      "Custom database names",
      "Email support",
      "Daily backups"
    ]
  },
  {
    "id": 3,
    "name": "PREMIUM",
    "maxInstances": 10,
    "price": 49.99,
    "currency": "USD",
    "features": [
      "10 database instances",
      "All STANDARD features",
      "Priority support",
      "Hourly backups",
      "Advanced monitoring"
    ]
  }
]
```

---

### Get Current Plan

Obtiene el plan actual del usuario con su uso.

**Endpoint:** `GET /api/plans/current`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "plan": {
    "name": "FREE",
    "maxInstances": 2,
    "price": 0
  },
  "usage": {
    "currentInstances": 1,
    "remainingInstances": 1,
    "percentage": 50
  }
}
```

---

## 💰 Payments

### Create Payment Preference

Crea una preferencia de pago en Mercado Pago para upgrade de plan.

**Endpoint:** `POST /api/payments/create-preference`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "planId": 2
}
```

**Response:** `200 OK`
```json
{
  "preferenceId": "1234567890-abc-def-ghi",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxx",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxx"
}
```

---

### Payment Webhook

Webhook para recibir notificaciones de Mercado Pago.

**Endpoint:** `POST /api/payments/webhook`

**Headers:** 
- `x-signature: <mercadopago-signature>`
- `x-request-id: <request-id>`

**Request Body:** (enviado por Mercado Pago)

---

## ❌ Error Responses

Todos los errores siguen este formato:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/databases"
}
```

### Códigos de Error Comunes

| Código | Status | Descripción |
|--------|--------|-------------|
| `PLAN_LIMIT_REACHED` | 403 | Usuario alcanzó el límite de instancias |
| `INSTANCE_NOT_FOUND` | 404 | Instancia no existe |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `VALIDATION_ERROR` | 400 | Error en validación de datos |
| `DOCKER_ERROR` | 500 | Error al crear/gestionar contenedor |
| `PAYMENT_FAILED` | 402 | Error en procesamiento de pago |
| `UNAUTHORIZED` | 401 | Token inválido o expirado |

---

## Rate Limiting

- **Límite:** 100 requests por minuto por usuario
- **Header de respuesta:** `X-RateLimit-Remaining: 95`

---

## Próximos Pasos

- [Testing de API](./testing.md)
- [Deployment](./deployment.md)
- [Arquitectura](./architecture.md)
