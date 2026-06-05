import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    User,
    BookOpen,
    Calendar,
    Clock,
    Award,
    Activity,
    ArrowLeft,
    Edit,
    CheckCircle,
    XCircle,
    Pause,
    AlertCircle,
    Mail,
    Phone,
    MapPin,
    TrendingUp,
    BarChart3,
    PlayCircle,
    FileText,
    Star,
    Target,
    Zap
} from 'lucide-react';

export default function EnrollmentShow({ enrollment, progressHistory, userEnrollments }) {
    const getStatusIcon = (status) => {
        const icons = {
            'active': <CheckCircle className="w-5 h-5 text-green-600" />,
            'completed': <Award className="w-5 h-5 text-blue-600" />,
            'cancelled': <XCircle className="w-5 h-5 text-red-600" />,
            'suspended': <Pause className="w-5 h-5 text-yellow-600" />
        };
        return icons[status] || <AlertCircle className="w-5 h-5 text-gray-400" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800',
            'suspended': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
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
            return `${hours} jam ${mins} menit`;
        }
        return `${mins} menit`;
    };

    const handleStatusChange = (newStatus) => {
        if (confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) {
            router.put(route('admin.enrollments.update-status', enrollment.id), {
                status: newStatus
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via toast
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Enrollment Detail - ${enrollment.user?.first_name} ${enrollment.user?.last_name}`} />

            <div className="p-4 lg:p-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.enrollments.index')}
                                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Detail Pendaftaran</h1>
                                <p className="text-indigo-100">
                                    Informasi lengkap pendaftaran pelatihan siswa
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(enrollment.status)}
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(enrollment.status)}`}>
                                {enrollment.status}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Informasi Siswa
                            </h2>
                            
                            <div className="flex items-start space-x-6">
                                <div className="flex-shrink-0">
                                    {enrollment.user?.avatar ? (
                                        <img
                                            src={enrollment.user.avatar.startsWith('http')
                                                ? enrollment.user.avatar
                                                : `/storage/${enrollment.user.avatar}`}
                                            alt={enrollment.user.first_name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                            {enrollment.user?.first_name?.charAt(0)}
                                            {enrollment.user?.last_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {enrollment.user?.first_name} {enrollment.user?.last_name}
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-center text-gray-600">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <span>{enrollment.user?.email}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Bergabung {formatDate(enrollment.user?.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Course Information */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Informasi Pelatihan
                            </h2>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden flex-shrink-0">
                                    {enrollment.course?.thumbnail ? (
                                        <img
                                            src={`/storage/${enrollment.course.thumbnail}`}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-8 h-8 text-white/60" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {enrollment.course?.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {enrollment.course?.description}
                                    </p>
                                    
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>{enrollment.course?.duration_hours || 0} jam</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            <span>{enrollment.course?.lesson_count || 0} pelajaran</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Star className="w-4 h-4 mr-2" />
                                            <span className="capitalize">{enrollment.course?.level || 'Beginner'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Progress History */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                Riwayat Progress
                            </h2>
                            
                            {progressHistory && progressHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {progressHistory.map((history, index) => (
                                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{history.activity}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Progress: {history.progress}%
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(history.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Belum ada riwayat progress</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enrollment Stats */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Progress Pelatihan</span>
                                        <span className="text-lg font-bold text-indigo-600">
                                            {enrollment.progress_percentage || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Only show "Waktu Belajar" if there is actual time spent */}
                                {enrollment.total_time_spent && enrollment.total_time_spent > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Waktu Belajar</span>
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatTime(enrollment.total_time_spent)}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Tanggal Daftar</span>
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(enrollment.enrolled_at)}
                                    </p>
                                </div>
                                
                                {enrollment.completed_at && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Tanggal Selesai</span>
                                            <Award className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-900">
                                            {formatDate(enrollment.completed_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Status Management */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kelola Status</h3>
                            
                            <div className="space-y-2">
                                {['active', 'completed', 'suspended', 'cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={enrollment.status === status}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                            enrollment.status === status
                                                ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'
                                        }`}
                                    >
                                        <span className="flex items-center">
                                            {getStatusIcon(status)}
                                            <span className="ml-2 capitalize">{status}</span>
                                        </span>
                                        {enrollment.status === status && (
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                                Aktif
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Other User Enrollments */}
                        {userEnrollments && userEnrollments.length > 0 && (
                            <motion.div 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Pelatihan Lainnya
                                </h3>
                                
                                <div className="space-y-3">
                                    {userEnrollments.slice(0, 5).map((otherEnrollment, index) => (
                                        <Link
                                            key={index}
                                            href={route('admin.enrollments.show', otherEnrollment.id)}
                                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {otherEnrollment.course?.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {otherEnrollment.status}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}