import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Globe,
    User,
    BookOpen,
    Trophy,
    Clock,
    Activity,
    TrendingUp,
    Star,
    Download,
    Eye,
    CheckCircle,
    AlertCircle,
    Users,
    GraduationCap,
    Award,
    BarChart3,
    Target,
    PlayCircle
} from 'lucide-react';

export default function StudentDetail({ student }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Use real data from the backend
    const studentData = {
        ...student,
        enrollments: student.enrollments || [],
        certificates: student.certificates || [],
        stats: {
            total_courses: student.enrolled_courses_count || 0,
            completed_courses: student.completed_courses_count || 0,
            in_progress_courses: student.in_progress_courses_count || 0,
            total_certificates: student.certificates_count || 0,
            total_learning_hours: student.total_learning_hours || 0,
            average_progress: student.average_progress || 0
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    const handleDelete = () => {
        router.delete(route('admin.users.students.destroy', student.id), {
            onSuccess: () => {
                toast.success('Student deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete student');
            }
        });
        setShowDeleteModal(false);
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-yellow-500';
        if (progress >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'suspended':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title={`${studentData.first_name} ${studentData.last_name} - Student Details`}>
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
                            href={route('admin.users.students')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                Student Details
                            </h1>
                            <p className="text-gray-600 mt-1">
                                View and manage student information
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.users.students.edit', student.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Student Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    {studentData.avatar ? (
                                        <img
                                            src={studentData.avatar}
                                            alt={studentData.first_name}
                                            className="w-24 h-24 rounded-full mx-auto mb-4"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                            {getInitials(studentData.first_name, studentData.last_name)}
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {studentData.first_name} {studentData.last_name}
                                    </h2>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(studentData.status)}`}>
                                        {studentData.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Mail className="w-5 h-5" />
                                        <span className="text-sm">{studentData.email}</span>
                                    </div>
                                    {studentData.phone && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <Phone className="w-5 h-5" />
                                            <span className="text-sm">{studentData.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-sm">Joined {formatDate(studentData.created_at)}</span>
                                    </div>
                                    {studentData.city && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <MapPin className="w-5 h-5" />
                                            <span className="text-sm">{studentData.city}, {studentData.country || 'Indonesia'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Card */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Learning Statistics</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Total Courses</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{studentData.stats.total_courses}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Completed</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{studentData.stats.completed_courses}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">In Progress</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{studentData.stats.in_progress_courses}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Certificates</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{studentData.stats.total_certificates}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Learning Hours</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{studentData.stats.total_learning_hours}h</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Courses and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Enrolled Courses */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Enrolled Courses</h3>
                                    <span className="text-sm text-gray-500">{studentData.enrollments.length} courses</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {studentData.enrollments.map((enrollment, index) => (
                                        <motion.div 
                                            key={enrollment.id}
                                            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="relative w-16 h-16 bg-blue-500 rounded-lg overflow-hidden">
                                                {enrollment.course.thumbnail ? (
                                                    <img
                                                        src={`/storage/${enrollment.course.thumbnail}`}
                                                        alt={enrollment.course.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full flex items-center justify-center ${enrollment.course.thumbnail ? 'hidden' : 'flex'}`}>
                                                    <BookOpen className="w-8 h-8 text-white/60" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {enrollment.course.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    by {enrollment.course.instructor.first_name} {enrollment.course.instructor.last_name}
                                                </p>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress)}`}
                                                                style={{width: `${enrollment.progress}%`}}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {enrollment.progress}%
                                                        </span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        enrollment.status === 'completed' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : enrollment.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {enrollment.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Enrolled</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {formatDate(enrollment.enrolled_at)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {studentData.enrollments.length === 0 && (
                                        <div className="text-center py-8">
                                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h4>
                                            <p className="text-gray-500">Student hasn't enrolled in any courses yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Certificates */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Certificates</h3>
                                    <span className="text-sm text-gray-500">{studentData.certificates.length} certificates</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {studentData.certificates.map((certificate, index) => (
                                        <motion.div 
                                            key={certificate.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all duration-200"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                    <Award className="w-6 h-6 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {certificate.course_title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Issued on {formatDate(certificate.issued_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={certificate.certificate_url}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="View Certificate"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <a
                                                    href={certificate.certificate_url}
                                                    download
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                    title="Download Certificate"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {studentData.certificates.length === 0 && (
                                        <div className="text-center py-8">
                                            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h4>
                                            <p className="text-gray-500">Student hasn't earned any certificates yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div 
                            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{studentData.first_name} {studentData.last_name}</strong>? 
                                This will permanently remove their account and all associated data.
                            </p>
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Student
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}