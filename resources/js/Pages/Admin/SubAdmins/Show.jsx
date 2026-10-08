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
    Users,
    Crown,
    Shield,
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
    Award,
    BarChart3,
    Target,
    PlayCircle,
    UserCheck
} from 'lucide-react';

export default function SubAdminShow({ subAdmin, assignedStudents = [], stats = {} }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
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
        router.delete(route('admin.sub-admins.destroy', subAdmin.id), {
            onSuccess: () => {
                toast.success('Sub Admin deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete sub admin');
            }
        });
        setShowDeleteModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title={`${subAdmin.first_name} ${subAdmin.last_name} - Sub Admin Details`}>
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
                            href={route('admin.sub-admins.index')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <Crown className="w-8 h-8 text-purple-600" />
                                <span>Sub Admin Details</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                View and manage sub administrator information
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.sub-admins.edit', subAdmin.id)}
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
                    {/* Left Column - Sub Admin Info */}
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
                                    {subAdmin.avatar ? (
                                        <img
                                            src={subAdmin.avatar}
                                            alt={subAdmin.first_name}
                                            className="w-24 h-24 rounded-full mx-auto mb-4"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                            {getInitials(subAdmin.first_name, subAdmin.last_name)}
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                                        <span>{subAdmin.first_name} {subAdmin.last_name}</span>
                                        <Crown className="w-5 h-5 text-purple-500" />
                                    </h2>
                                    <p className="text-purple-600 font-medium mt-1">Sub Administrator</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(subAdmin.is_active ? 'active' : 'inactive')}`}>
                                        {subAdmin.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Mail className="w-5 h-5" />
                                        <span className="text-sm">{subAdmin.email}</span>
                                    </div>
                                    {subAdmin.phone && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <Phone className="w-5 h-5" />
                                            <span className="text-sm">{subAdmin.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-sm">Joined {formatDate(subAdmin.created_at)}</span>
                                    </div>
                                    {subAdmin.city && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <MapPin className="w-5 h-5" />
                                            <span className="text-sm">{subAdmin.city}, {subAdmin.country || 'Indonesia'}</span>
                                        </div>
                                    )}
                                    {subAdmin.user_group && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <Users className="w-5 h-5" />
                                            <span className="text-sm">Group: {subAdmin.user_group.name}</span>
                                        </div>
                                    )}
                                </div>

                                {subAdmin.bio && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{subAdmin.bio}</p>
                                    </div>
                                )}
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
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <span>Management Overview</span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <UserCheck className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Assigned Students</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{stats.total_students || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Active Students</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{stats.active_students || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Total Enrollments</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{stats.total_enrollments || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Completed Courses</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{stats.completed_courses || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Award className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Certificates</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{stats.total_certificates || 0}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Assigned Students */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Assigned Students */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span>Assigned Students</span>
                                    </h3>
                                    <span className="text-sm text-gray-500">{assignedStudents.length} students</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {assignedStudents.map((student, index) => (
                                        <motion.div 
                                            key={student.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                {student.avatar ? (
                                                    <img
                                                        src={student.avatar}
                                                        alt={student.first_name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {getInitials(student.first_name, student.last_name)}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {student.first_name} {student.last_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        {student.email}
                                                    </p>
                                                    {student.user_group && (
                                                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                            {student.user_group.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {student.enrolled_courses_count || 0} courses
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-sm text-gray-600">
                                                            {student.certificates_count || 0} certificates
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <Link
                                                        href={route('admin.users.students.show', student.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="View Student Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.users.students.edit', student.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                        title="Edit Student"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {assignedStudents.length === 0 && (
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Students Assigned</h4>
                                            <p className="text-gray-500 mb-4">This sub admin doesn't have any assigned students yet.</p>
                                            <Link
                                                href={route('admin.users.students.create')}
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Add Students</span>
                                            </Link>
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
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Sub Admin</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{subAdmin.first_name} {subAdmin.last_name}</strong>? 
                                This will permanently remove their account and unassign all their students.
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
                                    Delete Sub Admin
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}