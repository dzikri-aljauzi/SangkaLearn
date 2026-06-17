import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Users,
    Eye,
    FileText,
    HelpCircle,
    ChevronLeft,
    TrendingUp,
    Activity,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Monitor
} from 'lucide-react';

export default function Show() {
    const { course, stats } = usePage().props;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
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

    const monitoringOptions = [
        {
            type: 'assignments',
            title: 'Assignment Monitoring',
            description: 'Track assignment submissions, grades, and completion status',
            icon: FileText,
            color: 'blue',
            count: stats.total_assignments,
            metric: `${stats.total_assignment_submissions} Submissions`,
            route: 'admin.assignments.monitoring.index'
        },
        {
            type: 'quizzes',
            title: 'Quiz Monitoring',
            description: 'View quiz attempts, scores, and detailed answer analysis',
            icon: HelpCircle,
            color: 'purple',
            count: stats.total_quizzes,
            metric: `${stats.total_quiz_attempts} Attempts`,
            route: 'admin.quizzes.monitoring.index'
        }
    ];

    const getColorClasses = (color) => {
        const colorMap = {
            green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: 'text-green-600',
                button: 'bg-green-600 hover:bg-green-700',
                count: 'text-green-600'
            },
            blue: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: 'text-blue-600',
                button: 'bg-blue-600 hover:bg-blue-700',
                count: 'text-blue-600'
            },
            purple: {
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                icon: 'text-purple-600',
                button: 'bg-purple-600 hover:bg-purple-700',
                count: 'text-purple-600'
            }
        };
        return colorMap[color];
    };

    return (
        <AppLayout>
            <Head title={`Monitoring - ${course.title}`} />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.monitoring.index')}
                                        className="mr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Link>
                                    <Monitor className="h-6 w-6 text-blue-600 mr-3" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Course Monitoring</h2>
                                        <p className="text-gray-600 mt-1">{course.title}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(course.status)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Course Info */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.total_enrollments}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Students</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.total_lessons}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Lessons</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.total_assignments}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Assignments</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {stats.total_quizzes}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Quizzes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monitoring Options */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Monitoring Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {monitoringOptions.map((option) => {
                                const Icon = option.icon;
                                const colors = getColorClasses(option.color);
                                
                                return (
                                    <div key={option.type} className={`${colors.bg} ${colors.border} border rounded-lg p-6 hover:shadow-lg transition-all duration-200`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <Icon className={`h-8 w-8 ${colors.icon}`} />
                                            <div className={`text-2xl font-bold ${colors.count}`}>
                                                {option.count}
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                            {option.title}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-600 mb-4">
                                            {option.description}
                                        </p>
                                        
                                        <div className="text-sm text-gray-500 mb-4">
                                            <TrendingUp className="h-4 w-4 inline mr-1" />
                                            {option.metric}
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    router.get(route(option.route), { course_id: course.id });
                                                }}
                                                className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Monitoring
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Course Instructor & Students Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Instructor Info */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                                <h4 className="text-sm font-medium text-gray-900">Course Instructor</h4>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                                        {course.instructor.first_name?.charAt(0)}{course.instructor.last_name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1 relative group cursor-pointer">
                                        <h5 className="text-sm font-medium text-gray-900 truncate">
                                            {course.instructor.first_name} {course.instructor.last_name}
                                        </h5>
                                        <p className="text-xs text-gray-500">{course.instructor.email}</p>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max max-w-[200px] break-words whitespace-normal text-center z-50">
                                            {course.instructor.first_name} {course.instructor.last_name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course Details */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                                <h4 className="text-sm font-medium text-gray-900">Course Details</h4>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Created:</span>
                                        <span className="ml-2 text-sm text-gray-900">
                                            {formatDate(course.created_at)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Harga:</span>
                                        <span className="ml-2 text-sm text-gray-900">
                                            {course.price > 0 ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Status:</span>
                                        <span className="ml-2">
                                            {getStatusBadge(course.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}