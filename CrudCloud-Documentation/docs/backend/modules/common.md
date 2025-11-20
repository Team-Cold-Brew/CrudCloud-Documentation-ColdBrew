# Módulo Common

El módulo Common contiene utilidades compartidas, modelos de dominio, excepciones personalizadas y configuraciones comunes utilizadas por todos los demás módulos del sistema.

## 📋 Características

✅ Modelos de dominio compartidos  
✅ Excepciones personalizadas  
✅ DTOs base y utilidades  
✅ Validadores personalizados  
✅ Constantes del sistema  
✅ Configuraciones globales

## 🏗️ Estructura

```
common/
├── config/              # Configuraciones globales
│   ├── CorsConfig.java
│   ├── JacksonConfig.java
│   └── ValidationConfig.java
├── dto/                 # DTOs base
│   ├── ApiResponse.java
│   ├── ErrorResponse.java
│   └── PageResponse.java
├── exception/           # Excepciones personalizadas
│   ├── DuplicateResourceException.java
│   ├── InvalidCredentialsException.java
│   ├── PlanLimitExceededException.java
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
├── models/              # Modelos de dominio
│   ├── User.java
│   ├── Plan.java
│   ├── Payment.java
│   ├── PaymentStatus.java
│   ├── Subscription.java
│   ├── SubscriptionStatus.java
│   ├── DatabaseInstance.java
│   └── Credential.java
├── util/                # Utilidades
│   ├── DateUtil.java
│   ├── StringUtil.java
│   └── ValidationUtil.java
└── constants/           # Constantes del sistema
    ├── ApiConstants.java
    └── AppConstants.java
```

## 📊 Modelos de Dominio

### User

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
    private List<DatabaseInstance> databases;
    
    @OneToMany(mappedBy = "user")
    private List<Payment> payments;
    
    @OneToMany(mappedBy = "user")
    private List<Subscription> subscriptions;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Plan

```java
@Entity
@Table(name = "plan")
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer planId;
    
    @Column(unique = true, nullable = false)
    private String name; // FREE, STANDARD, PREMIUM
    
    private String description;
    
    @Column(nullable = false)
    private Integer maxDatabases;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String billingCycle; // monthly, yearly
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Payment

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;
    
    private String mercadopagoPaymentId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private Plan plan;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    private String currency;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    private String externalReference;
    private String paymentMethod;
    private String paymentType;
    
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
}
```

### PaymentStatus

```java
public enum PaymentStatus {
    PENDING,        // Pago pendiente
    APPROVED,       // Pago aprobado
    AUTHORIZED,     // Pago autorizado
    IN_PROCESS,     // En proceso
    IN_MEDIATION,   // En mediación
    REJECTED,       // Rechazado
    CANCELLED,      // Cancelado
    REFUNDED,       // Reembolsado
    CHARGED_BACK    // Contracargo
}
```

### Subscription

```java
@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subscriptionId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private Plan plan;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    private Boolean autoRenew;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### SubscriptionStatus

```java
public enum SubscriptionStatus {
    ACTIVE,     // Suscripción activa
    CANCELLED,  // Cancelada por usuario
    EXPIRED,    // Vencida
    PENDING     // Pendiente de activación
}
```

### DatabaseInstance

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
    private DatabaseEngine engine;
    
    private String version;
    private String databaseName;
    
    @Enumerated(EnumType.STRING)
    private InstanceStatus status;
    
    private String containerName;
    private String containerId;
    private String host;
    private Integer port;
    
    @OneToOne(mappedBy = "instance")
    private Credential credential;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Credential

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
    private String password; // Cifrado con AES-256
    
    @Column(nullable = false)
    private String database;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## ⚠️ Excepciones Personalizadas

### Jerarquía de Excepciones

```
RuntimeException
│
├─ BusinessException (abstract)
│  ├─ DuplicateResourceException
│  ├─ InvalidCredentialsException
│  ├─ PlanLimitExceededException
│  ├─ ResourceNotFoundException
│  ├─ OAuthProcessingException
│  ├─ ContainerCreationException
│  └─ PaymentProcessingException
│
└─ TechnicalException (abstract)
   ├─ DatabaseConnectionException
   ├─ EmailSendingException
   └─ ExternalApiException
```

### DuplicateResourceException

```java
public class DuplicateResourceException extends BusinessException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

// Uso
throw new DuplicateResourceException("Email already registered");
```

### InvalidCredentialsException

```java
public class InvalidCredentialsException extends BusinessException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

// Uso
throw new InvalidCredentialsException("Invalid email or password");
```

### ResourceNotFoundException

```java
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: %s", resource, field, value));
    }
}

// Uso
throw new ResourceNotFoundException("User", "id", userId);
```

### PlanLimitExceededException

```java
public class PlanLimitExceededException extends BusinessException {
    private final String planName;
    private final int currentUsage;
    private final int maxLimit;
    
    public PlanLimitExceededException(String planName, int currentUsage, int maxLimit) {
        super(String.format(
            "Plan limit exceeded for %s: %d/%d", 
            planName, currentUsage, maxLimit
        ));
        this.planName = planName;
        this.currentUsage = currentUsage;
        this.maxLimit = maxLimit;
    }
}
```

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(
        DuplicateResourceException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            LocalDateTime.now(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(PlanLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handlePlanLimit(
        PlanLimitExceededException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            LocalDateTime.now(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }
    
    // Manejo genérico de excepciones
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(
        Exception ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            LocalDateTime.now(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## 📦 DTOs Base

### ApiResponse

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, LocalDateTime.now());
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }
}
```

