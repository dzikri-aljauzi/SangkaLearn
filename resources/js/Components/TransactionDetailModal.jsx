import React from 'react';
import {
    X,
    Calendar,
    CreditCard,
    User,
    Mail,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    ExternalLink,
    Package,
    Receipt
} from 'lucide-react';

export default function TransactionDetailModal({ transaction, onClose }) {
    if (!transaction) return null;

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'pending':
                return <Clock className="w-6 h-6 text-yellow-600" />;
            default:
                return <XCircle className="w-6 h-6 text-red-600" />;
        }
    };

    // Get status badge color
    const getStatusBadgeClass = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-800 border-green-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-6 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Receipt className="w-8 h-8" />
                                    <div>
                                        <h2 className="text-2xl font-bold">Detail Transaksi</h2>
                                        <p className="text-blue-100 text-sm">Order #{transaction.order_number}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Status and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        {getStatusIcon(transaction.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status Pembayaran</p>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClass(transaction.status_color)}`}>
                                            {transaction.status_label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tanggal Pembelian</p>
                                        <p className="font-semibold text-gray-900">{transaction.formatted_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Informasi Pembayaran
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Metode Pembayaran</p>
                                    <p className="font-semibold text-gray-900">{transaction.payment_method}</p>
                                </div>
                                {transaction.transaction_id && (
                                    <div>
                                        <p className="text-sm text-gray-600">ID Transaksi</p>
                                        <p className="font-mono text-sm text-gray-900">{transaction.transaction_id}</p>
                                    </div>
                                )}
                                {transaction.paid_at && (
                                    <div>
                                        <p className="text-sm text-gray-600">Dibayar Pada</p>
                                        <p className="text-sm text-gray-900">{transaction.paid_at}</p>
                                    </div>
                                )}
                                {transaction.confirmed_at && (
                                    <div>
                                        <p className="text-sm text-gray-600">Dikonfirmasi Pada</p>
                                        <p className="text-sm text-gray-900">{transaction.confirmed_at}</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Proof */}
                            {transaction.payment_proof && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Bukti Pembayaran</p>
                                    <a
                                        href={transaction.payment_proof}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Lihat Bukti Pembayaran
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Buyer Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-600" />
                                Informasi Pembeli
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nama</p>
                                        <p className="font-semibold text-gray-900">{transaction.buyer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-semibold text-gray-900">{transaction.buyer_email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-600" />
                                Pelatihan yang Dibeli
                            </h3>
                            <div className="space-y-3">
                                {transaction.courses.map((course, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                        {course.category}
                                                    </span>
                                                    {course.is_enrolled && (
                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Terdaftar
                                                        </span>
                                                    )}
                                                </div>
                                                {course.enrolled_at && (
                                                    <p className="text-xs text-gray-500">
                                                        Terdaftar sejak {course.enrolled_at}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-bold text-lg text-gray-900 mb-2">
                                                    {course.formatted_price}
                                                </div>
                                                {course.is_enrolled && (
                                                    <a
                                                        href={route('courses.show', course.slug)}
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Buka Pelatihan
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                Rincian Harga
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{transaction.formatted_subtotal}</span>
                                </div>
                                {transaction.discount_amount > 0 && (
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>Diskon</span>
                                        <span className="font-semibold">- {transaction.formatted_discount}</span>
                                    </div>
                                )}
                                {transaction.tax_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Pajak</span>
                                        <span className="font-semibold text-gray-900">{transaction.formatted_tax}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t-2 border-gray-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">{transaction.formatted_total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
