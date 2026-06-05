<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Split name into first_name and last_name
        $nameParts = explode(' ', trim($request->name), 2);
        $firstName = $nameParts[0];
        $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'timezone' => 'Asia/Jakarta', // Default timezone for Indonesia
            'language' => 'id', // Default language
            'is_active' => true,
        ]);

        // Assign default student role to new registrations
        $user->assignRole('student');

        // Try to send email verification code, but don't fail registration if email fails
        try {
            $user->sendEmailVerificationNotification();
            $emailSent = true;
            $message = 'Akun Anda berhasil dibuat! Silakan cek email untuk kode verifikasi 6 digit.';
        } catch (\Exception $e) {
            // If email fails, still generate a code for development
            $user->generateEmailVerificationCode();
            
            // Log the email error but continue with registration
            \Log::warning('Email verification failed during registration', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);
            $emailSent = false;
            
            $message = 'Akun Anda berhasil dibuat! Namun terdapat masalah dengan pengiriman email verifikasi. Anda dapat meminta kode verifikasi ulang nanti.';
        }

        Auth::login($user);

        // Redirect to email verification notice with appropriate message
        if ($emailSent) {
            return redirect(route('verification.notice'))->with('success', $message);
        } else {
            // If email failed, still redirect to verification page but with different message
            return redirect(route('verification.notice'))->with('warning', $message);
        }
    }
}