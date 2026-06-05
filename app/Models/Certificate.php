<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'learning_path_id',
        'certificate_number',
        'title',
        'description',
        'template',
        'issued_at',
        'expires_at',
        'is_valid',
        'verification_url',
        'certificate_file',
        'grade',
        'completion_percentage',
        'verification_code',
        'is_revoked',
        'revoked_at',
        'revoked_reason',
        'certificate_url',
        'metadata'
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'is_revoked' => 'boolean',
        'is_valid' => 'boolean',
        'metadata' => 'array',
        'completion_percentage' => 'decimal:2'
    ];

    /**
     * Get the user that owns the certificate.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course associated with the certificate.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the learning path associated with the certificate.
     */
    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class);
    }

    /**
     * Check if certificate is valid (not revoked and not expired).
     */
    public function isValid(): bool
    {
        if ($this->is_revoked) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Generate certificate verification URL.
     */
    public function getVerificationUrl(): string
    {
        // Temporary fix - return a simple verification URL format
        return url("/certificates/verify/{$this->verification_code}");
    }

    /**
     * Generate certificate download URL.
     */
    public function getDownloadUrl(): string
    {
        // Use student route for downloads
        return route('student.certificates.download', $this);
    }
}
