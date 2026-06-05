<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Handle contact form submission
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'topic' => 'required|string|max:100',
            'message' => 'required|string|max:2000',
        ], [
            'first_name.required' => 'Nama depan wajib diisi',
            'last_name.required' => 'Nama belakang wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'topic.required' => 'Pilih topik pesan',
            'message.required' => 'Pesan wajib diisi',
        ]);

        try {
            $fullName = $validated['first_name'] . ' ' . $validated['last_name'];
            $recipientEmail = 'leadership.nasional@gmail.com';

            // Send email
            Mail::send([], [], function ($mail) use ($validated, $fullName, $recipientEmail) {
                $mail->to($recipientEmail)
                    ->subject('[LeadNEX Contact] ' . $validated['topic'] . ' - dari ' . $fullName)
                    ->html($this->buildEmailContent($validated, $fullName));
            });

            // Log the contact submission
            Log::info('Contact form submitted', [
                'name' => $fullName,
                'email' => $validated['email'],
                'topic' => $validated['topic'],
            ]);

            return back()->with('success', 'Pesan Anda berhasil dikirim! Kami akan merespon dalam 24 jam.');

        } catch (\Exception $e) {
            Log::error('Contact form error: ' . $e->getMessage());

            return back()->withErrors([
                'message' => 'Gagal mengirim pesan. Silakan coba lagi atau hubungi kami langsung via WhatsApp.'
            ]);
        }
    }

    /**
     * Build HTML email content
     */
    private function buildEmailContent(array $data, string $fullName): string
    {
        $date = now()->format('d F Y, H:i');

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #4b5563; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                .value { background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
                .footer { background: #1f2937; color: #9ca3af; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; }
                .badge { display: inline-block; background: #fbbf24; color: #1f2937; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0; font-size: 24px;'>Pesan Baru dari Website LeadNEX</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>{$date}</p>
                </div>

                <div class='content'>
                    <div class='field'>
                        <div class='label'>Topik</div>
                        <div class='value'><span class='badge'>{$data['topic']}</span></div>
                    </div>

                    <div class='field'>
                        <div class='label'>Nama Lengkap</div>
                        <div class='value'>{$fullName}</div>
                    </div>

                    <div class='field'>
                        <div class='label'>Email</div>
                        <div class='value'><a href='mailto:{$data['email']}' style='color: #2563eb;'>{$data['email']}</a></div>
                    </div>

                    <div class='field'>
                        <div class='label'>Pesan</div>
                        <div class='message-box'>" . nl2br(htmlspecialchars($data['message'])) . "</div>
                    </div>
                </div>

                <div class='footer'>
                    <p style='margin: 0;'>Email ini dikirim otomatis dari form kontak website LeadNEX</p>
                    <p style='margin: 5px 0 0 0;'>© " . date('Y') . " LeadNEX Learning Platform</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
