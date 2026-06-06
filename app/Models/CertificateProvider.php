<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CertificateProvider extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'code',
        'color',
        'logo',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Scope untuk provider yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk sorting berdasarkan order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    /**
     * Get courses using this certificate provider
     */
    public function courses()
    {
        return $this->hasMany(Course::class, 'certificate_provider_id');
    }
}
