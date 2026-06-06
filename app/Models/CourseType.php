<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CourseType extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($courseType) {
            if (empty($courseType->slug)) {
                $courseType->slug = Str::slug($courseType->name);
            }
        });

        static::updating(function ($courseType) {
            if ($courseType->isDirty('name') && empty($courseType->slug)) {
                $courseType->slug = Str::slug($courseType->name);
            }
        });
    }

    /**
     * Get courses with this type
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Get active courses with this type
     */
    public function activeCourses(): HasMany
    {
        return $this->courses()->where('status', 'published');
    }

    /**
     * Scope to get only active types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by custom order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('name', 'asc');
    }

    /**
     * Get parent category
     */
    public function parent()
    {
        return $this->belongsTo(CourseType::class, 'parent_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(CourseType::class, 'parent_id');
    }

    /**
     * Get active children
     */
    public function activeChildren(): HasMany
    {
        return $this->children()->where('is_active', true);
    }

    /**
     * Scope to get only parent categories (no parent_id)
     */
    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get only child categories (has parent_id)
     */
    public function scopeChildren($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Check if this is a parent category
     */
    public function isParent(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if this is a child category
     */
    public function isChild(): bool
    {
        return !is_null($this->parent_id);
    }
}
