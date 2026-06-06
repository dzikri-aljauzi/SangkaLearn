@echo off
color 0B
title Alternative Solution - LocalTunnel
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                     ALTERNATIVE: LOCALTUNNEL                         ║
echo ║                    (Lebih mudah dari ngrok!)                         ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 LocalTunnel = Alternative ngrok yang lebih simple
echo 💡 Tidak perlu signup/auth token!
echo 🚀 Install sekali, langsung pakai
echo.

echo 📋 LANGKAH-LANGKAH:
echo    1. Install localtunnel via npm
echo    2. Start tunnel ke localhost:8000  
echo    3. Dapat URL publik instant
echo    4. Update .env dengan URL
echo    5. Test akses
echo.

pause

echo.
echo ⚡ STEP 1: INSTALL LOCALTUNNEL
echo.

REM Check if npm exists
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM tidak ditemukan!
    echo    Install Node.js dari: https://nodejs.org/
    echo    Atau pakai ngrok manual setup
    pause
    exit /b 1
)

echo 📦 Installing localtunnel globally...
npm install -g localtunnel

if %errorlevel% equ 0 (
    echo ✅ LocalTunnel berhasil diinstall
) else (
    echo ❌ Install gagal. Coba dengan administrator privileges
    echo    Klik kanan Command Prompt → Run as Administrator
    pause
    exit /b 1
)

echo.
echo 🔍 STEP 2: CHECK LARAVEL SERVER
echo.

powershell -Command "$response = try { Invoke-WebRequest -Uri 'http://localhost:8000' -UseBasicParsing -TimeoutSec 5 } catch { $null }; if ($response) { Write-Host 'Laravel server: RUNNING ✅' } else { Write-Host 'Laravel server: NOT RUNNING ❌' }"

echo.
set /p "server_ready=Laravel server sudah jalan di localhost:8000? (y/n): "
if /i not "%server_ready%"=="y" (
    echo.
    echo ❌ Jalankan Laravel server dulu!
    echo    Command: php artisan serve --port=8000
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 STEP 3: START TUNNEL
echo.
echo    ⚠️  PENTING: Jangan tutup window ini!
echo    ⚠️  Copy URL yang muncul nanti
echo.

pause

echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                        STARTING LOCALTUNNEL                          ║
echo ║                                                                      ║
echo ║  Tunggu sampai muncul URL seperti:                                   ║
echo ║  https://random-subdomain.loca.lt                                    ║
echo ║                                                                      ║
echo ║  Copy URL tersebut untuk update .env                                 ║
echo ╚══════════════════════════════════════════════════════════════════════╝

echo.
lt --port 8000