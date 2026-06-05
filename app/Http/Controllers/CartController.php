<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\CartItem;
use App\Models\Enrollment;

class CartController extends Controller
{
    /**
     * Display cart contents
     */
    public function index()
    {
        $user = Auth::user();
        
        $cartItems = CartItem::where('user_id', $user->id)
            ->with([
                'course' => function($q) {
                    $q->select('id', 'title', 'slug', 'thumbnail', 'price', 'discount_price', 'instructor_id')
                      ->with('instructor:id,first_name,last_name');
                }
            ])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'course_id' => $item->course_id,
                    'course' => [
                        'id' => $item->course->id,
                        'title' => $item->course->title,
                        'slug' => $item->course->slug,
                        'thumbnail' => $item->course->thumbnail,
                        'price' => $item->course->price,
                        'discount_price' => $item->course->discount_price,
                        'final_price' => $item->course->discount_price ?: $item->course->price,
                        'instructor_name' => $item->course->instructor->first_name . ' ' . $item->course->instructor->last_name,
                    ],
                    'added_at' => $item->created_at,
                ];
            });

        $total = $cartItems->sum(function ($item) {
            return $item['course']['final_price'];
        });

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'total' => $total,
            'itemCount' => $cartItems->count(),
        ]);
    }

    /**
     * Add course to cart
     */
    public function add(Course $course)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        try {
            // Check if user is already enrolled in this course
            $isEnrolled = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->exists();
                
            if ($isEnrolled) {
                return back()->with('error', 'Anda sudah terdaftar di pelatihan ini.');
            }
            
            // Check if course is already in cart
            $existingItem = CartItem::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
                
            if ($existingItem) {
                return back()->with('info', 'Pelatihan sudah ada di keranjang Anda.');
            }
            
            // Add to cart
            CartItem::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'price' => $course->discount_price ?: $course->price,
            ]);
            
            return back()->with('success', 'Pelatihan berhasil ditambahkan ke keranjang.');
            
        } catch (\Exception $e) {
            \Log::error('Cart add error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menambahkan ke keranjang.');
        }
    }

    /**
     * Remove item from cart
     */
    public function remove(CartItem $item)
    {
        $user = Auth::user();
        
        if ($item->user_id !== $user->id) {
            abort(403);
        }
        
        $item->delete();
        
        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        $user = Auth::user();
        
        CartItem::where('user_id', $user->id)->delete();
        
        return back()->with('success', 'Keranjang berhasil dikosongkan.');
    }

    /**
     * Get cart count (for header badge)
     */
    public function count()
    {
        if (!Auth::check()) {
            return response()->json(['count' => 0]);
        }
        
        $count = CartItem::where('user_id', Auth::id())->count();
        
        return response()->json(['count' => $count]);
    }
}
