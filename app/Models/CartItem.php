<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'price',
        'coupon_id',
        'discount_amount',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'course_id' => 'integer',
        'price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course for this cart item.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
