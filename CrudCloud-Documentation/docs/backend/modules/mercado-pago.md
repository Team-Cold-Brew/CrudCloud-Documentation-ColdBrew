# Mercado Pago Module

The Mercado Pago module implements integration with the payment platform using **Checkout Pro** to process payments and manage subscriptions.

## 📋 Features

✅ Mercado Pago Checkout Pro  
✅ Webhook processing  
✅ Automatic subscription management  
✅ Payment history per user  
✅ Payment and subscription states  
✅ Support for Sandbox and Production

## 🏗️ Architecture

```
mercadoPago/
├── config/               # MercadoPago SDK Configuration
├── controller/           # REST endpoints
├── dto/                  # Request/Response DTOs
├── model/               # Module-specific entities
├── repository/          # JPA repositories
└── service/             # Business logic
```

### Shared Models (common/models)

- `Payment` - Record of payments made
- `PaymentStatus` - States of a payment
- `Subscription` - User subscriptions
- `SubscriptionStatus` - Subscription states

### Module Models

- `PaymentPreference` - Checkout Pro preferences created

## 🔧 Configuration

### Environment Variables

```properties
# Access Token from MercadoPago
mercadopago.access.token=TEST-xxxxx     # For testing
mercadopago.access.token=APP_USR-xxxxx  # For production

# Public Key (for frontend)
mercadopago.public.key=TEST-xxxxx       # For testing
mercadopago.public.key=APP_USR-xxxxx    # For production

# Redirect URLs
mercadopago.notification.url=https://api.cold-brew.crudzaso.com/api/webhooks/mercadopago
mercadopago.success.url=https://cold-brew.crudzaso.com/payment/success
mercadopago.failure.url=https://cold-brew.crudzaso.com/payment/failure
mercadopago.pending.url=https://cold-brew.crudzaso.com/payment/pending
```

### Get Credentials

