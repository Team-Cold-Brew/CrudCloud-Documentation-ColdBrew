# Módulo de Base de Datos (Database)

El módulo de base de datos gestiona el ciclo de vida completo de instancias de bases de datos en contenedores Docker, permitiendo a los usuarios crear, configurar y administrar bases de datos PostgreSQL y MySQL en la nube.

## 📋 Características

✅ Creación de instancias de BD en contenedores Docker  
✅ Soporte para PostgreSQL y MySQL  
✅ Gestión automática de credenciales  
✅ Envío de credenciales por correo electrónico  
✅ Límites por plan de suscripción  
✅ Operaciones CRUD completas  
✅ Integración con Docker SDK de Java

## 🏗️ Arquitectura

```
database/
├── controller/           # Endpoints REST
├── dto/                  # DTOs de Request/Response
├── model/               # Entidades específicas del módulo
├── repository/          # Repositorios JPA
└── service/             # Lógica de negocio y Docker SDK
```

### Modelos Principales

- `DatabaseInstance` - Información de la instancia de BD
- `DatabaseEngine` - Motores disponibles (PostgreSQL, MySQL)
- `InstanceStatus` - Estados del ciclo de vida
- `Credential` - Credenciales de acceso generadas

## 🎯 Flujo de Creación de Instancia

```
1. Usuario solicita crear instancia
   POST /api/databases/create
   {
     userId: 1,
     engine: "POSTGRESQL",
     version: "15",
     databaseName: "mydb" (opcional)
   }

2. Backend valida límites del plan
   ├─ FREE: máximo 2 instancias
   ├─ STANDARD: máximo 5 instancias
   └─ PREMIUM: máximo 10 instancias

3. Genera credenciales aleatorias
   ├─ Username: crudzaso_{uuid}
   ├─ Password: {secure_random_32_chars}
   └─ Database Name: {custom o auto-generado}

4. Crea contenedor Docker
   ├─ Imagen: postgres:15 o mysql:8
   ├─ Variables de entorno con credenciales
   ├─ Mapeo de puertos aleatorio
   └─ Configuración de red

5. Guarda en base de datos
   ├─ DatabaseInstance
   ├─ Credential
   └─ Relación con User

6. Envía correo con credenciales
   ├─ Host: api.cold-brew.crudzaso.com
   ├─ Port: {puerto_mapeado}
   ├─ Username: crudzaso_{uuid}
   ├─ Password: {password_generado}
   └─ Database: {nombre_bd}

7. Retorna información al usuario
```

## 📡 API Endpoints

### Gestión de Instancias

#### Crear Instancia de Base de Datos

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

**Respuesta exitosa (201 Created):**

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

**Errores:**
- `400 Bad Request`: Límite de instancias alcanzado para el plan
- `400 Bad Request`: Motor de BD no soportado
- `404 Not Found`: Usuario no encontrado
- `500 Internal Server Error`: Error al crear contenedor Docker

#### Listar Instancias de Usuario

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

#### Obtener Instancia por ID

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

#### Iniciar Instancia

```http
POST /api/databases/{instanceId}/start
Authorization: Bearer {token}
```

Inicia un contenedor Docker detenido.

**Respuesta (200 OK):**

```json
{
  "instanceId": 1,
  "status": "RUNNING",
  "message": "Database instance started successfully"
}
```

#### Detener Instancia

```http
POST /api/databases/{instanceId}/stop
Authorization: Bearer {token}
```

Detiene un contenedor Docker en ejecución.

**Respuesta (200 OK):**

```json
{
  "instanceId": 1,
  "status": "STOPPED",
  "message": "Database instance stopped successfully"
}
```

#### Reiniciar Instancia

```http
POST /api/databases/{instanceId}/restart
Authorization: Bearer {token}
```

Reinicia el contenedor Docker.

**Respuesta (200 OK):**

```json
{
  "instanceId": 1,
  "status": "RUNNING",
  "message": "Database instance restarted successfully"
}
```

#### Eliminar Instancia

```http
DELETE /api/databases/{instanceId}
Authorization: Bearer {token}
```

Elimina el contenedor Docker y los datos asociados.

**Respuesta (200 OK):**

```json
{
  "message": "Database instance deleted successfully",
  "instanceId": 1
}
```

**⚠️ Advertencia:** Esta operación es **irreversible** y eliminará todos los datos de la base de datos.

### Credenciales

#### Obtener Credenciales de Instancia

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

#### Regenerar Contraseña

```http
POST /api/databases/{instanceId}/credentials/regenerate
Authorization: Bearer {token}
```

Genera una nueva contraseña para las credenciales existentes y reinicia el contenedor.

**Respuesta (200 OK):**

