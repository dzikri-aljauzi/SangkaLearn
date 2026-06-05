# Payment Integration

LeadNEX uses **Midtrans** as the payment gateway. Midtrans is an Indonesian payment gateway that supports QRIS, GoPay, bank transfer (VA), and e-wallets.

---

## Environment Variables

Add these to your `.env`:

```env
MIDTRANS_SERVER_KEY=<your-server-key>
MIDTRANS_CLIENT_KEY=<your-client-key>
MIDTRANS_MERCHANT_ID=<your-merchant-id>
MIDTRANS_ENVIRONMENT=sandbox          # or production
MIDTRANS_IS_PRODUCTION=false          # true for live
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
MIDTRANS_SSL_VERIFY_PEER=false        # set true in production with proper certs
MIDTRANS_SSL_VERIFY_HOST=false        # set true in production
```

Get credentials from [dashboard.midtrans.com](https://dashboard.midtrans.com) (Sandbox → Settings → Access Keys).

---

## Supported Payment Methods

| Method | Route | Notes |
|---|---|---|
| Snap (all methods) | `POST /payments` | Opens Midtrans Snap popup; user picks method |
| GoPay / QRIS | `POST /payment/gopay/create` | Returns QR code URL |
| Static QRIS | `POST /payment/static-qris/create` | Fixed QR for manual transfer |
| Static QRIS confirm | `POST /payment/static-qris/confirm` | Admin confirms receipt |
| QRIS (dynamic) | `POST /payment/qris/create` | Dynamic per-transaction QR |
| DANA | `POST /payment/dana/create` | DANA e-wallet |
| ShopeePay | `POST /payment/shopeepay/create` | ShopeePay e-wallet |

All payment routes require `auth` + `verified` middleware.

---

## Payment Flow

### Standard Snap flow
1. Student adds course to cart and goes to checkout
2. Frontend POSTs to `POST /payments` with cart + payment method
3. `PaymentController::process()` → `MidtransService::createTransaction()` creates an Order + Payment record and calls Midtrans Snap API
4. Midtrans returns a `snap_token`
5. Frontend renders Midtrans Snap popup using the token
6. On completion, Midtrans sends a webhook to `POST /payment/notification`

### QRIS / GoPay flow
1. Student picks GoPay or QRIS at checkout
2. Frontend POSTs to the specific `/payment/gopay/create` or `/payment/qris/create` endpoint
3. `MidtransService::createQRISTransaction()` calls Snap API with `enabled_payments: ['gopay']`
4. Response contains a QR code image URL displayed to the student
5. Student scans QR with GoPay/QRIS-compatible app
6. Midtrans sends webhook on completion

---

## Webhook (Payment Notification)

Midtrans calls your server when a payment status changes.

**Route:** `POST /payment/notification` (no auth, must be publicly accessible)

**Handler:** `PaymentController::handleNotification()` → `MidtransService::handleNotification()`

**What it does:**
1. Validates the incoming notification against order records
2. Maps Midtrans `transaction_status` to internal order statuses:
   - `settlement` / `capture` → order marked `paid`, enrollments created
   - `pending` → order stays `pending`
   - `deny` / `cancel` / `expire` → order marked `cancelled` / `failed`
3. On successful payment: creates `Enrollment` records for all ordered courses, sends `PaymentSuccessful` email notification to the student

**Important:** Add `/payment/notification` to your Midtrans dashboard notification URL settings. The URL must be publicly reachable (not localhost).

---

## Configuration File

Midtrans config lives in `config/midtrans.php`. Values are read from `.env` via this file — do not hardcode keys in the service class.

---

## Key Service Methods

All payment logic lives in `app/Services/MidtransService.php`:

| Method | Purpose |
|---|---|
| `createTransaction(Order, $method)` | Creates a Snap transaction for standard checkout |
| `createQRISTransaction(...)` | Creates a GoPay QRIS transaction |
| `createStaticQRIS(...)` | Creates a static QRIS payment |
| `handleNotification($data)` | Processes Midtrans webhook payload |
| `processSuccessfulPayment(Order, Payment)` | Creates enrollments and sends notifications after payment |
| `getTransactionStatus($orderId)` | Queries current status from Midtrans |
| `cancelTransaction($orderId)` | Cancels a pending transaction |

---

## Testing Payments (Sandbox)

Use the Midtrans sandbox environment:
- Set `MIDTRANS_IS_PRODUCTION=false`
- Use sandbox credentials from the Midtrans dashboard
- Test card numbers and QRIS flows are documented at [developers.midtrans.com](https://developers.midtrans.com/en/docs/sandbox-overview)
- For webhook testing, expose your local server with a tunneling tool (e.g. `scripts/start_ngrok.bat` for Windows, or `ngrok http 8000` on any platform)
