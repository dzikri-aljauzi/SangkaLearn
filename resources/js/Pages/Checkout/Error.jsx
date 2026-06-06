import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { XCircle, Home, RefreshCw, Phone, Mail } from 'lucide-react';

export default function CheckoutError({ message, order_id }) {
    return (
        <AppLayout>
            <Head title="Pembayaran Gagal" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {/* Error Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        
                        {/* Error Message */}
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Pembayaran Gagal
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            {message || 'Terjadi kesalahan saat memproses pembayaran'}
                        </p>
                        
                        {order_id && (
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">Order ID:</p>
                                <p className="text-lg font-mono text-gray-900">{order_id}</p>
                            </div>
                        )}
                    </div>

                    {/* Error Info */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Kemungkinan Penyebab
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Saldo kartu tidak mencukupi</li>
                                        <li>Koneksi internet terputus</li>
                                        <li>Data kartu yang dimasukkan tidak valid</li>
                                        <li>Bank sedang melakukan maintenance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                        <Link
                            href="/checkout"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Coba Lagi
                        </Link>
                        
                        <Link
                            href="/cart"
                            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Kembali ke Keranjang
                        </Link>
                        
                        <Link
                            href="/dashboard"
                            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Kembali ke Dashboard
                        </Link>
                    </div>

                    {/* Support Info */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-2">
                            Butuh Bantuan?
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>Email: support@lms.com</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>WhatsApp: +62 812 3456 7890</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}