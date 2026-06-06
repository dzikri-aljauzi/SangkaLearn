<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alumni extends Model
{
    use HasFactory;

    protected $table = 'alumni';

    protected $fillable = [
        'user_id',
        'certificate_queue_id',
        'name',
        'program',
        'company',
        'job_title',
        'photo',
        'testimonial',
        'linkedin_url',
        'is_active',
        'sort_order',
    ];

    /**
     * Get the user associated with this alumni
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the certificate queue associated with this alumni
     */
    public function certificateQueue()
    {
        return $this->belongsTo(CertificateQueue::class);
    }

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active alumni
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered alumni
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    /**
     * Get the initial for avatar
     */
    public function getInitialAttribute()
    {
        return strtoupper(substr($this->name, 0, 1));
    }
}
