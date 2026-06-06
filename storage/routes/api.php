<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MidtransController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Midtrans webhook routes (no CSRF protection for API routes)
Route::post('/midtrans/notification', [MidtransController::class, 'notification'])->name('api.midtrans.notification');
Route::get('/midtrans/notification', function() {
    return response()->json(['message' => 'Webhook endpoint is active', 'method' => 'GET']);
});
Route::get('/midtrans/transaction/{orderId}/status', [MidtransController::class, 'getTransactionStatus'])->name('api.midtrans.status');
Route::post('/midtrans/transaction/{orderId}/cancel', [MidtransController::class, 'cancelTransaction'])->name('api.midtrans.cancel');