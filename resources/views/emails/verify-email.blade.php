<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verifikasi Email - LeadNEX Learning Platform</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            color: #e0e7ff;
            margin: 10px 0 0;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .message {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }
        .alternative-text {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #4f46e5;
            text-decoration: none;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-note p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
        .button-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>LeadNEX Learning Platform</h1>
            <p>Verifikasi Email Anda</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Halo {{ $user->first_name ?? 'Pengguna' }}!
            </div>

            <div class="message">
                Terima kasih telah mendaftar di <strong>LeadNEX Learning Platform</strong>. 
                Untuk menyelesaikan proses pendaftaran dan mengakses semua fitur pembelajaran, 
                Anda perlu memverifikasi alamat email Anda.
            </div>

            <div class="button-center">
                <a href="{{ $verificationUrl }}" class="verify-button">
                    Verifikasi Email Saya
                </a>
            </div>

            <div class="security-note">
                <p>
                    <strong>⚠️ Catatan Keamanan:</strong> 
                    Link verifikasi ini akan kedaluwarsa dalam 60 menit untuk menjaga keamanan akun Anda.
                </p>
            </div>

            <div class="alternative-text">
                <p><strong>Jika tombol di atas tidak berfungsi,</strong> silakan copy dan paste link berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #4f46e5; font-family: monospace; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    {{ $verificationUrl }}
                </p>
            </div>

            <div class="alternative-text">
                <p><strong>Jika Anda tidak mendaftar di LeadNEX Learning Platform,</strong> Anda dapat mengabaikan email ini dengan aman. Akun tidak akan dibuat tanpa verifikasi email.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                Email ini dikirim oleh <strong>LeadNEX Learning Platform</strong><br>
                Jika ada pertanyaan, hubungi kami di 
                <a href="mailto:support@zero13indonesia.com">support@zero13indonesia.com</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                &copy; {{ date('Y') }} LeadNEX Learning Platform. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>