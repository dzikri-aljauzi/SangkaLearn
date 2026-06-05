import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Award,
    TrendingUp,
    Clock,
    CheckCircle,
    PlayCircle,
    PauseCircle,
    Globe,
    Users,
    Eye,
    Download
} from 'lucide-react';

export default function SubAdminStudentDetail({ student, stats, enrollments, certificates, recentActivity, subAdmin }) {
    const [activeTab, setActiveTab] = useState('overview');

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'active': return 'text-blue-600 bg-blue-100';
            case 'paused': return 'text-yellow-600 bg-yellow-100';
            case 'suspended': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'active': return <PlayCircle className="w-4 h-4" />;
            case 'paused': return <PauseCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getProgressBarColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <AppLayout title={`${student.first_name} ${student.last_name} - Student Details`}>
            <Head title={`${student.first_name} ${student.last_name} - Student Details`} />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/subadmin/students"
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <User className="w-8 h-8 text-blue-600" />
                                <span>{student.first_name} {student.last_name}</span>
                            </h1>
                            <p className="text-gray-600 mt-1">Student Progress Overview</p>
                        </div>
                    </div>
                </motion.div>

                {/* Student Profile Card */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="px-6 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="" className="w-20 h-20 rounded-full" />
                                    ) : (
                                        <span className="text-blue-600 font-bold text-2xl">
                                            {student.first_name[0]}{student.last_name[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
                                    <div className="flex flex-col space-y-2 mt-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{student.email}</span>
                                        </div>
                                        {student.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{student.phone}</span>
                                            </div>
                                        )}
                                        {(student.city || student.country) && (
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {student.city && student.country 
                                                        ? `${student.city}, ${student.country}`
                                                        : student.city || student.country
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {formatDate(student.created_at)}</span>
                                        </div>
                                        {student.user_group && (
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4" />
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                                    {student.user_group.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 lg:mt-0">
                                <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                    student.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                        student.is_active ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    {student.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_enrollments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completed_enrollments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <PlayCircle className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.in_progress_enrollments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Certificates</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_certificates}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Average Progress */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Average Progress</h3>
                        <span className="text-2xl font-bold text-gray-900">{stats.average_progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(stats.average_progress)}`}
                            style={{ width: `${stats.average_progress}%` }}
                        ></div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Course Enrollments
                            </button>
                            <button
                                onClick={() => setActiveTab('certificates')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === 'certificates'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Certificates
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                {enrollments && enrollments.length > 0 ? (
                                    enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">{enrollment.course.title}</h4>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                            <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
                                                            {enrollment.completed_at && (
                                                                <span>• Completed: {formatDate(enrollment.completed_at)}</span>
                                                            )}
                                                            {enrollment.last_accessed_at && (
                                                                <span>• Last accessed: {formatDate(enrollment.last_accessed_at)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {Math.round(enrollment.progress_percentage || 0)}%
                                                        </div>
                                                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                                            <div 
                                                                className={`h-2 rounded-full ${getProgressBarColor(enrollment.progress_percentage || 0)}`}
                                                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                                                        {getStatusIcon(enrollment.status)}
                                                        <span className="ml-1 capitalize">{enrollment.status}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Enrollments</h3>
                                        <p className="text-gray-600">This student hasn't enrolled in any courses yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'certificates' && (
                            <div className="space-y-4">
                                {certificates && certificates.length > 0 ? (
                                    certificates.map((certificate) => (
                                        <div key={certificate.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Award className="w-6 h-6 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">{certificate.course.title}</h4>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                            <span>Issued: {formatDate(certificate.issued_at)}</span>
                                                            {certificate.grade && (
                                                                <span>• Grade: {certificate.grade}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {certificate.certificate_url && (
                                                    <a
                                                        href={certificate.certificate_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>Download</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates</h3>
                                        <p className="text-gray-600">This student hasn't earned any certificates yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}