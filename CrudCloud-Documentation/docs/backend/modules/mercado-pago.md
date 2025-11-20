# Módulo de Mercado Pago

El módulo de Mercado Pago implementa la integración con la plataforma de pagos utilizando **Checkout Pro** para procesar pagos y gestionar suscripciones.

## 📋 Características

✅ Checkout Pro de Mercado Pago  
✅ Procesamiento de webhooks  
✅ Gestión automática de suscripciones  
✅ Historial de pagos por usuario  
✅ Estados de pago y suscripción  
✅ Soporte para Sandbox y Producción

## 🏗️ Arquitectura

```
mercadoPago/
├── config/               # Configuración del SDK de MercadoPago
├── controller/           # Endpoints REST
├── dto/                  # DTOs de Request/Response
├── model/               # Entidades específicas del módulo
├── repository/          # Repositorios JPA
└── service/             # Lógica de negocio
```

### Modelos Compartidos (common/models)

- `Payment` - Registro de pagos realizados
- `PaymentStatus` - Estados de un pago
- `Subscription` - Suscripciones de usuarios
- `SubscriptionStatus` - Estados de suscripción

### Modelos del Módulo

- `PaymentPreference` - Preferencias de Checkout Pro creadas

## 🔧 Configuración

### Variables de Entorno

```properties
# Access Token de MercadoPago
mercadopago.access.token=TEST-xxxxx     # Para pruebas
mercadopago.access.token=APP_USR-xxxxx  # Para producción

# Public Key (para frontend)
mercadopago.public.key=TEST-xxxxx       # Para pruebas
mercadopago.public.key=APP_USR-xxxxx    # Para producción

# URLs de redirección
mercadopago.notification.url=https://api.cold-brew.crudzaso.com/api/webhooks/mercadopago
mercadopago.success.url=https://cold-brew.crudzaso.com/payment/success
mercadopago.failure.url=https://cold-brew.crudzaso.com/payment/failure
mercadopago.pending.url=https://cold-brew.crudzaso.com/payment/pending
```

### Obtener Credenciales

1. Ingresa a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Ve a "Tus integraciones" → "Credenciales"
3. Copia el **Access Token** y **Public Key**
4. Para pruebas, usa las credenciales de "Modo Sandbox"

## 🚀 Endpoints

### Pagos

#### Crear Checkout (Preferencia de Pago)

```http
POST /api/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "planId": 2
}
```

**Respuesta exitosa (200 OK):**

```json
{
  "preferenceId": "123456789-abc123-def456",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-abc123-def456",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-abc123-def456",
  "externalReference": "PLAN-2-USER-1-abc123",
  "createdAt": "2025-11-19T10:30:00Z"
}
```

**Uso en Frontend:**
```javascript
// Redirigir al usuario al initPoint
window.location.href = response.initPoint;
```

#### Obtener Pago por ID

```http
GET /api/payments/{paymentId}
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
{
  "paymentId": 1,
  "mercadopagoPaymentId": "123456789",
  "userId": 1,
  "planId": 2,
  "amount": 19.99,
  "currency": "ARS",
  "status": "APPROVED",
  "externalReference": "PLAN-2-USER-1-abc123",
  "paymentMethod": "credit_card",
  "paymentType": "credit_card",
  "createdAt": "2025-11-19T10:30:00Z",
  "approvedAt": "2025-11-19T10:31:00Z"
}
```

#### Obtener Pagos de Usuario

```http
GET /api/payments/user/{userId}
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
[
  {
    "paymentId": 1,
    "mercadopagoPaymentId": "123456789",
    "userId": 1,
    "planId": 2,
    "amount": 19.99,
    "currency": "ARS",
    "status": "APPROVED",
    "externalReference": "PLAN-2-USER-1-abc123",
    "createdAt": "2025-11-19T10:30:00Z"
  }
]
```

#### Obtener Pagos Aprobados de Usuario

```http
GET /api/payments/user/{userId}/approved
Authorization: Bearer {token}
```

