<?php

namespace App\Notifications\Admin;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewUserRegistration extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $role;

    public function __construct(User $user, $role = 'student')
    {
        $this->user = $user;
        $this->role = $role;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $roleLabel = [
            'student' => 'Siswa',
            'instructor' => 'Instruktur',
            'admin' => 'Admin',
            'sub_admin' => 'Sub Admin'
        ];

        return [
            'type' => 'system',
            'category' => 'user',
            'title' => 'Pengguna baru terdaftar',
            'message' => "{$roleLabel[$this->role]} baru: {$this->user->first_name} {$this->user->last_name} ({$this->user->email})",
            'priority' => 'low',
            'action_url' => route('admin.users.students.show', $this->user->id),
            'user_id' => $this->user->id,
            'user_name' => $this->user->first_name . ' ' . $this->user->last_name,
            'user_email' => $this->user->email,
            'user_role' => $this->role,
        ];
    }
}
