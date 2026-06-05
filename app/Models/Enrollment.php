<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'course_id', 'order_id', 'status', 'enrollment_type', 'progress_percentage',
        'enrolled_at', 'completed_at', 'expires_at', 'last_accessed_at',
        'total_time_spent', 'completion_data', 'certificate_issued_at', 'certificate_file',
        'zoom_screenshot_path', 'zoom_screenshot_uploaded_at'
    ];

    protected function casts(): array
    {
        return [
            'progress_percentage' => 'decimal:2',
            'completion_data' => 'array',
            'enrolled_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_accessed_at' => 'datetime',
            'certificate_issued_at' => 'datetime',
            'zoom_screenshot_uploaded_at' => 'datetime',
        ];
    }

    /**
     * Get the zoom screenshot URL
     */
    public function getZoomScreenshotUrlAttribute(): ?string
    {
        if (!$this->zoom_screenshot_path) {
            return null;
        }
        return asset('storage/' . $this->zoom_screenshot_path);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'course_id', 'course_id')
                    ->where('user_id', $this->user_id);
    }

    public function hasCertificate(): bool
    {
        return $this->certificates()->exists();
    }

    public function getCertificate()
    {
        return $this->certificates()->first();
    }

    /**
     * Get the effective expires_at date
     * This considers both the enrollment's expires_at and the course's access_duration_days setting
     *
     * Logic:
     * - If course has NO duration limit (null/0), always return null (unlimited)
     * - If course HAS duration limit:
     *   - If enrollment has expires_at, use it
     *   - If enrollment has no expires_at, calculate on-the-fly from enrolled_at
     */
    public function getEffectiveExpiresAt(): ?\Carbon\Carbon
    {
        $course = $this->course;

        // If course doesn't have duration limit, access is unlimited
        if (!$course || !$course->access_duration_days || $course->access_duration_days <= 0) {
            return null; // Unlimited access - ignore any legacy expires_at
        }

        // Course has duration limit
        if ($this->expires_at) {
            return $this->expires_at;
        }

        // Calculate on-the-fly for existing enrollments without expires_at
        $enrolledAt = $this->enrolled_at ?? $this->created_at ?? now();
        return $enrolledAt->copy()->addDays($course->access_duration_days);
    }

    /**
     * Check if enrollment access has expired
     * Only considers expired if course actually has access_duration_days configured
     */
    public function isExpired(): bool
    {
        $effectiveExpiry = $this->getEffectiveExpiresAt();

        if (!$effectiveExpiry) {
            return false; // Unlimited access
        }

        return now()->gt($effectiveExpiry);
    }

    /**
     * Check if enrollment is still active (not expired and status is active/completed)
     */
    public function hasActiveAccess(): bool
    {
        if ($this->status === 'cancelled' || $this->status === 'suspended') {
            return false;
        }
        return !$this->isExpired();
    }

    /**
     * Get remaining days of access
     * Returns null if unlimited, 0 if expired, positive number if still active
     * Only considers remaining days if course has access_duration_days configured
     */
    public function getRemainingDays(): ?int
    {
        $effectiveExpiry = $this->getEffectiveExpiresAt();

        if (!$effectiveExpiry) {
            return null; // Unlimited access
        }

        $now = now();
        if ($now->gt($effectiveExpiry)) {
            return 0; // Expired
        }

        return (int) $now->diffInDays($effectiveExpiry);
    }

    /**
     * Get the expiration date for display
     * Returns null if unlimited access
     */
    public function getExpiresAtForDisplay(): ?\Carbon\Carbon
    {
        return $this->getEffectiveExpiresAt();
    }

    /**
     * Get formatted remaining access text
     */
    public function getRemainingAccessText(): string
    {
        $remaining = $this->getRemainingDays();

        if ($remaining === null) {
            return 'Akses Selamanya';
        }

        if ($remaining === 0) {
            return 'Akses Berakhir';
        }

        if ($remaining === 1) {
            return 'Sisa 1 hari';
        }

        return "Sisa {$remaining} hari";
    }

    /**
     * Calculate and set expires_at based on course's access_duration_days
     */
    public function calculateExpiresAt(): void
    {
        $course = $this->course;

        if (!$course || !$course->access_duration_days || $course->access_duration_days <= 0) {
            $this->expires_at = null; // Unlimited access
            return;
        }

        $enrolledAt = $this->enrolled_at ?? now();
        $this->expires_at = $enrolledAt->copy()->addDays($course->access_duration_days);
    }

    /**
     * Sync expires_at with course's current access_duration_days setting
     * Useful for updating existing enrollments when course duration changes
     */
    public function syncExpiresAt(): bool
    {
        $this->calculateExpiresAt();
        return $this->save();
    }
}