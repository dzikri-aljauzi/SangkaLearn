<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Conversation extends Model
{
    protected $fillable = [
        'subject',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withPivot(['last_read_at'])
                    ->withTimestamps();
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function getUnreadCountForUser($userId)
    {
        $participant = $this->participants()->where('users.id', $userId)->first();
        if (!$participant) {
            return 0;
        }

        return $this->messages()
                    ->where('user_id', '!=', $userId)
                    ->where('created_at', '>', $participant->pivot->last_read_at ?? '1970-01-01')
                    ->count();
    }

    public function markAsReadForUser($userId)
    {
        $this->participants()->updateExistingPivot($userId, [
            'last_read_at' => now()
        ]);
    }
}
