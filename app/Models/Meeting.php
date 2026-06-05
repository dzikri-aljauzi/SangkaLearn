<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'section_id',
        'title',
        'description',
        'zoom_link',
        'scheduled_at',
        'duration_minutes',
        'notes',
        'meeting_id',
        'passcode',
        'attendance_proof',
        'is_published',
        'sort_order',
        'alert_sent',
        'alert_sent_at',
        'alert_sent_by',
        'alert_recipients_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'alert_sent_at' => 'datetime',
        'is_published' => 'boolean',
        'alert_sent' => 'boolean',
    ];

    /**
     * Get the course this meeting belongs to
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the section this meeting belongs to
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'section_id');
    }

    /**
     * Get all attendances for this meeting
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(MeetingAttendance::class);
    }

    /**
     * Get all screenshots for this meeting
     */
    public function screenshots(): HasMany
    {
        return $this->hasMany(MeetingScreenshot::class)->orderBy('order');
    }

    /**
     * Get attendances where student attended
     */
    public function attendedStudents(): HasMany
    {
        return $this->attendances()->where('attended', true);
    }

    /**
     * Check if a user attended this meeting
     */
    public function isAttendedBy(User $user): bool
    {
        return $this->attendances()
            ->where('user_id', $user->id)
            ->where('attended', true)
            ->exists();
    }

    /**
     * Get attendance record for a specific user
     */
    public function getAttendanceForUser(User $user)
    {
        return $this->attendances()
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * Get formatted scheduled time
     */
    public function getFormattedScheduleAttribute(): string
    {
        if (!$this->scheduled_at) return 'Not scheduled';

        return $this->scheduled_at->format('d M Y, H:i');
    }

    /**
     * Check if meeting has passed
     */
    public function hasPassed(): bool
    {
        return $this->scheduled_at < now();
    }

    /**
     * Check if meeting is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->scheduled_at > now();
    }

    /**
     * Get attendance proof URL
     */
    public function getAttendanceProofUrlAttribute(): ?string
    {
        if ($this->attendance_proof) {
            return asset('storage/' . $this->attendance_proof);
        }
        return null;
    }

    /**
     * Check if attendance proof exists
     */
    public function hasAttendanceProof(): bool
    {
        return !empty($this->attendance_proof);
    }

    /**
     * Get attendance statistics
     */
    public function getAttendanceStats(): array
    {
        $total = $this->attendances()->count();
        $attended = $this->attendances()->where('attended', true)->count();

        return [
            'total' => $total,
            'attended' => $attended,
            'not_attended' => $total - $attended,
            'attendance_rate' => $total > 0 ? round(($attended / $total) * 100, 2) : 0,
        ];
    }
}
