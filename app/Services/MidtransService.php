<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use App\Services\CustomMidtransClient;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\CartItem;
use App\Notifications\PaymentSuccessful;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        $this->configureMidtrans();
    }

    private function configureMidtrans()
    {
        // Use midtrans config instead of services config
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
        
        // Configure CURL options for SSL - more permissive for development
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYHOST => config('midtrans.curl_options.ssl_verify_host', 0),
            CURLOPT_SSL_VERIFYPEER => config('midtrans.curl_options.ssl_verify_peer', false),
            CURLOPT_TIMEOUT => 60,
            CURLOPT_CONNECTTIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        
        // Configure SSL verification - disabled for Windows compatibility
        // Note: In production, ensure your server has proper SSL certificate setup
        Config::$curlOptions[CURLOPT_SSL_VERIFYPEER] = config('midtrans.curl_options.ssl_verify_peer', false);
        Config::$curlOptions[CURLOPT_SSL_VERIFYHOST] = config('midtrans.curl_options.ssl_verify_host', 0);
        
        // Log configuration for debugging
        Log::info('Midtrans Configuration', [
            'server_key_configured' => !empty(Config::$serverKey),
            'client_key_configured' => !empty(Config::$clientKey),
            'is_production' => Config::$isProduction,
            'ssl_verify_peer' => Config::$curlOptions[CURLOPT_SSL_VERIFYPEER],
            'ssl_verify_host' => Config::$curlOptions[CURLOPT_SSL_VERIFYHOST]
        ]);
    }

    public function createTransaction(Order $order, $paymentMethod = null)
    {
        try {
            // Load required relations
            $order->load(['user', 'items.course.category']);
            
            $user = $order->user;
            $items = [];
            
            foreach ($order->items as $item) {
                $items[] = [
                    'id' => $item->course->id,
                    'price' => (int)$item->price,
                    'quantity' => $item->quantity ?? 1,
                    'name' => $item->course->title,
                    'brand' => 'LeadNEX Academy',
                    'category' => $item->course->category->name ?? 'Course',
                    'merchant_name' => 'LeadNEX Academy'
                ];
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int)$order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $user->first_name ?? '',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                    'billing_address' => [
                        'first_name' => $user->first_name ?? '',
                        'last_name' => $user->last_name ?? '',
                        'email' => $user->email,
                        'phone' => $user->phone ?? '',
                        'address' => is_array($order->billing_details) ? ($order->billing_details['address'] ?? '') : '',
                        'city' => is_array($order->billing_details) ? ($order->billing_details['city'] ?? '') : '',
                        'postal_code' => is_array($order->billing_details) ? ($order->billing_details['postal_code'] ?? '') : '',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $items,
                'callbacks' => [
                    'finish' => route('payment.finish'),
                    'unfinish' => route('payment.unfinish'),
                    'error' => route('payment.error')
                ],
                'custom_field1' => 'LeadNEX Academy',
                'custom_field2' => $order->order_number,
                'custom_field3' => config('app.env')
            ];

            // ALWAYS configure enabled payment methods to prevent unwanted methods from appearing
            $params['enabled_payments'] = $this->getEnabledPayments($paymentMethod);
            
            // Explicitly disable payment methods that are not in our active list
            $params['disabled_payments'] = $this->getDisabledPayments();

            // Log the parameters for debugging
            Log::info('Creating Midtrans transaction', [
                'order_id' => $order->order_number,
                'params' => $params
            ]);

            $snapToken = Snap::getSnapToken($params);
            
            // Log successful token creation
            Log::info('Midtrans snap token created successfully', [
                'order_id' => $order->order_number,
                'token_length' => strlen($snapToken)
            ]);
            
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => 'midtrans',
                'transaction_id' => $order->order_number,
                'status' => 'pending',
                'amount' => $order->total_amount,
                'currency' => 'IDR',
                'payment_details' => [
                    'snap_token' => $snapToken,
                    'midtrans_params' => $params
                ]
            ]);

            return [
                'snap_token' => $snapToken,
                'payment' => $payment
            ];

        } catch (\Exception $e) {
            Log::error('Midtrans transaction creation failed', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'order_id' => $order->order_number ?? 'unknown'
            ]);
            throw $e;
        }
    }

    public function handleNotification($notification)
    {
        try {
            $transaction = $notification['transaction_status'] ?? null;
            $type = $notification['payment_type'] ?? null;
            $orderId = $notification['order_id'] ?? null;
            $fraud = $notification['fraud_status'] ?? null;

            Log::info('Processing Midtrans notification', [
                'order_id' => $orderId,
                'transaction_status' => $transaction,
                'payment_type' => $type,
                'fraud_status' => $fraud
            ]);

            if (!$orderId) {
                Log::error('Order ID missing in notification', ['notification' => $notification]);
                return false;
            }

            // Handle test notifications from Midtrans
            // Test order IDs contain "payment_notif_test"
            if (str_contains($orderId, 'payment_notif_test')) {
                Log::info('Received test notification from Midtrans', [
                    'order_id' => $orderId,
                    'transaction_status' => $transaction
                ]);
                // Return true to acknowledge test notification successfully
                return true;
            }

            $payment = Payment::where('transaction_id', $orderId)->first();

            if (!$payment) {
                Log::warning('Payment not found for order', [
                    'order_id' => $orderId,
                    'searched_column' => 'transaction_id',
                    'note' => 'This might be a test or invalid order'
                ]);
                // Return true to prevent Midtrans from sending error emails
                // But log it as warning for monitoring
                return true;
            }

            Log::info('Payment found', [
                'payment_id' => $payment->id,
                'current_status' => $payment->status,
                'order_id' => $payment->order_id
            ]);

            $order = $payment->order;

            if (!$order) {
                Log::error('Order not found for payment', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id
                ]);
                return false;
            }

            if ($transaction == 'capture') {
                if ($fraud == 'challenge') {
                    $payment->status = 'processing';
                } else if ($fraud == 'accept') {
                    $payment->status = 'completed';
                    $payment->paid_at = now();
                    $this->processSuccessfulPayment($order, $payment);
                }
            } else if ($transaction == 'settlement') {
                $payment->status = 'completed';
                $payment->paid_at = now();
                $this->processSuccessfulPayment($order, $payment);
            } else if ($transaction == 'pending') {
                $payment->status = 'pending';
            } else if ($transaction == 'deny') {
                $payment->status = 'failed';
            } else if ($transaction == 'expire') {
                $payment->status = 'cancelled';
            } else if ($transaction == 'cancel') {
                $payment->status = 'cancelled';
            }

            $payment->payment_details = array_merge(
                $payment->payment_details ?? [],
                ['notification_response' => $notification]
            );
            
            $payment->save();

            $order->status = $this->mapPaymentStatusToOrderStatus($payment->status);
            $order->save();

            Log::info('Payment and order status updated', [
                'payment_id' => $payment->id,
                'payment_status' => $payment->status,
                'order_status' => $order->status
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Midtrans notification handling failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    private function processSuccessfulPayment(Order $order, Payment $payment)
    {
        try {
            Log::info('Starting enrollment process', [
                'order_id' => $order->order_number,
                'user_id' => $order->user_id,
                'items_count' => $order->items->count()
            ]);

            $enrollmentCount = 0;
            $skippedCount = 0;

            foreach ($order->items as $item) {
                $enrollment = Enrollment::where([
                    'user_id' => $order->user_id,
                    'course_id' => $item->course_id
                ])->first();

                if (!$enrollment) {
                    Enrollment::create([
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id,
                        'order_id' => $order->id,
                        'enrolled_at' => now(),
                        'status' => 'active',
                        'enrollment_type' => 'purchase'
                    ]);

                    $enrollmentCount++;

                    Log::info('Created enrollment', [
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id,
                        'order_id' => $order->id
                    ]);
                } else {
                    $skippedCount++;
                    Log::info('Enrollment already exists, skipping', [
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id
                    ]);
                }
            }

            // Clear cart items for purchased courses
            $deletedCartItems = CartItem::where('user_id', $order->user_id)
                ->whereHas('course', function($query) use ($order) {
                    $courseIds = $order->items->pluck('course_id');
                    $query->whereIn('id', $courseIds);
                })
                ->delete();

            Log::info('Payment processed successfully', [
                'order_number' => $order->order_number,
                'new_enrollments' => $enrollmentCount,
                'skipped_enrollments' => $skippedCount,
                'cart_items_deleted' => $deletedCartItems
            ]);

            // Send email notification to user
            try {
                // Load necessary relations for email
                $order->load(['user', 'items.course']);

                // Send payment success notification
                $order->user->notify(new PaymentSuccessful($order, $payment));

                Log::info('Payment success email notification sent', [
                    'order_id' => $order->order_number,
                    'user_id' => $order->user_id,
                    'email' => $order->user->email
                ]);
            } catch (\Exception $e) {
                // Log email error but don't fail the payment process
                Log::error('Failed to send payment success email', [
                    'error' => $e->getMessage(),
                    'order_id' => $order->order_number,
                    'user_id' => $order->user_id,
                    'trace' => $e->getTraceAsString()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to process successful payment', [
                'error' => $e->getMessage(),
                'order_id' => $order->order_number ?? 'unknown',
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function mapPaymentStatusToOrderStatus($paymentStatus)
    {
        return match($paymentStatus) {
            'completed' => 'completed',
            'pending', 'processing' => 'pending',
            'failed', 'cancelled' => 'cancelled',
            default => 'pending'
        };
    }

    public function getTransactionStatus($orderId)
    {
        try {
            return Transaction::status($orderId);
        } catch (\Exception $e) {
            Log::error('Failed to get transaction status: ' . $e->getMessage());
            throw $e;
        }
    }

    public function cancelTransaction($orderId)
    {
        try {
            return Transaction::cancel($orderId);
        } catch (\Exception $e) {
            Log::error('Failed to cancel transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get enabled payment methods based on user selection
     * Only enable confirmed working payment methods
     */
    private function getEnabledPayments($paymentMethod)
    {
        switch ($paymentMethod) {
            case 'gopay':
                return ['gopay']; // GoPay only for QRIS transactions

            case 'dana':
                return ['dana']; // DANA e-wallet only

            case 'bank_transfer':
                // Enable all major bank virtual accounts including the requested ones
                // Note: Mandiri uses 'echannel' code, not 'mandiri_va'
                return ['bni_va', 'bri_va', 'echannel', 'cimb_va', 'permata_va'];

            default:
                // Return only working methods - no credit card for now
                return ['gopay', 'bni_va', 'bri_va', 'echannel', 'cimb_va', 'permata_va', 'dana'];
        }
    }

    /**
     * Create GoPay QRIS payment transaction using Snap API
     */
    public function createQRISTransaction($items, $total, $billingDetails, $userId)
    {
        try {
            $orderId = 'GOPAY-' . time() . '-' . str_pad($userId, 4, '0', STR_PAD_LEFT);
            $user = \App\Models\User::find($userId);
            
            if (!$user) {
                throw new \Exception('User not found');
            }

            // Prepare item details for GoPay QRIS
            $itemDetails = [];
            foreach ($items as $item) {
                $itemDetails[] = [
                    'id' => (string) ($item['course']['id'] ?? $item['id']),
                    'price' => (int) ($item['course']['final_price'] ?? $item['price']),
                    'quantity' => 1,
                    'name' => $item['course']['title'] ?? 'Course',
                    'category' => 'Course'
                ];
            }

            Log::info('Creating GoPay QRIS using Snap API', [
                'order_id' => $orderId,
                'amount' => $total,
                'user_id' => $userId
            ]);

            // Use Snap API with proper GoPay configuration
            $snapParams = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) $total,
                ],
                'customer_details' => [
                    'first_name' => $user->name ?? 'Customer',
                    'last_name' => '',
                    'email' => $billingDetails['email'] ?? $user->email,
                    'phone' => $billingDetails['phone'] ?? '08123456789',
                    'billing_address' => [
                        'first_name' => $user->name ?? 'Customer',
                        'last_name' => '',
                        'email' => $billingDetails['email'] ?? $user->email,
                        'phone' => $billingDetails['phone'] ?? '08123456789',
                        'address' => $billingDetails['address'] ?? 'Address',
                        'city' => $billingDetails['city'] ?? 'Jakarta',
                        'postal_code' => $billingDetails['postal_code'] ?? '12345',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $itemDetails,
                'enabled_payments' => ['gopay'], // GoPay only for QRIS
                'gopay' => [
                    'enable_callback' => true,
                    'callback_url' => url('/payment/finish')
                ],
                'callbacks' => [
                    'finish' => url('/payment/finish'),
                    'unfinish' => url('/payment/unfinish'),
                    'error' => url('/payment/error')
                ],
                'expiry' => [
                    'start_time' => date('Y-m-d H:i:s O'),
                    'unit' => 'minutes',
                    'duration' => 15
                ],
                'custom_field1' => 'LeadNEX Academy',
                'custom_field2' => $orderId,
                'custom_field3' => 'GoPay QRIS Payment'
            ];

            // Configure Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

            $snapToken = \Midtrans\Snap::getSnapToken($snapParams);
            
            Log::info('GoPay QRIS Snap token created successfully', [
                'order_id' => $orderId,
                'token_length' => strlen($snapToken)
            ]);

            return [
                'success' => true,
                'order_id' => $orderId,
                'total' => $total,
                'transaction_status' => 'pending',
                'fraud_status' => 'accept',
                'snap_token' => $snapToken,
                'qr_code_url' => null, // Available through Snap interface
                'actions' => [],
                'transaction_id' => null,
                'message' => 'GoPay QRIS payment created successfully',
                'method' => 'snap_api',
                'payment_type' => 'gopay'
            ];

        } catch (\Exception $e) {
            Log::error('GoPay QRIS creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            throw new \Exception('Failed to create GoPay QRIS payment: ' . $e->getMessage());
        }
    }

    /**
     * Create Static QRIS payment transaction
     * This method creates a QRIS payment using Snap API with GoPay configuration
     */
    public function createStaticQRIS($items, $total, $billingDetails, $userId, $qrisType = 'static')
    {
        try {
            $orderId = 'STATIC-QRIS-' . time() . '-' . str_pad($userId, 4, '0', STR_PAD_LEFT);
            $user = \App\Models\User::find($userId);
            
            if (!$user) {
                throw new \Exception('User not found');
            }

            // Prepare item details for Static QRIS
            $itemDetails = [];
            foreach ($items as $item) {
                $itemDetails[] = [
                    'id' => (string) ($item['course']['id'] ?? $item['id']),
                    'price' => (int) ($item['course']['final_price'] ?? $item['price']),
                    'quantity' => 1,
                    'name' => $item['course']['title'] ?? 'Course',
                    'category' => 'Course'
                ];
            }

            Log::info('Creating Static QRIS transaction using Snap API', [
                'order_id' => $orderId,
                'amount' => $total,
                'user_id' => $userId,
                'qris_type' => $qrisType
            ]);

            // Use Snap API with GoPay configuration for QRIS
            $snapParams = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) $total,
                ],
                'customer_details' => [
                    'first_name' => $user->name ?? 'Customer',
                    'last_name' => '',
                    'email' => $billingDetails['email'] ?? $user->email,
                    'phone' => $billingDetails['phone'] ?? '08123456789',
                    'billing_address' => [
                        'first_name' => $user->name ?? 'Customer',
                        'last_name' => '',
                        'email' => $billingDetails['email'] ?? $user->email,
                        'phone' => $billingDetails['phone'] ?? '08123456789',
                        'address' => $billingDetails['address'] ?? 'Address',
                        'city' => $billingDetails['city'] ?? 'Jakarta',
                        'postal_code' => $billingDetails['postal_code'] ?? '12345',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $itemDetails,
                'enabled_payments' => ['gopay'], // Enable GoPay which includes QRIS
                'gopay' => [
                    'enable_callback' => true,
                    'callback_url' => url('/payment/finish')
                ],
                'callbacks' => [
                    'finish' => url('/payment/finish'),
                    'unfinish' => url('/payment/unfinish'),
                    'error' => url('/payment/error')
                ],
                'expiry' => [
                    'start_time' => date('Y-m-d H:i:s O'),
                    'unit' => 'minutes',
                    'duration' => 30 // 30 minutes for Static QRIS
                ],
                'custom_field1' => 'LeadNEX Academy',
                'custom_field2' => $orderId,
                'custom_field3' => 'Static QRIS Payment'
            ];

            // Configure Midtrans
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

            // Create Snap token
            $snapToken = \Midtrans\Snap::getSnapToken($snapParams);
            
            Log::info('Static QRIS Snap token created successfully', [
                'order_id' => $orderId,
                'token_length' => strlen($snapToken)
            ]);

            return [
                'success' => true,
                'order_id' => $orderId,
                'total' => $total,
                'transaction_status' => 'pending',
                'fraud_status' => 'accept',
                'snap_token' => $snapToken,
                'qr_code_url' => null, // Will be available through Snap interface
                'actions' => [],
                'transaction_id' => null,
                'payment_type' => 'gopay', // Using GoPay for QRIS
                'acquirer' => 'gopay',
                'method' => 'snap_api',
                'message' => 'Static QRIS payment created successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Static QRIS creation failed: ' . $e->getMessage(), [
                'user_id' => $userId ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            throw new \Exception('Failed to create Static QRIS payment: ' . $e->getMessage());
        }
    }

    /**
     * Get readable error message from exception
     */
    private function getReadableError(\Exception $e)
    {
        $message = $e->getMessage();

        // Handle common SSL errors
        if (strpos($message, 'SSL certificate problem') !== false) {
            return 'SSL connection error. Please check your SSL configuration or contact support.';
        }

        // Handle cURL timeout errors
        if (strpos($message, 'timeout') !== false || strpos($message, 'Operation timed out') !== false) {
            return 'Connection timeout. Please try again or contact support if the problem persists.';
        }

        // Handle network errors
        if (strpos($message, 'Could not resolve host') !== false) {
            return 'Network connection error. Please check your internet connection.';
        }

        // Handle Midtrans API errors
        if (strpos($message, '401') !== false) {
            return 'Invalid API credentials. Please check your Midtrans configuration.';
        }

        if (strpos($message, '400') !== false) {
            return 'Invalid request data. Please check your payment information.';
        }

        // Return original message if no specific handling
        return $message;
    }

    /**
     * Test Midtrans connection using Custom Client
     */
    public function testConnection()
    {
        try {
            $customClient = new CustomMidtransClient();
            return $customClient->testConnection();
            
        } catch (\Exception $e) {
            Log::error('Midtrans Connection Test Failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false, 
                'message' => $this->getReadableError($e)
            ];
        }
    }

    /**
     * Get payment methods to be explicitly disabled
     * This prevents inactive banks and e-wallets from appearing in Midtrans Snap
     */
    private function getDisabledPayments()
    {
        // Disable all inactive bank virtual accounts and unavailable e-wallets
        return [
            'bca_va',        // BCA VA - not active in account
            'other_va',      // Other VA - not active
            'bank_transfer', // Generic bank transfer - use specific VAs only
            'echannel',      // Mandiri Clickpay
            'bca_klikbca',   // BCA KlikBCA
            'bca_klikpay',   // BCA KlikPay
            'cstore',        // Convenience Store
            'cardless_credit', // Cardless Credit
            'akulaku',       // Akulaku PayLater
            // Disable e-wallets not available in account
            'shopeepay',     // ShopeePay - not available
            'ovo',           // OVO - not available
            'linkaja',       // LinkAja - not available
        ];
    }

    /**
     * Create GoPay payment using Midtrans Charge API
     *
     * Uses 'gopay' payment type to generate QRIS-compatible QR code
     * that can be scanned with various e-wallets (GoPay, Dana, OVO, ShopeePay, LinkAja, etc)
     *
     * For web browser: Generates QR code (generate-qr-code-v2 with ASPI border)
     * For mobile: Provides deeplink for in-app payment
     *
     * @param Order $order
     * @param string $acquirer Legacy parameter, kept for backward compatibility
     * @return array
     * @throws \Exception
     */
    public function createQRISPayment(Order $order, string $acquirer = 'gopay')
    {
        try {
            // Load required relations
            $order->load(['user', 'items.course.category']);

            $user = $order->user;
            $items = [];

            foreach ($order->items as $item) {
                $items[] = [
                    'id' => (string)$item->course->id,
                    'price' => (int)$item->price,
                    'quantity' => $item->quantity ?? 1,
                    'name' => $item->course->title,
                ];
            }

            // Prepare Charge API request for GoPay
            // For web browser: QR Code will be generated (no callback needed)
            // For mobile: Deeplink will be used (callback can be enabled)
            $params = [
                'payment_type' => 'gopay',
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int)$order->total_amount,
                ],
                'item_details' => $items,
                'customer_details' => [
                    'first_name' => $user->first_name ?? $user->name ?? 'Customer',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '08123456789',
                ]
                // Note: 'gopay' parameter is optional for basic GoPay payment
                // Midtrans will auto-generate QR code for web, deeplink for mobile
            ];

            Log::info('Creating GoPay payment via Charge API', [
                'order_id' => $order->order_number,
                'payment_type' => 'gopay',
                'amount' => $order->total_amount,
                'params' => $params
            ]);

            // Call Midtrans Charge API using custom HTTP client
            $serverKey = Config::$serverKey;
            $isProduction = Config::$isProduction;

            $baseUrl = $isProduction
                ? 'https://api.midtrans.com/v2'
                : 'https://api.sandbox.midtrans.com/v2';

            $endpoint = $baseUrl . '/charge';

            // Make HTTP request to Charge API
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($params),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Basic ' . base64_encode($serverKey . ':')
                ],
                CURLOPT_SSL_VERIFYPEER => Config::$curlOptions[CURLOPT_SSL_VERIFYPEER] ?? false,
                CURLOPT_SSL_VERIFYHOST => Config::$curlOptions[CURLOPT_SSL_VERIFYHOST] ?? 0,
                CURLOPT_TIMEOUT => 60,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new \Exception('CURL Error: ' . $curlError);
            }

            $result = json_decode($response, true);

            // Comprehensive logging untuk debug
            Log::info('GoPay Charge API response received', [
                'order_id' => $order->order_number,
                'payment_type' => 'gopay',
                'http_code' => $httpCode,
                'response_keys' => $result ? array_keys($result) : [],
                'status_code' => $result['status_code'] ?? 'unknown',
                'transaction_status' => $result['transaction_status'] ?? 'unknown',
                'has_actions' => isset($result['actions']),
                'actions_count' => isset($result['actions']) ? count($result['actions']) : 0,
                'full_response' => $result // Log full response untuk debug
            ]);

            // Check for errors in response
            if (!$result) {
                Log::error('Failed to decode Midtrans response', [
                    'order_id' => $order->order_number,
                    'raw_response' => $response
                ]);
                throw new \Exception('Invalid response from Midtrans: Failed to decode JSON');
            }

            // Check for specific 402 error (Payment channel not activated)
            if (isset($result['status_code']) && $result['status_code'] == '402') {
                Log::error('GoPay payment channel not activated', [
                    'order_id' => $order->order_number,
                    'payment_type' => 'gopay',
                    'status_code' => $result['status_code'],
                    'status_message' => $result['status_message'] ?? 'Unknown',
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'GoPay belum diaktifkan di akun Midtrans Anda. ' .
                    'Silakan login ke Midtrans Dashboard (https://dashboard.midtrans.com) → ' .
                    'Settings → Payment Methods → E-Wallet section → Pastikan "GoPay" sudah aktif. ' .
                    'Error: ' . ($result['status_message'] ?? 'Payment channel is not activated')
                );
            }

            if ($httpCode !== 201 && $httpCode !== 200) {
                Log::error('Midtrans API returned error', [
                    'order_id' => $order->order_number,
                    'http_code' => $httpCode,
                    'status_message' => $result['status_message'] ?? 'Unknown',
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'Midtrans API Error: ' . ($result['status_message'] ?? 'Unknown error') .
                    ' (HTTP ' . $httpCode . '). ' .
                    'Detail: ' . json_encode($result)
                );
            }

            // Extract QR code URL from actions
            // Prefer generate-qr-code-v2 (ASPI format with border)
            $qrCodeUrl = null;
            $qrCodeUrlV2 = null;

            if (isset($result['actions']) && is_array($result['actions'])) {
                Log::info('Processing actions array', [
                    'order_id' => $order->order_number,
                    'actions' => $result['actions']
                ]);

                foreach ($result['actions'] as $action) {
                    if (isset($action['name'])) {
                        if ($action['name'] === 'generate-qr-code') {
                            $qrCodeUrl = $action['url'] ?? null;
                        }
                        if ($action['name'] === 'generate-qr-code-v2') {
                            $qrCodeUrlV2 = $action['url'] ?? null;
                        }
                    }
                }
            } else {
                Log::warning('No actions array in response', [
                    'order_id' => $order->order_number,
                    'response_structure' => array_keys($result)
                ]);
            }

            // Use v2 if available (ASPI format), otherwise use v1
            $finalQrCodeUrl = $qrCodeUrlV2 ?? $qrCodeUrl;

            if (!$finalQrCodeUrl) {
                Log::error('No QR code URL in QRIS response', [
                    'order_id' => $order->order_number,
                    'has_actions' => isset($result['actions']),
                    'actions' => $result['actions'] ?? null,
                    'qr_code_url' => $qrCodeUrl,
                    'qr_code_url_v2' => $qrCodeUrlV2,
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'QR code URL not found in Midtrans response. ' .
                    'Please check if QRIS is enabled in your Midtrans dashboard. ' .
                    'Response status: ' . ($result['transaction_status'] ?? 'unknown')
                );
            }

            Log::info('QRIS QR code URL extracted', [
                'order_id' => $order->order_number,
                'has_v1' => !empty($qrCodeUrl),
                'has_v2' => !empty($qrCodeUrlV2),
                'using_version' => $qrCodeUrlV2 ? 'v2 (ASPI)' : 'v1 (Plain)'
            ]);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => 'gopay',
                'transaction_id' => $order->order_number,
                'status' => 'pending',
                'amount' => $order->total_amount,
                'currency' => 'IDR',
                'payment_details' => [
                    'payment_type' => 'gopay',
                    'transaction_id' => $result['transaction_id'] ?? null,
                    'transaction_status' => $result['transaction_status'] ?? 'pending',
                    'qr_code_url' => $finalQrCodeUrl,
                    'qr_code_url_v1' => $qrCodeUrl,
                    'qr_code_url_v2' => $qrCodeUrlV2,
                    'qr_format' => $qrCodeUrlV2 ? 'ASPI' : 'Plain',
                    'actions' => $result['actions'] ?? [],
                    'midtrans_response' => $result
                ]
            ]);

            Log::info('GoPay payment created successfully', [
                'order_id' => $order->order_number,
                'payment_id' => $payment->id,
                'payment_type' => 'gopay',
                'qr_format' => $qrCodeUrlV2 ? 'ASPI' : 'Plain'
            ]);

            return [
                'success' => true,
                'payment' => $payment,
                'qr_code_url' => $finalQrCodeUrl,
                'qr_code_url_v1' => $qrCodeUrl,
                'qr_code_url_v2' => $qrCodeUrlV2,
                'transaction_id' => $result['transaction_id'] ?? null,
                'order_id' => $order->order_number,
                'status_code' => $result['status_code'] ?? null,
                'status_message' => $result['status_message'] ?? null,
                'transaction_status' => $result['transaction_status'] ?? 'pending',
                'payment_type' => 'gopay',
                'qr_format' => $qrCodeUrlV2 ? 'ASPI (with border)' : 'Plain (no border)',
                'actions' => $result['actions'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('GoPay payment creation failed', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'payment_type' => 'gopay',
                'order_id' => $order->order_number ?? 'unknown'
            ]);
            throw $e;
        }
    }

    /**
     * Create ShopeePay payment using Midtrans Charge API
     *
     * Uses 'shopeepay' payment_type to generate deeplink for ShopeePay app
     * User will be redirected to ShopeePay app to complete payment
     *
     * @param Order $order
     * @return array
     * @throws \Exception
     */
    public function createShopeePayPayment(Order $order)
    {
        try {
            // Load required relations
            $order->load(['user', 'items.course.category']);

            $user = $order->user;
            $items = [];

            foreach ($order->items as $item) {
                $items[] = [
                    'id' => (string)$item->course->id,
                    'price' => (int)$item->price,
                    'quantity' => $item->quantity ?? 1,
                    'name' => $item->course->title,
                ];
            }

            // Prepare Charge API request for ShopeePay
            // Callback URL for redirect after payment
            $callbackUrl = url('/payment/finish?order_id=' . $order->order_number);

            $params = [
                'payment_type' => 'shopeepay',
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int)$order->total_amount,
                ],
                'item_details' => $items,
                'customer_details' => [
                    'first_name' => $user->first_name ?? $user->name ?? 'Customer',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '08123456789',
                ],
                'shopeepay' => [
                    'callback_url' => $callbackUrl
                ]
            ];

            Log::info('Creating ShopeePay payment via Charge API', [
                'order_id' => $order->order_number,
                'payment_type' => 'shopeepay',
                'amount' => $order->total_amount,
                'callback_url' => $callbackUrl,
                'params' => $params
            ]);

            // Call Midtrans Charge API using custom HTTP client
            $serverKey = Config::$serverKey;
            $isProduction = Config::$isProduction;

            $baseUrl = $isProduction
                ? 'https://api.midtrans.com/v2'
                : 'https://api.sandbox.midtrans.com/v2';

            $endpoint = $baseUrl . '/charge';

            // Make HTTP request to Charge API
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($params),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Basic ' . base64_encode($serverKey . ':')
                ],
                CURLOPT_SSL_VERIFYPEER => Config::$curlOptions[CURLOPT_SSL_VERIFYPEER] ?? false,
                CURLOPT_SSL_VERIFYHOST => Config::$curlOptions[CURLOPT_SSL_VERIFYHOST] ?? 0,
                CURLOPT_TIMEOUT => 60,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new \Exception('CURL Error: ' . $curlError);
            }

            $result = json_decode($response, true);

            // Comprehensive logging untuk debug
            Log::info('ShopeePay Charge API response received', [
                'order_id' => $order->order_number,
                'payment_type' => 'shopeepay',
                'http_code' => $httpCode,
                'response_keys' => $result ? array_keys($result) : [],
                'status_code' => $result['status_code'] ?? 'unknown',
                'transaction_status' => $result['transaction_status'] ?? 'unknown',
                'has_actions' => isset($result['actions']),
                'actions_count' => isset($result['actions']) ? count($result['actions']) : 0,
                'full_response' => $result // Log full response untuk debug
            ]);

            // Check for errors in response
            if (!$result) {
                Log::error('Failed to decode Midtrans response', [
                    'order_id' => $order->order_number,
                    'raw_response' => $response
                ]);
                throw new \Exception('Invalid response from Midtrans: Failed to decode JSON');
            }

            // Check for specific 402 error (Payment channel not activated)
            if (isset($result['status_code']) && $result['status_code'] == '402') {
                Log::error('ShopeePay payment channel not activated', [
                    'order_id' => $order->order_number,
                    'payment_type' => 'shopeepay',
                    'status_code' => $result['status_code'],
                    'status_message' => $result['status_message'] ?? 'Unknown',
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'ShopeePay belum diaktifkan di akun Midtrans Anda. ' .
                    'Silakan login ke Midtrans Dashboard (https://dashboard.midtrans.com) → ' .
                    'Settings → Payment Methods → E-Wallet section → Pastikan "ShopeePay" sudah aktif. ' .
                    'Error: ' . ($result['status_message'] ?? 'Payment channel is not activated')
                );
            }

            if ($httpCode !== 201 && $httpCode !== 200) {
                Log::error('Midtrans API returned error', [
                    'order_id' => $order->order_number,
                    'http_code' => $httpCode,
                    'status_message' => $result['status_message'] ?? 'Unknown',
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'Midtrans API Error: ' . ($result['status_message'] ?? 'Unknown error') .
                    ' (HTTP ' . $httpCode . '). ' .
                    'Detail: ' . json_encode($result)
                );
            }

            // Extract deeplink URL from actions
            $deeplinkUrl = null;

            if (isset($result['actions']) && is_array($result['actions'])) {
                Log::info('Processing actions array', [
                    'order_id' => $order->order_number,
                    'actions' => $result['actions']
                ]);

                foreach ($result['actions'] as $action) {
                    if (isset($action['name']) && $action['name'] === 'deeplink-redirect') {
                        $deeplinkUrl = $action['url'] ?? null;
                        break;
                    }
                }
            } else {
                Log::warning('No actions array in response', [
                    'order_id' => $order->order_number,
                    'response_structure' => array_keys($result)
                ]);
            }

            if (!$deeplinkUrl) {
                Log::error('No deeplink URL in ShopeePay response', [
                    'order_id' => $order->order_number,
                    'has_actions' => isset($result['actions']),
                    'actions' => $result['actions'] ?? null,
                    'full_response' => $result
                ]);

                throw new \Exception(
                    'Deeplink URL not found in Midtrans response. ' .
                    'Please check if ShopeePay is enabled in your Midtrans dashboard. ' .
                    'Response status: ' . ($result['transaction_status'] ?? 'unknown')
                );
            }

            Log::info('ShopeePay deeplink URL extracted', [
                'order_id' => $order->order_number,
                'deeplink_url' => $deeplinkUrl
            ]);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => 'shopeepay',
                'transaction_id' => $order->order_number,
                'status' => 'pending',
                'amount' => $order->total_amount,
                'currency' => 'IDR',
                'payment_details' => [
                    'payment_type' => 'shopeepay',
                    'transaction_id' => $result['transaction_id'] ?? null,
                    'transaction_status' => $result['transaction_status'] ?? 'pending',
                    'deeplink_url' => $deeplinkUrl,
                    'callback_url' => $callbackUrl,
                    'actions' => $result['actions'] ?? [],
                    'midtrans_response' => $result
                ]
            ]);

            Log::info('ShopeePay payment created successfully', [
                'order_id' => $order->order_number,
                'payment_id' => $payment->id,
                'payment_type' => 'shopeepay'
            ]);

            return [
                'success' => true,
                'payment' => $payment,
                'deeplink_url' => $deeplinkUrl,
                'transaction_id' => $result['transaction_id'] ?? null,
                'order_id' => $order->order_number,
                'status_code' => $result['status_code'] ?? null,
                'status_message' => $result['status_message'] ?? null,
                'transaction_status' => $result['transaction_status'] ?? 'pending',
                'payment_type' => 'shopeepay',
                'actions' => $result['actions'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('ShopeePay payment creation failed', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'payment_type' => 'shopeepay',
                'order_id' => $order->order_number ?? 'unknown'
            ]);
            throw $e;
        }
    }

    /**
     * Create DANA payment using Midtrans Snap API
     *
     * DANA is not available as a direct payment_type in Charge API.
     * It must be accessed via Snap API with enabled_payments: ['dana'].
     * Snap will handle the DANA deeplink/redirect flow automatically.
     *
     * @param Order $order
     * @return array
     * @throws \Exception
     */
    public function createDANAPayment(Order $order)
    {
        try {
            // Load required relations
            $order->load(['user', 'items.course.category']);

            $user = $order->user;
            $items = [];

            foreach ($order->items as $item) {
                $items[] = [
                    'id' => (string)$item->course->id,
                    'price' => (int)$item->price,
                    'quantity' => $item->quantity ?? 1,
                    'name' => $item->course->title,
                    'brand' => 'LeadNEX Academy',
                    'category' => $item->course->category->name ?? 'Course',
                    'merchant_name' => 'LeadNEX Academy'
                ];
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int)$order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $user->first_name ?? $user->name ?? 'Customer',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '08123456789',
                    'billing_address' => [
                        'first_name' => $user->first_name ?? $user->name ?? 'Customer',
                        'last_name' => $user->last_name ?? '',
                        'email' => $user->email,
                        'phone' => $user->phone ?? '08123456789',
                        'address' => is_array($order->billing_details) ? ($order->billing_details['address'] ?? '') : '',
                        'city' => is_array($order->billing_details) ? ($order->billing_details['city'] ?? '') : '',
                        'postal_code' => is_array($order->billing_details) ? ($order->billing_details['postal_code'] ?? '') : '',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $items,
                'enabled_payments' => ['dana'],
                'callbacks' => [
                    'finish' => route('payment.finish'),
                    'unfinish' => route('payment.unfinish'),
                    'error' => route('payment.error')
                ],
                'custom_field1' => 'LeadNEX Academy',
                'custom_field2' => $order->order_number,
                'custom_field3' => 'DANA Payment'
            ];

            Log::info('Creating DANA payment via Snap API', [
                'order_id' => $order->order_number,
                'payment_type' => 'dana',
                'amount' => $order->total_amount,
                'params' => $params
            ]);

            $snapToken = Snap::getSnapToken($params);

            Log::info('DANA Snap token created successfully', [
                'order_id' => $order->order_number,
                'token_length' => strlen($snapToken)
            ]);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => 'dana',
                'transaction_id' => $order->order_number,
                'status' => 'pending',
                'amount' => $order->total_amount,
                'currency' => 'IDR',
                'payment_details' => [
                    'payment_type' => 'dana',
                    'snap_token' => $snapToken,
                    'midtrans_params' => $params
                ]
            ]);

            Log::info('DANA payment created successfully', [
                'order_id' => $order->order_number,
                'payment_id' => $payment->id,
                'payment_type' => 'dana'
            ]);

            return [
                'success' => true,
                'snap_token' => $snapToken,
                'payment' => $payment,
                'order_id' => $order->order_number,
                'payment_type' => 'dana'
            ];

        } catch (\Exception $e) {
            Log::error('DANA payment creation failed', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'payment_type' => 'dana',
                'order_id' => $order->order_number ?? 'unknown'
            ]);
            throw $e;
        }
    }
}