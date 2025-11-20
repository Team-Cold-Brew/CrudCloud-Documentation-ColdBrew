# Authentication Module (Auth)

The authentication module handles user registration, login, OAuth 2.0 authentication, and subscription plan management.

## 🏗️ Architecture

### High-Level Diagram

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

### Component Interaction Flow

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

## 🔐 Authentication Flows

### Traditional Registration

```
1. User sends POST /api/v1/auth/register
   { email, username, password }

2. AuthService validates data
   ├─ Verifies unique email
   ├─ Verifies unique username
   └─ Hash password with BCrypt

3. Creates user in DB
   ├─ Assigns FREE plan by default
   └─ Generates timestamps

4. Generates JWT token
   └─ Payload: { userId, email, roles }

5. Returns AuthResponse
   { token, user: { id, email, username, planName } }
```

### Traditional Login

```
1. User sends POST /api/v1/auth/login
   { email, password }

2. AuthService searches for user
   └─ By email

3. Verifies password
   └─ BCrypt.matches(rawPassword, hashedPassword)

4. Generates JWT token
   └─ Payload: { userId, email, roles }

5. Returns AuthResponse
   { token, user: { id, email, username, planName } }
```

### OAuth 2.0 (Google/GitHub)

```
1. User clicks on "Login with Google/GitHub"
   Frontend redirects to: /api/v1/oauth/google or /github

2. Backend redirects to OAuth provider
   └─ With client_id and redirect_uri

3. User authorizes on provider

4. Provider redirects to callback
   GET /api/v1/oauth/google/callback?code=xyz

5. Backend exchanges code for access_token
   └─ POST to provider's token URL

6. Obtains user information
   └─ GET to provider's user info URL

7. OAuthUserProcessorService processes user
   ├─ If exists by email → Link provider
   └─ If doesn't exist → Create new user

8. Generates JWT token

9. Redirects to frontend
   https://cold-brew.crudzaso.com?token=xyz
```

## 📡 API Endpoints

### Authentication

#### User Registration

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Successful response (201 Created):**

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

**Errors:**
- `400 Bad Request`: Email already registered
- `400 Bad Request`: Username already exists
- `400 Bad Request`: Data validation failed

#### User Login

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

**Errors:**
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found

#### Get User Profile

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

#### Google OAuth Start

```http
GET /api/v1/oauth/google
```

Redirects to Google OAuth with:
- `client_id`: Google application ID
- `redirect_uri`: Callback URL
- `response_type`: code
- `scope`: openid email profile

#### Google OAuth Callback

```http
GET /api/v1/oauth/google/callback?code=xyz
```

Processes authorization code and returns JWT token.

#### GitHub OAuth Start

```http
GET /api/v1/oauth/github
```

Redirects to GitHub OAuth with:
- `client_id`: GitHub application ID
- `redirect_uri`: Callback URL
- `scope`: read:user user:email

#### GitHub OAuth Callback

```http
GET /api/v1/oauth/github/callback?code=xyz
```

Processes authorization code and returns JWT token.

### Subscription Plans

#### Get All Plans

```http
GET /api/v1/plans
```

**Response (200 OK):**

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

#### Get Plan by ID

```http
GET /api/v1/plans/{planId}
```

**Response (200 OK):**

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

**Errors:**
- `404 Not Found`: Plan not found

#### Get Plan by Name

```http
GET /api/v1/plans/name/{name}
```

Valid values: `FREE`, `STANDARD`, `PREMIUM`

**Response (200 OK):**

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

## 🔒 Security Configuration

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

- **CORS enabled** for `https://cold-brew.crudzaso.com`
- **CSRF disabled** (stateless REST API)
- **Session Management**: STATELESS
- **Public endpoints**:
  - `/api/v1/auth/register`
  - `/api/v1/auth/login`
  - `/api/v1/oauth/**`
  - `/api/v1/plans/**`

- **Protected endpoints**:
  - `/api/v1/auth/profile` (requires JWT)

### Password Hashing

- **Algorithm**: BCrypt
- **Strength**: 12 rounds
- **Salt**: Automatically generated

## 📊 Data Models

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

## 🔗 Integration Points

### With Database Module
- Uses `Plan` to apply database creation limits
- Relationship: `User.personalPlan` → `maxDatabases` restrictions

### With Payment Module
- Plan upgrades via payment processing
- Subscription management
- Automatic update of `User.personalPlan`

### With Frontend
- Provides JWT token for subsequent API calls
- Standardized response format with DTOs
- Support for OAuth integration

## ⚠️ Exception Handling

### Custom Exceptions

- **`DuplicateResourceException`**: Email or username already exists
- **`InvalidCredentialsException`**: Incorrect password
- **`ResourceNotFoundException`**: User or plan not found
- **`OAuthProcessingException`**: Error in OAuth flow

### Error Responses

```json
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": "2025-11-19T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

## 📝 Plan Levels

| Plan | Max Databases | Monthly Price | Features |
|------|-------------------|----------------|-----------------|
| FREE | 2 | $0 | Nombres de BD auto-generados |
| STANDARD | 5 | $19.99 | Nombres personalizados, soporte por email |
| PREMIUM | 10 | $49.99 | Todo STANDARD + soporte prioritario |

## 🔑 Key Features

✅ **Traditional Authentication** with email/password
✅ **OAuth 2.0** with Google and GitHub  
✅ **JWT Tokens** for stateless sessions  
✅ **Password Hashing** with BCrypt (12 rounds)  
✅ **Subscription Plan Management**  
✅ **Data Validation** with Spring Validation  
✅ **Centralized Exception Handling**  
✅ **CORS configured** for frontend  
✅ **RESTful Endpoints** with clear documentation

## Next Steps

- [API Reference](../api-reference.md)
- [Database Module](./database.md)
- [Payment Module (Mercado Pago)](./mercado-pago.md)
- [General Architecture](../architecture.md)
