# Database Module

The database module manages the complete lifecycle of database instances in Docker containers, allowing users to create, configure, and manage PostgreSQL and MySQL databases in the cloud.

## 📋 Features

✅ Creation of DB instances in Docker containers  
✅ Support for PostgreSQL and MySQL  
✅ Automatic credential management  
✅ Credential delivery via email  
✅ Limits by subscription plan  
✅ Complete CRUD operations  
✅ Integration with Docker SDK for Java

## 🏗️ Architecture

```
database/
├── controller/           # REST endpoints
├── dto/                  # Request/Response DTOs
├── model/               # Module-specific entities
├── repository/          # JPA repositories
└── service/             # Business logic and Docker SDK
```

### Main Models

- `DatabaseInstance` - DB instance information
- `DatabaseEngine` - Available engines (PostgreSQL, MySQL)
- `InstanceStatus` - Lifecycle states
- `Credential` - Generated access credentials

## 🎯 Instance Creation Flow

```
1. User requests to create instance
   POST /api/databases/create
   {
     userId: 1,
     engine: "POSTGRESQL",
     version: "15",
     databaseName: "mydb" (optional)
   }

2. Backend validates plan limits
   ├─ FREE: maximum 2 instances
   ├─ STANDARD: maximum 5 instances
   └─ PREMIUM: maximum 10 instances

3. Generates random credentials
   ├─ Username: crudzaso_{uuid}
   ├─ Password: {secure_random_32_chars}
   └─ Database Name: {custom or auto-generated}

4. Creates Docker container
   ├─ Image: postgres:15 or mysql:8
   ├─ Environment variables with credentials
   ├─ Random port mapping
   └─ Network configuration

5. Saves to database
   ├─ DatabaseInstance
   ├─ Credential
   └─ Relationship with User

6. Sends email with credentials
   ├─ Host: api.cold-brew.crudzaso.com
   ├─ Port: {mapped_port}
   ├─ Username: crudzaso_{uuid}
   ├─ Password: {generated_password}
   └─ Database: {db_name}

7. Returns information to user
```

## 📡 API Endpoints

### Instance Management

#### Create Database Instance

```http
POST /api/databases/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "engine": "POSTGRESQL",
  "version": "15",
  "databaseName": "myapp_production"
}
```

**Successful response (201 Created):**

```json
{
  "instanceId": 1,
  "userId": 1,
  "engine": "POSTGRESQL",
  "version": "15",
  "databaseName": "myapp_production",
  "status": "RUNNING",
  "containerName": "crudcloud-db-abc123",
  "host": "api.cold-brew.crudzaso.com",
  "port": 5432,
  "createdAt": "2025-11-19T10:30:00Z",
  "credentials": {
    "username": "crudzaso_abc123def456",
    "password": "SecureRandomPassword123!@#XYZ",
    "database": "myapp_production"
  }
}
```

**Errors:**
- `400 Bad Request`: Instance limit reached for plan
- `400 Bad Request`: DB engine not supported
- `404 Not Found`: User not found
- `500 Internal Server Error`: Error creating Docker container

#### List User Instances

```http
GET /api/databases/user/{userId}
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
[
  {
    "instanceId": 1,
    "engine": "POSTGRESQL",
    "version": "15",
    "databaseName": "myapp_production",
    "status": "RUNNING",
    "host": "api.cold-brew.crudzaso.com",
    "port": 5432,
    "createdAt": "2025-11-19T10:30:00Z"
  },
  {
    "instanceId": 2,
    "engine": "MYSQL",
    "version": "8",
    "databaseName": "myapp_staging",
    "status": "STOPPED",
    "host": "api.cold-brew.crudzaso.com",
    "port": 3306,
    "createdAt": "2025-11-18T15:20:00Z"
  }
]
```

#### Get Instance by ID

```http
GET /api/databases/{instanceId}
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
{
  "instanceId": 1,
  "userId": 1,
  "engine": "POSTGRESQL",
  "version": "15",
  "databaseName": "myapp_production",
  "status": "RUNNING",
  "containerName": "crudcloud-db-abc123",
  "containerId": "abc123def456...",
  "host": "api.cold-brew.crudzaso.com",
  "port": 5432,
  "createdAt": "2025-11-19T10:30:00Z",
  "updatedAt": "2025-11-19T10:30:00Z"
}
```

#### Start Instance

```http
POST /api/databases/{instanceId}/start
Authorization: Bearer {token}
```

Starts a stopped Docker container.

**Response (200 OK):**

```json
{
  "instanceId": 1,
  "status": "RUNNING",
  "message": "Database instance started successfully"
}
```

#### Stop Instance

