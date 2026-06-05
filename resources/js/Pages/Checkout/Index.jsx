import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import QRISPayment from '../../Components/QRISPayment';
import {
    CreditCard,
    Wallet,
    Building,
    Lock,
    CheckCircle,
    ArrowLeft,
    User,
    Mail,
    MapPin,
    Phone,
    Calendar,
    Shield,
    QrCode,
    Smartphone
} from 'lucide-react';

export default function CheckoutIndex({ items, total, itemCount, user }) {
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [formData, setFormData] = useState({
        payment_method: 'bank_transfer',
        card_number: '',
        expiry_date: '',
        cvv: '',
        cardholder_name: user.name,
        billing_email: user.email,
        billing_phone: '',
        billing_address: '',
        billing_city: '',
        billing_postal_code: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQRIS, setShowQRIS] = useState(false);
    const [qrisOrderId, setQrisOrderId] = useState(null);
    const [qrisData, setQrisData] = useState(null); // Store full QRIS payment response

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Auto-format card number (XXXX XXXX XXXX XXXX)
        if (name === 'card_number') {
            formattedValue = value
                .replace(/\s/g, '') // Remove existing spaces
                .replace(/(.{4})/g, '$1 ') // Add space every 4 digits
                .trim() // Remove trailing space
                .substr(0, 19); // Max 19 characters (16 digits + 3 spaces)
        }

        // Auto-format expiry date (MM/YY)
        if (name === 'expiry_date') {
            formattedValue = value
                .replace(/\D/g, '') // Remove non-digits
                .replace(/(\d{2})(\d)/, '$1/$2') // Add slash after 2 digits
                .substr(0, 5); // Max 5 characters (MM/YY)
        }

        // Auto-format CVV (numbers only)
        if (name === 'cvv') {
            formattedValue = value
                .replace(/\D/g, '') // Remove non-digits
                .substr(0, 4); // Max 4 digits
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setFormData(prev => ({
            ...prev,
            payment_method: method
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Prepare payment data
            const paymentData = {
                items: items,
                total: total,
                payment_method: paymentMethod,
                billing_details: {
                    address: formData.billing_address,
                    city: formData.billing_city,
                    postal_code: formData.billing_postal_code,
                    email: formData.billing_email,
                    phone: formData.billing_phone
                }
            };

            // Determine endpoint based on payment method
            const endpoint = paymentMethod === 'dana'
                ? '/payment/dana/create'
                : '/checkout/process';

            // Send request to create Midtrans transaction
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (result.success) {
                // Load Midtrans Snap
                window.snap.pay(result.snap_token, {
                    onSuccess: function(result) {
                        console.log('Payment success:', result);
                        window.location.href = '/payment/finish?order_id=' + result.order_id;
                    },
                    onPending: function(result) {
                        console.log('Payment pending:', result);
                        window.location.href = '/payment/unfinish?order_id=' + result.order_id;
                    },
                    onError: function(result) {
                        console.log('Payment error:', result);
                        window.location.href = '/payment/error?order_id=' + result.order_id;
                    },
                    onClose: function() {
                        console.log('Payment popup closed');
                        setIsProcessing(false);
                    }
                });
            } else {
                alert('Gagal memproses pembayaran: ' + result.message);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Terjadi kesalahan saat memproses pembayaran');
            setIsProcessing(false);
        }
    };

    // Handle QRIS payment callbacks
    const handleQRISSuccess = (result) => {
        console.log('QRIS Payment success:', result);
        window.location.href = '/payment/finish?order_id=' + result.order_id;
    };

    const handleQRISCancel = () => {
        setShowQRIS(false);
        setQrisOrderId(null);
        setIsProcessing(false);
    };

    const handleQRISError = (error) => {
        console.error('QRIS Payment error:', error);
        alert('Pembayaran QRIS gagal: ' + error);
        setShowQRIS(false);
        setQrisOrderId(null);
        setIsProcessing(false);
    };

    return (
        <AppLayout>
            <Head title="Checkout - Pembayaran" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/cart"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Keranjang
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="mt-2 text-gray-600">Selesaikan pembelian Anda</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Payment Form */}
                        <div className="space-y-6">
                            {/* Payment Method Selection */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
                                
                                <div className="space-y-3">

                                    {/* Bank Transfer */}
                                    <div
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            paymentMethod === 'bank_transfer'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePaymentMethodChange('bank_transfer')}
                                    >
                                        <div className="flex items-center">
                                            <Building className="w-6 h-6 text-purple-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Transfer Bank</h3>
                                                <p className="text-sm text-gray-500">BNI, BRI, Mandiri, CIMB Niaga, PermataBank (Virtual Account)</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={`w-4 h-4 rounded-full border-2 ${
                                                    paymentMethod === 'bank_transfer'
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === 'bank_transfer' && (
                                                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DANA */}
                                    <div
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            paymentMethod === 'dana'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePaymentMethodChange('dana')}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 mr-3 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                                                    <rect width="24" height="24" rx="6" fill="#108EE9"/>
                                                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">DANA</text>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">DANA</h3>
                                                <p className="text-sm text-gray-500">Bayar dengan e-wallet DANA</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={`w-4 h-4 rounded-full border-2 ${
                                                    paymentMethod === 'dana'
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === 'dana' && (
                                                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details Form */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Pembayaran</h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    <div className="text-center py-8">
                                        <div className="text-gray-500">
                                            Instruksi pembayaran akan ditampilkan setelah Anda mengklik "Bayar Sekarang"
                                        </div>
                                    </div>

                                    {/* Billing Information */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-md font-medium text-gray-900 mb-4">Informasi Tagihan</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="billing_email"
                                                    value={formData.billing_email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nomor Telepon
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="billing_phone"
                                                    value={formData.billing_phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="+62 812 3456 7890"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Memproses Pembayaran...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5 mr-2" />
                                                    Bayar Sekarang - Rp {parseInt(total).toLocaleString()}
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            <Shield className="w-3 h-3 inline mr-1" />
                                            Pembayaran Anda aman dan terenkripsi
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                                
                                {/* Items */}
                                <div className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <img
                                                src={item.course.thumbnail || '/api/placeholder/80/60'}
                                                alt={item.course.title}
                                                className="w-16 h-12 object-cover rounded-md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {item.course.title}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {item.course.instructor_name}
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.course.final_price == 0 ? 'GRATIS' : `Rp ${parseInt(item.course.final_price).toLocaleString()}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({itemCount} item)</span>
                                        <span className="text-gray-900">Rp {parseInt(total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Biaya Administrasi</span>
                                        <span className="text-gray-900">Rp 0</span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-600">Rp {parseInt(total).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        Garansi 30 hari uang kembali
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        Akses seumur hidup
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        Sertifikat penyelesaian
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QRIS Payment Modal */}
            {showQRIS && qrisOrderId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-lg w-full">
                        <QRISPayment
                            orderId={qrisOrderId}
                            total={total}
                            onSuccess={handleQRISSuccess}
                            onCancel={handleQRISCancel}
                            onError={handleQRISError}
                            paymentType="qris"
                            qrCodeUrl={qrisData?.qr_code_url || null}
                            acquirer={qrisData?.acquirer || 'gopay'}
                        />
                    </div>
                </div>
            )}

        </AppLayout>
    );
}