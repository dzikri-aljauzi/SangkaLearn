# 🚀 CARA SETUP NGROK UNTUK AKSES PUBLIC (Step by Step)

## 🎯 **TUJUAN:**
Membuat Laravel app (localhost:8000) bisa diakses dari internet untuk webhook Midtrans

## 📋 **LANGKAH-LANGKAH:**

### **Step 1: Setup Ngrok Account**
1. **Buka:** https://ngrok.com/
2. **Sign Up** dengan email Anda
3. **Login** ke dashboard
4. **Copy Auth Token** dari: https://dashboard.ngrok.com/get-started/your-authtoken

### **Step 2: Install Ngrok (Manual)**
Jika automated download tidak work:

1. **Download ngrok:**
   - Go to: https://ngrok.com/download
   - Download untuk Windows
   - Extract ke folder project ini

2. **Setup Auth Token:**
   ```cmd
   # Buka Command Prompt di folder project
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

### **Step 3: Start Ngrok Tunnel**

**Buka Command Prompt BARU** di folder project, jalankan:
```cmd
ngrok http 8000
```

**Output yang diharapkan:**
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

### **Step 4: Copy Public URL**
**PENTING:** Copy URL yang berupa `https://abcd1234.ngrok.io`

### **Step 5: Update .env File**
Edit file `.env`:
```env
NGROK_URL=https://abcd1234.ngrok.io
```

### **Step 6: Clear Cache**
```cmd
php artisan config:clear
```

### **Step 7: Test Public Access**
1. Buka browser baru
2. Akses: `https://abcd1234.ngrok.io`
3. Harus bisa lihat halaman Laravel sama seperti `http://127.0.0.1:8000`

## ✅ **CARA VERIFIKASI BERHASIL:**

### **Test 1: Public URL Accessible**
```
✅ https://your-ngrok-url.ngrok.io → Shows Laravel homepage
✅ https://your-ngrok-url.ngrok.io/login → Shows login page  
✅ https://your-ngrok-url.ngrok.io/midtrans/notification → Shows 405 Method Not Allowed (normal)
```

### **Test 2: Ngrok Dashboard**
- Buka: http://127.0.0.1:4040
- Lihat incoming requests
- Monitor traffic real-time

### **Test 3: Laravel Accessible**
- Laravel server tetap berjalan: `http://127.0.0.1:8000`
- Ngrok mirror semua request ke public URL

## 🔧 **TROUBLESHOOTING:**

### **Problem 1: Ngrok tidak recognized**
**Solution:** Download manual dari ngrok.com

### **Problem 2: Auth token invalid** 
**Solution:** 
1. Sign up di ngrok.com
2. Get new token dari dashboard
3. Run: `ngrok config add-authtoken NEW_TOKEN`

### **Problem 3: Tunnel tidak start**
**Solution:**
1. Pastikan Laravel server running (`php artisan serve --port=8000`)
2. Check port 8000 tidak dipakai aplikasi lain
3. Restart ngrok

### **Problem 4: Public URL tidak bisa diakses**
**Solution:**
1. Check firewall/antivirus
2. Try different region: `ngrok http 8000 --region=ap`
3. Check ngrok dashboard untuk error logs

## 🎯 **NEXT STEPS AFTER NGROK RUNNING:**

### **1. Configure Midtrans Webhook**
1. Login: https://dashboard.midtrans.com/
2. Settings → Configuration
3. Set **Notification URL:** `https://your-ngrok-url.ngrok.io/midtrans/notification`

### **2. Test Real Payment**
1. Access: `https://your-ngrok-url.ngrok.io`
2. Login dan test checkout
3. Monitor webhook di ngrok dashboard

### **3. Keep Running**
- **PENTING:** Jangan tutup terminal ngrok
- **PENTING:** Jangan tutup Laravel server
- **PENTING:** Jangan tutup Vite dev server

## ⚠️ **WARNINGS:**

🚨 **URL berubah setiap restart** (free plan)  
🚨 **Update webhook URL di Midtrans jika restart**  
🚨 **Keep 3 terminals running:** Laravel, Vite, Ngrok  
🚨 **Production mode = real money!**

## 📊 **MONITORING:**

- **Ngrok Dashboard:** http://127.0.0.1:4040
- **Laravel Logs:** `tail -f storage/logs/laravel.log`
- **Midtrans Dashboard:** https://dashboard.midtrans.com/

---

**Setelah ngrok running, aplikasi Anda sudah bisa diakses public dan siap terima webhook dari Midtrans!** 🎉