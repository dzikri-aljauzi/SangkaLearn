import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    BookOpen, 
    Users, 
    Eye, 
    Search,
    Filter,
    TrendingUp,
    Book,
    Play,
    CheckCircle,
    AlertTriangle,
    FileText,
    HelpCircle,
    Calendar
} from 'lucide-react';

export default function Index() {
    const { courses = [], error } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // Implementation for search if needed
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            published: {
                class: 'bg-green-100 text-green-800',
                icon: CheckCircle,
                label: 'Published'
            },
            draft: {
                class: 'bg-yellow-100 text-yellow-800', 
                icon: AlertTriangle,
                label: 'Draft'
            },
            archived: {
                class: 'bg-gray-100 text-gray-800',
                icon: AlertTriangle,
                label: 'Archived'
            }
        };

        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const getEngagementLevel = (course) => {
        if (course.enrollments_count === 0) return 'No Activity';
        if (course.enrollments_count >= 50) return 'High';
        if (course.enrollments_count >= 20) return 'Medium'; 
        return 'Low';
    };

    const filteredCourses = courses.filter(course => {
        if (!course) return false;

        const matchesSearch = (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.instructor?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.instructor?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout>
            <Head title="Course Monitoring" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Monitoring</h1>
                        <p className="text-gray-600">Monitor course performance, engagement, and content statistics</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Courses
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search by course title or instructor..."
                                        />
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Status
                                    </label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                                <h3 className="text-sm font-medium text-red-800">
                                    Error Loading Course Data
                                </h3>
                            </div>
                            <div className="mt-2 text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Course Grid */}
                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {course.title}
                                                </h3>
                                            </div>
                                            {getStatusBadge(course.status)}
                                        </div>

                                        {/* Course Image */}
                                        {course.thumbnail && (
                                            <div className="mb-4">
                                                <img
                                                    src={`/storage/${course.thumbnail}`}
                                                    alt={course.title}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Instructor Info */}
                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span className="truncate">
                                                by {course.instructor?.first_name || 'Unknown'} {course.instructor?.last_name || 'Instructor'}
                                            </span>
                                        </div>

                                        {/* Statistics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {course.enrollments_count || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Students</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {course.total_content || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Content Items</div>
                                            </div>
                                        </div>

                                        {/* Content Breakdown */}
                                        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <Play className="h-4 w-4 mx-auto text-green-600 mb-1" />
                                                <div className="font-semibold">{course.total_lessons || 0}</div>
                                                <div className="text-gray-600">Lessons</div>
                                            </div>
                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <FileText className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                                                <div className="font-semibold">{course.total_assignments || 0}</div>
                                                <div className="text-gray-600">Assignments</div>
                                            </div>
                                            <div className="text-center p-2 bg-purple-50 rounded">
                                                <HelpCircle className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                                                <div className="font-semibold">{course.total_quizzes || 0}</div>
                                                <div className="text-gray-600">Quizzes</div>
                                            </div>
                                        </div>

                                        {/* Engagement Level */}
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                            <span>Engagement:</span>
                                            <span className={`font-semibold ${
                                                getEngagementLevel(course) === 'High' ? 'text-green-600' :
                                                getEngagementLevel(course) === 'Medium' ? 'text-yellow-600' :
                                                getEngagementLevel(course) === 'Low' ? 'text-red-600' :
                                                'text-gray-600'
                                            }`}>
                                                {getEngagementLevel(course)}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <span className="font-medium">Harga: </span>
                                            <span className="ml-1">
                                                {(course.price || 0) > 0 ? `Rp ${Number(course.price).toLocaleString('id-ID')}` : 'Gratis'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('admin.monitoring.courses.show', course.slug)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Monitoring
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-8 text-center">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || statusFilter ? 
                                        'Try adjusting your search criteria.' : 
                                        'No courses have been created yet.'
                                    }
                                </p>
                                {(searchTerm || statusFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('');
                                        }}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}