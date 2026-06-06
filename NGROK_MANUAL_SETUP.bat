@echo off
color 0E
title Ngrok Setup untuk Midtrans
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                        NGROK MANUAL SETUP                            ║
echo ║                  Memastikan Midtrans Webhook Berjalan                ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 TUJUAN: Membuat localhost:8000 bisa diakses dari internet
echo 💰 UNTUK: Midtrans bisa kirim webhook notification
echo.

echo 📋 LANGKAH-LANGKAH:
echo    1. Download dan extract ngrok
echo    2. Register account ngrok (GRATIS)
echo    3. Setup auth token
echo    4. Start tunnel
echo    5. Test akses public
echo.

pause

echo.
echo ⏬ STEP 1: DOWNLOAD NGROK
echo.

if exist "ngrok.exe" (
    echo ✅ ngrok.exe sudah ada
) else (
    echo 📥 Downloading ngrok...
    echo    URL: https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip
    
    powershell -Command "try { Invoke-WebRequest -Uri 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip' -OutFile 'ngrok.zip' -UseBasicParsing } catch { Write-Host 'Download failed' }"
    
    if exist "ngrok.zip" (
        echo 📦 Extracting...
        powershell -Command "try { Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force } catch { Write-Host 'Extract failed' }"
        del ngrok.zip >nul 2>&1
        
        if exist "ngrok.exe" (
            echo ✅ ngrok.exe berhasil didownload
        ) else (
            echo ❌ Extract gagal. Download manual dari: https://ngrok.com/download
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Download gagal. Download manual dari: https://ngrok.com/download
        pause
        exit /b 1
    )
)

echo.
echo 🔐 STEP 2: SETUP ACCOUNT (WAJIB!)
echo.
echo    1. Buka browser: https://dashboard.ngrok.com/signup
echo    2. Daftar GRATIS dengan email Anda
echo    3. Login ke dashboard
echo    4. Copy "Your Authtoken" dari: https://dashboard.ngrok.com/get-started/your-authtoken
echo.

set /p "continue=Sudah daftar dan copy auth token? (y/n): "
if /i not "%continue%"=="y" (
    echo.
    echo ⚠️  Anda HARUS daftar dulu untuk mendapat auth token
    echo    Tanpa auth token, ngrok tidak akan jalan!
    echo.
    pause
    exit /b 1
)

echo.
echo 🔑 STEP 3: INPUT AUTH TOKEN
echo.
echo    Paste auth token Anda di sini (contoh: 2abcDEFghiJKLmno3PQRstu4VWXyz5_678ABcdeFGHijkLMNopqRStUv9):

:input_token
set /p "token=Auth Token: "

if "%token%"=="" (
    echo ❌ Token kosong! Masukkan token yang valid.
    goto input_token
)

echo.
echo 🔧 Menyimpan auth token...
ngrok config add-authtoken %token%

if %errorlevel% equ 0 (
    echo ✅ Auth token berhasil disimpan
) else (
    echo ❌ Gagal menyimpan token. Token mungkin invalid.
    echo    Coba copy ulang dari: https://dashboard.ngrok.com/get-started/your-authtoken
    pause
    goto input_token
)

echo.
echo 🚀 STEP 4: MEMULAI TUNNEL
echo.
echo    ⚠️  PENTING: Jangan tutup window ini setelah tunnel dimulai!
echo    ⚠️  Laravel server harus sudah jalan di localhost:8000
echo.

REM Check if Laravel server is running
echo 🔍 Checking Laravel server...
powershell -Command "$response = try { Invoke-WebRequest -Uri 'http://localhost:8000' -UseBasicParsing -TimeoutSec 5 } catch { $null }; if ($response) { Write-Host 'Laravel server: RUNNING ✅' } else { Write-Host 'Laravel server: NOT RUNNING ❌' }"

echo.
echo 📊 Cek status server di terminal lain:
echo    Terminal 1: php artisan serve --port=8000
echo    Terminal 2: npm run dev
echo.

set /p "server_ready=Laravel server sudah jalan? (y/n): "
if /i not "%server_ready%"=="y" (
    echo.
    echo ❌ Jalankan Laravel server dulu!
    echo    Buka Command Prompt baru dan jalankan: php artisan serve --port=8000
    echo.
    pause
    exit /b 1
)

echo.
echo 🌐 Starting ngrok tunnel...
echo    - Tunggu sampai muncul "Forwarding" URL
echo    - Copy URL yang berupa: https://xxxxx.ngrok.io
echo    - Jangan tutup window ini!
echo.

pause

echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                           STARTING TUNNEL                            ║
echo ╚══════════════════════════════════════════════════════════════════════╝

ngrok http 8000