import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import { 
    BookOpen, 
    Users, 
    Eye, 
    Clock, 
    Download,
    TrendingUp,
    Book,
    Play,
    CheckCircle,
    ChevronLeft,
    Calendar,
    User,
    Monitor,
    Activity
} from 'lucide-react';

export default function Show() {
    const { lesson, stats, viewsByDate, userEngagement } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

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

    const getEngagementColor = (totalViews) => {
        if (totalViews >= 5) return 'text-green-600';
        if (totalViews >= 2) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <MonitoringLayout
            title={`Lesson Monitoring - ${lesson.title}`}
            showSidebar={true}
        >
            <Head title={`Lesson Monitoring - ${lesson.title}`} />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.lessons.monitoring.index')}
                                        className="mr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Link>
                                    {lesson.type === 'video' ? (
                                        <Play className="h-6 w-6 text-emerald-600 mr-3" />
                                    ) : (
                                        <BookOpen className="h-6 w-6 text-emerald-600 mr-3" />
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
                                        <p className="text-gray-600 mt-1">
                                            {lesson.section?.course?.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Completion Rate</div>
                                    <div className="text-2xl font-bold text-emerald-600">{stats.completion_rate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Eye className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.total_views}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Unique Viewers</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.unique_viewers}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Avg. Duration</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {formatDuration(stats.average_duration)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Activity className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Bounce Rate</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.bounce_rate}%</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'overview'
                                            ? 'border-emerald-500 text-emerald-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('engagement')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'engagement'
                                            ? 'border-emerald-500 text-emerald-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    User Engagement
                                </button>
                                <button
                                    onClick={() => setActiveTab('views')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'views'
                                            ? 'border-emerald-500 text-emerald-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Recent Views
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Lesson Details */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <Book className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Course:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{lesson.section?.course?.title}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Type:</span>
                                                        <span className="ml-2 text-sm text-gray-900 capitalize">{lesson.type}</span>
                                                    </div>
                                                </div>
                                                {lesson.video_duration && (
                                                    <div className="flex items-center">
                                                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-600">Duration:</span>
                                                            <span className="ml-2 text-sm text-gray-900">{lesson.video_duration} minutes</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Summary</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Total Duration:</span>
                                                    <span className="text-sm font-medium text-emerald-600">
                                                        {formatDuration(stats.total_duration)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Completion Rate:</span>
                                                    <span className="text-sm font-medium text-emerald-600">{stats.completion_rate}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Bounce Rate:</span>
                                                    <span className="text-sm font-medium text-red-600">{stats.bounce_rate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-4">
                                        {stats.total_views > 0 && (
                                            <a
                                                href={route('admin.lessons.export-data', lesson.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Data
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User Engagement Tab */}
                            {activeTab === 'engagement' && (
                                <div>
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Views
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total Duration
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Completed
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        First View
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Last View
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {userEngagement && userEngagement.length > 0 ? (
                                                    userEngagement.map((engagement, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {engagement.user?.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {engagement.user?.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className={`text-sm font-medium ${getEngagementColor(engagement.total_views)}`}>
                                                                    {engagement.total_views}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatDuration(engagement.total_duration)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {engagement.completed ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Yes
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        No
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {engagement.first_view ? 
                                                                    new Date(engagement.first_view).toLocaleDateString() : 'N/A'
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {engagement.last_view ? 
                                                                    new Date(engagement.last_view).toLocaleDateString() : 'N/A'
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center">
                                                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No engagement data</h3>
                                                            <p className="mt-1 text-sm text-gray-500">No students have viewed this lesson yet.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Recent Views Tab */}
                            {activeTab === 'views' && (
                                <div>
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        View Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Progress
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Completed
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {lesson.views && lesson.views.length > 0 ? (
                                                    lesson.views.slice(0, 20).map((view) => (
                                                        <tr key={view.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {view.user?.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {view.user?.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(view.created_at).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatDuration(view.duration)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {view.progress}%
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {view.completed ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Yes
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        No
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-12 text-center">
                                                            <Eye className="mx-auto h-12 w-12 text-gray-400" />
                                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No views yet</h3>
                                                            <p className="mt-1 text-sm text-gray-500">This lesson hasn't been viewed by any students yet.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {lesson.views && lesson.views.length > 20 && (
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-600">
                                                Showing latest 20 views out of {lesson.views.length} total views
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MonitoringLayout>
    );
}