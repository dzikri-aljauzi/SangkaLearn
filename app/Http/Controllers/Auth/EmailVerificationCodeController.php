<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class EmailVerificationCodeController extends Controller
{
    /**
     * Verify email using verification code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6'
        ], [
            'code.required' => 'Kode verifikasi wajib diisi',
            'code.size' => 'Kode verifikasi harus 6 digit'
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended('/student/dashboard?verified=1');
        }

        if ($user->markEmailAsVerifiedWithCode($request->code)) {
            event(new Verified($user));
            $user->updateLastLogin();
            
            return redirect()->intended('/student/dashboard')->with('success', 'Email berhasil diverifikasi! Selamat datang di SangkaLearn.');
        }

        return back()->withErrors([
            'code' => 'Kode verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.'
        ]);
    }
}