# ⚡ QUICK MIDTRANS PRODUCTION SETUP

## 🚨 **IMPORTANT: PRODUCTION = REAL MONEY!**

## 🚀 **QUICK SETUP (5 Minutes)**

### **1. Install Ngrok**
```bash
# Double click to run
setup_ngrok.bat
```
- Sign up: https://dashboard.ngrok.com/signup
- Get auth token: https://dashboard.ngrok.com/get-started/your-authtoken
- Run: `ngrok config add-authtoken YOUR_TOKEN`

### **2. Start Ngrok**
```bash
# Double click to run
start_ngrok.bat
```
**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### **3. Update Environment**
Edit `.env`:
```env
NGROK_URL=https://abc123.ngrok.io
```

Run:
```bash
php artisan config:clear
```

### **4. Configure Midtrans Dashboard**
1. Login: https://dashboard.midtrans.com/
2. Go to: **Settings → Configuration**
3. Set **Payment Notification URL:**
   ```
   https://abc123.ngrok.io/midtrans/notification
   ```

### **5. Test Payment**
1. Access: `http://127.0.0.1:8000`
2. Login: `student.test@example.com / password`
3. Add course → Checkout
4. **Use REAL card with small amount (Rp 1.000 - Rp 10.000)**

## 🔍 **MONITORING**
- **Ngrok Dashboard:** http://127.0.0.1:4040
- **Midtrans Dashboard:** https://dashboard.midtrans.com/

## ⚠️ **WARNINGS**
- 🚨 **Real money transactions**
- 🚨 **Keep ngrok running**
- 🚨 **Update webhook if ngrok restarts**
- 🚨 **Test with small amounts first**

## ✅ **SUCCESS INDICATORS**
- Ngrok tunnel active
- Webhook notifications received
- Real payment processed
- User enrolled automatically

---
**Ready to test with real payments!** 🎉