import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    BookOpen,
    Users,
    Clock,
    DollarSign,
    Globe,
    Target,
    CheckCircle,
    Eye,
    Edit,
    FileText,
    Calendar,
    Star,
    TrendingUp,
    Award,
    BarChart3,
    Activity
} from 'lucide-react';

export default function ShowCourse({ course }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner':
                return 'bg-blue-100 text-blue-800';
            case 'intermediate':
                return 'bg-orange-100 text-orange-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title={`Course Details - ${course.title}`}>
            <Head title={`Course Details - ${course.title}`} />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.courses.index')}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Details</h1>
                            <p className="text-gray-600 mt-1">View course information and statistics</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.courses.content', course.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Manage Content</span>
                        </Link>
                        
                        <Link
                            href={route('admin.courses.edit', course.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Course</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Course Overview Card */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Course Thumbnail */}
                        <div className="lg:col-span-1">
                            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                                {course.thumbnail ? (
                                    <img
                                        src={`/storage/${course.thumbnail}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-24 h-24 text-white/50" />
                                    </div>
                                )}
                                
                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(course.status)}`}>
                                        {course.status}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelColor(course.level)}`}>
                                        {course.level}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Course Details */}
                        <div className="lg:col-span-2 p-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                                    {course.subtitle && (
                                        <p className="text-lg text-gray-600 mb-4">{course.subtitle}</p>
                                    )}
                                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                                </div>

                                {/* Instructor */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {course.instructor?.first_name?.charAt(0)}{course.instructor?.last_name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1 relative group cursor-pointer">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {course.instructor?.first_name} {course.instructor?.last_name}
                                        </p>
                                        <p className="text-sm text-gray-600">Course Instructor</p>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max max-w-[200px] break-words whitespace-normal text-center z-50">
                                            {course.instructor?.first_name} {course.instructor?.last_name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Meta */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{course.duration_hours}h</p>
                                            <p className="text-xs text-gray-500">Duration</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{course.students_count || 0}</p>
                                            <p className="text-xs text-gray-500">Students</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Globe className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{course.language}</p>
                                            <p className="text-xs text-gray-500">Language</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {course.is_free ? 'Free' : formatCurrency(course.price)}
                                            </p>
                                            <p className="text-xs text-gray-500">Price</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                                <p className="text-2xl font-bold text-gray-900">{course.students_count || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(course.revenue || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round(course.completion_rate || 0)}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rating</p>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <p className="text-2xl font-bold text-gray-900">
                                        {course.rating_avg || '0.0'}
                                    </p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Learning Objectives */}
                    {course.learning_objectives && course.learning_objectives.length > 0 && (
                        <motion.div 
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center space-x-2 mb-4">
                                <Target className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
                            </div>
                            <ul className="space-y-2">
                                {course.learning_objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700">{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Requirements */}
                    {course.requirements && course.requirements.length > 0 && (
                        <motion.div 
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center space-x-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                            </div>
                            <ul className="space-y-2">
                                {course.requirements.map((requirement, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{requirement}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Course Dates */}
                <motion.div 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Course Timeline</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Created</p>
                            <p className="text-gray-900">
                                {new Date(course.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Last Updated</p>
                            <p className="text-gray-900">
                                {new Date(course.updated_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        {course.published_at && (
                            <div>
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-gray-900">
                                    {new Date(course.published_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}