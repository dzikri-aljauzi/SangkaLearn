<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends Notification
{
    protected $verificationCode;

    /**
     * Create a new notification instance.
     */
    public function __construct(?string $verificationCode = null)
    {
        $this->verificationCode = $verificationCode;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        // Ensure we have a verification code, generate if null
        $code = $this->verificationCode;
        if (!$code) {
            $code = $notifiable->generateEmailVerificationCode();
        }
        
        return (new MailMessage)
            ->subject('Kode Verifikasi Email - SangkaLearn')
            ->view('emails.verify-email-code', [
                'user' => $notifiable,
                'verificationCode' => $code,
            ]);
    }
}