import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    CreditCard,
    Calendar,
    Filter,
    Download,
    Eye,
    Receipt,
    Wallet,
    PieChart,
    BarChart3
} from 'lucide-react';

export default function RevenueReport({
    revenue_data,
    period,
    date_range
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [customDateRange, setCustomDateRange] = useState({
        start_date: '',
        end_date: ''
    });

    const periodOptions = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'yesterday', label: 'Kemarin' },
        { value: 'weekly', label: 'Minggu Ini' },
        { value: 'monthly', label: 'Bulan Ini' },
        { value: 'quarterly', label: 'Kuartal Ini' },
        { value: 'yearly', label: 'Tahun Ini' },
        { value: 'last_7_days', label: '7 Hari Terakhir' },
        { value: 'last_30_days', label: '30 Hari Terakhir' },
        { value: 'last_90_days', label: '90 Hari Terakhir' },
    ];

    const applyFilter = () => {
        const params = { period: selectedPeriod };
        
        if (customDateRange.start_date && customDateRange.end_date) {
            params.start_date = customDateRange.start_date;
            params.end_date = customDateRange.end_date;
        }

        router.get(route('admin.reports.revenue'), params);
    };

    const exportToExcel = () => {
        const params = { period: selectedPeriod };
        
        if (customDateRange.start_date && customDateRange.end_date) {
            params.start_date = customDateRange.start_date;
            params.end_date = customDateRange.end_date;
        }

        const url = route('admin.reports.export', params);
        window.open(url, '_blank');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method?.toLowerCase()) {
            case 'stripe':
                return <CreditCard className="w-4 h-4" />;
            case 'paypal':
                return <Wallet className="w-4 h-4" />;
            case 'bank_transfer':
                return <Receipt className="w-4 h-4" />;
            default:
                return <CreditCard className="w-4 h-4" />;
        }
    };

    const getPaymentMethodColor = (method) => {
        switch (method?.toLowerCase()) {
            case 'stripe':
                return 'bg-blue-100 text-blue-800';
            case 'paypal':
                return 'bg-yellow-100 text-yellow-800';
            case 'bank_transfer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const totalRevenue = revenue_data.payment_transactions.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalTransactions = revenue_data.payment_transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return (
        <AppLayout>
            <Head title="Laporan Pendapatan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => router.get(route('admin.reports.index'))}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Laporan Pendapatan</h1>
                                <p className="mt-2 text-gray-600">
                                    Analisis detail pendapatan dan transaksi pembayaran
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>
                                    {formatDate(date_range.start)} - {formatDate(date_range.end)}
                                </span>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 flex space-x-3">
                                <button 
                                    onClick={exportToExcel}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Periode
                                </label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {periodOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={customDateRange.start_date}
                                    onChange={(e) => setCustomDateRange({...customDateRange, start_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={customDateRange.end_date}
                                    onChange={(e) => setCustomDateRange({...customDateRange, end_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="flex items-end">
                                <button
                                    onClick={applyFilter}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Pendapatan</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {formatCurrency(totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-500">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            delay={0.1}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Transaksi</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {totalTransactions.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            delay={0.2}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Rata-rata Transaksi</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {formatCurrency(averageTransaction)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-500">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            delay={0.3}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Bulanan</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {revenue_data.monthly_breakdown.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-500">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Monthly Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Pendapatan Bulanan
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Trend pendapatan per bulan
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {revenue_data.monthly_breakdown.map((month, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {new Date(month.year, month.month - 1).toLocaleDateString('id-ID', { 
                                                    month: 'long', 
                                                    year: 'numeric' 
                                                })}
                                            </h4>
                                            <span className="text-sm text-gray-500">{month.transactions} transaksi</span>
                                        </div>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(month.total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Transactions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Riwayat Transaksi Pembayaran
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Detail semua pembayaran yang berhasil
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Order</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pembeli</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Metode</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Jumlah</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenue_data.payment_transactions.map((payment, index) => (
                                            <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <Receipt className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {payment.order_number}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                ID: {payment.transaction_id || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {payment.first_name} {payment.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {payment.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`}>
                                                        {getPaymentMethodIcon(payment.payment_method)}
                                                        <span className="ml-1">
                                                            {payment.payment_method === 'stripe' ? 'Stripe' :
                                                             payment.payment_method === 'paypal' ? 'PayPal' :
                                                             payment.payment_method === 'bank_transfer' ? 'Bank Transfer' :
                                                             payment.payment_method}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-green-600">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {payment.currency}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {payment.status === 'completed' ? 'Selesai' :
                                                         payment.status === 'pending' ? 'Pending' :
                                                         payment.status === 'failed' ? 'Gagal' :
                                                         payment.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">
                                                    {formatDateTime(payment.paid_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {revenue_data.payment_transactions.length === 0 && (
                                    <div className="text-center py-12">
                                        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Belum ada pembayaran dalam periode ini.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}