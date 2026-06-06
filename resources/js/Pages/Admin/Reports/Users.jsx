import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Users,
    UserPlus,
    TrendingUp,
    Calendar,
    Filter,
    Download,
    Eye,
    Mail,
    Award,
    Clock
} from 'lucide-react';

export default function UsersReport({
    users_data,
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

        router.get(route('admin.reports.users'), params);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getRoleColor = (role) => {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'instructor': 'bg-blue-100 text-blue-800',
            'student': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="Laporan Pengguna" />

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
                                <h1 className="text-3xl font-bold text-gray-900">Laporan Pengguna</h1>
                                <p className="mt-2 text-gray-600">
                                    Analisis registrasi dan aktivitas pengguna platform
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Pengguna Baru</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {users_data.total_new_users.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500">
                                    <UserPlus className="w-6 h-6 text-white" />
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
                                    <p className="text-sm text-gray-600 font-medium">Rata-rata per Hari</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {users_data.daily_registrations.length > 0 
                                            ? Math.round(users_data.total_new_users / users_data.daily_registrations.length)
                                            : 0
                                        }
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-500">
                                    <TrendingUp className="w-6 h-6 text-white" />
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
                                    <p className="text-sm text-gray-600 font-medium">Jumlah Peran</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {users_data.users_by_role.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-500">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Daily Registrations */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Registrasi Harian
                            </h3>
                            
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {users_data.daily_registrations.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            <span className="font-semibold text-blue-600">{day.total} pengguna</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Users by Role */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Distribusi Berdasarkan Peran
                            </h3>
                            
                            <div className="space-y-4">
                                {users_data.users_by_role.map((role, index) => {
                                    const percentage = users_data.total_new_users > 0 
                                        ? (role.total / users_data.total_new_users) * 100 
                                        : 0;
                                    
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.role_name)}`}>
                                                        {role.role_name === 'admin' ? 'Admin' : 
                                                         role.role_name === 'instructor' ? 'Instruktur' : 'Siswa'}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {role.total} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{width: `${percentage}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Students */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Siswa Paling Aktif
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Berdasarkan jumlah pelatihan yang diikuti
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Pelatihan Diikuti</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Bergabung</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users_data.top_students.map((student, index) => (
                                            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">
                                                    {student.email}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {student.enrollments_count} pelatihan
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">
                                                    {formatDate(student.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}