### ErrorResponse

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private Map<String, String> validationErrors;
    
    public ErrorResponse(int status, String message, LocalDateTime timestamp, String path) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
    }
}
```

### PageResponse

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
    
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}
```

## 🔧 Utilidades

### DateUtil

```java
public class DateUtil {
    public static LocalDateTime addMonths(LocalDateTime date, int months) {
        return date.plusMonths(months);
    }
    
    public static LocalDateTime addYears(LocalDateTime date, int years) {
        return date.plusYears(years);
    }
    
    public static boolean isExpired(LocalDateTime endDate) {
        return endDate.isBefore(LocalDateTime.now());
    }
    
    public static long daysBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.DAYS.between(start, end);
    }
}
```

### StringUtil

```java
public class StringUtil {
    public static String generateRandomString(int length) {
        return RandomStringUtils.randomAlphanumeric(length);
    }
    
    public static String generateSecurePassword() {
        return RandomStringUtils.randomAlphanumeric(32);
    }
    
    public static String generateUsername() {
        return "crudzaso_" + UUID.randomUUID().toString().replace("-", "");
    }
    
    public static boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
```

### ValidationUtil

```java
public class ValidationUtil {
    public static void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }
    
    public static void validatePositive(Integer value, String fieldName) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }
    
    public static void validateEmail(String email) {
        if (!StringUtil.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
}
```

## 🔒 Configuraciones Globales

### CorsConfig

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "https://cold-brew.crudzaso.com",
                        "http://localhost:3000"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

### JacksonConfig

```java
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Configurar formato de fechas
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Ignorar propiedades desconocidas
        mapper.configure(
            DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, 
            false
        );
        
        // Formato de nombres en snake_case
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        
        return mapper;
    }
}
```

### ValidationConfig

```java
@Configuration
public class ValidationConfig {
    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }
    
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        return new MethodValidationPostProcessor();
    }
}
```

## 📌 Constantes del Sistema

### ApiConstants

```java
public class ApiConstants {
    public static final String API_VERSION = "v1";
    public static final String API_BASE_PATH = "/api/" + API_VERSION;
    
    // Endpoints
    public static final String AUTH_PATH = API_BASE_PATH + "/auth";
    public static final String OAUTH_PATH = API_BASE_PATH + "/oauth";
    public static final String PLANS_PATH = API_BASE_PATH + "/plans";
    public static final String DATABASES_PATH = API_BASE_PATH + "/databases";
    public static final String PAYMENTS_PATH = API_BASE_PATH + "/payments";
    public static final String SUBSCRIPTIONS_PATH = API_BASE_PATH + "/subscriptions";
    public static final String WEBHOOKS_PATH = API_BASE_PATH + "/webhooks";
    
    // Headers
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
}
```

### AppConstants

```java
public class AppConstants {
    // Database
    public static final String DEFAULT_DATABASE_HOST = "api.cold-brew.crudzaso.com";
    public static final String DOCKER_NETWORK = "crudcloud-network";
    
    // Email
    public static final String FROM_EMAIL = "noreply@crudzaso.com";
    public static final String SUPPORT_EMAIL = "support@crudzaso.com";
    
    // Plans
    public static final String FREE_PLAN = "FREE";
    public static final String STANDARD_PLAN = "STANDARD";
    public static final String PREMIUM_PLAN = "PREMIUM";
    
    public static final int FREE_MAX_DATABASES = 2;
    public static final int STANDARD_MAX_DATABASES = 5;
    public static final int PREMIUM_MAX_DATABASES = 10;
    
    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;
    
    // Security
    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final int PASSWORD_MAX_LENGTH = 100;
    public static final int USERNAME_MIN_LENGTH = 3;
    public static final int USERNAME_MAX_LENGTH = 50;
}
```

## 🔗 Uso en Otros Módulos

### Módulo Auth

```java
// Usar excepciones personalizadas
if (userRepository.existsByEmail(email)) {
    throw new DuplicateResourceException("Email already registered");
}

// Usar utilidades
String securePassword = StringUtil.generateSecurePassword();

// Usar constantes
if (currentInstances >= AppConstants.FREE_MAX_DATABASES) {
    throw new PlanLimitExceededException(
        AppConstants.FREE_PLAN, 
        currentInstances, 
        AppConstants.FREE_MAX_DATABASES
    );
}
```

### Módulo Database

```java
// Usar modelos compartidos
User user = userRepository.findById(userId)
    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

// Usar utilidades
String username = StringUtil.generateUsername();
String password = StringUtil.generateSecurePassword();

// Usar constantes
String host = AppConstants.DEFAULT_DATABASE_HOST;
String network = AppConstants.DOCKER_NETWORK;
```

### Módulo Payments

```java
// Usar enums compartidos
payment.setStatus(PaymentStatus.APPROVED);
subscription.setStatus(SubscriptionStatus.ACTIVE);

// Usar utilidades de fecha
LocalDateTime endDate = DateUtil.addMonths(startDate, 1);

// Usar DTOs base
return ApiResponse.success("Payment processed", paymentResponse);
```

## ✅ Características Clave

✅ **Modelos Compartidos** entre todos los módulos  
✅ **Excepciones Personalizadas** con manejo centralizado  
✅ **DTOs Base** para respuestas consistentes  
✅ **Utilidades Reutilizables** para operaciones comunes  
✅ **Constantes Centralizadas** para configuración  
✅ **Validaciones Consistentes** en toda la aplicación  
✅ **Configuraciones Globales** de CORS, Jackson, etc.

## Próximos Pasos

- [Módulo de Autenticación](./auth.md)
- [Módulo de Base de Datos](./database.md)
- [Módulo de Pagos (Mercado Pago)](./mercado-pago.md)
- [Arquitectura del Backend](../architecture.md)