```json
{
  "credentialId": 1,
  "newPassword": "NewSecureRandomPassword456!@#ABC",
  "message": "Password regenerated successfully. New credentials sent to email."
}
```

## 🔧 Integración con Docker SDK

### Configuración de Docker Client

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

### Crear Contenedor PostgreSQL

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

### Crear Contenedor MySQL

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

## 📊 Modelos de Datos

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
    CREATING,    // Creando contenedor
    RUNNING,     // Contenedor en ejecución
    STOPPED,     // Contenedor detenido
    ERROR,       // Error en el contenedor
    DELETED      // Contenedor eliminado
}
```

## 📧 Envío de Credenciales por Email

### Plantilla de Email

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
    <h1>¡Tu base de datos está lista! 🎉</h1>
    <p>Hemos creado tu instancia de base de datos en CrudCloud.</p>
    
    <div class="credentials">
        <h3>Credenciales de Acceso</h3>
        <div class="credential-item">
            <span class="label">Motor:</span> PostgreSQL 15
        </div>
        <div class="credential-item">
            <span class="label">Host:</span> api.cold-brew.crudzaso.com
        </div>
        <div class="credential-item">
            <span class="label">Puerto:</span> 5432
        </div>
        <div class="credential-item">
            <span class="label">Usuario:</span> crudzaso_abc123def456
        </div>
        <div class="credential-item">
            <span class="label">Contraseña:</span> SecureRandomPassword123!
        </div>
        <div class="credential-item">
            <span class="label">Base de Datos:</span> myapp_production
        </div>
    </div>
    
    <h3>String de Conexión</h3>
    <code>postgresql://crudzaso_abc123def456:SecureRandomPassword123!@api.cold-brew.crudzaso.com:5432/myapp_production</code>
    
    <p><strong>⚠️ Importante:</strong> Guarda estas credenciales en un lugar seguro.</p>
</body>
</html>
```

## 🔒 Seguridad

### Generación de Credenciales

```java
// Username único
String username = "crudzaso_" + UUID.randomUUID().toString().replace("-", "");

// Password seguro (32 caracteres aleatorios)
String password = RandomStringUtils.randomAlphanumeric(32);
```

### Almacenamiento de Contraseñas

- ⚠️ Las contraseñas se almacenan **cifradas** en la base de datos
- ✅ Se usa **AES-256** para cifrado
- ✅ Clave de cifrado en variable de entorno `DB_ENCRYPTION_KEY`

### Network Isolation

```java
// Contenedores en red privada
.withNetworkMode("crudcloud-network")

// Solo puertos expuestos son accesibles
.withPortBindings(...)
```

## 📝 Límites por Plan

| Plan | Max Instancias | Nombres Personalizados |
|------|---------------|------------------------|
| FREE | 2 | ❌ (Auto-generados) |
| STANDARD | 5 | ✅ |
| PREMIUM | 10 | ✅ |

### Validación de Límites

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

## 🔗 Integración con Otros Módulos

### Con Módulo Auth
- Valida que el usuario esté autenticado
- Verifica límites del plan del usuario
- Obtiene información del plan (`User.personalPlan`)

### Con Módulo de Pagos
- Upgrade de plan permite crear más instancias
- Validación de suscripción activa

### Con Servicio de Email
- Envío de credenciales al crear instancia
- Notificaciones de cambios de estado
- Alertas de reinicio de contraseña

## ⚠️ Manejo de Errores

### Excepciones Personalizadas

- **`PlanLimitExceededException`**: Límite de instancias alcanzado
- **`DatabaseEngineNotSupportedException`**: Motor de BD no soportado
- **`ContainerCreationException`**: Error al crear contenedor Docker
- **`ContainerNotFoundException`**: Contenedor no encontrado
- **`CredentialGenerationException`**: Error al generar credenciales

### Respuesta de Error

```json
{
  "status": 400,
  "message": "You have reached the maximum number of databases for your FREE plan (2/2)",
  "timestamp": "2025-11-19T10:30:00Z",
  "path": "/api/databases/create",
  "suggestion": "Upgrade to STANDARD plan to create up to 5 databases"
}
```

## 🎯 Características Clave

✅ **Creación Automática** de contenedores Docker  
✅ **Gestión de Credenciales** segura y cifrada  
✅ **Envío de Credenciales** por email  
✅ **Soporte Multi-Motor** (PostgreSQL, MySQL)  
✅ **Límites por Plan** de suscripción  
✅ **Operaciones CRUD** completas  
✅ **Network Isolation** con Docker  
✅ **Port Mapping** automático  
✅ **Health Checks** de contenedores

## Próximos Pasos

- [Módulo de Autenticación](./auth.md)
- [Módulo de Pagos (Mercado Pago)](./mercado-pago.md)
- [Módulo Common](./common.md)
- [Arquitectura del Backend](../architecture.md)
