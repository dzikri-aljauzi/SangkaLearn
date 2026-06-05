<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\CartItem;
use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\MidtransService;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // If direct purchase from course detail
        if ($request->has('course_id') && $request->has('direct_purchase')) {
            $course = Course::with(['instructor:id,first_name,last_name'])
                ->findOrFail($request->course_id);
            
            // Safe instructor name handling for direct purchase
            $instructorName = 'Unknown Instructor';
            if ($course->instructor) {
                $firstName = $course->instructor->first_name ?? '';
                $lastName = $course->instructor->last_name ?? '';
                $instructorName = trim($firstName . ' ' . $lastName) ?: 'Unknown Instructor';
            }
                
            $items = [[
                'id' => 'direct-' . $course->id,
                'course' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price,
                    'discount_price' => $course->discount_price,
                    'final_price' => $course->discount_price ?: $course->price,
                    'instructor_name' => $instructorName,
                ],
                'is_direct_purchase' => true
            ]];
            
            $total = $course->discount_price ?: $course->price;
            $itemCount = 1;
        } else {
            // Regular cart checkout
            $cartQuery = CartItem::where('user_id', $user->id)
                ->with([
                    'course' => function($q) {
                        $q->select('id', 'title', 'slug', 'thumbnail', 'price', 'discount_price', 'instructor_id')
                          ->with('instructor:id,first_name,last_name');
                    }
                ]);
            
            // If selected items are specified, filter by them
            if ($request->has('selected_items')) {
                $selectedIds = $request->input('selected_items');
                if (is_array($selectedIds) && !empty($selectedIds)) {
                    $cartQuery->whereIn('id', $selectedIds);
                }
            }
            
            $cartItems = $cartQuery->get()
                ->map(function ($item) {
                    // Safe instructor name handling
                    $instructorName = 'Unknown Instructor';
                    if ($item->course && $item->course->instructor) {
                        $firstName = $item->course->instructor->first_name ?? '';
                        $lastName = $item->course->instructor->last_name ?? '';
                        $instructorName = trim($firstName . ' ' . $lastName) ?: 'Unknown Instructor';
                    }
                    
                    return [
                        'id' => $item->id,
                        'course' => [
                            'id' => $item->course->id,
                            'title' => $item->course->title,
                            'slug' => $item->course->slug,
                            'thumbnail' => $item->course->thumbnail,
                            'price' => $item->course->price,
                            'discount_price' => $item->course->discount_price,
                            'final_price' => $item->course->discount_price ?: $item->course->price,
                            'instructor_name' => $instructorName,
                        ],
                        'is_direct_purchase' => false
                    ];
                });

            $items = $cartItems;
            $total = $cartItems->sum(function ($item) {
                return $item['course']['final_price'];
            });
            $itemCount = $cartItems->count();
        }

        return Inertia::render('Checkout/Index', [
            'items' => $items,
            'total' => $total,
            'itemCount' => $itemCount,
            'user' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
            ]
        ]);
    }

    public function processPayment(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:credit_card,ewallet,bank_transfer',
            'billing_details' => 'nullable|array'
        ]);

        $user = Auth::user();
        $midtransService = new MidtransService();

        try {
            DB::beginTransaction();

            // Create Order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $request->total,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $request->total,
                'currency' => 'IDR',
                'billing_details' => $request->billing_details ?? []
            ]);

            // Create Order Items
            foreach ($request->items as $item) {
                $course = Course::findOrFail($item['course']['id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'unit_price' => $item['course']['final_price'],
                    'price' => $item['course']['final_price'],
                    'quantity' => 1,
                    'discount_amount' => 0,
                    'total_price' => $item['course']['final_price']
                ]);
            }

            // Create Midtrans transaction
            $midtransResponse = $midtransService->createTransaction($order, $request->payment_method);

            DB::commit();

            return response()->json([
                'success' => true,
                'snap_token' => $midtransResponse['snap_token'],
                'order_id' => $order->order_number,
                'redirect_url' => config('services.midtrans.environment') === 'sandbox' 
                    ? 'https://app.sandbox.midtrans.com/snap/v1/transactions/' . $midtransResponse['snap_token']
                    : 'https://app.midtrans.com/snap/v1/transactions/' . $midtransResponse['snap_token']
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentFinish(Request $request)
    {
        $user = Auth::user();
        
        // Get order details if available
        $orderDetails = null;
        if ($request->order_id) {
            $order = Order::where('order_number', $request->order_id)
                ->where('user_id', $user->id)
                ->with(['items.course'])
                ->first();
            
            if ($order && $order->status === 'completed') {
                $orderDetails = $order;
            }
        }
        
        return Inertia::render('Checkout/Success', [
            'message' => 'Pembayaran berhasil diproses!',
            'order_id' => $request->order_id,
            'order_details' => $orderDetails,
            'user' => [
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email
            ]
        ]);
    }

    public function paymentUnfinish(Request $request)
    {
        return Inertia::render('Checkout/Pending', [
            'message' => 'Pembayaran belum selesai. Silakan selesaikan pembayaran Anda.',
            'order_id' => $request->order_id
        ]);
    }

    public function paymentSuccess(Request $request)
    {
        $user = Auth::user();
        
        // Get order details if available
        $orderDetails = null;
        if ($request->order_id) {
            $order = Order::where('order_number', $request->order_id)
                ->where('user_id', $user->id)
                ->with(['items.course'])
                ->first();
            
            if ($order && $order->status === 'completed') {
                $orderDetails = $order;
            }
        }
        
        return Inertia::render('Checkout/Success', [
            'message' => 'Pembayaran berhasil! Terima kasih atas pembelian Anda.',
            'order_id' => $request->order_id,
            'order_details' => $orderDetails,
            'user' => [
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email
            ]
        ]);
    }

    public function paymentFailed(Request $request)
    {
        return Inertia::render('Checkout/Failed', [
            'message' => 'Pembayaran gagal. Silakan coba lagi.',
            'order_id' => $request->order_id
        ]);
    }

    public function paymentError(Request $request)
    {
        return Inertia::render('Checkout/Error', [
            'message' => 'Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.',
            'order_id' => $request->order_id
        ]);
    }
}
