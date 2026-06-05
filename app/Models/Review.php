<?php
// app/Models/Review.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'reviewable_type', 'reviewable_id', 'rating',
        'title', 'content', 'pros', 'cons', 'is_verified_purchase',
        'is_approved', 'is_featured'
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:2',
            'pros' => 'array',
            'cons' => 'array',
            'is_verified_purchase' => 'boolean',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewable()
    {
        return $this->morphTo();
    }
}