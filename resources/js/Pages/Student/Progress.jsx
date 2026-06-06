import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import ProgressRing from '../../Components/ProgressRing';
import { formatRelativeTime } from '../../lib/utils';
import {
    BookOpen,
    PlayCircle,
    Trophy,
    Clock,
    Calendar,
    Star,
    ChevronRight,
    Award,
    BarChart3,
    TrendingUp,
    Zap,
    CheckCircle,
    AlertCircle,
    User,
    Users,
    Activity,
    Brain,
    Flame,
    Eye
} from 'lucide-react';

export default function StudentProgress({
    user,
    enrollments = [],
    stats = {},
    progressChart = [],
    skillsProgress = [],
    achievements = [],
    learningPath = []
}) {
    const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year

    const {
        total_enrolled = 0,
        completed_courses = 0,
        in_progress_courses = 0,
        average_progress = 0,
        completion_rate = 0,
        current_streak = 7,
        longest_streak = 14,
        skills_mastered = 0,
        certificates_earned = 0
    } = stats;

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'from-green-500 to-green-600';
        if (progress >= 60) return 'from-blue-500 to-blue-600';
        if (progress >= 40) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return CheckCircle;
            case 'in_progress': return PlayCircle;
            case 'paused': return AlertCircle;
            default: return BookOpen;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'paused': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <AppLayout title="Progress Belajar">
            <Head title="Progress Belajar" />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10">
                        <motion.h1 
                            className="text-3xl font-bold mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Progress Belajar 📊 
                        </motion.h1>
                        <motion.p 
                            className="text-purple-100 text-lg mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Pantau kemajuan pembelajaran dan raih target Anda
                        </motion.p>
                        
                        {/* Progress Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                            <motion.div
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <ProgressRing progress={completion_rate} size={80} color="white" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-purple-100">Completion Rate</div>
                                    <div className="text-lg font-bold">{completion_rate}%</div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="text-2xl font-bold">{current_streak}</div>
                                <div className="text-purple-100 text-sm">Day Streak</div>
                                <div className="flex items-center mt-1">
                                    <Flame className="w-4 h-4 text-orange-300 mr-1" />
                                    <span className="text-xs text-purple-200">Best: {longest_streak}</span>
                                </div>
                            </motion.div>
                        </div>
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
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{total_enrolled}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Total Pelatihan</h3>
                        <p className="text-sm text-gray-500">{in_progress_courses} sedang berlangsung</p>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{completed_courses}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Pelatihan Selesai</h3>
                        <p className="text-sm text-gray-500">+{Math.min(completed_courses, 3)} bulan ini</p>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{skills_mastered}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Skills Mastered</h3>
                        <p className="text-sm text-gray-500">Across {Math.ceil(skills_mastered / 3)} categories</p>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{certificates_earned}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Sertifikat</h3>
                        <p className="text-sm text-gray-500">Earned this month</p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Progress */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    <span>Progress Pelatihan</span>
                                </h2>
                                <Link 
                                    href="/student/my-learning" 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {enrollments.slice(0, 6).map((enrollment, index) => {
                                    const StatusIcon = getStatusIcon(enrollment.status);
                                    const progress = enrollment.calculated_progress || enrollment.progress_percentage || 0;
                                    
                                    return (
                                        <motion.div
                                            key={enrollment.id}
                                            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 1.3 + (index * 0.1) }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={enrollment.course.thumbnail ? `/storage/${enrollment.course.thumbnail}` : '/images/course-placeholder.jpg'}
                                                        alt={enrollment.course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                        <PlayCircle className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/learn/${enrollment.course.slug}`}>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                                                            {enrollment.course.title}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        by {enrollment.course.instructor?.first_name} {enrollment.course.instructor?.last_name}
                                                    </p>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="mb-2">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Progress</span>
                                                            <span className="font-semibold text-gray-900">{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <motion.div 
                                                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                transition={{ duration: 1, delay: 1.5 + (index * 0.1) }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{enrollment.completed_content_items || 0}/{enrollment.total_content_items || 0} materi</span>
                                                            <span>Last: {formatRelativeTime(enrollment.last_accessed_at || enrollment.created_at)}</span>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {enrollment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {enrollments.length === 0 && (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pelatihan</h3>
                                        <p className="text-gray-500 mb-4">Mulai belajar dengan mengikuti pelatihan pertama Anda</p>
                                        <Link 
                                            href="/student/browse-courses" 
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            Jelajahi Pelatihan
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recent Achievements */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 2.4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <span>Recent Achievements</span>
                                </h3>
                                <Link 
                                    href="/student/certificates"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                            
                            <div className="space-y-3">
                                {(achievements.length > 0 ? achievements : [
                                    { title: 'First Course Completed', description: 'Completed your first course', icon: '🎉', date: '2 days ago' },
                                    { title: '7 Day Streak', description: 'Learned for 7 consecutive days', icon: '🔥', date: '1 week ago' },
                                    { title: 'JavaScript Master', description: 'Earned JavaScript certificate', icon: '🏆', date: '2 weeks ago' }
                                ]).map((achievement, index) => (
                                    <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-2xl">{achievement.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {achievements.length === 0 && (
                                    <div className="text-center py-4">
                                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No achievements yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Keep learning to unlock achievements</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}