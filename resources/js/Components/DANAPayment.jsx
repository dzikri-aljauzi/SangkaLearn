import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';

export default function DANAPayment({ orderId, total, onSuccess, onCancel, onError, deeplinkUrl }) {
    const [status, setStatus] = useState('pending'); // pending, redirecting, completed, failed, expired
    const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
    const [isPolling, setIsPolling] = useState(true);
    const pollingRef = useRef(null);
    const countdownRef = useRef(null);

    // Start countdown timer
    useEffect(() => {
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    setStatus('expired');
                    setIsPolling(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    // Poll payment status
    useEffect(() => {
        if (!isPolling || !orderId) return;

        const pollStatus = async () => {
            try {
                const response = await fetch(`/payment/qris/status?order_id=${orderId}`, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.transaction_status === 'settlement' || data.payment_status === 'completed') {
                        setStatus('completed');
                        setIsPolling(false);
                        if (onSuccess) {
                            onSuccess({ order_id: orderId, status: 'completed' });
                        }
                    } else if (data.transaction_status === 'expire' || data.transaction_status === 'cancel') {
                        setStatus('failed');
                        setIsPolling(false);
                    }
                }
            } catch (error) {
                console.error('Error polling DANA payment status:', error);
            }
        };

        pollingRef.current = setInterval(pollStatus, 5000); // Poll every 5 seconds

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [isPolling, orderId, onSuccess]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOpenDANA = () => {
        if (deeplinkUrl) {
            setStatus('redirecting');
            window.open(deeplinkUrl, '_blank');
        }
    };

    const handleCancel = () => {
        setIsPolling(false);
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (onCancel) onCancel();
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#0D5C63"/>
                        <path d="M12 16h6l3 16h6l3-16h6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">DANA</text>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Pembayaran DANA</h3>
                <p className="text-sm text-gray-500 mt-1">Selesaikan pembayaran melalui aplikasi DANA</p>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">
                    Rp {parseInt(total).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-1">Order ID: {orderId}</p>
            </div>

            {/* Status Display */}
            {status === 'pending' && (
                <>
                    {/* Countdown Timer */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Selesaikan pembayaran dalam</span>
                        <span className={`font-bold text-lg ${countdown < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatTime(countdown)}
                        </span>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-3">Cara Pembayaran:</h4>
                        <ol className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                                <span>Klik tombol <strong>"Buka Aplikasi DANA"</strong> di bawah</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                                <span>Anda akan diarahkan ke aplikasi DANA</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                                <span>Konfirmasi pembayaran di aplikasi DANA</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                                <span>Pembayaran akan otomatis terverifikasi</span>
                            </li>
                        </ol>
                    </div>

                    {/* Open DANA Button */}
                    <button
                        onClick={handleOpenDANA}
                        className="w-full bg-[#0D5C63] hover:bg-[#0D5C63] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3"
                    >
                        <Smartphone className="w-5 h-5" />
                        Buka Aplikasi DANA
                        <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* Polling Indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Menunggu konfirmasi pembayaran...</span>
                    </div>

                    {/* Cancel Button */}
                    <button
                        onClick={handleCancel}
                        className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Batalkan Pembayaran
                    </button>
                </>
            )}

            {status === 'redirecting' && (
                <>
                    <div className="text-center py-6">
                        <div className="animate-pulse">
                            <Smartphone className="w-12 h-12 text-[#0D5C63] mx-auto mb-3" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">Membuka aplikasi DANA...</p>
                        <p className="text-sm text-gray-500">Silakan selesaikan pembayaran di aplikasi DANA Anda</p>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Sisa waktu:</span>
                        <span className={`font-bold ${countdown < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatTime(countdown)}
                        </span>
                    </div>

                    {/* Polling Indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Menunggu konfirmasi pembayaran...</span>
                    </div>

                    {/* Re-open DANA button */}
                    <button
                        onClick={handleOpenDANA}
                        className="w-full bg-[#0D5C63] hover:bg-[#0D5C63] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3"
                    >
                        <Smartphone className="w-5 h-5" />
                        Buka Ulang DANA
                    </button>

                    <button
                        onClick={handleCancel}
                        className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Batalkan
                    </button>
                </>
            )}

            {status === 'completed' && (
                <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h4>
                    <p className="text-sm text-gray-500">Pembayaran DANA Anda telah berhasil dikonfirmasi</p>
                </div>
            )}

            {status === 'expired' && (
                <div className="text-center py-6">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Waktu Habis</h4>
                    <p className="text-sm text-gray-500 mb-4">Batas waktu pembayaran telah habis. Silakan coba lagi.</p>
                    <button
                        onClick={handleCancel}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            )}

            {status === 'failed' && (
                <div className="text-center py-6">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Pembayaran Gagal</h4>
                    <p className="text-sm text-gray-500 mb-4">Pembayaran DANA gagal atau dibatalkan. Silakan coba lagi.</p>
                    <button
                        onClick={handleCancel}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
    );
}
