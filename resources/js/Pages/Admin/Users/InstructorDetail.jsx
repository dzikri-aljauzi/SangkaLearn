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
    PlayCircle,
    DollarSign,
    Briefcase,
    Building
} from 'lucide-react';

export default function InstructorDetail({ instructor }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    const handleDelete = () => {
        router.delete(route('admin.users.instructors.destroy', instructor.id), {
            onSuccess: () => {
                toast.success('Instructor deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete instructor');
            }
        });
        setShowDeleteModal(false);
    };

    return (
        <AppLayout title={`Instructor Detail - ${instructor.first_name} ${instructor.last_name}`}>
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
                            href={route('admin.users.instructors')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                Instructor Detail
                            </h1>
                            <p className="text-gray-600 mt-1">
                                View and manage instructor information
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.users.instructors.edit', instructor.id)}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="p-6 text-center">
                                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {instructor.avatar ? (
                                        <img 
                                            src={instructor.avatar} 
                                            alt={`${instructor.first_name} ${instructor.last_name}`}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">
                                            {getInitials(instructor.first_name, instructor.last_name)}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {instructor.first_name} {instructor.last_name}
                                </h2>
                                <p className="text-gray-600 mb-4">{instructor.specialization || 'Instructor'}</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    instructor.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {instructor.is_active ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            Inactive
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{instructor.email}</p>
                                        <p className="text-xs text-gray-500">Email Address</p>
                                    </div>
                                </div>
                                {instructor.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{instructor.phone}</p>
                                            <p className="text-xs text-gray-500">Phone Number</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(instructor.created_at)}</p>
                                        <p className="text-xs text-gray-500">Joined Date</p>
                                    </div>
                                </div>
                                {instructor.experience_years && (
                                    <div className="flex items-center space-x-3">
                                        <Briefcase className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{instructor.experience_years} years</p>
                                            <p className="text-xs text-gray-500">Experience</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Bio */}
                        {instructor.bio && (
                            <motion.div 
                                className="bg-white rounded-2xl shadow-sm border border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Bio</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-700 leading-relaxed">{instructor.bio}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Statistics & Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistics Cards */}
                        <motion.div
                            className="grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{instructor.courses_count || 0}</p>
                                        <p className="text-sm text-gray-500">Courses</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{instructor.students_count || 0}</p>
                                        <p className="text-sm text-gray-500">Students</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Courses List */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
                            </div>
                            <div className="p-6">
                                {instructor.course_details && instructor.course_details.length > 0 ? (
                                    <div className="space-y-4">
                                        {instructor.course_details.map((course, index) => (
                                            <div key={course.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{course.enrollments_count || 0} students</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <DollarSign className="w-4 h-4" />
                                                                <span>{formatCurrency(course.price)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{formatDate(course.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            course.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : course.status === 'draft'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {course.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No courses created yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Instructor</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this instructor? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}