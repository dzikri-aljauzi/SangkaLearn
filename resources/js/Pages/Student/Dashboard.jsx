import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import ProgressRing from '../../Components/ProgressRing';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import {
    BookOpen,
    PlayCircle,
    Trophy,
    Clock,
    TrendingUp,
    Calendar,
    Users,
    ChevronRight,
    Target,
    Award,
    BarChart3,
    Download,
    Zap,
    Flame
} from 'lucide-react';

export default function StudentDashboard({
    user,
    stats = {},
    enrollments = [],
    certificates = [],
    recommendedCourses = [],
    recentActivity = []
}) {
    // Debug: Log received data
    React.useEffect(() => {
        console.log('Dashboard Data Received:', {
            stats,
            enrollments_count: enrollments?.length,
            certificates_count: certificates?.length,
            user: user?.email
        });
    }, []);

    const {
        courses_enrolled = 0,
        courses_completed = 0,
        certificates_earned = 0,
        learning_streak_current = 0,
        learning_streak_longest = 0,
        quiz_attempts = 0,
        assignment_submissions = 0
    } = stats || {};

    // Calculate completion rate
    const completionRate = courses_enrolled > 0 ? Math.round((courses_completed / courses_enrolled) * 100) : 0;

    // Use actual streak data from backend
    const currentStreak = learning_streak_current;
    const longestStreak = learning_streak_longest;

    return (
        <AppLayout title="Student Dashboard">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Welcome Header */}
                <motion.div 
                    className="bg-blue-600 rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative"
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
                            Welcome back, {user.first_name}! 🎯
                        </motion.h1>
                        <motion.p 
                            className="text-blue-100 text-lg mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {completionRate > 75 ? "Amazing progress! Keep up the great work!" : 
                             completionRate > 50 ? "You're doing well! Continue your learning journey." :
                             "Let's achieve your learning goals together."}
                        </motion.p>
                        
                        {/* Enhanced Progress Overview */}
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{courses_enrolled}</div>
                                    <div className="text-xs text-blue-100">Enrolled</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{certificates_earned}</div>
                                    <div className="text-xs text-blue-100">Certificates</div>
                                </div>
                               
                            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        title="Learning Streak"
                        value={`${currentStreak} days`}
                        icon={Flame}
                        change={currentStreak > 0 ? `+${Math.min(currentStreak, 7)} days` : "Start learning!"}
                        changeType={currentStreak > 0 ? "positive" : "neutral"}
                        gradient="bg-petrol-600"
                        delay={0.1}
                    />

                    <StatCard
                        title="Certificates Earned"
                        value={certificates_earned}
                        icon={Trophy}
                        change="View all Certificates"
                        changeType="neutral"
                        gradient="bg-petrol-600"
                        delay={0.2}
                        href="/student/certificates"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Continue Learning */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                    <PlayCircle className="w-6 h-6 text-blue-600" />
                                    <span>Continue Learning</span>
                                </h2>
                                <Link 
                                    href="/student/my-learning" 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {enrollments && enrollments.length > 0 ? enrollments.slice(0, 3).map((enrollment, index) => {
                                    const progressPercentage = enrollment.progress_percentage || 0;
                                    const completedLessons = enrollment.completed_lessons || 0;
                                    const totalLessons = enrollment.total_lessons || enrollment.course?.lessons?.length || 0;

                                    if (!enrollment.course) {
                                        console.warn('Enrollment missing course data:', enrollment);
                                        return null;
                                    }

                                    return (
                                        <motion.div
                                            key={enrollment.id || index}
                                            className="group"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                                        >
                                            <Link
                                                href={`/learn/${enrollment.course.slug}`}
                                                className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 relative">
                                                        <img 
                                                            src={enrollment.course.thumbnail ? `/storage/${enrollment.course.thumbnail}` : '/images/course-placeholder.jpg'} 
                                                            alt={enrollment.course.title}
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/course-placeholder.jpg';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <PlayCircle className="w-8 h-8 text-white" />
                                                        </div>
                                                        {progressPercentage === 100 && (
                                                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                            {enrollment.course.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            by {enrollment.course.instructor?.first_name} {enrollment.course.instructor?.last_name}
                                                        </p>
                                                        <div className="mt-3">
                                                        
                                                            
                                                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                                <span>Last accessed {formatRelativeTime(enrollment.last_accessed_at || enrollment.created_at)}</span>
                                                                <span>{enrollment.course.duration_hours}h total</span>
                                                            </div>
                                                            {enrollment.status === 'completed' && (
                                                                <div className="mt-2">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                                        <Trophy className="w-3 h-3 mr-1" />
                                                                        Completed
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                }) : null}

                                {(!enrollments || enrollments.length === 0) && (
                                    <motion.div 
                                        className="text-center py-12"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                    >
                                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-12 h-12 text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Learning Journey</h3>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Discover amazing courses and begin developing new skills today.</p>
                                        <Link
                                            href="/student/browse-courses"
                                            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            <span>Browse Courses</span>
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recommended Courses */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                                <Link
                                    href="/student/browse-courses"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                                >
                                    <span>Browse All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {recommendedCourses.slice(0, 4).map((course, index) => {
                                    const enrollmentCount = course.enrollments_count || 0;

                                    return (
                                        <Link 
                                            key={course.id || index}
                                            href={`/courses/${course.slug}`}
                                            className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                                        >
                                            <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                                                <img 
                                                    src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.jpg'} 
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.target.src = '/images/course-placeholder.jpg';
                                                    }}
                                                />
                                                {course.is_featured && (
                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Featured
                                                    </div>
                                                )}
                                                {course.level && (
                                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full capitalize">
                                                        {course.level}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">
                                                by {course.instructor?.first_name} {course.instructor?.last_name}
                                            </p>
                                            {course.category && (
                                                <p className="text-xs text-blue-600 mb-2">
                                                    {course.category.name}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    {enrollmentCount > 0 && (
                                                        <span className="text-xs text-gray-500">({enrollmentCount})</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {course.duration_hours}h
                                                    </span>
                                                    {course.price && course.price > 0 && (
                                                        <span className="text-sm font-semibold text-green-600">
                                                            {new Intl.NumberFormat('id-ID', {
                                                                style: 'currency',
                                                                currency: 'IDR',
                                                                minimumFractionDigits: 0
                                                            }).format(course.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Certificates */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                    <span>Certificates</span>
                                </h3>
                                <Link
                                    href="/student/certificates"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                            
                            <div className="space-y-3">
                                {certificates.slice(0, 3).map((certificate, index) => {
                                    const issuedDate = new Date(certificate.issued_at);
                                    const isRecent = (Date.now() - issuedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
                                    
                                    return (
                                        <div key={certificate.id || index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg relative">
                                            {isRecent && (
                                                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                    !
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start space-x-3">
                                                    {certificate.course?.thumbnail && (
                                                        <img 
                                                            src={`/storage/${certificate.course.thumbnail}`}
                                                            alt={certificate.course.title}
                                                            className="w-10 h-10 rounded object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                                            {certificate.course?.title || 'Certificate'}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Earned {issuedDate.toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                        {certificate.course?.instructor && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                by {certificate.course.instructor.first_name} {certificate.course.instructor.last_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {isRecent && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            New!
                                                        </span>
                                                    )}
                                                    <Link 
                                                        href={route('student.certificates.view', certificate.id)}
                                                        className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors"
                                                        title="View Certificate"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {certificates.length === 0 && (
                                    <div className="text-center py-4">
                                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No certificates yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Complete courses to earn certificates</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Learning Streak */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span>Learning Streak</span>
                            </h3>
                            
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <ProgressRing 
                                        progress={(currentStreak / longestStreak) * 100} 
                                        size={100} 
                                        color="red"
                                        showPercentage={false}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
                                        <div className="text-xs text-gray-500">days</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-sm text-gray-600 mb-2">Current streak</div>
                                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                        <span>Goal: {longestStreak} days</span>
                                        <span>•</span>
                                        <span>Best: {longestStreak} days</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg">
                                        🔥 You're on fire! Keep learning to maintain your streak!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            
                            <div className="space-y-3">
                                <Link 
                                    href="/student/my-learning"
                                    className="w-full bg-blue-600 text-white p-3 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 block"
                                >
                                    My Learning
                                </Link>
                                
                                <Link
                                    href="/student/browse-courses"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    Browse New Courses
                                </Link>
                                
                                <Link 
                                    href="/student/progress"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    View Progress
                                </Link>
                                
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}