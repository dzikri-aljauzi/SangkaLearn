import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    TrendingUp,
    TrendingDown,
    Award,
    BookOpen,
    CheckCircle,
    XCircle,
    Pause,
    AlertCircle,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';

export default function EnrollmentIndex({ 
    enrollments = { data: [], total: 0, from: 0, to: 0, last_page: 1, links: [] }, 
    stats = { total: 0, active: 0, completed: 0, this_month: 0, growth_percentage: 0, completion_rate: 0 }, 
    courses = [], 
    filters = { search: '', status: '', course: '', date_range: '', per_page: 15 },
    error = null
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedFilters, setSelectedFilters] = useState({
        status: filters.status || '',
        course: filters.course || '',
        date_range: filters.date_range || '',
        per_page: filters.per_page || 15
    });

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const applyFilters = (newFilters = {}) => {
        const params = { ...selectedFilters, ...newFilters };
        router.get('/admin/enrollments', params);
    };

    const getStatusIcon = (status) => {
        const icons = {
            'active': <UserCheck className="w-4 h-4 text-green-600" />,
            'completed': <CheckCircle className="w-4 h-4 text-blue-600" />
        };
        return icons[status] || <AlertCircle className="w-4 h-4 text-gray-400" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (minutes) => {
        if (!minutes) return '0 menit';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}j ${mins}m`;
        }
        return `${mins} menit`;
    };

    const StatCard = ({ title, value, change, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 text-sm ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                            {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                             change < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                            <span>{change > 0 ? '+' : ''}{change}%</span>
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
            <Head title="Riwayat Pendaftaran" />

            <div className="p-4 lg:p-6 space-y-6">
                {/* Error Display */}
                {error && (
                    <motion.div 
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </motion.div>
                )}

                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Riwayat Pendaftaran</h1>
                            <p className="text-indigo-100">
                                Kelola dan monitor semua pendaftaran pelatihan siswa
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <button 
                                onClick={() => {
                                    const params = new URLSearchParams(selectedFilters);
                                    const url = `/admin/enrollments/export?${params.toString()}`;
                                    window.open(url, '_blank');
                                }}
                                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Pendaftaran"
                        value={stats.total.toLocaleString()}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Sedang Aktif"
                        value={stats.active.toLocaleString()}
                        icon={UserCheck}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Selesai"
                        value={stats.completed.toLocaleString()}
                        icon={Award}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="Bulan Ini"
                        value={stats.this_month.toLocaleString()}
                        change={stats.growth_percentage}
                        icon={TrendingUp}
                        color="bg-orange-500"
                    />
                </div>

                {/* Filters */}
                <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari siswa atau pelatihan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </form>

                        {/* Status Filter */}
                        <select
                            value={selectedFilters.status}
                            onChange={(e) => applyFilters({ status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="completed">Selesai</option>
                        </select>

                        {/* Course Filter */}
                        <select
                            value={selectedFilters.course}
                            onChange={(e) => applyFilters({ course: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Semua Pelatihan</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>

                        {/* Date Range Filter */}
                        <select
                            value={selectedFilters.date_range}
                            onChange={(e) => applyFilters({ date_range: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Semua Waktu</option>
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                            <option value="year">Tahun Ini</option>
                        </select>
                    </div>
                </motion.div>

                {/* Enrollment List */}
                <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Daftar Pendaftaran ({enrollments.total.toLocaleString()})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Per halaman:</span>
                                <select
                                    value={selectedFilters.per_page}
                                    onChange={(e) => applyFilters({ per_page: e.target.value })}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                    <option value="15">15</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Siswa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pelatihan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Waktu Belajar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Daftar
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {enrollments?.data?.length > 0 ? enrollments.data.map((enrollment, index) => (
                                    <motion.tr 
                                        key={enrollment.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Student */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    {enrollment.user?.avatar ? (
                                                        <img
                                                            src={enrollment.user.avatar.startsWith('http')
                                                                ? enrollment.user.avatar
                                                                : `/storage/${enrollment.user.avatar}`}
                                                            alt={enrollment.user.first_name || 'User'}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                            {enrollment.user?.first_name?.charAt(0) || 'U'}
                                                            {enrollment.user?.last_name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {enrollment.user ? `${enrollment.user.first_name} ${enrollment.user.last_name}` : `User ID: ${enrollment.user_id}`}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {enrollment.user?.email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Course */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {enrollment.course?.title || `Course ID: ${enrollment.course_id}`}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(enrollment.status)}
                                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                                                    {enrollment.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                                        style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {enrollment.progress_percentage || 0}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Study Time */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {formatTime(enrollment.total_time_spent)}
                                            </div>
                                        </td>

                                        {/* Enrollment Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(enrollment.enrolled_at)}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/enrollments/${enrollment.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data pendaftaran
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {enrollments?.last_page > 1 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {enrollments?.from || 0} - {enrollments?.to || 0} dari {enrollments?.total || 0} pendaftaran
                                </div>
                                <div className="flex items-center space-x-2">
                                    {enrollments?.links?.filter(link => link && link.label)?.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                                    link.active 
                                                        ? 'bg-indigo-600 text-white' 
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={index}
                                                className="px-3 py-2 text-sm rounded-md text-gray-400 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Empty State */}
                {enrollments.data.length === 0 && (
                    <motion.div 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tidak ada pendaftaran ditemukan
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Belum ada siswa yang mendaftar atau coba ubah filter pencarian.
                        </p>
                        <button 
                            onClick={() => router.get('/admin/enrollments')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}