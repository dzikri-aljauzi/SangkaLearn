import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    ShoppingCart,
    BookOpen,
    Calendar,
    Filter,
    Download,
    Eye,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Target,
    Clock
} from 'lucide-react';

export default function ReportsIndex({
    summary,
    revenue,
    enrollments,
    courses,
    period,
    date_range
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [showFilters, setShowFilters] = useState(false);
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

        router.get(route('admin.reports.index'), params);
    };

    const exportToExcel = () => {
        const params = { period: selectedPeriod };
        
        if (customDateRange.start_date && customDateRange.end_date) {
            params.start_date = customDateRange.start_date;
            params.end_date = customDateRange.end_date;
        }

        // Create a temporary link to download the file
        const url = route('admin.reports.export', params);
        window.location.href = url;
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

    const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <AppLayout>
            <Head title="Laporan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Laporan Dashboard</h1>
                                <p className="mt-2 text-gray-600">
                                    Analisis performa dan statistik platform pembelajaran
                                </p>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 flex space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </button>
                                
                                <button 
                                    onClick={exportToExcel}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Excel
                                </button>
                            </div>
                        </div>

                        {/* Date Range Info */}
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                                {formatDate(date_range.start)} - {formatDate(date_range.end)}
                            </span>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Laporan</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={applyFilter}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Terapkan Filter
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Pendapatan"
                            value={formatCurrency(summary.total_revenue)}
                            icon={DollarSign}
                            color="bg-green-500"
                        />
                        
                        <StatCard
                            title="Total Pesanan"
                            value={summary.total_orders.toLocaleString()}
                            icon={ShoppingCart}
                            color="bg-blue-500"
                        />
                        
                        <StatCard
                            title="Total Pendaftaran"
                            value={summary.total_enrollments.toLocaleString()}
                            icon={Users}
                            color="bg-purple-500"
                        />
                        
                        <StatCard
                            title="Pelatihan Aktif"
                            value={summary.active_courses.toLocaleString()}
                            icon={BookOpen}
                            color="bg-orange-500"
                        />
                    </div>

                    {/* Charts and Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Revenue Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Trend Pendapatan</h3>
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-3">
                                {revenue.daily_revenue.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">{formatCurrency(day.total)}</div>
                                            <div className="text-xs text-gray-500">{day.transactions} transaksi</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Enrollment Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Trend Pendaftaran</h3>
                                <LineChart className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-3">
                                {enrollments.daily_enrollments.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                                        <div className="font-semibold text-purple-600">{day.total} siswa</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Courses and Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Selling Courses */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Pelatihan Terlaris</h3>
                                <Target className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-4">
                                {courses.top_selling_courses.map((course, index) => (
                                    <div key={course.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                <span>{course.sales_count} terjual</span>
                                                <span>{formatCurrency(course.revenue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Sales by Category */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Penjualan per Kategori</h3>
                                <PieChart className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-4">
                                {courses.sales_by_category.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="font-medium text-gray-900">{category.category_name}</span>
                                        </div>
                                        <span className="font-semibold text-blue-600">{category.total} pelatihan</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Detail</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => router.get(route('admin.reports.users'))}
                                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Users className="w-5 h-5 text-blue-600 mr-3" />
                                <span className="font-medium text-gray-900">Laporan Pengguna</span>
                            </button>
                            
                            <button
                                onClick={() => router.get(route('admin.reports.courses'))}
                                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <BookOpen className="w-5 h-5 text-green-600 mr-3" />
                                <span className="font-medium text-gray-900">Laporan Pelatihan</span>
                            </button>
                            
                            <button
                                onClick={() => router.get(route('admin.reports.revenue'))}
                                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <DollarSign className="w-5 h-5 text-purple-600 mr-3" />
                                <span className="font-medium text-gray-900">Laporan Pendapatan</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}