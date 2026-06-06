import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import RevenueChart from '../../Components/RevenueChart';
import ProgressRing from '../../Components/ProgressRing';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import { 
    BookOpen, 
    Users, 
    DollarSign, 
    Star,
    TrendingUp, 
    Calendar,
    Plus,
    ChevronRight,
    Target,
    Award,
    BarChart3,
    Eye,
    Edit3,
    Clock,
    PlayCircle,
    Zap,
    MessageSquare,
    ThumbsUp,
    Video,
    FileText,
    Settings
} from 'lucide-react';

export default function InstructorDashboard({ 
    user, 
    stats = {}, 
    courses = []
}) {
    const { 
        total_courses = 0, 
        total_students = 0, 
        total_revenue = 0, 
        avg_rating = 0 
    } = stats;

    return (
        <AppLayout title="Instructor Dashboard">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Welcome Header */}
                <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10 max-w-4xl">
                        <motion.h1 
                            className="text-3xl font-bold mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Welcome back, {user.first_name}! 🎓
                        </motion.h1>
                        <motion.p 
                            className="text-blue-100 text-lg mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {total_students > 100 ? "You're reaching amazing milestones as an educator!" : 
                             total_students > 50 ? "Your teaching impact is growing steadily." :
                             "Build your teaching legacy and inspire more students."}
                        </motion.p>
                        
                        {/* Enhanced Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{total_courses}</div>
                                        <div className="text-blue-100 text-sm">Active Courses</div>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{total_students}</div>
                                        <div className="text-blue-100 text-sm">Total Students</div>
                                    </div>
                                    <Users className="w-8 h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-bold">Rp {(total_revenue / 1000000).toFixed(1)}M</div>
                                        <div className="text-blue-100 text-sm">Total Revenue</div>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold flex items-center">
                                            {avg_rating}
                                            <Star className="w-5 h-5 text-yellow-300 ml-1 fill-current" />
                                        </div>
                                        <div className="text-blue-100 text-sm">Avg Rating</div>
                                    </div>
                                    <ThumbsUp className="w-8 h-8 text-white/80" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div 
                            className="flex flex-wrap gap-3 mt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <Link 
                                href="/instructor/courses/create"
                                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Course</span>
                            </Link>
                            
                            <Link 
                                href="/instructor/analytics"
                                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                            </Link>
                            
                            <Link 
                                href="/instructor/students"
                                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                            >
                                <Users className="w-4 h-4" />
                                <span>Students</span>
                            </Link>
                            
                            <Link 
                                href="/instructor/messages"
                                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Messages</span>
                            </Link>
                        </motion.div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
                        <div className="absolute bottom-4 right-16 w-20 h-20 rounded-full bg-white/10"></div>
                        <div className="absolute top-16 right-32 w-16 h-16 rounded-full bg-white/15"></div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="New Students (30d)"
                        value={42}
                        icon={Users}
                        change="+15%"
                        changeType="positive"
                        gradient="from-blue-500 to-cyan-500"
                        delay={0.1}
                    />
                    <StatCard
                        title="Course Completion"
                        value="87%"
                        icon={Award}
                        change="+5%"
                        changeType="positive"
                        gradient="from-green-500 to-emerald-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Video Watch Time"
                        value="284h"
                        icon={Video}
                        change="+23h"
                        changeType="positive"
                        gradient="from-purple-500 to-pink-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Student Engagement"
                        value="92%"
                        icon={Zap}
                        change="+8%"
                        changeType="positive"
                        gradient="from-orange-500 to-red-500"
                        delay={0.4}
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Revenue Analytics */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <RevenueChart type="bar" />
                            <RevenueChart type="pie" />
                        </div>
                        {/* Your Courses */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
                                <Link 
                                    href="/instructor/courses" 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                                >
                                    <span>Manage All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {courses.map((course, index) => (
                                    <div key={index} className="group">
                                        <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={course.thumbnail || '/images/course-placeholder.jpg'} 
                                                        alt={course.title}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {course.enrollments_count} students enrolled
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            course.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {course.status}
                                                        </span>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm text-gray-600">4.8</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center space-x-2">
                                                    <Link 
                                                        href={`/instructor/courses/${course.id}/edit`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    >
                                                        <Edit3 className="w-5 h-5" />
                                                    </Link>
                                                    <Link 
                                                        href={`/courses/${course.slug}`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {courses.length === 0 && (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                                        <p className="text-gray-500 mb-4">Create your first course to start teaching.</p>
                                        <Link 
                                            href="/instructor/courses/create" 
                                            className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                            Create Course
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Overview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h2>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Course Completion Rate</span>
                                        <span className="text-sm text-blue-600 font-semibold">78%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Student Satisfaction</span>
                                        <span className="text-sm text-yellow-600 font-semibold">92%</span>
                                    </div>
                                    <div className="w-full bg-yellow-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '92%'}}></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">This Month's Revenue</span>
                                        <span className="text-sm text-green-600 font-semibold">+15%</span>
                                    </div>
                                    <div className="w-full bg-green-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">New Enrollments</span>
                                        <span className="text-sm text-purple-600 font-semibold">+23%</span>
                                    </div>
                                    <div className="w-full bg-purple-200 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '73%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">New Students</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">42</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">Revenue</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">Rp 2.4M</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Award className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">Completions</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">18</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-sm text-gray-700">Watch Time</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">284h</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Users className="w-4 h-4 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">5 new students enrolled in "React Fundamentals"</p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Star className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">New 5-star review on "JavaScript Basics"</p>
                                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <PlayCircle className="w-4 h-4 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Course completion: "Advanced CSS"</p>
                                        <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                            
                            <div className="space-y-3">
                                <Link 
                                    href="/instructor/courses/create"
                                    className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white p-3 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 block"
                                >
                                    Create New Course
                                </Link>
                                
                                <Link 
                                    href="/instructor/analytics"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    View Analytics
                                </Link>
                                
                                <Link 
                                    href="/instructor/students"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    Manage Students
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}