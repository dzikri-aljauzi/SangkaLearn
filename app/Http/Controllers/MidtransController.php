<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MidtransService;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    private $midtransService;

    public function __construct()
    {
        $this->midtransService = new MidtransService();
    }

    public function notification(Request $request)
    {
        try {
            // Log incoming webhook request
            Log::info('Midtrans webhook notification received', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'payload' => $request->all(),
                'headers' => [
                    'content-type' => $request->header('content-type'),
                    'x-forwarded-for' => $request->header('x-forwarded-for')
                ]
            ]);

            $notification = $request->all();

            $result = $this->midtransService->handleNotification($notification);

            if ($result) {
                Log::info('Midtrans notification processed successfully', [
                    'order_id' => $notification['order_id'] ?? 'unknown',
                    'transaction_status' => $notification['transaction_status'] ?? 'unknown'
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Notification processed successfully'
                ], 200);
            }

            Log::warning('Midtrans notification processing returned false', [
                'notification' => $notification
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process notification'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Midtrans notification error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function getTransactionStatus($orderId)
    {
        try {
            $status = $this->midtransService->getTransactionStatus($orderId);
            
            return response()->json([
                'status' => 'success',
                'data' => $status
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get transaction status: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get transaction status'
            ], 500);
        }
    }

    public function cancelTransaction($orderId)
    {
        try {
            $result = $this->midtransService->cancelTransaction($orderId);
            
            return response()->json([
                'status' => 'success',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to cancel transaction: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel transaction'
            ], 500);
        }
    }
}