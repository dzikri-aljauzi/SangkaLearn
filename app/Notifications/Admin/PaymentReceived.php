<?php

namespace App\Notifications\Admin;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class PaymentReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $user;

    public function __construct(Order $order, User $user)
    {
        $this->order = $order;
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'system',
            'category' => 'payment',
            'title' => 'Pembayaran diterima',
            'message' => "Pembayaran Rp " . number_format($this->order->total_amount, 0, ',', '.') . " dari {$this->user->first_name} {$this->user->last_name}",
            'priority' => 'medium',
            'action_url' => '/admin/orders/' . $this->order->id,
            'order_id' => $this->order->id,
            'user_id' => $this->user->id,
            'user_name' => $this->user->first_name . ' ' . $this->user->last_name,
            'amount' => $this->order->total_amount,
        ];
    }
}
