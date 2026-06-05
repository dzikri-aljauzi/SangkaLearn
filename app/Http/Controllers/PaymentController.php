<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Course;
use App\Services\MidtransService;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Create payment transaction for GoPay (both regular GoPay and QRIS)
     */
    public function createGoPayPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'billing_details' => 'required|array'
            ]);

            $paymentType = $request->payment_method; // gopay or gopay_qris

            Log::info('GoPay Payment Request', [
                'user_id' => auth()->id(),
                'payment_method' => $paymentType,
                'total' => $request->total,
                'items_count' => count($request->items)
            ]);

            DB::beginTransaction();
            
            try {
                // Generate order number with appropriate prefix
                $prefix = $paymentType === 'gopay_qris' ? 'QRIS' : 'GOPAY';
                $orderNumber = $prefix . '-' . time() . '-' . str_pad(auth()->id(), 4, '0', STR_PAD_LEFT);
                
                // Create Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'subtotal' => $request->total,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $request->total,
                    'currency' => 'IDR',
                    'billing_details' => $request->billing_details
                ]);

                // Create Order Items
                foreach ($request->items as $item) {
                    $courseId = $item['course']['id'] ?? $item['id'];
                    $courseTitle = $item['course']['title'] ?? 'Course';
                    $coursePrice = $item['course']['final_price'] ?? $item['price'] ?? 0;
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $courseId,
                        'course_title' => $courseTitle,
                        'price' => $coursePrice,
                        'unit_price' => $coursePrice,
                        'quantity' => 1,
                        'discount_amount' => 0,
                        'total_price' => $coursePrice,
                    ]);
                }

                // Create Midtrans transaction using gopay method
                $midtransResponse = $this->midtransService->createTransaction($order, 'gopay');

                DB::commit();

                return response()->json([
                    'success' => true,
                    'snap_token' => $midtransResponse['snap_token'],
                    'order_id' => $order->order_number,
                    'payment_id' => $midtransResponse['payment']->id,
                    'total' => $request->total,
                    'payment_method' => $paymentType,
                    'redirect_url' => config('midtrans.is_production') 
                        ? 'https://app.midtrans.com/snap/v1/transactions/' . $midtransResponse['snap_token']
                        : 'https://app.sandbox.midtrans.com/snap/v1/transactions/' . $midtransResponse['snap_token'],
                    'message' => 'GoPay payment created successfully'
                ]);
                
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('GoPay Payment Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create QRIS payment using Midtrans Charge API
     */
    public function createQRISPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'billing_details' => 'required|array',
                'acquirer' => 'nullable|string|in:gopay,airpay shopee'
            ]);

            $acquirer = $request->acquirer ?? 'gopay'; // Default to gopay

            Log::info('QRIS Payment Request via Charge API', [
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'acquirer' => $acquirer,
                'total' => $request->total,
                'items_count' => count($request->items)
            ]);

            DB::beginTransaction();

            try {
                // Generate order number with QRIS prefix
                $orderNumber = 'QRIS-' . time() . '-' . str_pad(auth()->id(), 4, '0', STR_PAD_LEFT);

                // Create Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'subtotal' => $request->total,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $request->total,
                    'currency' => 'IDR',
                    'billing_details' => $request->billing_details
                ]);

                // Create Order Items
                foreach ($request->items as $item) {
                    $courseId = $item['course']['id'] ?? $item['id'];
                    $courseTitle = $item['course']['title'] ?? 'Course';
                    $coursePrice = $item['course']['final_price'] ?? $item['price'] ?? 0;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $courseId,
                        'course_title' => $courseTitle,
                        'price' => $coursePrice,
                        'unit_price' => $coursePrice,
                        'quantity' => 1,
                        'discount_amount' => 0,
                        'total_price' => $coursePrice,
                    ]);
                }

                // Create QRIS payment using Charge API
                $qrisResponse = $this->midtransService->createQRISPayment($order, $acquirer);

                DB::commit();

                Log::info('QRIS payment created successfully', [
                    'order_id' => $order->order_number,
                    'payment_id' => $qrisResponse['payment']->id,
                    'qr_format' => $qrisResponse['qr_format'],
                    'acquirer' => $acquirer
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $order->order_number,
                    'payment_id' => $qrisResponse['payment']->id,
                    'total' => $request->total,
                    'qr_code_url' => $qrisResponse['qr_code_url'],
                    'qr_code_url_v1' => $qrisResponse['qr_code_url_v1'],
                    'qr_code_url_v2' => $qrisResponse['qr_code_url_v2'],
                    'qr_format' => $qrisResponse['qr_format'],
                    'transaction_id' => $qrisResponse['transaction_id'],
                    'transaction_status' => $qrisResponse['transaction_status'],
                    'acquirer' => $acquirer,
                    'payment_method' => 'qris',
                    'message' => 'QRIS payment created successfully. Scan QR code to pay.'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('QRIS Payment Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create QRIS payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create ShopeePay payment transaction
     */
    public function createShopeePayPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'billing_details' => 'required|array'
            ]);

            Log::info('ShopeePay Payment Request via Charge API', [
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'total' => $request->total,
                'items_count' => count($request->items)
            ]);

            DB::beginTransaction();

            try {
                // Generate order number with SHOPEEPAY prefix
                $orderNumber = 'SHOPEEPAY-' . time() . '-' . str_pad(auth()->id(), 4, '0', STR_PAD_LEFT);

                // Create Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'subtotal' => $request->total,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $request->total,
                    'currency' => 'IDR',
                    'billing_details' => $request->billing_details
                ]);

                // Create Order Items
                foreach ($request->items as $item) {
                    $courseId = $item['course']['id'] ?? $item['id'];
                    $courseTitle = $item['course']['title'] ?? 'Course';
                    $coursePrice = $item['course']['final_price'] ?? $item['price'] ?? 0;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $courseId,
                        'course_title' => $courseTitle,
                        'price' => $coursePrice,
                        'quantity' => 1,
                        'unit_price' => $coursePrice,
                        'discount_amount' => 0,
                        'total_price' => $coursePrice
                    ]);
                }

                // Create ShopeePay payment via Midtrans Charge API
                $shopeePayResponse = $this->midtransService->createShopeePayPayment($order);

                DB::commit();

                Log::info('ShopeePay payment created successfully', [
                    'order_id' => $order->order_number,
                    'payment_id' => $shopeePayResponse['payment']->id,
                    'deeplink_url' => $shopeePayResponse['deeplink_url']
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $order->order_number,
                    'payment_id' => $shopeePayResponse['payment']->id,
                    'total' => $request->total,
                    'deeplink_url' => $shopeePayResponse['deeplink_url'],
                    'transaction_id' => $shopeePayResponse['transaction_id'],
                    'transaction_status' => $shopeePayResponse['transaction_status'],
                    'payment_method' => 'shopeepay',
                    'message' => 'ShopeePay payment created successfully. Redirecting to ShopeePay app...'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('ShopeePay Payment Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create ShopeePay payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create DANA payment transaction
     */
    public function createDANAPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'billing_details' => 'required|array'
            ]);

            Log::info('DANA Payment Request via Charge API', [
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'total' => $request->total,
                'items_count' => count($request->items)
            ]);

            DB::beginTransaction();

            try {
                // Generate order number with DANA prefix
                $orderNumber = 'DANA-' . time() . '-' . str_pad(auth()->id(), 4, '0', STR_PAD_LEFT);

                // Create Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'subtotal' => $request->total,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $request->total,
                    'currency' => 'IDR',
                    'billing_details' => $request->billing_details
                ]);

                // Create Order Items
                foreach ($request->items as $item) {
                    $courseId = $item['course']['id'] ?? $item['id'];
                    $courseTitle = $item['course']['title'] ?? 'Course';
                    $coursePrice = $item['course']['final_price'] ?? $item['price'] ?? 0;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $courseId,
                        'course_title' => $courseTitle,
                        'price' => $coursePrice,
                        'quantity' => 1,
                        'unit_price' => $coursePrice,
                        'discount_amount' => 0,
                        'total_price' => $coursePrice
                    ]);
                }

                // Create DANA payment via Midtrans Snap API
                $danaResponse = $this->midtransService->createDANAPayment($order);

                DB::commit();

                Log::info('DANA payment created successfully', [
                    'order_id' => $order->order_number,
                    'payment_id' => $danaResponse['payment']->id,
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $order->order_number,
                    'payment_id' => $danaResponse['payment']->id,
                    'total' => $request->total,
                    'snap_token' => $danaResponse['snap_token'],
                    'payment_method' => 'dana',
                    'message' => 'DANA payment created successfully.'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('DANA Payment Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create DANA payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create Static QRIS payment transaction
     */
    public function createStaticQRISPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'billing_details' => 'required|array'
            ]);

            Log::info('Static QRIS Payment Request', [
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method,
                'total' => $request->total,
                'items_count' => count($request->items)
            ]);

            DB::beginTransaction();
            
            try {
                // Generate order number
                $orderNumber = 'STATIC-QRIS-' . time() . '-' . str_pad(auth()->id(), 4, '0', STR_PAD_LEFT);
                
                // Create Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'status' => 'pending',
                    'subtotal' => $request->total,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $request->total,
                    'currency' => 'IDR',
                    'billing_details' => $request->billing_details
                ]);

                // Create Order Items
                foreach ($request->items as $item) {
                    $courseId = $item['course']['id'] ?? $item['id'];
                    $courseTitle = $item['course']['title'] ?? 'Course';
                    $coursePrice = $item['course']['final_price'] ?? $item['price'] ?? 0;
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $courseId,
                        'course_title' => $courseTitle,
                        'price' => $coursePrice,
                        'unit_price' => $coursePrice,
                        'quantity' => 1,
                        'discount_amount' => 0,
                        'total_price' => $coursePrice,
                    ]);
                }

                // Create payment record for static QRIS
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'user_id' => auth()->id(),
                    'payment_method' => 'static_qris',
                    'transaction_id' => $orderNumber,
                    'status' => 'pending',
                    'amount' => $request->total,
                    'currency' => 'IDR',
                    'payment_details' => [
                        'order_id' => $orderNumber,
                        'payment_type' => 'static_qris',
                        'qr_image_path' => 'images/staticqris.pdf',
                        'transaction_status' => 'pending',
                        'created_at' => now()->toISOString(),
                        'expected_amount' => $request->total
                    ]
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'order_id' => $orderNumber,
                    'payment_id' => $payment->id,
                    'total' => $request->total,
                    'qr_image_path' => '/images/staticqris.pdf',
                    'transaction_status' => 'pending',
                    'payment_type' => 'static_qris',
                    'expected_amount' => $request->total,
                    'message' => 'Static QRIS payment created successfully. Silakan scan QR Code dan transfer sesuai jumlah yang tercantum.'
                ]);
                
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Static QRIS Payment Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Static QRIS payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm Static QRIS payment manually
     */
    public function confirmStaticQRISPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'payment_id' => 'required|exists:payments,id',
                'amount_paid' => 'required|numeric|min:0'
            ]);

            $payment = Payment::with('order.items')->findOrFail($request->payment_id);

            // Verify payment method is static QRIS
            if ($payment->payment_method !== 'static_qris') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment method'
                ], 400);
            }

            // Verify payment belongs to current user
            if ($payment->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if already processed
            if ($payment->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment already processed',
                    'current_status' => $payment->status
                ], 400);
            }

            DB::beginTransaction();

            try {
                $expectedAmount = $payment->amount;
                $amountPaid = $request->amount_paid;

                // Validate amount (allow small tolerance for rounding)
                $tolerance = 1.00; // 1 IDR tolerance
                if (abs($expectedAmount - $amountPaid) > $tolerance) {
                    // Payment amount doesn't match
                    $payment->update([
                        'status' => 'failed',
                        'payment_details' => array_merge($payment->payment_details, [
                            'failure_reason' => 'amount_mismatch',
                            'expected_amount' => $expectedAmount,
                            'paid_amount' => $amountPaid,
                            'difference' => $expectedAmount - $amountPaid,
                            'failed_at' => now()->toISOString()
                        ])
                    ]);

                    DB::commit();

                    return response()->json([
                        'success' => false,
                        'message' => 'Jumlah pembayaran tidak sesuai. Expected: ' . number_format($expectedAmount, 0, ',', '.') . ', Paid: ' . number_format($amountPaid, 0, ',', '.'),
                        'expected_amount' => $expectedAmount,
                        'paid_amount' => $amountPaid,
                        'status' => 'failed'
                    ], 400);
                }

                // Payment amount is correct, mark as completed
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'payment_details' => array_merge($payment->payment_details, [
                        'confirmed_at' => now()->toISOString(),
                        'confirmed_amount' => $amountPaid,
                        'transaction_status' => 'settlement'
                    ])
                ]);

                // Update order status
                $payment->order->update(['status' => 'completed']);

                // Handle course enrollment
                $this->handleCourseEnrollment($payment);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Pembayaran berhasil dikonfirmasi! Anda telah terdaftar di course.',
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order->order_number,
                    'amount_paid' => $amountPaid,
                    'status' => 'completed',
                    'courses_enrolled' => $payment->order->items->pluck('course_title')->toArray()
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Static QRIS Payment Confirmation Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle payment notification from Midtrans
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            // Log raw notification data
            Log::info('Raw Midtrans Notification Received', [
                'ip' => $request->ip(),
                'payload' => $request->all()
            ]);

            $notification = new \Midtrans\Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type;

            Log::info('Payment Notification Received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $paymentType
            ]);

            // FIXED: Search by transaction_id (order_number), not order_id (foreign key)
            $payment = Payment::where('transaction_id', $orderId)->first();

            if (!$payment) {
                // Try alternative search methods
                $payment = Payment::whereHas('order', function($query) use ($orderId) {
                    $query->where('order_number', $orderId);
                })->first();

                if (!$payment) {
                    Log::error('Payment not found for order', [
                        'order_id' => $orderId,
                        'searched_transaction_id' => true,
                        'searched_order_number' => true
                    ]);
                    return response()->json(['status' => 'error', 'message' => 'Payment not found'], 404);
                }
            }

            DB::transaction(function () use ($payment, $transactionStatus, $fraudStatus, $paymentType, $notification) {
                // Update payment status based on transaction status
                switch ($transactionStatus) {
                    case 'capture':
                        if ($paymentType == 'credit_card') {
                            $status = $fraudStatus == 'challenge' ? 'pending' : 'completed';
                        } else {
                            $status = 'completed';
                        }
                        break;
                    
                    case 'settlement':
                        $status = 'completed';
                        $payment->paid_at = now();
                        break;
                    
                    case 'pending':
                        $status = 'pending';
                        break;
                    
                    case 'deny':
                    case 'expire':
                    case 'cancel':
                        $status = 'failed';
                        break;
                    
                    default:
                        $status = 'pending';
                        break;
                }

                $payment->update([
                    'status' => $status,
                    'transaction_id' => $notification->transaction_id ?? null,
                    'payment_details' => array_merge($payment->payment_details ?? [], [
                        'transaction_status' => $transactionStatus,
                        'payment_type' => $paymentType,
                        'settlement_time' => $notification->settlement_time ?? null,
                        'gross_amount' => $notification->gross_amount ?? null
                    ])
                ]);

                // If payment is completed, handle course enrollment
                if ($status === 'completed') {
                    Log::info('Payment completed, initiating enrollment', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order->order_number ?? 'unknown',
                        'user_id' => $payment->user_id
                    ]);
                    $this->handleCourseEnrollment($payment);
                }
            });

            Log::info('Payment notification processed successfully', [
                'order_id' => $orderId,
                'payment_status' => $payment->status,
                'enrollment_triggered' => $payment->status === 'completed'
            ]);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Payment notification error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(Request $request): JsonResponse
    {
        try {
            $orderId = $request->order_id;
            
            // Search payment by Midtrans order ID (stored in JSON field)
            $payment = Payment::whereJsonContains('payment_details->midtrans_order_id', $orderId)
                ->orWhereHas('order', function($query) use ($orderId) {
                    $query->where('order_number', $orderId);
                })
                ->first();

            if (!$payment) {
                Log::warning('Payment not found for order_id', [
                    'order_id' => $orderId,
                    'search_method' => 'JSON + order_number'
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            // Use Custom Midtrans Client for status check - use midtrans_order_id, not our internal order_id
            $midtransOrderId = $payment->payment_details['midtrans_order_id'] ?? $orderId;
            
            $customClient = new \App\Services\CustomMidtransClient();
            $status = $customClient->getTransactionStatus($midtransOrderId);

            return response()->json([
                'success' => true,
                'payment_status' => $payment->status,
                'transaction_status' => $status['transaction_status'] ?? 'unknown',
                'payment_type' => $status['payment_type'] ?? null,
                'gross_amount' => $status['gross_amount'] ?? null,
                'payment_id' => $payment->id,
                'order_id' => $orderId
            ]);

        } catch (\Exception $e) {
            Log::error('Check payment status error: ' . $e->getMessage(), [
                'order_id' => $orderId ?? 'unknown'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check payment status'
            ], 500);
        }
    }

    /**
     * Handle course enrollment after successful payment
     */
    private function handleCourseEnrollment(Payment $payment): void
    {
        try {
            // Load payment with order and order items
            $payment->load('order.items');

            if (!$payment->order || !$payment->order->items) {
                Log::warning('No order or order items found for payment', [
                    'payment_id' => $payment->id
                ]);
                return;
            }

            $enrollmentCount = 0;
            $skippedCount = 0;

            foreach ($payment->order->items as $orderItem) {
                // Check if user is already enrolled
                $existingEnrollment = DB::table('enrollments')
                    ->where('user_id', $payment->user_id)
                    ->where('course_id', $orderItem->course_id)
                    ->first();

                if (!$existingEnrollment) {
                    DB::table('enrollments')->insert([
                        'user_id' => $payment->user_id,
                        'course_id' => $orderItem->course_id,
                        'order_id' => $payment->order_id,
                        'enrolled_at' => now(),
                        'status' => 'active',
                        'payment_id' => $payment->id,
                        'enrollment_type' => 'purchase',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    $enrollmentCount++;

                    Log::info('User enrolled in course successfully', [
                        'user_id' => $payment->user_id,
                        'course_id' => $orderItem->course_id,
                        'order_id' => $payment->order_id,
                        'payment_id' => $payment->id,
                        'enrollment_type' => 'purchase'
                    ]);
                } else {
                    $skippedCount++;
                    Log::info('User already enrolled in course, skipping', [
                        'user_id' => $payment->user_id,
                        'course_id' => $orderItem->course_id
                    ]);
                }
            }

            Log::info('Course enrollment completed', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order->order_number,
                'total_items' => $payment->order->items->count(),
                'new_enrollments' => $enrollmentCount,
                'already_enrolled' => $skippedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Course enrollment error: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Generate QRIS QR Code for direct display
     */
    public function generateQRCode(Request $request): JsonResponse
    {
        try {
            $orderId = $request->order_id;
            
            Log::info('QR Code generation requested', [
                'order_id' => $orderId
            ]);
            
            // Search payment by Midtrans order ID (stored in JSON field)
            $payment = Payment::whereJsonContains('payment_details->midtrans_order_id', $orderId)
                ->orWhereHas('order', function($query) use ($orderId) {
                    $query->where('order_number', $orderId);
                })
                ->first();

            if (!$payment) {
                Log::warning('Payment not found for QR generation', [
                    'order_id' => $orderId,
                    'search_method' => 'JSON + order_number'
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            // Check if QR code URL exists in payment details
            $paymentDetails = $payment->payment_details ?? [];
            $qrCodeUrl = $paymentDetails['qr_code_url'] ?? null;
            
            Log::info('QR Code generation request', [
                'payment_id' => $payment->id,
                'order_id' => $orderId,
                'payment_status' => $payment->status,
                'has_qr_code_url' => !empty($qrCodeUrl),
                'payment_details_keys' => array_keys($paymentDetails)
            ]);
            
            if ($qrCodeUrl) {
                // QR code URL is available from payment creation
                return response()->json([
                    'success' => true,
                    'qr_string' => $qrCodeUrl,
                    'payment_status' => $payment->status,
                    'payment_id' => $payment->id,
                    'order_id' => $orderId,
                    'message' => 'QR code ready',
                    'qr_generation_method' => 'direct_url'
                ]);
            }

            // Fallback: Try to get QR code from actions
            $actions = $paymentDetails['actions'] ?? [];
            if (is_array($actions)) {
                foreach ($actions as $action) {
                    if (isset($action['name']) && $action['name'] === 'generate-qr-code') {
                        return response()->json([
                            'success' => true,
                            'qr_string' => $action['url'],
                            'payment_status' => $payment->status,
                            'payment_id' => $payment->id,
                            'order_id' => $orderId,
                            'message' => 'QR code ready from actions',
                            'qr_generation_method' => 'actions'
                        ]);
                    }
                }
            }

            // Fallback: Use snap token and try to get QR from transaction status
            $snapToken = $paymentDetails['snap_token'] ?? null;
            if ($snapToken) {
                Log::info('Using snap token for QR generation', [
                    'payment_id' => $payment->id,
                    'order_id' => $orderId,
                    'method' => $paymentDetails['method'] ?? 'unknown'
                ]);

                // Try to get QR code URL from transaction status
                try {
                    $customClient = new \App\Services\CustomMidtransClient();
                    $transactionStatus = $customClient->getTransactionStatus($orderId);
                    
                    // Look for QR code in actions
                    if (isset($transactionStatus['actions']) && is_array($transactionStatus['actions'])) {
                        foreach ($transactionStatus['actions'] as $action) {
                            if (isset($action['name']) && $action['name'] === 'generate-qr-code') {
                                return response()->json([
                                    'success' => true,
                                    'qr_string' => $action['url'],
                                    'payment_status' => $payment->status,
                                    'payment_id' => $payment->id,
                                    'order_id' => $orderId,
                                    'message' => 'QR code ready from transaction status',
                                    'qr_generation_method' => 'transaction_status'
                                ]);
                            }
                        }
                    }
                } catch (\Exception $statusError) {
                    Log::warning('Failed to get transaction status for QR', [
                        'order_id' => $orderId,
                        'error' => $statusError->getMessage()
                    ]);
                }

                // Final fallback: return snap token for client-side handling
                return response()->json([
                    'success' => true,
                    'qr_string' => $snapToken,
                    'payment_status' => $payment->status,
                    'payment_id' => $payment->id,
                    'order_id' => $orderId,
                    'message' => 'Using snap token for QR display',
                    'qr_generation_method' => 'snap_token_fallback',
                    'snap_url' => "https://" . (config('midtrans.is_production') ? 'app.midtrans.com' : 'app.sandbox.midtrans.com') . "/snap/v3/redirection/" . $snapToken
                ]);
            }

            // No QR code available
            Log::warning('QR code not available for payment', [
                'payment_id' => $payment->id,
                'order_id' => $orderId,
                'payment_details' => $paymentDetails
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'QR code not available for this payment',
                'payment_status' => $payment->status,
                'debug_info' => [
                    'has_qr_code_url' => !empty($qrCodeUrl),
                    'has_snap_token' => !empty($snapToken),
                    'actions_count' => count($actions),
                    'payment_details_keys' => array_keys($paymentDetails)
                ]
            ], 404);

        } catch (\Exception $e) {
            Log::error('QR Code generation error: ' . $e->getMessage(), [
                'order_id' => $orderId ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Midtrans connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->midtransService->testConnection();
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Midtrans connection test failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
