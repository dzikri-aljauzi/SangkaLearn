<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotProxyController extends Controller
{
    /**
     * Proxy request to chatbot API to bypass CORS
     */
    public function sendMessage(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'input_prompt' => 'required|string|max:1000'
            ]);

            $inputPrompt = $validated['input_prompt'];

            // Log request for debugging
            Log::info('Chatbot request received', [
                'input_prompt' => $inputPrompt,
                'ip' => $request->ip()
            ]);

            // Make request to external chatbot API
            $response = Http::timeout(30)
                ->withoutVerifying() // Disable SSL verification for development
                ->withHeaders([
                    'Authorization' => 'Bearer 9ba4422794218b12514e15db1ce514df73637cf73a9e0a1cf34ff9259bff07a1d7d3173232e83bfdd9d1bdde07968ca9563cef91ca735b4ed37bb4e97a6ffcd9',
                    'Content-Type' => 'application/json',
                ])
                ->post('http://212.85.24.58:8080/chatbot-response', [
                    'input_prompt' => $inputPrompt
                ]);

            // Check if request was successful
            if ($response->successful()) {
                $data = $response->json();

                // Log successful response
                Log::info('Chatbot response successful', [
                    'status' => $response->status(),
                    'has_result' => isset($data['result'])
                ]);

                return response()->json($data);
            }

            // Handle error responses
            Log::warning('Chatbot API error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return response()->json([
                'error' => 'Chatbot API error',
                'message' => 'Maaf, terjadi kesalahan saat menghubungi chatbot.',
                'status' => $response->status()
            ], $response->status());

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation error
            return response()->json([
                'error' => 'Validation error',
                'message' => 'Pesan tidak valid. Maksimal 1000 karakter.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // General error
            Log::error('Chatbot proxy error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Server error',
                'message' => 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }
}
