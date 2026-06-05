import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import ProgressRing from '../../Components/ProgressRing';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import { 
    BookOpen, 
    PlayCircle, 
    Trophy, 
    Clock, 
    Calendar,
    Users,
    Star,
    ChevronRight,
    Target,
    Award,
    BarChart3,
    Download,
    Filter,
    Search,
    Grid,
    List,
    AlertCircle,
    CheckCircle,
    Pause,
    Play,
    BookmarkCheck,
    TrendingUp,
    Zap
} from 'lucide-react';

export default function MyLearning({
    user,
    enrollments = [],
    stats = {},
    upcomingDeadlines = []
}) {
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed, paused
    const [searchTerm, setSearchTerm] = useState('');

    const {
        total_enrolled = 0,
        active_courses = 0,
        completed_courses = 0,
        paused_courses = 0,
        average_progress = 0,
        certificates_earned = 0
    } = stats;

    // Filter enrollments based on status and search
    const filteredEnrollments = enrollments.filter(enrollment => {
        // Handle expired filter separately
        let matchesStatus = false;
        if (filterStatus === 'all') {
            matchesStatus = true;
        } else if (filterStatus === 'expired') {
            matchesStatus = enrollment.remaining_days === 0;
        } else if (filterStatus === 'active') {
            // Active means status is active AND not expired
            matchesStatus = enrollment.status === 'active' && enrollment.remaining_days !== 0;
        } else {
            matchesStatus = enrollment.status === filterStatus;
        }

        const matchesSearch = !searchTerm ||
            enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.course.instructor?.first_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return CheckCircle;
            case 'active': return Play;
            case 'paused': return Pause;
            default: return BookOpen;
        }
    };

    return (
        <AppLayout title="My Learning">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative"
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
                            My Learning Journey
                        </motion.h1>
                        <motion.p 
                            className="text-blue-100 text-lg mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Track your progress and continue your learning adventure
                        </motion.p>
                        
                        {/* Quick Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                            <motion.div
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="text-2xl font-bold">{total_enrolled}</div>
                                <div className="text-blue-100 text-sm">Total Courses</div>
                            </motion.div>

                            <motion.div
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="text-2xl font-bold">{active_courses}</div>
                                <div className="text-blue-100 text-sm">In Progress</div>
                            </motion.div>

                            <motion.div
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className="text-2xl font-bold">{completed_courses}</div>
                                <div className="text-blue-100 text-sm">Completed</div>
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
                    <StatCard
                        title="Average Progress"
                        value={`${Math.round(average_progress || 0)}%`}
                        icon={TrendingUp}
                        change={average_progress > 50 ? "Great progress!" : "Keep learning!"}
                        changeType={average_progress > 50 ? "positive" : "neutral"}
                        gradient="from-green-500 to-blue-500"
                        delay={0.1}
                    />
                    <StatCard
                        title="Certificates Earned"
                        value={certificates_earned}
                        icon={Award}
                        change={certificates_earned > 0 ? "Well done!" : "Complete courses!"}
                        changeType={certificates_earned > 0 ? "positive" : "neutral"}
                        gradient="from-yellow-500 to-orange-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Active Learning"
                        value={`${active_courses} courses`}
                        icon={Zap}
                        change={active_courses > 0 ? "Keep it up!" : "Start learning!"}
                        changeType={active_courses > 0 ? "positive" : "neutral"}
                        gradient="from-purple-500 to-pink-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${total_enrolled > 0 ? Math.round((completed_courses / total_enrolled) * 100) : 0}%`}
                        icon={Target}
                        change={completed_courses > 0 ? "Excellent!" : "Complete more!"}
                        changeType={completed_courses > 0 ? "positive" : "neutral"}
                        gradient="from-blue-500 to-cyan-500"
                        delay={0.4}
                    />
                </div>

                <div className="space-y-6">
                    {/* Filters and Search */}
                        <motion.div 
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search courses..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                    
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="all">Semua Pelatihan</option>
                                        <option value="active">Aktif</option>
                                        <option value="completed">Selesai</option>
                                        <option value="expired">Akses Berakhir</option>
                                        <option value="paused">Ditunda</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Course List */}
                        <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            {filteredEnrollments.length > 0 ? (
                                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {filteredEnrollments.map((enrollment, index) => {
                                        const StatusIcon = getStatusIcon(enrollment.status);
                                        const progress = enrollment.calculated_progress || enrollment.progress_percentage || 0;
                                        
                                        return (
                                            <motion.div
                                                key={enrollment.id}
                                                className="bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
                                            >
                                                <div className={`p-6 ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}>
                                                    {/* Course Thumbnail */}
                                                    <div className={`relative ${viewMode === 'list' ? 'flex-shrink-0 w-24 h-24' : 'w-full h-48 mb-4'} rounded-lg overflow-hidden`}>
                                                        {/* Check if course has video content */}
                                                        {enrollment.course.has_video_content ? (
                                                            <>
                                                                <img
                                                                    src={enrollment.course.thumbnail ? `/storage/${enrollment.course.thumbnail}` : '/images/course-placeholder.jpg'}
                                                                    alt={enrollment.course.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        e.target.src = '/images/course-placeholder.jpg';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                                    <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                                                                <div className="text-center">
                                                                    <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                                                                    <span className="text-xs font-medium text-blue-700">Text Content</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Status Badge */}
                                                        <div className="absolute top-2 right-2">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {enrollment.status}
                                                            </span>
                                                        </div>
                                                        
                                                        {progress === 100 && (
                                                            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Course Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <Link
                                                                    href={enrollment.study_url || `/learn/${enrollment.course.slug}`}
                                                                    className="block"
                                                                >
                                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                                                        {enrollment.course.title}
                                                                    </h3>
                                                                </Link>
                                                                <p className="text-sm text-gray-500 mb-1">
                                                                    by {enrollment.course.instructor?.first_name} {enrollment.course.instructor?.last_name}
                                                                </p>
                                                                {enrollment.course.category && (
                                                                    <p className="text-xs text-blue-600 mb-2">
                                                                        {enrollment.course.category.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Progress */}
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between text-sm mb-2">
                                                                <span className="text-gray-600">Progress</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-blue-600 font-bold">{progress}%</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ({enrollment.completed_content_items || 0}/{enrollment.total_content_items || 0} items)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                                                <motion.div 
                                                                    className="bg-gradient-to-r from-blue-500 to-yellow-500 h-3 rounded-full" 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${progress}%` }}
                                                                    transition={{ duration: 1, delay: 0.8 + (index * 0.1) }}
                                                                ></motion.div>
                                                            </div>
                                                        </div>

                                                        {/* Course Stats */}
                                                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-4">
                                                            <div className="text-center">
                                                                <div className="font-semibold text-gray-900">{enrollment.total_lessons || 0}</div>
                                                                <div>Lessons ✓</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-semibold text-gray-900">{enrollment.total_quizzes || 0}</div>
                                                                <div>Quizzes</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-semibold text-gray-900">{enrollment.total_assignments || 0}</div>
                                                                <div>Assignments ✓</div>
                                                            </div>
                                                        </div>

                                                        {/* Access Duration Info */}
                                                        {enrollment.expires_at ? (
                                                            <div className={`flex items-center gap-2 text-xs mb-4 p-2 rounded-lg ${
                                                                enrollment.remaining_days === 0
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : enrollment.remaining_days <= 7
                                                                        ? 'bg-orange-50 text-orange-700'
                                                                        : 'bg-green-50 text-green-700'
                                                            }`}>
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    {enrollment.remaining_days === 0
                                                                        ? 'Akses Berakhir'
                                                                        : enrollment.remaining_days === 1
                                                                            ? 'Sisa 1 hari'
                                                                            : `Sisa ${enrollment.remaining_days} hari`
                                                                    }
                                                                </span>
                                                                <span className="text-gray-500 ml-auto">
                                                                    s/d {new Date(enrollment.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-xs text-blue-600 mb-4 p-2 bg-blue-50 rounded-lg">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>Akses Selamanya</span>
                                                            </div>
                                                        )}

                                                        {/* Next Lesson */}
                                                        {enrollment.next_lesson && (
                                                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                                                <div className="text-sm font-medium text-blue-900 mb-1">Next Lesson:</div>
                                                                <div className="text-sm text-blue-700">{enrollment.next_lesson.title}</div>
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    {formatDuration(enrollment.next_lesson.duration_minutes)} • {enrollment.next_lesson.section?.title}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-500">
                                                                Last accessed {formatRelativeTime(enrollment.last_accessed_at || enrollment.created_at)}
                                                            </div>
                                                            {/* Check if access expired */}
                                                            {enrollment.remaining_days === 0 ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-red-600 font-medium">Akses Berakhir</span>
                                                                    <button
                                                                        disabled
                                                                        className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                                                    >
                                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                                        Tidak Dapat Diakses
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <Link
                                                                    href={enrollment.study_url || `/learn/${enrollment.course.slug}`}
                                                                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                                >
                                                                    {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <motion.div 
                                    className="text-center py-12"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                >
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchTerm || filterStatus !== 'all' ? 'No courses found' : 'No courses enrolled yet'}
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchTerm || filterStatus !== 'all' 
                                            ? 'Try adjusting your search or filters' 
                                            : 'Start your learning journey by browsing our course catalog'
                                        }
                                    </p>
                                    <Link
                                        href="/student/browse-courses"
                                        className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        <span>Browse Courses</span>
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}