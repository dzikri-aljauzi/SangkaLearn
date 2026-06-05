<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class PaymentSuccessful extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $payment;

    public function __construct(Order $order, Payment $payment)
    {
        $this->order = $order;
        $this->payment = $payment;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $paymentMethod = $this->getPaymentMethodName($this->payment->payment_method);

        $mailMessage = (new MailMessage)
            ->subject('Pembayaran Berhasil - ' . $this->order->order_number)
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Terima kasih! Pembayaran Anda telah berhasil diproses.')
            ->line('**Detail Pesanan:**')
            ->line('Nomor Pesanan: **' . $this->order->order_number . '**')
            ->line('Tanggal: **' . $this->payment->paid_at->format('d F Y, H:i') . ' WIB**')
            ->line('Metode Pembayaran: **' . $paymentMethod . '**')
            ->line('')
            ->line('**Pelatihan yang Dibeli:**');

        // Add course details
        foreach ($this->order->items as $item) {
            $courseName = $item->course->title ?? 'Unknown Course';
            $price = 'Rp ' . number_format($item->price, 0, ',', '.');
            $mailMessage->line('• ' . $courseName . ' - ' . $price);
        }

        $mailMessage->line('')
            ->line('**Total Pembayaran: Rp ' . number_format($this->order->total_amount, 0, ',', '.') . '**')
            ->line('')
            ->line('Pelatihan Anda sudah aktif dan siap untuk dipelajari!')
            ->action('Mulai Belajar Sekarang', route('student.my-learning'))
            ->line('Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.')
            ->salutation('Salam hangat, Tim LeadNEX Academy');

        return $mailMessage;
    }

    public function toArray($notifiable)
    {
        $courses = $this->order->items->map(function($item) {
            return $item->course->title ?? 'Unknown Course';
        })->join(', ');

        return [
            'type' => 'user',
            'category' => 'payment',
            'title' => 'Pembayaran Berhasil',
            'message' => "Pembayaran untuk {$courses} telah berhasil diproses",
            'priority' => 'high',
            'action_url' => route('student.my-learning'),
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'payment_id' => $this->payment->id,
            'amount' => $this->order->total_amount,
        ];
    }

    private function getPaymentMethodName($method)
    {
        $methods = [
            'gopay' => 'GoPay',
            'bni_va' => 'BNI Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'mandiri_va' => 'Mandiri Virtual Account',
            'echannel' => 'Mandiri Bill Payment',
            'cimb_va' => 'CIMB Niaga Virtual Account',
            'permata_va' => 'Permata Virtual Account',
            'bca_va' => 'BCA Virtual Account',
            'midtrans' => 'Midtrans',
            'bank_transfer' => 'Transfer Bank',
        ];

        return $methods[$method] ?? ucfirst(str_replace('_', ' ', $method));
    }
}
