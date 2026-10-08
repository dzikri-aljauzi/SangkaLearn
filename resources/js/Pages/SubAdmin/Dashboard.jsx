import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import { 
    Users, 
    BookOpen, 
    Award, 
    TrendingUp,
    UserCheck,
    Clock,
    Target,
    ChevronRight,
    Eye,
    Calendar,
    PieChart
} from 'lucide-react';

export default function SubAdminDashboard({ 
    stats, 
    studentsProgress = [], 
    recentActivities = [],
    progressTrends = [],
    coursePerformance = [],
    subAdmin 
}) {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'enrollment': return <UserCheck className="w-4 h-4 text-blue-500" />;
            case 'completion': return <Award className="w-4 h-4 text-green-500" />;
            case 'certificate': return <Award className="w-4 h-4 text-purple-500" />;
            default: return <BookOpen className="w-4 h-4 text-gray-500" />;
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 bg-green-100';
        if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <AppLayout title="Sub Admin Dashboard">
            <Head title="Sub Admin Dashboard" />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <Users className="w-8 h-8 text-blue-600" />
                            <span>Student Progress Dashboard</span>
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, {subAdmin?.name || 'Sub Admin'}
                            {subAdmin?.user_group && (
                                <span className="ml-2 text-blue-600 font-medium">
                                    • {subAdmin.user_group.name}
                                </span>
                            )}
                        </p>
                    </div>

                    <Link
                        href="/subadmin/students"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        <span>View All Students</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <StatCard
                        title="Total Students"
                        value={stats?.total_students || 0}
                        icon={Users}
                        change={`${stats?.active_students || 0} active`}
                        changeType="positive"
                        gradient="bg-petrol-600"
                        delay={0.1}
                    />
                    <StatCard
                        title="Active Students"
                        value={stats?.active_students || 0}
                        icon={UserCheck}
                        change="Currently learning"
                        changeType="positive"
                        gradient="bg-petrol-600"
                        delay={0.2}
                    />
                    <StatCard
                        title="Total Enrollments"
                        value={stats?.total_enrollments || 0}
                        icon={BookOpen}
                        change={`${stats?.completed_courses || 0} completed`}
                        changeType="positive"
                        gradient="bg-petrol-600"
                        delay={0.3}
                    />
                    
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Progress Overview */}
                    <motion.div 
                        className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <span>Top Performing Students</span>
                                </h3>
                                <Link
                                    href="/subadmin/students"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {studentsProgress && studentsProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {studentsProgress.slice(0, 5).map((student, index) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
                                                    ) : (
                                                        <span className="text-blue-600 font-medium">
                                                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {student.name}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                        <span>{student.enrolled_courses} courses</span>
                                                        <span>•</span>
                                                        <span>{student.completed_courses} completed</span>
                                                        <span>•</span>
                                                        <span>{student.certificates} certificates</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-right">
                                                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getProgressColor(student.average_progress)}`}>
                                                        {Math.round(student.average_progress)}% avg
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/subadmin/students/${student.id}`}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                                    <p className="text-gray-600">Students assigned to you will appear here.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activities */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                <span>Recent Activities</span>
                            </h3>
                        </div>
                        
                        <div className="p-4">
                            {recentActivities && recentActivities.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {recentActivities.slice(0, 10).map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                            <div className="flex-shrink-0 mt-1">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-900">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">No recent activities</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Progress Trends Chart */}
                {progressTrends && progressTrends.length > 0 && (
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <PieChart className="w-5 h-5 text-purple-600" />
                                <span>Progress Trends (Last 7 Days)</span>
                            </h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-7 gap-4">
                                {progressTrends.map((trend, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-xs text-gray-500 mb-2">{trend.date}</div>
                                        <div className="space-y-1">
                                            <div className="bg-blue-100 rounded-sm p-2">
                                                <div className="text-xs font-medium text-blue-700">
                                                    {trend.enrollments}
                                                </div>
                                                <div className="text-xs text-blue-600">Enrolls</div>
                                            </div>
                                            <div className="bg-green-100 rounded-sm p-2">
                                                <div className="text-xs font-medium text-green-700">
                                                    {trend.completions}
                                                </div>
                                                <div className="text-xs text-green-600">Complete</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

    
                    
            </div>
        </AppLayout>
    );
}