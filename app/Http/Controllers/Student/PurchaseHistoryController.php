<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseHistoryController extends Controller
{
    /**
     * Display purchase history for the authenticated student
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Base query - only orders that have payments
        $query = Order::with([
            'items.course.category',
            'payments' => function($query) {
                $query->latest();
            },
            'enrollments'
        ])
        ->where('user_id', $user->id)
        ->whereHas('payments'); // Only orders with payments

        // Filter by status
        $status = $request->input('status', 'all');
        if ($status !== 'all') {
            $query->whereHas('payments', function($q) use ($status) {
                switch ($status) {
                    case 'success':
                        $q->whereIn('status', ['paid', 'completed']);
                        break;
                    case 'pending':
                        $q->where('status', 'pending');
                        break;
                    case 'failed':
                        $q->whereIn('status', ['failed', 'expired', 'cancelled']);
                        break;
                }
            });
        }

        // Search by course name
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('items.course', function($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%");
            });
        }

        // Sort
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'price_high':
                $query->orderBy('total_amount', 'desc');
                break;
            case 'price_low':
                $query->orderBy('total_amount', 'asc');
                break;
            default: // newest
                $query->latest();
                break;
        }

        // Paginate
        $purchases = $query->paginate(12)->through(function ($order) {
            $latestPayment = $order->payments->first();

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'date' => $order->created_at->format('d M Y'),
                'formatted_date' => $order->created_at->format('d F Y, H:i'),
                'total_amount' => $order->total_amount,
                'formatted_price' => 'Rp ' . number_format($order->total_amount, 0, ',', '.'),
                'status' => $latestPayment ? $latestPayment->status : 'pending',
                'status_label' => $this->getStatusLabel($latestPayment),
                'status_color' => $this->getStatusColor($latestPayment),
                'payment_method' => $this->formatPaymentMethod($latestPayment),
                'courses' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->course->id,
                        'title' => $item->course->title,
                        'slug' => $item->course->slug,
                        'thumbnail' => $item->course->thumbnail
                            ? asset('storage/' . $item->course->thumbnail)
                            : asset('images/default-course.jpg'),
                        'category' => $item->course->category->name ?? 'Uncategorized',
                        'price' => $item->price,
                        'formatted_price' => 'Rp ' . number_format($item->price, 0, ',', '.'),
                    ];
                }),
                'courses_count' => $order->items->count(),
                'has_enrollment' => $order->enrollments->isNotEmpty(),
            ];
        });

        return Inertia::render('Student/PurchaseHistory', [
            'purchases' => $purchases,
            'filters' => [
                'status' => $status,
                'search' => $request->input('search', ''),
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Show purchase detail
     */
    public function show($id)
    {
        $user = auth()->user();

        $order = Order::with([
            'items.course.category',
            'payments' => function($query) {
                $query->latest();
            },
            'enrollments.course',
            'user'
        ])
        ->where('user_id', $user->id)
        ->findOrFail($id);

        $latestPayment = $order->payments->first();

        $detail = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'date' => $order->created_at->format('d M Y, H:i'),
            'formatted_date' => $order->created_at->format('d F Y, H:i:s'),

            // Amounts
            'subtotal' => $order->subtotal,
            'formatted_subtotal' => 'Rp ' . number_format($order->subtotal, 0, ',', '.'),
            'discount_amount' => $order->discount_amount ?? 0,
            'formatted_discount' => 'Rp ' . number_format($order->discount_amount ?? 0, 0, ',', '.'),
            'tax_amount' => $order->tax_amount ?? 0,
            'formatted_tax' => 'Rp ' . number_format($order->tax_amount ?? 0, 0, ',', '.'),
            'total_amount' => $order->total_amount,
            'formatted_total' => 'Rp ' . number_format($order->total_amount, 0, ',', '.'),

            // Payment info
            'payment_method' => $this->formatPaymentMethod($latestPayment),
            'payment_method_raw' => $latestPayment?->payment_method,
            'transaction_id' => $latestPayment?->transaction_id,
            'status' => $latestPayment?->status ?? 'pending',
            'status_label' => $this->getStatusLabel($latestPayment),
            'status_color' => $this->getStatusColor($latestPayment),
            'paid_at' => $latestPayment?->paid_at?->format('d F Y, H:i:s'),
            'confirmed_at' => $latestPayment?->confirmed_at?->format('d F Y, H:i:s'),

            // Courses
            'courses' => $order->items->map(function ($item) use ($order) {
                $enrollment = $order->enrollments->firstWhere('course_id', $item->course_id);

                return [
                    'id' => $item->course->id,
                    'title' => $item->course->title,
                    'slug' => $item->course->slug,
                    'thumbnail' => $item->course->thumbnail
                        ? asset('storage/' . $item->course->thumbnail)
                        : asset('images/default-course.jpg'),
                    'category' => $item->course->category->name ?? 'Uncategorized',
                    'price' => $item->price,
                    'formatted_price' => 'Rp ' . number_format($item->price, 0, ',', '.'),
                    'is_enrolled' => $enrollment !== null,
                    'enrolled_at' => $enrollment?->created_at?->format('d M Y'),
                ];
            }),

            // User info
            'buyer_name' => $order->user->name,
            'buyer_email' => $order->user->email,

            // Additional info
            'has_enrollment' => $order->enrollments->isNotEmpty(),
            'payment_proof' => $latestPayment?->payment_proof
                ? asset('storage/' . $latestPayment->payment_proof)
                : null,
        ];

        return response()->json($detail);
    }

    /**
     * Get status label for display
     */
    private function getStatusLabel($payment)
    {
        if (!$payment) {
            return 'Pending';
        }

        return match($payment->status) {
            'paid', 'completed' => 'Success / Paid',
            'pending' => 'Pending',
            'failed' => 'Failed',
            'expired' => 'Expired',
            'cancelled' => 'Cancelled',
            default => ucfirst($payment->status),
        };
    }

    /**
     * Get status color for badge
     */
    private function getStatusColor($payment)
    {
        if (!$payment) {
            return 'yellow';
        }

        return match($payment->status) {
            'paid', 'completed' => 'green',
            'pending' => 'yellow',
            'failed', 'expired', 'cancelled' => 'red',
            default => 'gray',
        };
    }

    /**
     * Format payment method for display
     */
    private function formatPaymentMethod($payment)
    {
        if (!$payment || !$payment->payment_method) {
            return 'Not specified';
        }

        return match($payment->payment_method) {
            'qris' => 'QRIS',
            'static_qris' => 'QRIS (Static)',
            'bank_transfer' => 'Bank Transfer',
            'credit_card' => 'Credit Card',
            'gopay' => 'GoPay',
            'shopeepay' => 'ShopeePay',
            'dana' => 'DANA',
            'ovo' => 'OVO',
            'bca_va' => 'BCA Virtual Account',
            'bni_va' => 'BNI Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'mandiri_va' => 'Mandiri Virtual Account',
            'permata_va' => 'Permata Virtual Account',
            default => ucwords(str_replace('_', ' ', $payment->payment_method)),
        };
    }
}
