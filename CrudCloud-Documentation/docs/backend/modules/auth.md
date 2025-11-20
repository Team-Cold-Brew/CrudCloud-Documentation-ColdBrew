# Módulo de Autenticación (Auth)

El módulo de autenticación maneja el registro de usuarios, inicio de sesión, autenticación OAuth 2.0 y gestión de planes de suscripción.

## 🏗️ Arquitectura

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                            │
│                   (Spring Security Filter)                        │
│              ┌─────────────────────────────────┐                 │
│              │  JwtAuthenticationFilter        │                 │
│              │  (Validate JWT Tokens)          │                 │
│              └─────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ AuthController   │ │ OAuthController  │ │ PlanController   │
│                  │ │                  │ │                  │
│ - Register User  │ │ - Google OAuth   │ │ - Get All Plans  │
│ - Login User     │ │ - GitHub OAuth   │ │ - Get Plan by ID │
│ - Get Profile    │ │ - Link Account   │ │ - Get Plan ByName│
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ UserRepository   │ │OAuthProvider*    │ │ PlanRepository   │
│                  │ │Repository        │ │                  │
│ - Find by Email  │ │                  │ │ - Find All       │
│ - Find by ID     │ │ - Manage OAuth   │ │ - Find by ID     │
│ - Exists Check   │ │   Providers      │ │ - Find by Name   │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              ┌────────────────────────────────┐
              │      Database (PostgreSQL)     │
              │  - users table                 │
              │  - plan table                  │
              │  - user_oauth_providers table  │
              └────────────────────────────────┘
```

### Flujo de Interacción de Componentes

```
User Request
    │
    ▼
SecurityFilterChain (CORS, CSRF)
    │
    ▼
JwtAuthenticationFilter (If protected endpoint)
    │ Validates Token
    ├─ If Valid → Continue
    └─ If Invalid → 401 Unauthorized
    │
    ▼
Controller Layer
    ├─ AuthController (Register, Login, Profile)
    ├─ OAuthController (OAuth Callbacks)
    └─ PlanController (Plan Data)
    │
    ▼
Service Layer
    ├─ AuthService (Auth Business Logic)
    ├─ OAuthUserProcessorService (OAuth User Processing)
    ├─ GoogleOAuthService / GitHubOAuthService (Provider Integration)
    └─ PlanService (Plan Logic)
    │
    ▼
Repository Layer
    └─ Database Access
    │
    ▼
Response to Client with JWT Token (if auth) or Data
```

## 🔐 Flujos de Autenticación

### Registro Tradicional

```
1. Usuario envía POST /api/v1/auth/register
   { email, username, password }

2. AuthService valida datos
   ├─ Verifica email único
   ├─ Verifica username único
   └─ Hash password con BCrypt

3. Crea usuario en BD
   ├─ Asigna plan FREE por defecto
   └─ Genera timestamps

4. Genera JWT token
   └─ Payload: { userId, email, roles }

5. Retorna AuthResponse
   { token, user: { id, email, username, planName } }
```

### Login Tradicional

```
1. Usuario envía POST /api/v1/auth/login
   { email, password }

2. AuthService busca usuario
   └─ Por email

3. Verifica contraseña
   └─ BCrypt.matches(rawPassword, hashedPassword)

4. Genera JWT token
   └─ Payload: { userId, email, roles }

5. Retorna AuthResponse
   { token, user: { id, email, username, planName } }
```

### OAuth 2.0 (Google/GitHub)

```
1. Usuario hace clic en "Login with Google/GitHub"
   Frontend redirige a: /api/v1/oauth/google o /github

2. Backend redirige a proveedor OAuth
   └─ Con client_id y redirect_uri

3. Usuario autoriza en proveedor

4. Proveedor redirige a callback
   GET /api/v1/oauth/google/callback?code=xyz

5. Backend intercambia code por access_token
   └─ POST a token URL del proveedor

