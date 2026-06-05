import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Clock, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

export default function QRISPayment({
    orderId,
    total,
    onSuccess,
    onCancel,
    onError,
    paymentType = 'gopay',
    qrCodeUrl = null, // QR code URL dapat langsung diberikan dari payment response
    acquirer = 'gopay' // gopay or airpay shopee
}) {
    const [qrString, setQrString] = useState(qrCodeUrl || '');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Menunggu pembayaran...');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [isPolling, setIsPolling] = useState(false);

    // Format waktu countdown
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate QR code data - can be URL or token
    const getQRCodeData = (qrData) => {
        if (!qrData) return '';
        
        // If it's already a URL (from Midtrans QR code API), use it directly
        if (qrData.startsWith('http')) {
            return qrData;
        }
        
        // Otherwise, it might be a token or QR string
        return qrData;
    };

    // Polling untuk cek status pembayaran
    useEffect(() => {
        if (!isPolling || paymentStatus === 'completed') return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/payment/qris/status?order_id=${orderId}`, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    setPaymentStatus(result.payment_status);
                    
                    if (result.payment_status === 'completed') {
                        setStatusMessage('Pembayaran berhasil!');
                        setIsPolling(false);
                        onSuccess && onSuccess(result);
                    } else if (result.payment_status === 'failed') {
                        setStatusMessage('Pembayaran gagal');
                        setIsPolling(false);
                        onError && onError('Payment failed');
                    }
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [isPolling, orderId, paymentStatus, onSuccess, onError]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setPaymentStatus('expired');
            setStatusMessage('Waktu pembayaran habis');
            setIsPolling(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Generate QR Code
    useEffect(() => {
        if (orderId && paymentStatus === 'pending' && !qrCodeUrl) {
            // Only fetch if QR code URL not provided
            generateQRCode();
        } else if (qrCodeUrl && paymentStatus === 'pending') {
            // QR code URL already provided, start polling
            setIsPolling(true);
            setStatusMessage('Scan QR Code untuk melakukan pembayaran');
        }
    }, [orderId, paymentStatus, qrCodeUrl]);

    const generateQRCode = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/payment/qris/generate?order_id=${orderId}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();
            console.log('QR Generation Result:', result); // Debug log

            if (result.success) {
                // QR string from QRIS Charge API or Transaction Status
                if (result.qr_string) {
                    setQrString(result.qr_string);
                    setIsPolling(true);
                    setStatusMessage('Scan QR Code untuk melakukan pembayaran');
                    console.log('QR Code method:', result.qr_generation_method);

                    // If we have snap_url, we can also use it as alternative
                    if (result.snap_url) {
                        console.log('Snap URL available:', result.snap_url);
                    }
                } else {
                    setStatusMessage('QR Code tidak tersedia');
                    onError && onError('QR code not available');
                }
            } else {
                console.error('QR Generation failed:', result);
                setStatusMessage(`Gagal generate QR Code: ${result.message || 'Unknown error'}`);
                if (result.debug_info) {
                    console.log('Debug info:', result.debug_info);
                }
                onError && onError(result.message || 'QR generation failed');
            }
        } catch (error) {
            console.error('QR generation error:', error);
            setStatusMessage('Terjadi kesalahan saat generate QR Code');
            onError && onError('Network error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshQRCode = () => {
        if (timeLeft > 0) {
            generateQRCode();
        }
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'completed':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'failed':
            case 'expired':
                return <AlertCircle className="w-8 h-8 text-red-500" />;
            default:
                return <Clock className="w-8 h-8 text-yellow-500" />;
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'failed':
            case 'expired':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {paymentType === 'qris' ? 'QRIS Payment' : paymentType === 'static_qris' ? 'Static QRIS Payment' : 'GoPay Payment'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {paymentType === 'qris' || paymentType === 'static_qris'
                                ? `Scan dengan aplikasi e-wallet (${acquirer === 'gopay' ? 'GoPay, Gojek, dll' : acquirer === 'airpay shopee' ? 'ShopeePay, dll' : 'semua yang support QRIS'})`
                                : 'Scan dengan aplikasi GoPay/Gojek'}
                        </p>
                        <p className="text-xs text-gray-400">Order ID: {orderId}</p>
                    </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                    Rp {parseInt(total).toLocaleString()}
                </div>
                
                {/* Status */}
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="text-sm font-medium">{statusMessage}</span>
                </div>
            </div>

            {/* QR Code Display */}
            {paymentStatus === 'pending' && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="text-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                                <p className="text-sm text-gray-600">Generating QR Code...</p>
                            </div>
                        ) : qrString ? (
                            <div className="space-y-4">
                                {/* QR Code Display */}
                                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                    {/* Check if qrString is already a Midtrans QR image URL */}
                                    {qrString.startsWith('http') && qrString.includes('midtrans') ? (
                                        <img 
                                            src={qrString}
                                            alt="QR Code untuk Pembayaran QRIS"
                                            className="w-44 h-44 object-contain"
                                            onError={(e) => {
                                                console.error('Direct QR image failed to load:', qrString);
                                                // Fallback to Midtrans Snap iframe
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                            onLoad={() => {
                                                console.log('Direct QR Code loaded successfully from:', qrString);
                                            }}
                                        />
                                    ) : (
                                        // For snap tokens or other QR strings, generate QR code
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getQRCodeData(qrString))}`}
                                            alt="QR Code untuk Pembayaran QRIS"
                                            className="w-44 h-44 object-contain"
                                            onError={(e) => {
                                                console.error('QR Code generation failed for:', qrString);
                                                // Fallback: show placeholder
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                            onLoad={() => {
                                                console.log('QR Code generated successfully for:', qrString.substring(0, 50) + '...');
                                            }}
                                        />
                                    )}
                                    <div className="hidden w-44 h-44 bg-white rounded-lg overflow-hidden border">
                                        <iframe
                                            src={`https://app.midtrans.com/snap/v3/redirection/${qrString}`}
                                            width="176"
                                            height="176"
                                            frameBorder="0"
                                            scrolling="no"
                                            className="w-full h-full"
                                            onLoad={() => {
                                                console.log('Fallback Midtrans Snap iframe loaded');
                                            }}
                                        ></iframe>
                                    </div>
                                    <div className="hidden w-44 h-44 bg-gray-100 items-center justify-center rounded-lg flex-col">
                                        <QrCode className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500 text-center">QR Code<br/>untuk Pembayaran</p>
                                        <button
                                            onClick={generateQRCode}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            Reload
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">
                                        {paymentType === 'qris' || paymentType === 'static_qris'
                                            ? 'Scan QR code dengan aplikasi e-wallet yang mendukung QRIS'
                                            : 'Scan QR code dengan aplikasi GoPay atau Gojek'}
                                    </p>
                                    <button
                                        onClick={refreshQRCode}
                                        disabled={isLoading}
                                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Refresh QR Code</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Gagal memuat QR Code</p>
                                <button
                                    onClick={generateQRCode}
                                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timer */}
            {paymentStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm text-yellow-700">Waktu tersisa:</span>
                        </div>
                        <span className="text-lg font-mono font-bold text-yellow-700">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Cara Pembayaran:
                </h4>
                {paymentType === 'qris' || paymentType === 'static_qris' ? (
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>1. Buka aplikasi e-wallet Anda (GoPay, OVO, Dana, ShopeePay, dll)</li>
                        <li>2. Pilih menu "Scan QR" atau "QRIS"</li>
                        <li>3. Scan QR code di atas</li>
                        <li>4. Periksa detail pembayaran dan konfirmasi</li>
                        <li>5. Pembayaran akan otomatis terverifikasi</li>
                    </ul>
                ) : (
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>1. Buka aplikasi GoPay atau Gojek</li>
                        <li>2. Pilih menu "Scan QR" atau "Bayar"</li>
                        <li>3. Scan QR code di atas</li>
                        <li>4. Konfirmasi pembayaran di aplikasi GoPay</li>
                        <li>5. Pembayaran akan otomatis terverifikasi</li>
                    </ul>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                {paymentStatus === 'pending' && (
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                )}
                
                {paymentStatus === 'completed' && (
                    <button
                        onClick={onSuccess}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Lanjutkan
                    </button>
                )}
                
                {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                )}
            </div>

            {/* Status Messages */}
            {paymentStatus === 'completed' && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-green-600">
                        ✅ Pembayaran berhasil! Anda akan segera dapat mengakses course.
                    </p>
                </div>
            )}
            
            {paymentStatus === 'failed' && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-red-600">
                        ❌ Pembayaran gagal. Silakan coba lagi atau hubungi customer service.
                    </p>
                </div>
            )}
            
            {paymentStatus === 'expired' && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-red-600">
                        ⏰ Waktu pembayaran telah habis. Silakan buat transaksi baru.
                    </p>
                </div>
            )}
        </div>
    );
}