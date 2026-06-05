<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'sort_order',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'section_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'section_id');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'section_id');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class, 'section_id');
    }
}
