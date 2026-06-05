import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Clock, AlertCircle, RefreshCw, Smartphone, FileText, CreditCard } from 'lucide-react';

export default function StaticQRISPayment({ 
    orderId, 
    total, 
    paymentId,
    onSuccess, 
    onCancel, 
    onError,
    qrImagePath = '/images/staticqris.pdf'
}) {
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Scan QR Code dan transfer sesuai nominal');
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for manual confirmation
    const [amountPaid, setAmountPaid] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Format waktu countdown
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format currency
    const formatCurrency = (amount) => {
        return parseInt(amount).toLocaleString('id-ID');
    };

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setPaymentStatus('expired');
            setStatusMessage('Waktu pembayaran habis');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleConfirmPayment = async () => {
        if (!amountPaid) {
            alert('Silakan masukkan jumlah yang dibayarkan');
            return;
        }

        const paidAmount = parseFloat(amountPaid);
        if (paidAmount <= 0) {
            alert('Jumlah pembayaran harus lebih dari 0');
            return;
        }

        setIsConfirming(true);

        try {
            const response = await fetch('/payment/static-qris/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    payment_id: paymentId,
                    amount_paid: paidAmount
                })
            });

            const result = await response.json();

            if (result.success) {
                setPaymentStatus('completed');
                setStatusMessage('Pembayaran berhasil dikonfirmasi!');
                setShowConfirmModal(false);
                onSuccess && onSuccess(result);
            } else {
                alert(result.message || 'Gagal mengkonfirmasi pembayaran');
            }
        } catch (error) {
            console.error('Payment confirmation error:', error);
            alert('Terjadi kesalahan saat mengkonfirmasi pembayaran');
            onError && onError(error.message);
        } finally {
            setIsConfirming(false);
        }
    };

    const openQRImage = () => {
        // Open PDF in new window
        window.open(qrImagePath, '_blank');
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'completed':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'expired':
                return <AlertCircle className="w-8 h-8 text-red-500" />;
            default:
                return <Clock className="w-8 h-8 text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'expired':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    return (
        <>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Static QRIS Payment
                            </h3>
                            <p className="text-sm text-gray-500">
                                Scan dengan aplikasi e-wallet yang mendukung QRIS
                            </p>
                            <p className="text-xs text-gray-400">Order ID: {orderId}</p>
                        </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                        Rp {formatCurrency(total)}
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
                            <div className="space-y-4">
                                {/* Static QR Code Preview */}
                                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    <div className="text-center p-4">
                                        <FileText className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-3">QR Code QRIS Static</p>
                                        <button
                                            onClick={openQRImage}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Lihat QR Code
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Klik tombol di atas untuk melihat QR Code
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Transfer tepat sesuai nominal: <strong>Rp {formatCurrency(total)}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Amount Alert */}
                {paymentStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="text-center">
                            <CreditCard className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                                Transfer Tepat Sesuai Nominal
                            </p>
                            <p className="text-lg font-bold text-yellow-900">
                                Rp {formatCurrency(total)}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Pembayaran akan gagal jika tidak sesuai nominal
                            </p>
                        </div>
                    </div>
                )}

                {/* Timer */}
                {paymentStatus === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-blue-700">Waktu tersisa:</span>
                            </div>
                            <span className="text-lg font-mono font-bold text-blue-700">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Cara Pembayaran:
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                        <li>1. Klik "Lihat QR Code" untuk melihat QR QRIS</li>
                        <li>2. Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)</li>
                        <li>3. Pilih menu "Scan QR" atau "QRIS"</li>
                        <li>4. Scan QR code yang ditampilkan</li>
                        <li>5. Transfer tepat sesuai nominal: Rp {formatCurrency(total)}</li>
                        <li>6. Setelah transfer, klik "Saya Sudah Transfer"</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                    {paymentStatus === 'pending' && (
                        <>
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Saya Sudah Transfer
                            </button>
                            
                            <button
                                onClick={onCancel}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                        </>
                    )}
                    
                    {paymentStatus === 'completed' && (
                        <button
                            onClick={onSuccess}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Lanjutkan ke Course
                        </button>
                    )}
                    
                    {paymentStatus === 'expired' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Coba Lagi
                        </button>
                    )}
                </div>

                {/* Status Messages */}
                {paymentStatus === 'completed' && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-green-600">
                            ✅ Pembayaran berhasil dikonfirmasi! Anda dapat mengakses course sekarang.
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Konfirmasi Pembayaran
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Jumlah yang harus dibayar:
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    Rp {formatCurrency(total)}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Masukkan jumlah yang Anda bayarkan:
                                </label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    placeholder="Contoh: 299000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ Pastikan jumlah yang Anda masukkan sesuai dengan jumlah yang benar-benar Anda transfer.
                                    Jika tidak sesuai, pembayaran akan ditolak.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isConfirming}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isConfirming || !amountPaid}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isConfirming ? 'Mengkonfirmasi...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}