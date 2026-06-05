<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class CustomMidtransClient
{
    private $serverKey;
    private $clientKey;
    private $isProduction;
    private $baseUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->clientKey = config('midtrans.client_key');
        $this->isProduction = config('midtrans.is_production');
        $this->baseUrl = $this->isProduction 
            ? 'https://app.midtrans.com' 
            : 'https://app.sandbox.midtrans.com';
    }

    /**
     * Create Snap Token
     */
    public function createSnapToken(array $params): array
    {
        $endpoint = $this->baseUrl . '/snap/v1/transactions';
        
        Log::info('Custom Midtrans: Creating snap token', [
            'endpoint' => $endpoint,
            'order_id' => $params['transaction_details']['order_id'] ?? 'unknown'
        ]);

        $response = $this->makeRequest('POST', $endpoint, $params);
        
        if (!$response['success']) {
            throw new \Exception($response['message']);
        }

        return [
            'success' => true,
            'token' => $response['data']['token'],
            'redirect_url' => $response['data']['redirect_url']
        ];
    }

    /**
     * Create QRIS Charge (for direct QR code generation)
     */
    public function createQRISCharge(array $params): array
    {
        $endpoint = $this->baseUrl . '/v2/charge';
        
        Log::info('Custom Midtrans: Creating QRIS charge', [
            'endpoint' => $endpoint,
            'order_id' => $params['transaction_details']['order_id'] ?? 'unknown'
        ]);

        $response = $this->makeRequest('POST', $endpoint, $params);
        
        if (!$response['success']) {
            throw new \Exception($response['message']);
        }

        return $response['data'];
    }

    /**
     * Get Transaction Status
     */
    public function getTransactionStatus(string $orderId): array
    {
        $endpoint = $this->baseUrl . '/v2/' . $orderId . '/status';
        
        Log::info('Custom Midtrans: Getting transaction status', [
            'endpoint' => $endpoint,
            'order_id' => $orderId
        ]);

        $response = $this->makeRequest('GET', $endpoint);
        
        if (!$response['success']) {
            throw new \Exception($response['message']);
        }

        return $response['data'];
    }

    /**
     * Make HTTP Request to Midtrans
     */
    private function makeRequest(string $method, string $url, array $data = null): array
    {
        $ch = curl_init();
        
        $headers = [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
            'Accept: application/json',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];

        $curlOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => config('midtrans.curl_options.ssl_verify_peer', false),
            CURLOPT_SSL_VERIFYHOST => config('midtrans.curl_options.ssl_verify_host', 0),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10
        ];

        if ($method === 'POST' && $data) {
            $curlOptions[CURLOPT_POST] = true;
            $curlOptions[CURLOPT_POSTFIELDS] = json_encode($data);
        }

        curl_setopt_array($ch, $curlOptions);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Handle cURL errors
        if ($curlError) {
            Log::error('Custom Midtrans cURL Error', [
                'error' => $curlError,
                'url' => $url
            ]);
            
            return [
                'success' => false,
                'message' => 'Connection error: ' . $curlError
            ];
        }

        // Parse response
        $responseData = json_decode($response, true);
        
        Log::info('Custom Midtrans Response', [
            'http_code' => $httpCode,
            'url' => $url,
            'response_length' => strlen($response)
        ]);

        // Handle success responses (2xx)
        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'data' => $responseData,
                'http_code' => $httpCode
            ];
        }

        // Handle error responses
        $errorMessage = 'HTTP ' . $httpCode . ': ';
        
        if ($responseData) {
            if (isset($responseData['error_messages']) && is_array($responseData['error_messages'])) {
                $errorMessage .= implode(', ', $responseData['error_messages']);
            } elseif (isset($responseData['message'])) {
                $errorMessage .= $responseData['message'];
            } else {
                $errorMessage .= 'Unknown error';
            }
            
            Log::error('Custom Midtrans API Error', [
                'http_code' => $httpCode,
                'response' => $responseData,
                'url' => $url
            ]);
        } else {
            $errorMessage .= $response;
            
            Log::error('Custom Midtrans Raw Error', [
                'http_code' => $httpCode,
                'raw_response' => $response,
                'url' => $url
            ]);
        }

        return [
            'success' => false,
            'message' => $this->getReadableError($httpCode, $errorMessage),
            'http_code' => $httpCode,
            'raw_response' => $responseData
        ];
    }

    /**
     * Convert error codes to readable messages
     */
    private function getReadableError(int $httpCode, string $message): string
    {
        switch ($httpCode) {
            case 400:
                return 'Invalid request data. Please check your payment information.';
            case 401:
                return 'Invalid API credentials. You may be using production keys in sandbox mode or vice versa.';
            case 403:
                return 'Access forbidden. Please check your API permissions.';
            case 404:
                if (strpos($message, '/charge') !== false) {
                    return 'Charge endpoint not available. Please use Snap API instead.';
                }
                return 'Transaction not found.';
            case 409:
                return 'Transaction already exists with this order ID.';
            case 500:
                return 'Midtrans server error. Please try again later.';
            case 503:
                return 'Midtrans service temporarily unavailable.';
            default:
                return $message;
        }
    }

    /**
     * Test connection to Midtrans
     */
    public function testConnection(): array
    {
        try {
            // Test with a fake order ID to see if API responds
            $testOrderId = 'TEST-' . time();
            
            $this->getTransactionStatus($testOrderId);
            
            // If we reach here without exception, connection is working
            return ['success' => true, 'message' => 'Connection OK'];
            
        } catch (\Exception $e) {
            $message = $e->getMessage();
            
            // If we get 404 (transaction not found), connection is actually working
            if (strpos($message, '404') !== false || strpos($message, 'not found') !== false) {
                return ['success' => true, 'message' => 'Connection OK - API is reachable'];
            }
            
            return [
                'success' => false,
                'message' => $message
            ];
        }
    }
}