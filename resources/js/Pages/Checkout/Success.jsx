import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    CheckCircle,
    Download,
    BookOpen,
    Mail,
    Calendar,
    Home,
    ArrowRight
} from 'lucide-react';

export default function CheckoutSuccess({ message, order_id, user }) {
    useEffect(() => {
        // Clear cart after successful payment (if needed)
        // This could be done via an API call or other mechanism
    }, []);

    return (
        <AppLayout>
            <Head title="Pembayaran Berhasil" />
            
            <div className="min-h-screen bg-green-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-green-500 px-8 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Berhasil!</h1>
                            <p className="text-green-100 text-lg">
                                Terima kasih atas pembelian Anda{user?.name ? ', ' + user.name : ''}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-8">
                            {/* Order Details */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ID Pesanan</label>
                                        <p className="text-gray-900 font-mono text-sm">{order_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tanggal</label>
                                        <p className="text-gray-900">{new Date().toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Berhasil
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* What's Next */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Langkah Selanjutnya</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Mail className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-medium text-gray-900">Email Konfirmasi</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-600">
                                            Kami telah mengirimkan email konfirmasi pembayaran dan detail akses pelatihan ke <strong>{user?.email || 'email Anda'}</strong>
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-6 h-6 text-green-600" />
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-medium text-gray-900">Akses Pelatihan</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-600">
                                            Pelatihan Anda sudah aktif dan dapat diakses melalui dashboard pembelajaran Anda.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-blue-50 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yang Anda Dapatkan:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Akses ke semua materi</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Sertifikat penyelesaian</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Akses di mobile & desktop</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/student/my-learning"
                                    className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Mulai Belajar Sekarang
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                                <Link
                                    href="/student/browse-courses"
                                    className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    Jelajahi Pelatihan Lainnya
                                </Link>
                            </div>

                            {/* Support Info */}
                            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                                <p className="text-gray-600 mb-2">
                                    Butuh bantuan? Hubungi tim support kami
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                                    <a href="mailto:support@lms.com" className="text-blue-600 hover:text-blue-700 flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
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