```http
POST /api/databases/{instanceId}/stop
Authorization: Bearer {token}
```

Stops a running Docker container.

**Response (200 OK):**

```json
{
  "instanceId": 1,
  "status": "STOPPED",
  "message": "Database instance stopped successfully"
}
```

#### Restart Instance

```http
POST /api/databases/{instanceId}/restart
Authorization: Bearer {token}
```

Restarts the Docker container.

**Response (200 OK):**

```json
{
  "instanceId": 1,
  "status": "RUNNING",
  "message": "Database instance restarted successfully"
}
```

#### Delete Instance

```http
DELETE /api/databases/{instanceId}
Authorization: Bearer {token}
```

Deletes the Docker container and associated data.

**Response (200 OK):**

```json
{
  "message": "Database instance deleted successfully",
  "instanceId": 1
}
```

**⚠️ Warning:** This operation is **irreversible** and will delete all database data.

### Credentials

#### Get Instance Credentials

```http
GET /api/databases/{instanceId}/credentials
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
{
  "credentialId": 1,
  "instanceId": 1,
  "username": "crudzaso_abc123def456",
  "password": "SecureRandomPassword123!@#XYZ",
  "database": "myapp_production",
  "host": "api.cold-brew.crudzaso.com",
  "port": 5432,
  "connectionString": "postgresql://crudzaso_abc123def456:SecureRandomPassword123!@#XYZ@api.cold-brew.crudzaso.com:5432/myapp_production",
  "createdAt": "2025-11-19T10:30:00Z"
}
```

#### Regenerate Password

```http
POST /api/databases/{instanceId}/credentials/regenerate
Authorization: Bearer {token}
```

Generates a new password for existing credentials and restarts the container.

**Response (200 OK):**

```json
{
  "credentialId": 1,
  "newPassword": "NewSecureRandomPassword456!@#ABC",
  "message": "Password regenerated successfully. New credentials sent to email."
}
```

## 🔧 Docker SDK Integration

### Docker Client Configuration

```java
DockerClient dockerClient = DockerClientBuilder
    .getInstance()
    .withDockerHttpClient(
        new ApacheDockerHttpClient.Builder()
            .dockerHost(URI.create("unix:///var/run/docker.sock"))
            .build()
    )
    .build();
```

### Create PostgreSQL Container

```java
CreateContainerResponse container = dockerClient
    .createContainerCmd("postgres:15")
    .withName("crudcloud-db-" + uuid)
    .withEnv(
        "POSTGRES_USER=" + username,
        "POSTGRES_PASSWORD=" + password,
        "POSTGRES_DB=" + databaseName
    )
    .withHostConfig(
        HostConfig.newHostConfig()
            .withPortBindings(
                new PortBinding(
                    Ports.Binding.bindPort(hostPort),
                    ExposedPort.tcp(5432)
                )
            )
            .withNetworkMode("crudcloud-network")
    )
    .exec();

dockerClient.startContainerCmd(container.getId()).exec();
```

### Create MySQL Container

```java
CreateContainerResponse container = dockerClient
    .createContainerCmd("mysql:8")
    .withName("crudcloud-db-" + uuid)
    .withEnv(
        "MYSQL_ROOT_PASSWORD=" + password,
        "MYSQL_DATABASE=" + databaseName,
        "MYSQL_USER=" + username,
        "MYSQL_PASSWORD=" + password
    )
    .withHostConfig(
        HostConfig.newHostConfig()
            .withPortBindings(
                new PortBinding(
                    Ports.Binding.bindPort(hostPort),
                    ExposedPort.tcp(3306)
                )
            )
            .withNetworkMode("crudcloud-network")
    )
    .exec();

dockerClient.startContainerCmd(container.getId()).exec();
```

## 📊 Data Models

### DatabaseInstance Entity

```java
@Entity
@Table(name = "database_instances")
public class DatabaseInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer instanceId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    private DatabaseEngine engine; // POSTGRESQL, MYSQL
    
    private String version;
    private String databaseName;
    
    @Enumerated(EnumType.STRING)
    private InstanceStatus status; // RUNNING, STOPPED, ERROR
    
    private String containerName;
    private String containerId;
    private String host;
    private Integer port;
    
    @OneToOne(mappedBy = "instance", cascade = CascadeType.ALL)
    private Credential credential;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Credential Entity

```java
@Entity
@Table(name = "credentials")
public class Credential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer credentialId;
    
    @OneToOne
    @JoinColumn(name = "instance_id")
    private DatabaseInstance instance;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String database;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Enums

#### DatabaseEngine

