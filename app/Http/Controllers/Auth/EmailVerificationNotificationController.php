<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        try {
            $request->user()->sendEmailVerificationNotification();
            return back()->with('status', 'verification-link-sent');
        } catch (\Exception $e) {
            // If email fails, still generate a code for development
            $user = $request->user();
            if (!$user->email_verification_code || $user->email_verification_code_expires_at < now()) {
                $user->generateEmailVerificationCode();
            }
            
            // Log the email error but return graceful message to user
            \Log::warning('Email verification resend failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
                'generated_code' => $user->email_verification_code
            ]);
            
            if (config('app.debug')) {
                return back()->with('warning', 'Email gagal terkirim, tetapi kode verifikasi sudah digenerate dan akan ditampilkan di halaman.');
            } else {
                return back()->with('warning', 'Terjadi masalah saat mengirim email verifikasi. Silakan coba lagi nanti atau hubungi administrator jika masalah berlanjut.');
            }
        }
    }
}
