@echo off
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    NGROK SETUP DEMO                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎯 TUJUAN: Membuat localhost bisa diakses dari internet
echo 💡 KENAPA: Midtrans butuh URL publik untuk webhook notification
echo.
echo 📋 YANG AKAN DILAKUKAN:
echo    1. Setup ngrok account (manual)
echo    2. Download dan install ngrok 
echo    3. Start tunnel: localhost:8000 → https://random.ngrok.io
echo    4. Update .env dengan public URL
echo    5. Test akses publik
echo.
echo ⚠️  YANG HARUS ANDA LAKUKAN:
echo    1. Sign up di: https://ngrok.com/
echo    2. Login dan copy auth token
echo    3. Jalankan command yang diberikan
echo.
pause
echo.
echo 🚀 STARTING SETUP...
echo.

REM Check if ngrok exists
if exist "ngrok.exe" (
    echo ✅ Ngrok sudah terdownload
) else (
    echo 📥 Downloading ngrok...
    curl -o ngrok.zip -L "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip"
    powershell -Command "Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force"
    del ngrok.zip
    echo ✅ Ngrok downloaded successfully
)

echo.
echo 🔑 SETUP AUTH TOKEN:
echo    1. Buka: https://dashboard.ngrok.com/get-started/your-authtoken
echo    2. Copy auth token
echo    3. Jalankan command berikut (ganti YOUR_TOKEN):
echo.
echo    ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
echo.
set /p "token=Paste your auth token here: "
if not "%token%"=="" (
    ngrok config add-authtoken %token%
    echo ✅ Auth token configured
) else (
    echo ❌ No token provided. Please run manually:
    echo    ngrok config add-authtoken YOUR_TOKEN
)

echo.
echo 🌐 STARTING NGROK TUNNEL...
echo    - This will create public URL for your localhost:8000
echo    - Keep this window OPEN
echo    - Copy the HTTPS URL when it appears
echo.
pause
echo.
echo 🚀 Starting tunnel...
ngrok http 8000