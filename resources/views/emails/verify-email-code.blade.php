<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi Email - SangkaLearn</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2C312F;
            background-color: #FCFCFB;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #0D5C63;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 8px 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2C312F;
        }
        .verification-code {
            background: #0D5C63;
            color: white;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 20px;
            margin: 30px 0;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            border: 3px solid #E3E5E2;
        }
        .instructions {
            background-color: #F2F3F1;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #0D5C63;
            margin: 25px 0;
        }
        .instructions h3 {
            margin: 0 0 15px;
            color: #2C312F;
            font-size: 16px;
            font-weight: 600;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
            color: #565C59;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .security-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .security-notice h4 {
            margin: 0 0 10px;
            color: #92400e;
            font-size: 14px;
            font-weight: 600;
        }
        .security-notice p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .expiry-info {
            background-color: #fee2e2;
            border: 1px solid #f87171;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .expiry-info p {
            margin: 0;
            color: #dc2626;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            background-color: #FCFCFB;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E3E5E2;
        }
        .footer p {
            margin: 5px 0;
            color: #6B716E;
            font-size: 14px;
        }
        .footer a {
            color: #0D5C63;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .troubleshooting {
            margin: 30px 0;
            padding: 20px;
            background-color: #EEF6F6;
            border-radius: 8px;
            border-left: 4px solid #4F9A9F;
        }
        .troubleshooting h4 {
            margin: 0 0 15px;
            color: #083A3F;
            font-size: 16px;
        }
        .troubleshooting ul {
            margin: 0;
            padding-left: 20px;
            color: #083A3F;
        }
        .troubleshooting li {
            margin-bottom: 8px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Kode Verifikasi Email</h1>
            <p>SangkaLearn</p>
        </div>
        
        <div class="content">
            <p class="greeting">
                Halo <strong>{{ $user->name }}</strong>,
            </p>
            
            <p>
                Terima kasih telah mendaftar di <strong>SangkaLearn</strong>! Untuk menyelesaikan proses verifikasi email Anda, silakan masukkan kode verifikasi berikut:
            </p>
            
            <div class="verification-code">
                {{ $verificationCode }}
            </div>
            
            <div class="expiry-info">
                <p>⏰ Kode ini akan kedaluwarsa dalam 15 menit</p>
            </div>
            
            <div class="instructions">
                <h3>📋 Cara Menggunakan Kode:</h3>
                <ol>
                    <li>Kembali ke halaman verifikasi di website</li>
                    <li>Masukkan 6 digit kode di atas</li>
                    <li>Klik tombol "Verifikasi Email"</li>
                    <li>Email Anda akan terverifikasi dan Anda dapat menggunakan akun</li>
                </ol>
            </div>
            
            <div class="security-notice">
                <h4>🛡️ Penting untuk Keamanan:</h4>
                <p>
                    Jangan bagikan kode ini kepada siapa pun. Tim kami tidak akan pernah meminta kode verifikasi melalui telepon, email, atau media lainnya.
                </p>
            </div>
            
            <div class="troubleshooting">
                <h4>💡 Tips Troubleshooting:</h4>
                <ul>
                    <li><strong>Kode tidak berfungsi?</strong> Pastikan Anda memasukkan semua 6 digit dengan benar</li>
                    <li><strong>Kode kedaluwarsa?</strong> Kembali ke halaman verifikasi dan klik "Kirim Ulang Kode"</li>
                    <li><strong>Masih bermasalah?</strong> Hubungi tim support kami</li>
                    <li><strong>Tidak menerima email?</strong> Periksa folder spam/junk Anda</li>
                </ul>
            </div>
            
            <p>
                Jika Anda tidak mendaftar di platform kami, abaikan email ini. Akun tidak akan dibuat tanpa verifikasi email.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>SangkaLearn</strong></p>
            <p>Platform pembelajaran digital terdepan untuk mengembangkan bisnis Anda</p>
            <p>
                Butuh bantuan? 
                <a href="mailto:support@sangkalearn.id">support@sangkalearn.id</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #9AA09C;">
                © {{ date('Y') }} SangkaLearn. Semua hak dilindungi undang-undang.
            </p>
        </div>
    </div>
</body>
</html>