import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import {
    FileText,
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
    ArrowLeft
} from 'lucide-react';

export default function Index() {
    const { assignments, courses, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.assignments.monitoring.index'), {
            search: searchTerm,
            course_id: selectedCourse,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCourse('');
        router.get(route('admin.assignments.monitoring.index'));
    };

    const getStatusBadge = (stats) => {
        const { total_submissions, graded_submissions } = stats;
        
        if (total_submissions === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    No Submissions
                </span>
            );
        }
        
        if (graded_submissions === total_submissions) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All Graded
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Pending ({total_submissions - graded_submissions})
            </span>
        );
    };

    return (
        <MonitoringLayout
            title="Assignment Monitoring"
            showSidebar={true}
        >
            <Head title="Assignment Monitoring" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Back to Main Menu Button */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                                        Search Assignments
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search by assignment title..."
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Assignments Grid */}
                    {assignments.data && assignments.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.data.map((assignment) => (
                                <div key={assignment.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {assignment.title}
                                                </h3>
                                            </div>
                                            {getStatusBadge(assignment.stats)}
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <Book className="h-4 w-4 mr-1" />
                                            <span className="truncate">{assignment.course?.title}</span>
                                        </div>

                                        {/* Statistics */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {assignment.stats.total_submissions}
                                                </div>
                                                <div className="text-xs text-gray-500">Total Submissions</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {assignment.stats.graded_submissions}
                                                </div>
                                                <div className="text-xs text-gray-500">Graded</div>
                                            </div>
                                        </div>

                                        {/* Average Score */}
                                        {assignment.stats.average_score && (
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <span>Average Score:</span>
                                                <span className="font-semibold flex items-center">
                                                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                                                    {assignment.stats.average_score.toFixed(1)}%
                                                </span>
                                            </div>
                                        )}

                                        {/* Due Date */}
                                        {assignment.due_date && (
                                            <div className="text-sm text-gray-600 mb-4">
                                                <span className="font-medium">Due: </span>
                                                {new Date(assignment.due_date).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('admin.assignments.monitoring.show', assignment.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Link>
                                            {assignment.stats.total_submissions > 0 && (
                                                <a
                                                    href={route('admin.assignments.export-grades', assignment.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    title="Export Grades"
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
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.search || filters.course_id ? 
                                        'Try adjusting your search criteria.' : 
                                        'No assignments have been created yet.'
                                    }
                                </p>
                                {(filters.search || filters.course_id) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {assignments.last_page > 1 && (
                        <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {assignments.prev_page_url && (
                                    <Link
                                        href={assignments.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {assignments.next_page_url && (
                                    <Link
                                        href={assignments.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{assignments.from}</span> to{' '}
                                        <span className="font-medium">{assignments.to}</span> of{' '}
                                        <span className="font-medium">{assignments.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {assignments.links.map((link, index) => {
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
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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