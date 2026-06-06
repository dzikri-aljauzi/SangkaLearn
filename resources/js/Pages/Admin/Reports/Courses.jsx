import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Filter,
    Download,
    Eye,
    Star,
    Clock,
    Target
} from 'lucide-react';

export default function CoursesReport({
    courses_data,
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

        router.get(route('admin.reports.courses'), params);
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

    const getPerformanceColor = (revenue) => {
        if (revenue > 1000000) return 'bg-green-100 text-green-800';
        if (revenue > 500000) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const totalRevenue = courses_data.course_performance.reduce((sum, course) => sum + parseFloat(course.revenue), 0);
    const totalSales = courses_data.course_performance.reduce((sum, course) => sum + parseInt(course.sales_count), 0);
    const totalEnrollments = courses_data.course_performance.reduce((sum, course) => sum + parseInt(course.enrollments_count), 0);

    return (
        <AppLayout>
            <Head title="Laporan Pelatihan" />

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
                                <h1 className="text-3xl font-bold text-gray-900">Laporan Pelatihan</h1>
                                <p className="mt-2 text-gray-600">
                                    Analisis performa penjualan dan pendaftaran pelatihan
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
                                    <p className="text-sm text-gray-600 font-medium">Total Penjualan</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {totalSales.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500">
                                    <Target className="w-6 h-6 text-white" />
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
                                    <p className="text-sm text-gray-600 font-medium">Total Pendaftaran</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {totalEnrollments.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-500">
                                    <Users className="w-6 h-6 text-white" />
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
                                    <p className="text-sm text-gray-600 font-medium">Rata-rata Harga</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : formatCurrency(0)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-500">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Course Performance Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Performa Pelatihan
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Detail penjualan dan pendaftaran setiap pelatihan
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pelatihan</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Harga</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Penjualan</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pendaftaran</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pendapatan</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Dibuat</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses_data.course_performance.map((course, index) => (
                                            <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                                <BookOpen className="w-6 h-6 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {course.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {course.subtitle || 'Tidak ada subtitle'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-900 font-medium">
                                                    {formatCurrency(course.price)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center">
                                                        <Target className="w-4 h-4 text-blue-500 mr-2" />
                                                        <span className="font-medium text-blue-600">
                                                            {course.sales_count} terjual
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center">
                                                        <Users className="w-4 h-4 text-purple-500 mr-2" />
                                                        <span className="font-medium text-purple-600">
                                                            {course.enrollments_count} siswa
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getPerformanceColor(course.revenue)}`}>
                                                        {formatCurrency(course.revenue)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        course.status === 'published' ? 'bg-green-100 text-green-800' : 
                                                        course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                        course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {course.status === 'published' ? 'Aktif' : 
                                                         course.status === 'draft' ? 'Draft' :
                                                         course.status === 'pending' ? 'Pending' :
                                                         course.status === 'archived' ? 'Arsip' : course.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">
                                                    {formatDate(course.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {courses_data.course_performance.length === 0 && (
                                    <div className="text-center py-12">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data pelatihan</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Belum ada penjualan atau pendaftaran pelatihan dalam periode ini.
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