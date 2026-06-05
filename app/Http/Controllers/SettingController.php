<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index');
    }

    public function update(Request $request)
    {
        // Handle general settings update
        return redirect()->back()->with('success', 'Settings updated successfully');
    }

    public function payment()
    {
        return Inertia::render('Admin/Settings/Payment', [
            'settings' => [
                'stripe_public_key' => env('STRIPE_KEY', ''),
                'stripe_secret_key' => env('STRIPE_SECRET', ''),
                'paypal_client_id' => env('PAYPAL_CLIENT_ID', ''),
                'paypal_secret' => env('PAYPAL_SECRET', ''),
                'midtrans_server_key' => env('MIDTRANS_SERVER_KEY', ''),
                'midtrans_client_key' => env('MIDTRANS_CLIENT_KEY', ''),
                'midtrans_environment' => env('MIDTRANS_ENVIRONMENT', 'sandbox'),
                'payment_methods' => ['stripe', 'paypal', 'midtrans'],
                'default_currency' => env('DEFAULT_CURRENCY', 'IDR'),
            ]
        ]);
    }

    public function updatePayment(Request $request)
    {
        $request->validate([
            'stripe_public_key' => 'nullable|string',
            'stripe_secret_key' => 'nullable|string',
            'paypal_client_id' => 'nullable|string',
            'paypal_secret' => 'nullable|string',
            'midtrans_server_key' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_environment' => 'required|in:sandbox,production',
            'default_currency' => 'required|string|max:3',
        ]);

        // In a real application, you would update environment variables or database settings
        return redirect()->back()->with('success', 'Payment settings updated successfully');
    }

    public function smtp()
    {
        return Inertia::render('Admin/Settings/Smtp', [
            'settings' => [
                'mail_host' => env('MAIL_HOST', 'smtp.gmail.com'),
                'mail_port' => env('MAIL_PORT', '587'),
                'mail_username' => env('MAIL_USERNAME', ''),
                'mail_password' => env('MAIL_PASSWORD', ''),
                'mail_encryption' => env('MAIL_ENCRYPTION', 'tls'),
                'mail_from_address' => env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
                'mail_from_name' => env('MAIL_FROM_NAME', 'LMS Platform'),
            ]
        ]);
    }

    public function updateSmtp(Request $request)
    {
        $request->validate([
            'mail_host' => 'required|string',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_username' => 'required|email',
            'mail_password' => 'required|string',
            'mail_encryption' => 'required|in:tls,ssl',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string|max:255',
        ]);

        // In a real application, you would update environment variables or database settings
        return redirect()->back()->with('success', 'SMTP settings updated successfully');
    }

    public function social()
    {
        return Inertia::render('Admin/Settings/Social', [
            'settings' => [
                'facebook_app_id' => env('FACEBOOK_APP_ID', ''),
                'facebook_app_secret' => env('FACEBOOK_APP_SECRET', ''),
                'google_client_id' => env('GOOGLE_CLIENT_ID', ''),
                'google_client_secret' => env('GOOGLE_CLIENT_SECRET', ''),
                'twitter_api_key' => env('TWITTER_API_KEY', ''),
                'twitter_api_secret' => env('TWITTER_API_SECRET', ''),
                'linkedin_client_id' => env('LINKEDIN_CLIENT_ID', ''),
                'linkedin_client_secret' => env('LINKEDIN_CLIENT_SECRET', ''),
                'social_login_enabled' => true,
                'social_sharing_enabled' => true,
            ]
        ]);
    }

    public function updateSocial(Request $request)
    {
        $request->validate([
            'facebook_app_id' => 'nullable|string',
            'facebook_app_secret' => 'nullable|string',
            'google_client_id' => 'nullable|string',
            'google_client_secret' => 'nullable|string',
            'twitter_api_key' => 'nullable|string',
            'twitter_api_secret' => 'nullable|string',
            'linkedin_client_id' => 'nullable|string',
            'linkedin_client_secret' => 'nullable|string',
            'social_login_enabled' => 'boolean',
            'social_sharing_enabled' => 'boolean',
        ]);

        // In a real application, you would update environment variables or database settings
        return redirect()->back()->with('success', 'Social media settings updated successfully');
    }
}
