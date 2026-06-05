<?php
// app/Models/Course.php (basic structure)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;
    
    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $fillable = [
        'title', 'slug', 'subtitle', 'description', 'learning_objectives',
        'requirements', 'target_audience', 'instructor_id', 'category_id',
        'course_type_id', 'level', 'language', 'duration_hours', 'has_certificate',
        'certificate_title', 'delivery_method',
        'zoom_link', 'zoom_schedule', 'zoom_notes', 'require_zoom_screenshot', 'virtual_background_path',
        'thumbnail', 'preview_video', 'preview_type', 'price', 'is_free',
        'discount_price', 'discount_expires_at', 'status', 'published_at',
        'is_featured', 'max_students', 'meta_title', 'meta_description',
        'meta_keywords', 'access_type', 'access_description',
        // Certificate fields
        'competency_units', 'instructor_name', 'certificate_unit_kompetensi',
        // Unit Kompetensi fields (legacy - kept for backward compatibility)
        'unit_kompetensi_1', 'unit_kompetensi_2', 'unit_kompetensi_3',
        'unit_kompetensi_4', 'unit_kompetensi_5', 'unit_kompetensi_6', 'unit_kompetensi_7',
        // Period fields
        'is_permanent', 'access_duration_days', 'period_start', 'period_end', 'registration_deadline',
        'auto_archive', 'archived_at',
        // Statistics fields (cached)
        'enrolled_count', 'completed_count', 'rating_avg', 'rating_count',
        'lesson_count', 'quiz_count'
    ];

    protected function casts(): array
    {
        return [
            'learning_objectives' => 'array',
            'requirements' => 'array',
            'target_audience' => 'array',
            'meta_keywords' => 'array',
            'competency_units' => 'array',
            'certificate_unit_kompetensi' => 'array',
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'rating_avg' => 'decimal:2',
            'has_certificate' => 'boolean',
            'is_free' => 'boolean',
            'is_featured' => 'boolean',
            'is_permanent' => 'boolean',
            'auto_archive' => 'boolean',
            'require_zoom_screenshot' => 'boolean',
            'discount_expires_at' => 'datetime',
            'published_at' => 'datetime',
            'period_start' => 'date',
            'period_end' => 'date',
            'registration_deadline' => 'date',
            'zoom_schedule' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get all instructors for this course (many-to-many relationship).
     */
    public function instructors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_instructors', 'course_id', 'instructor_id')
            ->withPivot('role', 'revenue_share')
            ->withTimestamps()
            ->orderByPivot('role', 'asc'); // primary first, then secondary
    }

    /**
     * Get the primary instructor for this course.
     */
    public function primaryInstructor()
    {
        return $this->instructors()->wherePivot('role', 'primary')->first();
    }

    /**
     * Get secondary instructors for this course.
     */
    public function secondaryInstructors()
    {
        return $this->instructors()->wherePivot('role', 'secondary');
    }

    /**
     * Get instructor names as comma-separated string.
     */
    public function getInstructorNamesAttribute(): string
    {
        $instructors = $this->instructors;
        if ($instructors->isEmpty()) {
            // Fallback to single instructor
            return $this->instructor ?
                trim($this->instructor->first_name . ' ' . $this->instructor->last_name) : '';
        }

        return $instructors->map(function ($instructor) {
            return trim($instructor->first_name . ' ' . $instructor->last_name);
        })->implode(', ');
    }

    /**
     * Users who have special access to this course (for private courses)
     */
    public function userAccess(): HasMany
    {
        return $this->hasMany(CourseUserAccess::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function courseType(): BelongsTo
    {
        return $this->belongsTo(CourseType::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CourseSection::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    public function certificateQueues(): HasMany
    {
        return $this->hasMany(CertificateQueue::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    /**
     * Target categories (Mahasiswa, Pemerintah, Perusahaan, etc.)
     */
    public function targetCategories(): BelongsToMany
    {
        return $this->belongsToMany(CourseTargetCategory::class, 'course_target_category_course')
            ->withTimestamps();
    }

    public function authorizedUsers(): HasMany
    {
        return $this->userAccess()->where(function($query) {
            $query->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
        });
    }

    public function hasUserAccess(User $user): bool
    {
        if ($this->access_type === 'public') {
            return true;
        }

        return $this->authorizedUsers()
                   ->where('user_id', $user->id)
                   ->exists();
    }

    public function grantAccessToUser(User $user, ?User $grantedBy = null, ?string $reason = null, ?string $expiresAt = null): CourseUserAccess
    {
        // Create or update access record
        $access = CourseUserAccess::updateOrCreate(
            [
                'course_id' => $this->id,
                'user_id' => $user->id,
            ],
            [
                'granted_by' => $grantedBy?->id,
                'access_reason' => $reason,
                'expires_at' => $expiresAt ? now()->parse($expiresAt) : null,
                'granted_at' => now(),
            ]
        );

        // Auto-enroll user to the course if not already enrolled
        $enrollment = Enrollment::firstOrCreate(
            [
                'course_id' => $this->id,
                'user_id' => $user->id,
            ],
            [
                'status' => 'active',
                'enrollment_type' => 'granted', // Mark as granted access (not purchased)
                'enrolled_at' => now(),
                'progress_percentage' => 0,
                'expires_at' => $expiresAt ? now()->parse($expiresAt) : null,
            ]
        );

        // If enrollment already exists but was inactive, reactivate it
        if ($enrollment->wasRecentlyCreated === false && $enrollment->status !== 'active') {
            $enrollment->update([
                'status' => 'active',
                'expires_at' => $expiresAt ? now()->parse($expiresAt) : null,
            ]);
        }

        return $access;
    }

    public function revokeUserAccess(User $user): bool
    {
        $deleted = $this->userAccess()
                       ->where('user_id', $user->id)
                       ->delete() > 0;

        // Also revoke enrollment if it was granted (not purchased)
        $enrollment = $this->enrollments()
                          ->where('user_id', $user->id)
                          ->where('enrollment_type', 'granted') // Only revoke granted access
                          ->first();

        if ($enrollment) {
            // Mark as inactive instead of deleting (to preserve progress data)
            $enrollment->update([
                'status' => 'inactive',
                'expires_at' => now(), // Set expired
            ]);
        }

        return $deleted;
    }

    public function isPublic(): bool
    {
        return $this->access_type === 'public';
    }

    public function isPrivate(): bool
    {
        return $this->access_type === 'private';
    }

    /**
     * Check if course is currently open for registration
     */
    public function isOpenForRegistration(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->is_permanent) {
            return true;
        }

        $now = now();

        // Check registration deadline
        if ($this->registration_deadline && $now->gt($this->registration_deadline)) {
            return false;
        }

        // Check period start/end
        if ($this->period_start && $now->lt($this->period_start)) {
            return false;
        }

        if ($this->period_end && $now->gt($this->period_end)) {
            return false;
        }

        return true;
    }

    /**
     * Check if course is currently active (dalam periode)
     */
    public function isActive(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->archived_at) {
            return false;
        }

        if ($this->is_permanent) {
            return true;
        }

        $now = now();

        if ($this->period_start && $now->lt($this->period_start)) {
            return false;
        }

        if ($this->period_end && $now->gt($this->period_end)) {
            return false;
        }

        return true;
    }

    /**
     * Check if course should be archived
     */
    public function shouldBeArchived(): bool
    {
        if (!$this->auto_archive || $this->is_permanent || $this->archived_at) {
            return false;
        }

        if ($this->period_end && now()->gt($this->period_end)) {
            return true;
        }

        return false;
    }

    /**
     * Archive this course
     */
    public function archive(): bool
    {
        $this->status = 'archived';
        $this->archived_at = now();
        return $this->save();
    }

    /**
     * Scope for active courses only
     */
    public function scopeActiveOnly($query)
    {
        return $query->where('status', 'published')
                    ->whereNull('archived_at')
                    ->where(function($q) {
                        $q->where('is_permanent', true)
                          ->orWhere(function($q2) {
                              $now = now();
                              $q2->where(function($q3) use ($now) {
                                  $q3->whereNull('period_start')
                                     ->orWhere('period_start', '<=', $now);
                              })->where(function($q3) use ($now) {
                                  $q3->whereNull('period_end')
                                     ->orWhere('period_end', '>=', $now);
                              });
                          });
                    });
    }

    /**
     * Scope for courses open for registration
     */
    public function scopeOpenForRegistration($query)
    {
        return $query->where('status', 'published')
                    ->whereNull('archived_at')
                    ->where(function($q) {
                        $q->where('is_permanent', true)
                          ->orWhere(function($q2) {
                              $now = now();
                              $q2->where(function($q3) use ($now) {
                                  $q3->whereNull('registration_deadline')
                                     ->orWhere('registration_deadline', '>=', $now);
                              })->where(function($q3) use ($now) {
                                  $q3->whereNull('period_start')
                                     ->orWhere('period_start', '<=', $now);
                              })->where(function($q3) use ($now) {
                                  $q3->whereNull('period_end')
                                     ->orWhere('period_end', '>=', $now);
                              });
                          });
                    });
    }

    /**
     * Get delivery method label
     */
    public function getDeliveryMethodLabelAttribute(): string
    {
        return match($this->delivery_method) {
            'hybrid' => 'Hybrid (Recording + Zoom)',
            'online_recording' => 'Online Recording',
            'zoom_interactive' => 'Zoom Interaktif',
            default => 'Hybrid'
        };
    }

}


