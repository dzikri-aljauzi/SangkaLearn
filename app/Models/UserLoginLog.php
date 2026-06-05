<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLoginLog extends Model
{
    protected $fillable = [
        'user_id',
        'login_date',
        'login_at',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'login_date' => 'date',
        'login_at' => 'datetime',
    ];

    /**
     * Get the user that owns the login log
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