```java
public enum DatabaseEngine {
    POSTGRESQL("postgres", 5432),
    MYSQL("mysql", 3306);
    
    private final String imageName;
    private final int defaultPort;
}
```

#### InstanceStatus

```java
public enum InstanceStatus {
    CREATING,    // Creating container
    RUNNING,     // Container running
    STOPPED,     // Container stopped
    ERROR,       // Container error
    DELETED      // Contenedor eliminado
}
```

## 📧 Send Credentials by Email

### Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .credentials { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .credential-item { margin: 10px 0; }
        .label { font-weight: bold; color: #6366F1; }
    </style>
</head>
<body>
    <h1>Your database is ready! 🎉</h1>
    <p>We have created your database instance on CrudCloud.</p>
    
    <div class="credentials">
        <h3>Access Credentials</h3>
        <div class="credential-item">
            <span class="label">Engine:</span> PostgreSQL 15
        </div>
        <div class="credential-item">
            <span class="label">Host:</span> api.cold-brew.crudzaso.com
        </div>
        <div class="credential-item">
            <span class="label">Port:</span> 5432
        </div>
        <div class="credential-item">
            <span class="label">Username:</span> crudzaso_abc123def456
        </div>
        <div class="credential-item">
            <span class="label">Password:</span> SecureRandomPassword123!
        </div>
        <div class="credential-item">
            <span class="label">Database:</span> myapp_production
        </div>
    </div>
    
    <h3>Connection String</h3>
    <code>postgresql://crudzaso_abc123def456:SecureRandomPassword123!@api.cold-brew.crudzaso.com:5432/myapp_production</code>
    
    <p><strong>⚠️ Important:</strong> Save these credentials in a secure location.</p>
</body>
</html>
```

## 🔒 Security

### Credential Generation

```java
// Unique username
String username = "crudzaso_" + UUID.randomUUID().toString().replace("-", "");

// Secure password (32 random characters)
String password = RandomStringUtils.randomAlphanumeric(32);
```

### Password Storage

- ⚠️ Passwords are stored **encrypted** in the database
- ✅ **AES-256** encryption is used
- ✅ Encryption key in `DB_ENCRYPTION_KEY` environment variable

### Network Isolation

```java
// Containers in private network
.withNetworkMode("crudcloud-network")

// Only exposed ports are accessible
.withPortBindings(...)
```

## 📝 Limits by Plan

| Plan | Max Instances | Custom Names |
|------|---------------|----------------------|
| FREE | 2 | ❌ (Auto-generated) |
| STANDARD | 5 | ✅ |
| PREMIUM | 10 | ✅ |

### Limits Validation

```java
public void validateInstanceLimit(User user) {
    int currentInstances = databaseInstanceRepository
        .countByUserAndStatusNot(user, InstanceStatus.DELETED);
    
    int maxInstances = user.getPersonalPlan().getMaxDatabases();
    
    if (currentInstances >= maxInstances) {
        throw new PlanLimitExceededException(
            "You have reached the maximum number of databases for your plan"
        );
    }
}
```

## 🔗 Integration with Other Modules

### With Auth Module
- Validates that user is authenticated
- Verifies user's plan limits
- Obtains plan information (`User.personalPlan`)

### With Payment Module
- Plan upgrade allows creating more instances
- Active subscription validation

### With Email Service
- Send credentials when creating instance
- State change notifications
- Password reset alerts

## ⚠️ Error Handling

### Custom Exceptions

- **`PlanLimitExceededException`**: Instance limit reached
- **`DatabaseEngineNotSupportedException`**: DB engine not supported
- **`ContainerCreationException`**: Error creating Docker container
- **`ContainerNotFoundException`**: Container not found
- **`CredentialGenerationException`**: Error generating credentials

### Error Response

```json
{
  "status": 400,
  "message": "You have reached the maximum number of databases for your FREE plan (2/2)",
  "timestamp": "2025-11-19T10:30:00Z",
  "path": "/api/databases/create",
  "suggestion": "Upgrade to STANDARD plan to create up to 5 databases"
}
```

## 🎯 Key Features

✅ **Automatic Creation** of Docker containers  
✅ **Credential Management** secure and encrypted  
✅ **Credential Delivery** via email  
✅ **Multi-Engine Support** (PostgreSQL, MySQL)  
✅ **Limits by Plan** subscription  
✅ **Complete CRUD Operations**  
✅ **Network Isolation** with Docker  
✅ **Automatic Port Mapping**  
✅ **Container Health Checks**

## Next Steps

- [Authentication Module](./auth.md)
- [Payment Module (Mercado Pago)](./mercado-pago.md)
- [Common Module](./common.md)
- [Backend Architecture](../architecture.md)
