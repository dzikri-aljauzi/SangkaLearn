import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    Plus,
    Search,
    Filter,
    BookOpen,
    Users,
    DollarSign,
    Eye,
    Edit,
    Trash2,
    Star,
    Clock,
    Play,
    CheckCircle,
    AlertCircle,
    FileText,
    Download,
    Upload,
    MoreVertical,
    TrendingUp,
    Shield,
    Award
} from 'lucide-react';

export default function CoursesIndex({ courses = { data: [], total: 0 }, stats = {}, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const handleExport = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        
        const url = route('admin.courses.export') + (params.toString() ? '?' + params.toString() : '');
        window.open(url, '_blank');
    };


    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.courses.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStatusFilter = (status) => {
        router.get(route('admin.courses.index'), { 
            ...filters, 
            status: status === filters.status ? '' : status 
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleLevelFilter = (level) => {
        router.get(route('admin.courses.index'), { 
            ...filters, 
            level: level === filters.level ? '' : level 
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleAccessTypeFilter = (accessType) => {
        router.get(route('admin.courses.index'), { 
            ...filters, 
            access_type: accessType === filters.access_type ? '' : accessType 
        }, {
            preserveState: true,
            replace: true
        });
    };

    const deleteCourse = (courseSlug) => {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(route('admin.courses.destroy', courseSlug), {
                onSuccess: () => toast.success('Course deleted successfully!'),
                onError: () => toast.error('Failed to delete course')
            });
        }
    };

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

    const getAccessTypeColor = (accessType) => {
        switch (accessType) {
            case 'public':
                return 'bg-green-100 text-green-800';
            case 'private':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title="Kelola Pelatihan">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Pelatihan</h1>
                        <p className="text-gray-600 mt-1">Manage all courses on your platform</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                        
                        <Link
                            href={route('admin.courses.create')}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pelatihan</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pelatihan</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_courses || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.published_courses || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Draft</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.draft_courses || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_students || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_revenue > 1000000 
                                        ? `${(stats.total_revenue / 1000000).toFixed(1)}M` 
                                        : `${(stats.total_revenue / 1000).toFixed(0)}K`}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </form>

                        <div className="flex items-center space-x-3">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['all', 'published', 'draft', 'archived'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusFilter(status === 'all' ? '' : status)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                            (status === 'all' ? !filters.status : filters.status === status)
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelFilter(level === 'all' ? '' : level)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                            (level === 'all' ? !filters.level : filters.level === level)
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['all', 'public', 'private'].map((accessType) => (
                                    <button
                                        key={accessType}
                                        onClick={() => handleAccessTypeFilter(accessType === 'all' ? '' : accessType)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                            (accessType === 'all' ? !filters.access_type : filters.access_type === accessType)
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {accessType === 'all' ? 'All' : accessType.charAt(0).toUpperCase() + accessType.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Course Grid */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {courses.data && courses.data.length > 0 ? courses.data.map((course, index) => (
                        <motion.div
                            key={course.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            {/* Course Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                {course.thumbnail ? (
                                    <>
                                        <img
                                            src={course.thumbnail_url || `/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.warn('Thumbnail failed to load for course:', course.title);
                                                e.target.style.display = 'none';
                                                const fallback = e.target.parentNode.querySelector('.thumbnail-fallback');
                                                if (fallback) {
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div className="thumbnail-fallback w-full h-full flex items-center justify-center absolute inset-0" style={{display: 'none'}}>
                                            <div className="text-center text-white/50">
                                                <BookOpen className="w-16 h-16 mx-auto mb-2" />
                                                <p className="text-xs">Image not found</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-white/50" />
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                                        {course.status}
                                    </span>
                                </div>

                                {/* Level Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                                        {course.level}
                                    </span>
                                </div>

                                {/* Access Type Badge */}
                                <div className="absolute bottom-3 left-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccessTypeColor(course.access_type)}`}>
                                        {course.access_type === 'public' ? 'Public' : 'Private'}
                                    </span>
                                </div>

                                {/* Preview Button */}
                                <div className="absolute bottom-3 right-3">
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        target="_blank"
                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                                        title="Preview Course (Opens in new tab)"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                                        {course.subtitle || course.description}
                                    </p>
                                </div>

                                {/* Instructor */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {course.instructor?.first_name?.charAt(0)}{course.instructor?.last_name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1 relative group cursor-pointer">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {course.instructor?.first_name} {course.instructor?.last_name}
                                        </p>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max max-w-[200px] break-words whitespace-normal text-center z-50">
                                            {course.instructor?.first_name} {course.instructor?.last_name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{course.students_count || 0} students</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{course.duration_hours || 0}h</span>
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1"></div>

                                {/* Course Actions - Fixed at bottom */}
                                <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={route('admin.courses.content', course.slug)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                                        >
                                            {/* <FileText className="w-4 h-4" /> */}
                                            <span className='text-sm'>Kelola Konten</span>
                                        </Link>
                                        <Link
                                            href={`/admin/courses/${course.slug}/preview`}
                                            className="flex items-center justify-center px-3 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                            title="Preview Student View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        {course.access_type === 'private' && (
                                            <Link
                                                href={route('admin.courses.access', course.id)}
                                                className="flex items-center justify-center px-3 py-2.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                                title="Manage Access"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </Link>
                                        )}
                                        <Link
                                            href={route('admin.courses.edit', course.slug)}
                                            className="flex items-center justify-center px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => deleteCourse(course.slug)}
                                            className="flex items-center justify-center px-3 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Price and Revenue */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {course.is_free ? 'Free' : formatCurrency(course.price)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Revenue: {formatCurrency(course.revenue || 0)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium text-gray-900">4.8</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Rating</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filters.status || filters.level || filters.access_type
                                    ? 'Try adjusting your search or filters' 
                                    : 'Get started by creating your first course'}
                            </p>
                            <Link
                                href={route('admin.courses.create')}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Pelatihan</span>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                {courses.data && courses.data.length > 0 && courses.last_page > 1 && (
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {courses.from || 1} to {courses.to || courses.data.length} of {courses.total} courses
                            </div>
                            <div className="flex items-center space-x-2">
                                {courses.prev_page_url && (
                                    <Link
                                        href={courses.prev_page_url}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}
                                
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Page {courses.current_page} of {courses.last_page}
                                </span>
                                
                                {courses.next_page_url && (
                                    <Link
                                        href={courses.next_page_url}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}