Filtra solo pagos con estado `APPROVED`.

### Suscripciones

#### Obtener Suscripción de Usuario

```http
GET /api/subscriptions/user/{userId}
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
{
  "subscriptionId": 1,
  "userId": 1,
  "planId": 2,
  "status": "ACTIVE",
  "startDate": "2025-11-19T10:30:00Z",
  "endDate": "2025-12-19T10:30:00Z",
  "autoRenew": true,
  "createdAt": "2025-11-19T10:30:00Z",
  "updatedAt": "2025-11-19T10:30:00Z"
}
```

#### Obtener Suscripciones Activas de Usuario

```http
GET /api/subscriptions/user/{userId}/active
Authorization: Bearer {token}
```

Filtra solo suscripciones con estado `ACTIVE`.

#### Cancelar Suscripción

```http
POST /api/subscriptions/{subscriptionId}/cancel
Authorization: Bearer {token}
```

**Respuesta (200 OK):**

```json
{
  "subscriptionId": 1,
  "status": "CANCELLED",
  "message": "Subscription cancelled successfully"
}
```

### Webhooks

#### Webhook de Mercado Pago

```http
POST /api/webhooks/mercadopago
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

**Procesamiento:**
1. Recibe notificación de Mercado Pago
2. Obtiene detalles del pago usando el SDK
3. Actualiza estado del pago en BD
4. Si pago aprobado:
   - Crea nueva suscripción
   - O actualiza suscripción existente
   - Actualiza plan del usuario

**Respuesta (200 OK):**

```json
{
  "status": "processed",
  "paymentId": "123456789",
  "message": "Webhook processed successfully"
}
```

## 🔄 Flujo de Pago Completo

### Paso 1: Cliente Solicita Checkout

```
Frontend → POST /api/payments/checkout
{ userId: 1, planId: 2 }
```

### Paso 2: Backend Crea Preferencia

```
Backend:
1. Busca usuario y plan en BD
2. Crea PreferenceRequest con SDK de MercadoPago
   - title: "Plan STANDARD - CrudCloud"
   - quantity: 1
   - unit_price: 19.99
   - external_reference: "PLAN-2-USER-1-abc123"
3. Configura URLs de retorno
4. Guarda PaymentPreference en BD
5. Retorna initPoint al frontend
```

### Paso 3: Usuario Paga en Mercado Pago

```
Frontend:
1. Redirige a initPoint
2. Usuario completa pago en interfaz de MercadoPago
3. MercadoPago procesa el pago
```

### Paso 4: Notificación vía Webhook

```
MercadoPago → POST /api/webhooks/mercadopago
{ type: "payment", data: { id: "123456789" } }

Backend:
1. Recibe notificación
2. Obtiene detalles del pago vía SDK
3. Guarda/actualiza Payment en BD
4. Si status = "approved":
   a. Busca/crea Subscription
   b. Actualiza User.personalPlan
   c. Calcula endDate según billingCycle
```

### Paso 5: Redirección

```
MercadoPago redirige a:
- Success: https://cold-brew.crudzaso.com/payment/success
- Failure: https://cold-brew.crudzaso.com/payment/failure
- Pending: https://cold-brew.crudzaso.com/payment/pending
```

## 📊 Estados de Pago

El módulo mapea los estados de Mercado Pago a estados internos:

| Estado MercadoPago | Estado Interno | Descripción |
|-------------------|----------------|-------------|
| `pending` | `PENDING` | Pago pendiente de procesamiento |
| `approved` | `APPROVED` | Pago aprobado y acreditado |
| `authorized` | `APPROVED` | Pago autorizado |
| `in_process` | `PENDING` | Pago en proceso de revisión |
| `in_mediation` | `IN_MEDIATION` | Pago en mediación |
| `rejected` | `REJECTED` | Pago rechazado |
| `cancelled` | `CANCELLED` | Pago cancelado |
| `refunded` | `REFUNDED` | Pago reembolsado |
| `charged_back` | `CHARGED_BACK` | Contracargo aplicado |

## 📊 Estados de Suscripción

| Estado | Descripción |
|--------|-------------|
| `ACTIVE` | Suscripción activa y vigente |
| `CANCELLED` | Suscripción cancelada por el usuario |
| `EXPIRED` | Suscripción vencida (endDate superado) |
| `PENDING` | Suscripción pendiente de activación |

## 🧪 Testing

### Tarjetas de Prueba (Sandbox)

#### Tarjeta Aprobada

```
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: Cualquier fecha futura
Nombre: TEST USER
```

#### Tarjeta Rechazada

```
Número: 5031 4332 1540 6351
CVV: 123
Vencimiento: Cualquier fecha futura
```

Más tarjetas de prueba en: [MercadoPago Test Cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

### Usando ngrok para Webhooks Locales

```bash
# Iniciar ngrok
ngrok http 8080

