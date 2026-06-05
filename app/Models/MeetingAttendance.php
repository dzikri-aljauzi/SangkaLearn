<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'user_id',
        'attended',
        'marked_at',
        'marked_by',
        'notes',
    ];

    protected $casts = [
        'attended' => 'boolean',
        'marked_at' => 'datetime',
    ];

    /**
     * Get the meeting this attendance belongs to
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    /**
     * Get the user (student) for this attendance
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who marked this attendance
     */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    /**
     * Mark as attended
     */
    public function markAsAttended(User $admin, ?string $notes = null): void
    {
        $this->update([
            'attended' => true,
            'marked_at' => now(),
            'marked_by' => $admin->id,
            'notes' => $notes,
        ]);
    }

    /**
     * Mark as not attended
     */
    public function markAsNotAttended(User $admin, ?string $notes = null): void
    {
        $this->update([
            'attended' => false,
            'marked_at' => now(),
            'marked_by' => $admin->id,
            'notes' => $notes,
        ]);
    }
}
