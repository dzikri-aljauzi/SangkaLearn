<?php
// app/Models/InstructorProfile.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'headline',
        'biography',
        'specializations',
        'certifications',
        'rating',
        'total_students',
        'total_courses',
        'total_revenue',
        'payment_methods',
        'is_verified',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'specializations' => 'array',
            'certifications' => 'array',
            'payment_methods' => 'array',
            'rating' => 'decimal:2',
            'total_revenue' => 'decimal:2',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}