6. Obtiene información del usuario
   └─ GET a user info URL del proveedor

7. OAuthUserProcessorService procesa usuario
   ├─ Si existe por email → Vincula provider
   └─ Si no existe → Crea usuario nuevo

8. Genera JWT token

9. Redirige a frontend
   https://cold-brew.crudzaso.com?token=xyz
```

## 📡 API Endpoints

### Autenticación

#### Registro de Usuario

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Respuesta exitosa (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "planName": "FREE",
    "oauthProvider": null,
    "createdAt": "2025-11-19T10:30:00Z"
  }
}
```

**Errores:**
- `400 Bad Request`: Email ya registrado
- `400 Bad Request`: Username ya existe
- `400 Bad Request`: Validación de datos fallida

#### Login de Usuario

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Respuesta exitosa (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "planName": "FREE",
    "oauthProvider": null,
    "createdAt": "2025-11-19T10:30:00Z"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas
- `404 Not Found`: Usuario no encontrado

#### Obtener Perfil de Usuario

```http
GET /api/v1/auth/profile
Authorization: Bearer {token}
```

**Respuesta exitosa (200 OK):**

```json
{
  "userId": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "planName": "FREE",
  "oauthProvider": null,
  "createdAt": "2025-11-19T10:30:00Z"
}
```

### OAuth Endpoints

#### Google OAuth Inicio

```http
GET /api/v1/oauth/google
```

Redirige a Google OAuth con:
- `client_id`: ID de aplicación Google
- `redirect_uri`: URL de callback
- `response_type`: code
- `scope`: openid email profile

#### Google OAuth Callback

```http
GET /api/v1/oauth/google/callback?code=xyz
```

Procesa código de autorización y retorna token JWT.

#### GitHub OAuth Inicio

```http
GET /api/v1/oauth/github
```

Redirige a GitHub OAuth con:
- `client_id`: ID de aplicación GitHub
- `redirect_uri`: URL de callback
- `scope`: read:user user:email

#### GitHub OAuth Callback

```http
GET /api/v1/oauth/github/callback?code=xyz
```

Procesa código de autorización y retorna token JWT.

### Planes de Suscripción

#### Obtener Todos los Planes

```http
GET /api/v1/plans
```

**Respuesta (200 OK):**

```json
[
  {
    "planId": 1,
    "name": "FREE",
    "description": "Free tier with basic features",
    "maxDatabases": 2,
    "price": 0.00,
    "billingCycle": "monthly"
  },
  {
    "planId": 2,
    "name": "STANDARD",
    "description": "Standard tier with extended features",
    "maxDatabases": 5,
    "price": 19.99,
    "billingCycle": "monthly"
  },
  {
    "planId": 3,
    "name": "PREMIUM",
    "description": "Premium tier with unlimited features",
    "maxDatabases": 10,
    "price": 49.99,
    "billingCycle": "monthly"
  }
]
```

#### Obtener Plan por ID

```http
GET /api/v1/plans/{planId}
```

**Respuesta (200 OK):**

```json
{
  "planId": 1,
  "name": "FREE",
  "description": "Free tier with basic features",
  "maxDatabases": 2,
  "price": 0.00,
  "billingCycle": "monthly"
}
```

**Errores:**
- `404 Not Found`: Plan no encontrado

#### Obtener Plan por Nombre

```http
GET /api/v1/plans/name/{name}
```

Valores válidos: `FREE`, `STANDARD`, `PREMIUM`

**Respuesta (200 OK):**

```json
{
  "planId": 1,
  "name": "FREE",
  "description": "Free tier with basic features",
  "maxDatabases": 2,
  "price": 0.00,
  "billingCycle": "monthly"
}
```

## 🔒 Configuración de Seguridad

### JWT Configuration

```properties
# JWT Secret Key (256-bit base64)
JWT_SECRET=your-256-bit-base64-encoded-secret-key-here

# Token expiration (24 hours in milliseconds)
JWT_EXPIRATION=86400000
```

### OAuth Configuration

#### Google OAuth

```properties
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_TOKEN_URL=https://oauth2.googleapis.com/token
GOOGLE_USER_INFO_URL=https://www.googleapis.com/oauth2/v2/userinfo
```

#### GitHub OAuth

```properties
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_TOKEN_URL=https://github.com/login/oauth/access_token
GITHUB_USER_INFO_URL=https://api.github.com/user
```

### Security Filter Chain

- **CORS habilitado** para `https://cold-brew.crudzaso.com`
- **CSRF deshabilitado** (API REST stateless)
- **Session Management**: STATELESS
- **Endpoints públicos**:
  - `/api/v1/auth/register`
  - `/api/v1/auth/login`
  - `/api/v1/oauth/**`
  - `/api/v1/plans/**`

- **Endpoints protegidos**:
  - `/api/v1/auth/profile` (requiere JWT)

### Password Hashing

- **Algoritmo**: BCrypt
- **Strength**: 12 rounds
- **Salt**: Generado automáticamente

## 📊 Modelos de Datos

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private Plan personalPlan;
    
    @OneToMany(mappedBy = "user")
    private List<UserOAuthProvider> oauthProviders;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Plan Entity

```java
@Entity
@Table(name = "plan")
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer planId;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private Integer maxDatabases;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String billingCycle;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### UserOAuthProvider Entity

```java
@Entity
@Table(name = "user_oauth_providers")
public class UserOAuthProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer providerId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
    
    @Enumerated(EnumType.STRING)
    private OAuthProvider provider; // GOOGLE, GITHUB
    
    @Column(unique = true)
    private String providerUserId;
    
    private String providerEmail;
    private String providerName;
    
    private LocalDateTime linkedAt;
}
```

## 🔗 Puntos de Integración

### Con Módulo de Base de Datos
- Usa `Plan` para aplicar límites de creación de bases de datos
- Relación: `User.personalPlan` → restricciones `maxDatabases`

### Con Módulo de Pagos
- Upgrade de planes mediante procesamiento de pagos
- Gestión de suscripciones
- Actualización automática de `User.personalPlan`

### Con Frontend
- Provee JWT token para llamadas API subsecuentes
- Formato estandarizado de respuestas con DTOs
- Soporte para integración OAuth

## ⚠️ Manejo de Excepciones

### Excepciones Personalizadas

- **`DuplicateResourceException`**: Email o username ya existe
- **`InvalidCredentialsException`**: Contraseña incorrecta
- **`ResourceNotFoundException`**: Usuario o plan no encontrado
- **`OAuthProcessingException`**: Error en flujo OAuth

### Respuestas de Error

```json
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": "2025-11-19T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

## 📝 Niveles de Plan

| Plan | Max Bases de Datos | Precio Mensual | Características |
|------|-------------------|----------------|-----------------|
| FREE | 2 | $0 | Nombres de BD auto-generados |
| STANDARD | 5 | $19.99 | Nombres personalizados, soporte por email |
| PREMIUM | 10 | $49.99 | Todo STANDARD + soporte prioritario |

## 🔑 Características Clave

✅ **Autenticación Tradicional** con email/password  
✅ **OAuth 2.0** con Google y GitHub  
✅ **JWT Tokens** para sesiones stateless  
✅ **Hashing de Contraseñas** con BCrypt (12 rounds)  
✅ **Gestión de Planes** de suscripción  
✅ **Validación de Datos** con Spring Validation  
✅ **Manejo de Excepciones** centralizado  
✅ **CORS configurado** para frontend  
✅ **Endpoints RESTful** con documentación clara

## Próximos Pasos

- [Referencia de API](../api-reference.md)
- [Módulo de Base de Datos](./database.md)
- [Módulo de Pagos (Mercado Pago)](./mercado-pago.md)
- [Arquitectura General](../architecture.md)
