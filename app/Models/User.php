<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Notifications\CustomVerifyEmail;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'avatar',
        'phone',
        'date_of_birth',
        'gender',
        'bio',
        'job_title',
        'company',
        'social_links',
        'timezone',
        'language',
        'is_active',
        'last_login_at',
        'city',
        'country',
        'address',
        'last_education',
        'employment_status',
        'linkedin_url',
        'status',
        'email_verified_at',
        'email_verification_code',
        'email_verification_code_expires_at',
        'specialization',
        'experience_years',
        'user_type',
        'user_group_id',
        'accessible_courses',
        'assigned_sub_admin_id',
        'current_streak',
        'longest_streak',
        'last_login_date'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'social_links' => 'array',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'email_verification_code_expires_at' => 'datetime',
            'accessible_courses' => 'array',
            'last_login_date' => 'date',
        ];
    }

    /**
     * Get user's full name
     */
    public function getNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get user's roles
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    /**
     * Get user's instructor profile
     */
    public function instructorProfile(): HasOne
    {
        return $this->hasOne(InstructorProfile::class);
    }

    /**
     * Get user's enrollments
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Get user's created courses (if instructor)
     */
    public function createdCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    /**
     * Alias for createdCourses - Get instructor's courses
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    /**
     * Get instructor's specializations (many-to-many)
     */
    public function specializations(): BelongsToMany
    {
        return $this->belongsToMany(Specialization::class, 'instructor_specializations', 'user_id', 'specialization_id')
                    ->withTimestamps();
    }

    /**
     * Get user's reviews
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get user's orders
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get user's certificates
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get user's course access permissions
     */
    public function courseAccess(): HasMany
    {
        return $this->hasMany(CourseUserAccess::class);
    }

    /**
     * Get courses that user has access to (private courses)
     */
    public function accessiblePrivateCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user_access')
                   ->wherePivot(function($query) {
                       $query->whereNull('expires_at')
                             ->orWhere('expires_at', '>', now());
                   })
                   ->withPivot(['granted_at', 'access_reason', 'expires_at']);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->where('permissions', 'like', '%"' . $permission . '"%')
            ->exists();
    }

    /**
     * Assign role to user
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role && !$this->hasRole($roleName)) {
            $this->roles()->attach($role->id);
        }
    }

    /**
     * Remove role from user
     */
    public function removeRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $this->roles()->detach($role->id);
        }
    }

    /**
     * Get user's primary role (first role)
     */
    public function getPrimaryRoleAttribute(): ?Role
    {
        return $this->roles()->first();
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is instructor
     */
    public function isInstructor(): bool
    {
        return $this->hasRole('instructor');
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    /**
     * Scope to filter active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Boot the model - ensure relationships are loaded properly
     */
    protected static function boot()
    {
        parent::boot();
        
        // Add any model events here if needed
    }

    /**
     * Send the email verification notification.
     */
    /**
     * Generate a new email verification code
     */
    public function generateEmailVerificationCode(): string
    {
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $this->update([
            'email_verification_code' => $code,
            'email_verification_code_expires_at' => now()->addMinutes(15), // 15 minutes expiry
        ]);
        
        return $code;
    }
    
    /**
     * Check if the verification code is valid
     */
    public function isValidVerificationCode(string $code): bool
    {
        return $this->email_verification_code === $code 
            && $this->email_verification_code_expires_at 
            && $this->email_verification_code_expires_at->isFuture();
    }
    
    /**
     * Mark email as verified using code
     */
    public function markEmailAsVerifiedWithCode(string $code): bool
    {
        if ($this->isValidVerificationCode($code)) {
            $this->update([
                'email_verified_at' => now(),
                'email_verification_code' => null,
                'email_verification_code_expires_at' => null,
            ]);
            return true;
        }
        return false;
    }

    public function sendEmailVerificationNotification(): void
    {
        // Generate verification code
        $code = $this->generateEmailVerificationCode();

        // Send notification with code
        $this->notify(new CustomVerifyEmail($code));
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Get user's conversations
     */
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
                    ->withPivot(['last_read_at'])
                    ->withTimestamps();
    }

    /**
     * Get user's messages
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get user's login logs
     */
    public function loginLogs(): HasMany
    {
        return $this->hasMany(UserLoginLog::class);
    }

    /**
     * Get user's group (for special students)
     */
    public function userGroup()
    {
        return $this->belongsTo(UserGroup::class, 'user_group_id');
    }

    /**
     * Get assigned sub admin (for special students)
     */
    public function assignedSubAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_sub_admin_id');
    }

    /**
     * Get students assigned to this sub admin
     */
    public function assignedStudents()
    {
        return $this->hasMany(User::class, 'assigned_sub_admin_id')
                   ->where('user_type', 'special');
    }

    /**
     * Check if user is sub admin
     */
    public function isSubAdmin(): bool
    {
        return $this->hasRole('sub_admin');
    }

    /**
     * Check if user is special student
     */
    public function isSpecialStudent(): bool
    {
        return $this->user_type === 'special' && $this->hasRole('student');
    }

    /**
     * Check if user is general student
     */
    public function isGeneralStudent(): bool
    {
        return $this->user_type === 'general' && $this->hasRole('student');
    }

    /**
     * Get courses that special student has direct access to
     */
    public function getAccessibleCoursesAttribute()
    {
        // Always return the raw data properly parsed
        $rawValue = $this->attributes['accessible_courses'] ?? null;
        
        if (is_null($rawValue)) {
            return [];
        }
        
        if (is_array($rawValue)) {
            return $rawValue;
        }
        
        if (is_string($rawValue)) {
            $decoded = json_decode($rawValue, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    /**
     * Check if user can access a specific course
     */
    public function canAccessCourse($courseId)
    {
        $course = Course::find($courseId);
        
        if (!$course || $course->status !== 'published') {
            return false;
        }

        // Public courses are accessible to everyone
        if ($course->access_type === 'public') {
            return true;
        }

        // Check if user has enrollment for this course
        if ($this->enrollments()->where('course_id', $courseId)->exists()) {
            return true;
        }

        // Check private course access
        if ($course->access_type === 'private') {
            $hasAccess = CourseUserAccess::where('user_id', $this->id)
                ->where('course_id', $courseId)
                ->where(function($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
                })
                ->exists();
                
            if ($hasAccess) {
                return true;
            }
        }

        // Check special student direct access
        if ($this->isSpecialStudent()) {
            return in_array($courseId, $this->accessible_courses);
        }

        return false;
    }

    /**
     * Get all courses accessible to this user (without enrollment)
     */
    public function getAccessibleCourses()
    {
        $courseIds = collect();

        // Add public courses
        $publicCourses = Course::where('status', 'published')
            ->where('access_type', 'public')
            ->pluck('id');
        $courseIds = $courseIds->merge($publicCourses);

        // Add private courses user has access to
        $privateCourses = CourseUserAccess::where('user_id', $this->id)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->pluck('course_id');
        $courseIds = $courseIds->merge($privateCourses);

        // Add special student courses
        if ($this->isSpecialStudent()) {
            $courseIds = $courseIds->merge($this->accessible_courses);
        }

        return Course::whereIn('id', $courseIds->unique())
            ->where('status', 'published')
            ->get();
    }
}