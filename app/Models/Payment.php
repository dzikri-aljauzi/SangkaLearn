<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'payment_method',
        'transaction_id',
        'payment_intent_id',
        'status',
        'amount',
        'confirmed_amount',
        'currency',
        'payment_details',
        'refund_details',
        'paid_at',
        'confirmed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_amount' => 'decimal:2',
        'payment_details' => 'array',
        'refund_details' => 'array',
        'paid_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if payment is static QRIS
     */
    public function isStaticQris(): bool
    {
        return $this->payment_method === 'static_qris';
    }

    /**
     * Check if payment is manually confirmed
     */
    public function isManuallyConfirmed(): bool
    {
        return $this->confirmed_at !== null && $this->confirmed_amount !== null;
    }

    /**
     * Get the effective amount (confirmed amount for static QRIS, regular amount otherwise)
     */
    public function getEffectiveAmount(): float
    {
        return $this->isStaticQris() && $this->confirmed_amount 
            ? (float) $this->confirmed_amount 
            : (float) $this->amount;
    }

    /**
     * Check if payment amount matches expected amount within tolerance
     */
    public function isAmountValid(float $paidAmount, float $tolerance = 1.00): bool
    {
        return abs((float) $this->amount - $paidAmount) <= $tolerance;
    }
}
