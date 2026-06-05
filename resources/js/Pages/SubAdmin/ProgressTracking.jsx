import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import { 
    BarChart3, 
    Users, 
    TrendingUp, 
    Award,
    BookOpen,
    Target,
    Clock,
    Eye,
    ArrowLeft,
    Filter,
    Search,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react';

export default function ProgressTracking({
    progressData = [],
    overallStats = {},
    subAdmin
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('progress');

    // Filter and sort progress data
    const filteredProgressData = progressData
        .filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'progress':
                    return b.average_progress - a.average_progress;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'enrollments':
                    return b.total_enrollments - a.total_enrollments;
                case 'certificates':
                    return b.certificates_count - a.certificates_count;
                default:
                    return 0;
            }
        });

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 bg-green-100';
        if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getProgressBarColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <AppLayout title="Progress Tracking">
            <Head title="Progress Tracking" />
            
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
                            href="/subadmin/dashboard"
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                                <span>Progress Tracking</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Monitor and track progress of your assigned students
                                {subAdmin.user_group && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • {subAdmin.user_group.name}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Overall Stats */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <StatCard
                        title="Total Students"
                        value={overallStats.total_students || 0}
                        icon={Users}
                        change={`${overallStats.active_students || 0} active`}
                        changeType="positive"
                        gradient="from-blue-500 to-purple-600"
                        delay={0.1}
                    />
                    <StatCard
                        title="Avg Progress"
                        value={`${Math.round(overallStats.average_completion_rate || 0)}%`}
                        icon={TrendingUp}
                        change={`${overallStats.students_with_progress || 0} with progress`}
                        changeType="positive"
                        gradient="from-green-500 to-blue-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Total Courses"
                        value={overallStats.total_courses_assigned || 0}
                        icon={BookOpen}
                        change={`${overallStats.total_courses_completed || 0} completed`}
                        changeType="positive"
                        gradient="from-purple-500 to-pink-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${overallStats.total_courses_assigned > 0 ? Math.round((overallStats.total_courses_completed / overallStats.total_courses_assigned) * 100) : 0}%`}
                        icon={Target}
                        change="Overall performance"
                        changeType="neutral"
                        gradient="from-orange-500 to-red-500"
                        delay={0.4}
                    />
                </motion.div>

                {/* View Toggle */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Student Progress Tracking
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                                
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="progress">Sort by Progress</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="enrollments">Sort by Enrollments</option>
                                    <option value="certificates">Sort by Certificates</option>
                                </select>
                        </div>
                    </div>
                </motion.div>

                {/* Content Area - Student Progress */}
                <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Student Progress Overview ({filteredProgressData.length})
                            </h3>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {filteredProgressData.length > 0 ? (
                                filteredProgressData.map((student, index) => (
                                    <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt="" className="w-12 h-12 rounded-full" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-blue-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-lg font-medium text-gray-900">
                                                            {student.name}
                                                        </h4>
                                                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            student.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {student.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                                                    {student.user_group && (
                                                        <p className="text-xs text-blue-600 mb-2">
                                                            {student.user_group.name}
                                                        </p>
                                                    )}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                                                        <div>
                                                            <span className="font-medium text-gray-900">{student.total_enrollments}</span>
                                                            <div>Enrollments</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{student.completed_enrollments}</span>
                                                            <div>Completed</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{student.certificates_count}</span>
                                                            <div>Certificates</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{student.estimated_time_spent}h</span>
                                                            <div>Time Spent</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900 mb-1">
                                                        {student.average_progress}%
                                                    </div>
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${getProgressBarColor(student.average_progress)}`}
                                                            style={{ width: `${student.average_progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/subadmin/students/${student.id}`}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View Details</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm ? 'No students match your search criteria.' : 'No students assigned yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}