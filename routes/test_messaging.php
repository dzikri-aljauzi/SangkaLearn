<?php

// Temporary test route to debug messaging POST issue
// Add this to web.php: require __DIR__.'/test_messaging.php';

use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

// Test POST directly without any special processing
Route::middleware(['auth', 'verified'])->post('/test/admin-message-post', function(\Illuminate\Http\Request $request) {
    \Log::info('TEST: Admin message POST received', [
        'url' => $request->fullUrl(),
        'method' => $request->method(),
        'all_data' => $request->all(),
        'headers' => $request->headers->all(),
        'user' => auth()->user()?->email,
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Test POST received',
        'data_received' => $request->all(),
        'user' => auth()->user()?->email,
    ]);
});

// Test actual MessageController::store method directly
Route::middleware(['auth', 'verified'])->post('/test/message-controller-store', function(\Illuminate\Http\Request $request) {
    try {
        \Log::info('TEST: Calling MessageController::store', [
            'data' => $request->all()
        ]);

        $controller = new MessageController();
        $result = $controller->store($request);

        \Log::info('TEST: MessageController::store success');

        return response()->json([
            'status' => 'success',
            'message' => 'Controller method executed successfully',
        ]);
    } catch (\Exception $e) {
        \Log::error('TEST: MessageController::store failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'error',
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile()),
        ], 500);
    }
});
