import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import {
    HelpCircle,
    Users,
    CheckCircle,
    Clock,
    Search,
    Filter,
    Download,
    Eye,
    AlertTriangle,
    TrendingUp,
    Book,
    Target,
    ArrowLeft,
    LayoutDashboard
} from 'lucide-react';

export default function Index() {
    const { quizzes, courses, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.quizzes.monitoring.index'), {
            search: searchTerm,
            course_id: selectedCourse,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCourse('');
        router.get(route('admin.quizzes.monitoring.index'));
    };

    const getStatusBadge = (stats) => {
        const { total_attempts, completed_attempts } = stats;
        
        if (total_attempts === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    No Attempts
                </span>
            );
        }
        
        if (completed_attempts === total_attempts) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All Completed
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                In Progress ({stats.in_progress_attempts})
            </span>
        );
    };

    const getPassRateColor = (passRate) => {
        if (passRate >= 80) return 'text-green-600';
        if (passRate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <MonitoringLayout
            title="Quiz Monitoring"
            showSidebar={true}
        >
            <Head title="Quiz Monitoring" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Back to Main Menu Button */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Menu Utama
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Quizzes
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Search by quiz title..."
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Quizzes Grid */}
                    {quizzes.data && quizzes.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.data.map((quiz) => (
                                <div key={quiz.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <HelpCircle className="h-6 w-6 text-purple-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {quiz.title}
                                                </h3>
                                            </div>
                                            {getStatusBadge(quiz.stats)}
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <Book className="h-4 w-4 mr-1" />
                                            <span className="truncate">{quiz.course?.title}</span>
                                        </div>

                                        {/* Statistics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {quiz.stats.total_attempts}
                                                </div>
                                                <div className="text-xs text-gray-500">Total Attempts</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {quiz.stats.completed_attempts}
                                                </div>
                                                <div className="text-xs text-gray-500">Completed</div>
                                            </div>
                                        </div>

                                        {/* Performance Metrics */}
                                        {quiz.stats.average_score !== null && (
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <span>Average Score:</span>
                                                    <span className="font-semibold flex items-center">
                                                        <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                                                        {quiz.stats.average_score}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <span>Pass Rate:</span>
                                                    <span className={`font-semibold flex items-center ${getPassRateColor(quiz.stats.pass_rate)}`}>
                                                        <Target className="h-4 w-4 mr-1" />
                                                        {quiz.stats.pass_rate}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Time Limit */}
                                        {quiz.time_limit && (
                                            <div className="text-sm text-gray-600 mb-4">
                                                <span className="font-medium">Time Limit: </span>
                                                {quiz.time_limit} minutes
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('admin.quizzes.monitoring.show', quiz.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Link>
                                            {quiz.stats.completed_attempts > 0 && (
                                                <a
                                                    href={route('admin.quizzes.export-results', quiz.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                    title="Export Results"
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
                                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.search || filters.course_id ? 
                                        'Try adjusting your search criteria.' : 
                                        'No quizzes have been created yet.'
                                    }
                                </p>
                                {(filters.search || filters.course_id) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {quizzes.last_page > 1 && (
                        <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {quizzes.prev_page_url && (
                                    <Link
                                        href={quizzes.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {quizzes.next_page_url && (
                                    <Link
                                        href={quizzes.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{quizzes.from}</span> to{' '}
                                        <span className="font-medium">{quizzes.to}</span> of{' '}
                                        <span className="font-medium">{quizzes.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {quizzes.links.map((link, index) => {
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
                                                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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
        </MonitoringLayout>
    );
}