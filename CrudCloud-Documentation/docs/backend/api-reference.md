# API Reference

## Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://api.cold-brew.crudzaso.com/api`

## Authentication

All routes (except `/auth/register` and `/auth/login`) require a JWT token in the header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication & User Management

### Register User

Registers a new user in the system.

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
- Email: valid format, unique
- Password: minimum 8 characters, 1 uppercase, 1 number, 1 special character
- UserType: `INDIVIDUAL` or `ORGANIZATION`

---

### Login

Authenticates a user and returns a JWT token.

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

Obtains the authenticated user's profile.

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

Lists all available database engines.

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

Creates a new database instance.

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
- On FREE plan, `databaseName` is optional (auto-generated)
- On STANDARD/PREMIUM plans, `databaseName` is required

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

⚠️ **Important:** The password is only shown in this response. It cannot be retrieved later.

---

### List Instances

Lists all instances of the authenticated user.

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

Obtains the details of a specific instance.

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

Suspends a running instance (stops the container).

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

Resumes a suspended instance (starts the container).

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

Permanently deletes an instance (destroys the container).

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

Generates a new password for the instance.

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

⚠️ **Important:** The new password is only shown in this response.

---

### Download Credentials PDF

Generates and downloads a PDF with the instance credentials.

**Endpoint:** `GET /api/databases/{id}/credentials/pdf`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (application/pdf)

---

## 💳 Plans & Subscriptions

### List Plans

Lists all available plans.

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

Obtains the user's current plan with usage.

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

Creates a payment preference in Mercado Pago for plan upgrade.

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

Webhook to receive notifications from Mercado Pago.

**Endpoint:** `POST /api/payments/webhook`

**Headers:** 
- `x-signature: <mercadopago-signature>`
- `x-request-id: <request-id>`

**Request Body:** (sent by Mercado Pago)

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/databases"
}
```

### Common Error Codes

| Code | Status | Description |
|--------|--------|-------------|
| `PLAN_LIMIT_REACHED` | 403 | User reached instance limit |
| `INSTANCE_NOT_FOUND` | 404 | Instance does not exist |
| `INVALID_CREDENTIALS` | 401 | Incorrect email or password |
| `VALIDATION_ERROR` | 400 | Data validation error |
| `DOCKER_ERROR` | 500 | Error creating/managing container |
| `PAYMENT_FAILED` | 402 | Payment processing error |
| `UNAUTHORIZED` | 401 | Invalid or expired token |

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Response header:** `X-RateLimit-Remaining: 95`

---

## Next Steps

- [Deployment](./deployment.md)
- [Architecture](./architecture.md)
