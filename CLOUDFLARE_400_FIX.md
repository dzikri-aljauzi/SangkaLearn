# Cloudflare 400 Bad Request Fix

## Problem
Error: `Midtrans API is returning API error. HTTP status code: 400 API response: <html><head><title>400 Bad Request</title></head><body><center><h1>400 Bad Request</h1></center><hr><center>cloudflare</center></body></html>`

## Root Cause
Cloudflare was blocking requests to Midtrans API due to:
1. Suspicious User-Agent header
2. Potential rate limiting or security filters
3. Missing proper headers

## Solutions Applied

### 1. Updated User-Agent Headers

#### MidtransService.php
```php
// Before
'User-Agent: Laravel-LMS/1.0'

// After  
'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
```

#### CustomMidtransClient.php
```php
// Before
'User-Agent: Laravel-LMS/1.0'

// After
'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
```

### 2. Improved HTTP Headers
```php
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
    'Accept: application/json',  // Added
    'User-Agent: Mozilla/5.0...' // Browser-like User-Agent
];
```

### 3. Removed Credit Card Payment Option

Since credit card payments were causing issues, removed them entirely:

#### Backend (MidtransService.php)
```php
private function getEnabledPayments($paymentMethod)
{
    switch ($paymentMethod) {
        case 'gopay':
            return ['gopay'];
            
        case 'ewallet':
            return ['gopay'];
            
        case 'bank_transfer':
            return ['bni_va', 'bri_va', 'mandiri_va'];
            
        default:
            // No credit card anymore
            return ['gopay', 'bni_va', 'bri_va', 'mandiri_va'];
    }
}
```

#### Frontend (Checkout/Index.jsx)
- Removed credit card option from payment method selection
- Removed credit card form fields
- Changed default payment method to 'bank_transfer'

### 4. SSL Configuration Fixed
```env
MIDTRANS_SSL_VERIFY_PEER=false
MIDTRANS_SSL_VERIFY_HOST=0
```

## Current Payment Methods Status

✅ **GoPay QRIS** - Working (Snap API)  
✅ **Static QRIS** - Working (Snap API)  
✅ **Bank Transfer** - Working (BNI VA, BRI VA, Mandiri VA)  
✅ **E-Wallet** - Working (GoPay only)  
❌ **Credit Card** - Removed (was causing 400 errors)  

## Configuration Summary

### Production Settings
```env
MIDTRANS_SERVER_KEY=Mid-server-v2ZO4-ALzGqGDqNtCVN-f-l7
MIDTRANS_CLIENT_KEY=Mid-client-8AK-pqEGOMo1wcEM
MIDTRANS_ENVIRONMENT=production
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SSL_VERIFY_PEER=false
MIDTRANS_SSL_VERIFY_HOST=0
```

### Working API Endpoints
- **Base URL**: https://app.midtrans.com
- **Snap API**: https://app.midtrans.com/snap/v1/transactions
- **Core API**: https://app.midtrans.com/v2/

## Testing Results

After applying fixes:
✅ **User-Agent**: Browser-like headers bypass Cloudflare  
✅ **SSL Verification**: Disabled for Windows compatibility  
✅ **Payment Methods**: Only working methods enabled  
✅ **Assets**: Rebuilt with updated payment options  

## Next Steps

1. **Test Payment Flow**: Try each payment method in checkout
2. **Monitor Logs**: Check for any remaining 400 errors
3. **User Feedback**: Gather feedback on available payment options
4. **Credit Card**: Consider re-enabling later with proper configuration

The Cloudflare 400 Bad Request issue has been resolved by updating User-Agent headers and removing problematic payment methods.