# Copiar URL pública generada
# https://abc123.ngrok.io

# Actualizar application.properties
mercadopago.notification.url=https://abc123.ngrok.io/api/webhooks/mercadopago
```

## 🔐 Seguridad

- ✅ **Access Token nunca expuesto** en frontend (solo Public Key)
- ✅ **Credenciales en variables de entorno**
- ✅ **External Reference único** por transacción
- ⚠️ **Validación de webhooks recomendada** (verificar firma de MercadoPago)
- ✅ **HTTPS requerido** para webhooks en producción

## 📝 Notas Importantes

### External Reference

Formato automático: `PLAN-{planId}-USER-{userId}-{uuid}`

```java
String externalReference = String.format(
    "PLAN-%d-USER-%d-%s",
    planId,
    userId,
    UUID.randomUUID().toString().substring(0, 8)
);
```

### Billing Cycle

Las suscripciones calculan `endDate` basado en el campo `billingCycle` del Plan:

- `monthly` → endDate = startDate + 1 mes
- `yearly` → endDate = startDate + 1 año

### Webhooks Públicos

Los webhooks **deben ser accesibles públicamente**:
- ✅ Producción: `https://api.cold-brew.crudzaso.com/api/webhooks/mercadopago`
- ✅ Desarrollo: Usar ngrok para crear túnel público

### Gestión Automática de Suscripciones

Cuando un pago es aprobado:
1. Si el usuario **no tiene suscripción** → Se crea nueva
2. Si el usuario **ya tiene suscripción** → Se actualiza con nuevo plan y fechas
3. El campo `User.personalPlan` se actualiza automáticamente

## 🔗 Integración con Otros Módulos

### Con Módulo Auth
- Obtiene información de `User` para procesar pagos
- Actualiza `User.personalPlan` al aprobar pago
- Usa `Plan` para obtener precio y características

### Con Frontend
- Frontend redirige a `initPoint` para completar pago
- Recibe notificaciones de éxito/fallo vía URLs de retorno
- Consulta estado de suscripción para mostrar información al usuario

## 🎯 Funcionalidades Implementadas

✅ **Checkout Pro**: Crear preferencias de pago  
✅ **Procesamiento de Pagos**: Webhooks automáticos  
✅ **Gestión de Suscripciones**: Creación, actualización y cancelación  
✅ **Historial de Pagos**: Consulta por usuario  
✅ **Estados Mapeados**: Conversión de estados de MercadoPago  
✅ **Cálculo de Fechas**: Automático basado en billing cycle  
✅ **Soporte Sandbox**: Pruebas con tarjetas de test

## 📚 Referencias

- [Documentación Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [SDK Java MercadoPago](https://github.com/mercadopago/sdk-java)
- [Webhooks MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks)
- [Tarjetas de Prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

## Próximos Pasos

- [Módulo de Autenticación](./auth.md)
- [Módulo de Base de Datos](./database.md)
- [Arquitectura del Backend](../architecture.md)
- [Deployment](../deployment.md)
