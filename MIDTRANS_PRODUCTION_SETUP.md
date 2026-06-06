# 🚀 MIDTRANS PRODUCTION SETUP dengan NGROK

## 📋 OVERVIEW
Guide ini menjelaskan cara setup Midtrans Production mode menggunakan ngrok untuk webhook handling sebelum aplikasi di-hosting.

## 🔧 PREREQUISITES
- Laravel server running di port 8000
- Akun Midtrans Production
- Koneksi internet stabil

## 📥 STEP 1: INSTALL NGROK

### Windows:
```bash
# Run setup script
setup_ngrok.bat
```

### Manual Installation:
1. Download ngrok dari: https://ngrok.com/download
2. Extract ke project folder
3. Sign up di: https://dashboard.ngrok.com/signup
4. Get auth token: https://dashboard.ngrok.com/get-started/your-authtoken

### Setup Auth Token:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## 🌐 STEP 2: START NGROK TUNNEL

```bash
# Use provided script
start_ngrok.bat

# Or manual:
ngrok http 8000
```

**Output example:**
```
ngrok                                                              
                                                               
Session Status                online                           
Account                       your-email@example.com          
Version                       3.x.x                           
Region                        Asia Pacific (ap)               
Latency                       45ms                            
Web Interface                 http://127.0.0.1:4040          
Forwarding                    https://abcd1234.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**⚠️ IMPORTANT:** Copy the HTTPS URL (e.g., `https://abcd1234.ngrok.io`)

## ⚙️ STEP 3: UPDATE ENVIRONMENT

Update `.env`:
```env
NGROK_URL=https://abcd1234.ngrok.io
```

Clear cache:
```bash
php artisan config:clear
```

## 🔗 STEP 4: CONFIGURE MIDTRANS WEBHOOK

### Login to Midtrans Dashboard:
1. Go to: https://dashboard.midtrans.com/
2. Login dengan akun Production
3. Navigate to: **Settings → Configuration**

### Set Notification URL:
```
Production Payment Notification URL:
https://abcd1234.ngrok.io/midtrans/notification

Production Finish Redirect URL:  
https://abcd1234.ngrok.io/payment/finish

Production Unfinish Redirect URL:
https://abcd1234.ngrok.io/payment/unfinish

Production Error Redirect URL:
https://abcd1234.ngrok.io/payment/error
```

### Enable HTTP Notifications:
- ✅ Payment Notification
- ✅ Recurring Notification  
- ✅ Pay Account Notification

## 🧪 STEP 5: TESTING

### Test Flow:
1. **Access Application:** `http://127.0.0.1:8000`
2. **Login:** `student.test@example.com / password`
3. **Add to Cart → Checkout**
4. **Fill payment details**
5. **Click "Bayar Sekarang"**

### Real Payment Testing:
⚠️ **WARNING:** Production mode menggunakan uang sungguhan!

**Test dengan nominal kecil:**
- Gunakan kartu kredit/debit pribadi
- Test dengan nominal Rp 1.000 - Rp 10.000
- Verifikasi SMS/email konfirmasi

### Expected Flow:
```
Checkout → Midtrans Production → Real Payment → 
Webhook → Success/Failure Page → Enrollment
```

## 🔍 MONITORING & DEBUGGING

### Ngrok Dashboard:
- URL: `http://127.0.0.1:4040`
- Monitor webhook requests
- Check request/response logs

### Laravel Logs:
```bash
tail -f storage/logs/laravel.log
```

### Midtrans Dashboard:
- Transaction history
- Payment status
- Webhook logs

## ⚡ QUICK COMMANDS

### Start All Services:
```bash
# Terminal 1: Laravel
php artisan serve --port=8000

# Terminal 2: Vite  
npm run dev

# Terminal 3: Ngrok
start_ngrok.bat
```

### Troubleshooting:
```bash
# Clear cache
php artisan config:clear
php artisan cache:clear

# Check routes
php artisan route:list --name=midtrans

# Test webhook
curl -X POST https://your-ngrok-url.ngrok.io/midtrans/notification \
  -H "Content-Type: application/json" \
  -d '{"order_id":"TEST"}'
```

## 🚨 IMPORTANT NOTES

### Security:
- ✅ HTTPS required untuk production
- ✅ Webhook signature validation enabled
- ✅ Environment variables secured

### Ngrok Limitations:
- Free plan: 1 tunnel, expires every 8 hours
- URL changes setiap restart (update webhook URL)
- Paid plan: persistent URLs

### Production Checklist:
- [ ] Real Midtrans production credentials
- [ ] Valid business documents submitted to Midtrans
- [ ] Payment methods activated
- [ ] Webhook URLs configured
- [ ] SSL certificate (handled by ngrok)
- [ ] Error handling & logging implemented

## 🎯 SUCCESS INDICATORS

✅ **Ngrok tunnel active**
✅ **Midtrans webhook configured** 
✅ **Real payment processed**
✅ **User enrolled automatically**
✅ **No SSL/CURL errors**

## 📞 SUPPORT

Jika ada masalah:
1. Check ngrok dashboard: `http://127.0.0.1:4040`
2. Check Laravel logs
3. Check Midtrans transaction dashboard
4. Verify webhook URL masih active

---

**⚠️ REMEMBER:** Production = Real Money! Test carefully!