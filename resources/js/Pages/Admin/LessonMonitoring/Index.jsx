import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    BookOpen, 
    Users, 
    Eye, 
    Clock, 
    Search,
    Filter,
    Download,
    TrendingUp,
    Book,
    Play,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

export default function Index() {
    const { lessons, courses, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.lessons.monitoring.index'), {
            search: searchTerm,
            course_id: selectedCourse,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCourse('');
        router.get(route('admin.lessons.monitoring.index'));
    };

    const getEngagementBadge = (stats) => {
        const { total_views, unique_viewers } = stats;
        
        if (total_views === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    No Views
                </span>
            );
        }
        
        const engagementRate = unique_viewers > 0 ? (total_views / unique_viewers) : 0;
        
        if (engagementRate >= 2) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    High Engagement
                </span>
            );
        }
        
        if (engagementRate >= 1.2) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Eye className="w-3 h-3 mr-1" />
                    Medium Engagement
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Engagement
            </span>
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return 'N/A';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <AppLayout>
            <Head title="Lesson Monitoring" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Lessons
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="Search by lesson title..."
                                        />
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Course
                                    </label>
                                    <select
                                        id="course"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">All Courses</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Lessons Grid */}
                    {lessons.data && lessons.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessons.data.map((lesson) => (
                                <div key={lesson.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                {lesson.type === 'video' ? (
                                                    <Play className="h-6 w-6 text-emerald-600 mr-2" />
                                                ) : (
                                                    <BookOpen className="h-6 w-6 text-emerald-600 mr-2" />
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {lesson.title}
                                                </h3>
                                            </div>
                                            {getEngagementBadge(lesson.stats)}
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <Book className="h-4 w-4 mr-1" />
                                            <span className="truncate">{lesson.section?.course?.title}</span>
                                        </div>

                                        {/* Statistics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-emerald-600">
                                                    {lesson.stats.total_views}
                                                </div>
                                                <div className="text-xs text-gray-500">Total Views</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {lesson.stats.unique_viewers}
                                                </div>
                                                <div className="text-xs text-gray-500">Unique Viewers</div>
                                            </div>
                                        </div>

                                        {/* Completion Rate */}
                                        {lesson.stats.completion_rate !== null && (
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <span>Completion Rate:</span>
                                                <span className="font-semibold flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                                    {lesson.stats.completion_rate}%
                                                </span>
                                            </div>
                                        )}

                                        {/* Average Duration */}
                                        {lesson.stats.average_duration && (
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <span>Avg. Watch Time:</span>
                                                <span className="font-semibold flex items-center">
                                                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                                    {formatDuration(lesson.stats.average_duration)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Last Viewed */}
                                        {lesson.stats.last_viewed && (
                                            <div className="text-sm text-gray-600 mb-4">
                                                <span className="font-medium">Last viewed: </span>
                                                {new Date(lesson.stats.last_viewed).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('admin.lessons.monitoring.show', lesson.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Link>
                                            {lesson.stats.total_views > 0 && (
                                                <a
                                                    href={route('admin.lessons.export-data', lesson.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                    title="Export Data"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-8 text-center">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.search || filters.course_id ? 
                                        'Try adjusting your search criteria.' : 
                                        'No lessons have been created yet.'
                                    }
                                </p>
                                {(filters.search || filters.course_id) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {lessons.last_page > 1 && (
                        <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {lessons.prev_page_url && (
                                    <Link
                                        href={lessons.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {lessons.next_page_url && (
                                    <Link
                                        href={lessons.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{lessons.from}</span> to{' '}
                                        <span className="font-medium">{lessons.to}</span> of{' '}
                                        <span className="font-medium">{lessons.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {lessons.links.map((link, index) => {
                                            if (link.url === null) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}