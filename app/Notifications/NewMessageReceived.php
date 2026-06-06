<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewMessageReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;
    protected $sender;
    protected $conversationId;

    public function __construct(Message $message, User $sender, $conversationId = null)
    {
        $this->message = $message;
        $this->sender = $sender;
        $this->conversationId = $conversationId ?? $message->conversation_id;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        // Determine the correct messages URL based on recipient's role
        $role = $notifiable->roles->first()?->name ?? 'student';

        $messageUrl = match($role) {
            'admin' => '/admin/messages',
            'instructor' => '/instructor/messages',
            'sub_admin' => '/subadmin/messages',
            default => '/student/messages',
        };

        // Get message subject - handle both Message model and Conversation
        $subject = $this->message->subject ?? 'Pesan Baru';

        return [
            'type' => 'user',
            'category' => 'system',
            'title' => 'Pesan Baru',
            'message' => "{$this->sender->first_name} {$this->sender->last_name} mengirim pesan kepada Anda",
            'priority' => 'medium',
            'action_url' => $messageUrl,
            'message_id' => $this->message->id,
            'conversation_id' => $this->conversationId,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->first_name . ' ' . $this->sender->last_name,
            'subject' => $subject,
        ];
    }
}