1. Go to [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Go to "Your integrations" → "Credentials"
3. Copy the **Access Token** and **Public Key**
4. For testing, use the "Sandbox Mode" credentials

## 🚀 Endpoints

### Payments

#### Create Checkout (Payment Preference)

```http
POST /api/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "planId": 2
}
```

**Successful response (200 OK):**

```json
{
  "preferenceId": "123456789-abc123-def456",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-abc123-def456",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-abc123-def456",
  "externalReference": "PLAN-2-USER-1-abc123",
  "createdAt": "2025-11-19T10:30:00Z"
}
```

**Frontend Usage:**
```javascript
// Redirect user to initPoint
window.location.href = response.initPoint;
```

#### Get Payment by ID

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

#### Get User Payments

```http
GET /api/payments/user/{userId}
Authorization: Bearer <token>
```

**Response (200 OK):**

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

#### Get User Approved Payments

```http
GET /api/payments/user/{userId}/approved
Authorization: Bearer <token>
```

Filters only payments with `APPROVED` status.

### Subscriptions

#### Get User Subscription

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

#### Get User Active Subscriptions

```http
GET /api/subscriptions/user/{userId}/active
Authorization: Bearer <token>
```

Filters only subscriptions with `ACTIVE` status.

#### Cancel Subscription

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

#### Mercado Pago Webhook

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

**Processing:**
1. Receives notification from Mercado Pago
2. Obtains payment details using SDK
3. Updates payment status in DB
4. If payment approved:
   - Creates new subscription
   - Or updates existing subscription
   - Updates user plan

**Respuesta (200 OK):**

```json
{
  "status": "processed",
  "paymentId": "123456789",
  "message": "Webhook processed successfully"
}
```

## 🔄 Complete Payment Flow

### Step 1: Client Requests Checkout

```
Frontend → POST /api/payments/checkout
{ userId: 1, planId: 2 }
```

### Step 2: Backend Creates Preference

```
Backend:
1. Searches for user and plan in DB
2. Creates PreferenceRequest with MercadoPago SDK
   - title: "Plan STANDARD - CrudCloud"
   - quantity: 1
   - unit_price: 19.99
   - external_reference: "PLAN-2-USER-1-abc123"
3. Configures return URLs
4. Saves PaymentPreference in DB
5. Returns initPoint to frontend
```

### Step 3: User Pays on Mercado Pago

```
Frontend:
1. Redirects to initPoint
2. User completes payment on MercadoPago interface
3. MercadoPago processes the payment
```

### Step 4: Notification via Webhook

```
MercadoPago → POST /api/webhooks/mercadopago
{ type: "payment", data: { id: "123456789" } }

Backend:
1. Receives notification
2. Obtains payment details via SDK
3. Saves/updates Payment in DB
4. If status = "approved":
   a. Searches/creates Subscription
   b. Updates User.personalPlan
   c. Calculates endDate based on billingCycle
```

### Step 5: Redirection

```
MercadoPago redirects to:
- Success: https://cold-brew.crudzaso.com/payment/success
- Failure: https://cold-brew.crudzaso.com/payment/failure
- Pending: https://cold-brew.crudzaso.com/payment/pending
```

## 📊 Payment States

The module maps MercadoPago states to internal states:

| MercadoPago State | Internal State | Description |
|-------------------|----------------|-------------|
| `pending` | `PENDING` | Pending payment |
| `approved` | `APPROVED` | Payment approved and credited |
| `authorized` | `APPROVED` | Payment authorized |
| `in_process` | `PENDING` | Payment under review |
| `in_mediation` | `IN_MEDIATION` | Payment in mediation |
| `rejected` | `REJECTED` | Payment rejected |
| `cancelled` | `CANCELLED` | Payment cancelled |
| `refunded` | `REFUNDED` | Payment refunded |
| `charged_back` | `CHARGED_BACK` | Chargeback applied |

## 📊 Subscription States

| State | Description |
|--------|-------------|
| `ACTIVE` | Active and current subscription |
| `CANCELLED` | Subscription cancelled by user |
| `EXPIRED` | Subscription expired (endDate exceeded) |
| `PENDING` | Subscription pending activation |

## 🧪 Testing

### Test Cards (Sandbox)

#### Approved Card

```
Number: 5031 7557 3453 0604
CVV: 123
Expiration: Any future date
Name: TEST USER
```

#### Rejected Card

```
Number: 5031 4332 1540 6351
CVV: 123
Expiration: Any future date
```

More test cards at: [MercadoPago Test Cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

### Using ngrok for Local Webhooks

```bash
# Start ngrok
ngrok http 8080

# Copy generated public URL
# https://abc123.ngrok.io

# Update application.properties
mercadopago.notification.url=https://abc123.ngrok.io/api/webhooks/mercadopago
```

## 🔐 Security

- ✅ **Access Token never exposed** in frontend (only Public Key)
- ✅ **Credentials in environment variables**
- ✅ **Unique External Reference** per transaction
- ⚠️ **Webhook validation recommended** (verify MercadoPago signature)
- ✅ **HTTPS required** for webhooks in production

## 📝 Important Notes

### External Reference

Automatic format: `PLAN-{planId}-USER-{userId}-{uuid}`

```java
String externalReference = String.format(
    "PLAN-%d-USER-%d-%s",
    planId,
    userId,
    UUID.randomUUID().toString().substring(0, 8)
);
```

### Billing Cycle

Subscriptions calculate `endDate` based on Plan's `billingCycle` field:

- `monthly` → endDate = startDate + 1 month
- `yearly` → endDate = startDate + 1 year

### Public Webhooks

Webhooks **must be publicly accessible**:
- ✅ Production: `https://api.cold-brew.crudzaso.com/api/webhooks/mercadopago`
- ✅ Development: Use ngrok to create public tunnel

### Automatic Subscription Management

When a payment is approved:
1. If user **has no subscription** → Create new one
2. If user **already has subscription** → Update with new plan and dates
3. The `User.personalPlan` field is automatically updated

## 🔗 Integration with Other Modules

### With Auth Module
- Obtains `User` information to process payments
- Updates `User.personalPlan` when approving payment
- Uses `Plan` to get price and features

### With Frontend
- Frontend redirects to `initPoint` to complete payment
- Receives success/failure notifications via return URLs
- Queries subscription status to show information to user

## 🎯 Implemented Features

✅ **Checkout Pro**: Create payment preferences  
✅ **Payment Processing**: Automatic webhooks  
✅ **Subscription Management**: Creation, update and cancellation  
✅ **Payment History**: Query by user  
✅ **Mapped States**: Conversion of MercadoPago states  
✅ **Date Calculation**: Automatic based on billing cycle  
✅ **Sandbox Support**: Testing with test cards

## 📚 References

- [Checkout Pro Documentation](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [MercadoPago Java SDK](https://github.com/mercadopago/sdk-java)
- [MercadoPago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks)
- [Test Cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

## Next Steps

- [Authentication Module](./auth.md)
- [Database Module](./database.md)
- [Backend Architecture](../architecture.md)
- [Deployment](../deployment.md)
