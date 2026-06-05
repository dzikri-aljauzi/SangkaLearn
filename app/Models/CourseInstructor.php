<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseInstructor extends Model
{
    protected $table = 'course_instructors';

    protected $fillable = [
        'course_id',
        'instructor_id',
        'role',
        'revenue_share',
    ];

    protected $casts = [
        'revenue_share' => 'decimal:2',
    ];

    /**
     * Get the course that this instructor is assigned to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the instructor (user) for this assignment.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Scope to get primary instructors only.
     */
    public function scopePrimary($query)
    {
        return $query->where('role', 'primary');
    }

    /**
     * Scope to get secondary instructors only.
     */
    public function scopeSecondary($query)
    {
        return $query->where('role', 'secondary');
    }
}
