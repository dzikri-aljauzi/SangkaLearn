import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    XCircle,
    RefreshCcw,
    Home,
    CreditCard,
    ArrowLeft,
    AlertTriangle
} from 'lucide-react';

export default function CheckoutFailed({ message, order_id, user }) {
    return (
        <AppLayout>
            <Head title="Pembayaran Gagal" />
            
            <div className="min-h-screen bg-red-50 py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Failed Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-500 px-8 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Gagal</h1>
                            <p className="text-red-100 text-lg">
                                {message || 'Maaf, pembayaran Anda tidak dapat diproses'}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-8">
                            {/* Order Details */}
                            {order_id && (
                                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ID Pesanan</label>
                                            <p className="text-gray-900 font-mono text-sm">{order_id}</p>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Gagal
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Possible Reasons */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Kemungkinan Penyebab</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Saldo atau limit kartu tidak mencukupi</h3>
                                            <p className="text-gray-600 text-sm">Pastikan saldo atau limit kartu kredit/debit Anda mencukupi untuk transaksi ini.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Informasi kartu salah</h3>
                                            <p className="text-gray-600 text-sm">Periksa kembali nomor kartu, tanggal kadaluarsa, dan kode CVV yang Anda masukkan.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Koneksi internet terputus</h3>
                                            <p className="text-gray-600 text-sm">Pastikan koneksi internet Anda stabil selama proses pembayaran.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Kartu diblokir atau tidak aktif</h3>
                                            <p className="text-gray-600 text-sm">Hubungi bank penerbit kartu untuk memastikan kartu Anda aktif dan dapat digunakan untuk transaksi online.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* What to do next */}
                            <div className="bg-blue-50 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apa yang harus dilakukan?</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-semibold text-sm">1</span>
                                        </div>
                                        <p className="text-gray-700">Periksa kembali informasi kartu dan saldo Anda</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-semibold text-sm">2</span>
                                        </div>
                                        <p className="text-gray-700">Coba menggunakan metode pembayaran lain</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-semibold text-sm">3</span>
                                        </div>
                                        <p className="text-gray-700">Hubungi customer support jika masalah berlanjut</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/checkout"
                                    className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    <RefreshCcw className="w-5 h-5 mr-2" />
                                    Coba Bayar Lagi
                                </Link>
                                <Link
                                    href="/cart"
                                    className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Kembali ke Keranjang
                                </Link>
                            </div>

                            {/* Support Info */}
                            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                                <p className="text-gray-600 mb-2">
                                    Butuh bantuan? Hubungi tim support kami
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                                    <a href="mailto:support@lms.com" className="text-blue-600 hover:text-blue-700 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        support@lms.com
                                    </a>
                                    <span className="text-gray-400 hidden sm:inline">•</span>
                                    <span className="text-gray-600">Response time: 24 jam</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-700"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}