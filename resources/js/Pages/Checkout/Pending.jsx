import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Clock, Home, RefreshCw, AlertCircle } from 'lucide-react';

export default function CheckoutPending({ message, order_id }) {
    return (
        <AppLayout>
            <Head title="Pembayaran Pending" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {/* Pending Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
                            <Clock className="h-12 w-12 text-yellow-600" />
                        </div>
                        
                        {/* Pending Message */}
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Pembayaran Pending
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            {message || 'Pembayaran Anda sedang dalam proses'}
                        </p>
                        
                        {order_id && (
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">Order ID:</p>
                                <p className="text-lg font-mono text-gray-900">{order_id}</p>
                            </div>
                        )}
                    </div>

                    {/* Status Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Informasi Pembayaran
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Selesaikan pembayaran sesuai instruksi yang diberikan</li>
                                        <li>Pembayaran akan dikonfirmasi dalam 1x24 jam</li>
                                        <li>Anda akan mendapat notifikasi via email</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Periksa Status Pembayaran
                        </button>
                        
                        <Link
                            href="/dashboard"
                            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}