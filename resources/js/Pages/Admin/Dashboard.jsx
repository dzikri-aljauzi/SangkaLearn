import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/StatCard';
import QuickActions from '../../Components/QuickActions';
import SimpleChart from '../../Components/SimpleChart';
import { formatDuration, formatRelativeTime, getInitials, generateColor } from '../../lib/utils';
import { 
    Users, 
    BookOpen, 
    DollarSign, 
    TrendingUp,
    Calendar,
    Settings,
    ChevronRight,
    Target,
    Award,
    BarChart3,
    Eye,
    Edit3,
    UserPlus,
    Plus,
    Activity,
    ShoppingCart,
    Server,
    Database,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    UserCheck,
    PlayCircle
} from 'lucide-react';

export default function AdminDashboard({ 
    user, 
    stats = {}, 
    recentUsers = [], 
    recentCourses = [], 
    recentEnrollments = [],
    growthStats = {},
    chartData = {}
}) {
    const { 
        total_users = 0,
        total_students = 0,
        total_instructors = 0,
        total_admins = 0,
        total_sub_admins = 0,
        total_courses = 0, 
        total_lessons = 0,
        total_enrollments = 0, 
        active_enrollments = 0,
        total_revenue = 0,
        new_users_this_month = 0,
        new_courses_this_month = 0,
        new_enrollments_this_month = 0,
        active_users_today = 0,
        completion_rate = 0
    } = stats;

    const {
        user_growth_percentage = 0,
        course_growth_percentage = 0,
        enrollment_growth_percentage = 0
    } = growthStats;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AppLayout title="Admin Dashboard">
            <div className="p-3 sm:p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-4 sm:space-y-6">
                {/* Welcome Header */}
                <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10 max-w-4xl">
                        <motion.h1 
                            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Admin Dashboard
                        </motion.h1>
                        <motion.p 
                            className="text-blue-100 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {total_users > 2000 ? "Your platform is thriving with incredible growth!" : 
                             total_users > 1000 ? "Great progress! Your LMS is expanding steadily." :
                             "Building a strong foundation for your learning platform."}
                        </motion.p>
                        
                        {/* Platform Overview */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{total_users.toLocaleString()}</div>
                                        <div className="text-blue-100 text-xs sm:text-sm">Jumlah Pengguna</div>
                                        <div className="text-xs text-green-300 mt-1">+{new_users_this_month} bulan ini</div>
                                    </div>
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{total_courses}</div>
                                        <div className="text-blue-100 text-xs sm:text-sm">Jumlah Pelatihan</div>
                                        <div className="text-xs text-green-300 mt-1">+{new_courses_this_month} bulan ini</div>
                                    </div>
                                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{total_lessons}</div>
                                        <div className="text-blue-100 text-xs sm:text-sm">Jumlah Pelajaran</div>
                                        <div className="text-xs text-blue-200 mt-1">Total materi ajar</div>
                                    </div>
                                    <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/80" />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{active_enrollments}</div>
                                        <div className="text-blue-100 text-xs sm:text-sm">Pendaftar Aktif</div>
                                        <div className="text-xs text-green-300 mt-1">+{new_enrollments_this_month} bulan ini</div>
                                    </div>
                                    <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/80" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div 
                            className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <Link 
                                href={route('admin.users.students')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Students</span>
                            </Link>
                            
                            <Link 
                                href={route('admin.courses.index')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Courses</span>
                            </Link>
                            
                            <Link 
                                href={route('admin.sub-admins.index')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Sub Admins</span>
                            </Link>

                            <Link 
                                href={route('admin.groups.index')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Groups</span>
                            </Link>
                            
                            <Link 
                                href={route('admin.analytics')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Analytics</span>
                            </Link>
                            
                            <Link 
                                href={route('admin.settings.index')}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 text-xs sm:text-sm font-medium"
                            >
                                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Settings</span>
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

                {/* Detailed Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                    <StatCard
                        title="Total Siswa"
                        value={total_students.toLocaleString()}
                        icon={Users}
                        change={user_growth_percentage > 0 ? `+${user_growth_percentage}%` : `${user_growth_percentage}%`}
                        changeType={user_growth_percentage >= 0 ? "positive" : "negative"}
                        gradient="from-blue-500 to-cyan-500"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Instruktur"
                        value={total_instructors.toLocaleString()}
                        icon={Award}
                        change={`${total_courses} pelatihan dibuat`}
                        changeType="neutral"
                        gradient="from-purple-500 to-pink-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Sub Admin"
                        value={total_sub_admins.toLocaleString()}
                        icon={Shield}
                        change={`${total_students} siswa dikelola`}
                        changeType="neutral"
                        gradient="from-orange-500 to-red-500"
                        delay={0.25}
                    />
                    <StatCard
                        title="Tingkat Penyelesaian"
                        value={`${completion_rate}%`}
                        icon={Target}
                        change={`${active_enrollments} sedang belajar`}
                        changeType={completion_rate >= 75 ? "positive" : completion_rate >= 50 ? "neutral" : "negative"}
                        gradient="from-green-500 to-emerald-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Pendapatan"
                        value={total_revenue > 1000000 ? formatCurrency(total_revenue / 1000000).replace(/[^\d,.-]/g, '') + 'M' : formatCurrency(total_revenue / 1000).replace(/[^\d,.-]/g, '') + 'K'}
                        icon={DollarSign}
                        change={enrollment_growth_percentage > 0 ? `+${enrollment_growth_percentage}%` : `${enrollment_growth_percentage}%`}
                        changeType={enrollment_growth_percentage >= 0 ? "positive" : "negative"}
                        gradient="from-yellow-500 to-orange-500"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Data Visualization Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <SimpleChart 
                                type="line"
                                data={chartData.monthlyGrowth || []}
                                title="Pertumbuhan Pengguna Bulanan"
                            />
                            <SimpleChart 
                                type="donut"
                                data={chartData.userDistribution || []}
                                title="Distribusi Pengguna"
                            />
                        </div>

                        {/* Additional Chart */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <SimpleChart 
                                type="bar"
                                data={[
                                    { label: 'Aktif Hari Ini', value: active_users_today },
                                    { label: 'Pendaftaran Baru', value: new_enrollments_this_month },
                                    { label: 'Pelatihan Baru', value: new_courses_this_month },
                                    { label: 'Total Pelajaran', value: total_lessons },
                                ]}
                                title="Aktivitas Platform"
                            />
                        </div>
                        {/* Recent Users */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Users</h2>
                                <Link 
                                    href={route('admin.users.students')} 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                                >
                                    <span className="hidden sm:inline">View All</span>
                                    <span className="sm:hidden">All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {recentUsers.map((recentUser, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                                {recentUser.avatar ? (
                                                    <img
                                                        src={recentUser.avatar}
                                                        alt={`${recentUser.first_name} ${recentUser.last_name}`}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${recentUser.avatar ? 'hidden' : 'flex'}`}>
                                                    {recentUser.first_name?.charAt(0) || 'U'}{recentUser.last_name?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                    {recentUser.first_name} {recentUser.last_name}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{recentUser.email}</p>
                                                <p className="text-xs text-gray-400 hidden sm:block">
                                                    Joined {new Date(recentUser.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize hidden sm:inline-block">
                                                {recentUser.roles?.[0]?.name || 'student'}
                                            </span>
                                            <Link 
                                                href={
                                                    recentUser.roles?.[0]?.name === 'student' ? route('admin.users.students.show', recentUser.id) :
                                                    recentUser.roles?.[0]?.name === 'instructor' ? route('admin.users.instructors.show', recentUser.id) :
                                                    recentUser.roles?.[0]?.name === 'sub_admin' ? route('admin.sub-admins.show', recentUser.id) :
                                                    route('admin.users.students.show', recentUser.id)
                                                }
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title={`View ${recentUser.roles?.[0]?.name || 'user'} details`}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                {recentUsers.length === 0 && (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                                        <p className="text-sm text-gray-500">Users will appear here as they register.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Courses */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Courses</h2>
                                <Link 
                                    href={route('admin.courses.index')} 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                                >
                                    <span className="hidden sm:inline">View All</span>
                                    <span className="sm:hidden">All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {recentCourses.map((course, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={`/storage/${course.thumbnail}`}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center ${course.thumbnail ? 'hidden' : 'flex'}`}>
                                                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white/60" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                    {course.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                    by {course.instructor?.first_name} {course.instructor?.last_name}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Created {new Date(course.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                course.status === 'published' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {course.status}
                                            </span>
                                            <Link 
                                                href={route('admin.courses.edit', course.slug || course.id)}
                                                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title={`View details for ${course.title}`}
                                            >
                                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                {recentCourses.length === 0 && (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                                        <p className="text-sm text-gray-500">Courses will appear here as instructors create them.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recent Enrollments */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Pendaftaran Terbaru</h3>
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                {recentEnrollments.slice(0, 5).map((enrollment, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            {enrollment.user?.avatar ? (
                                                <img
                                                    src={enrollment.user.avatar}
                                                    alt={`${enrollment.user.first_name} ${enrollment.user.last_name}`}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold ${enrollment.user?.avatar ? 'hidden' : 'flex'}`}>
                                                {enrollment.user?.first_name?.charAt(0) || 'U'}{enrollment.user?.last_name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {enrollment.user?.first_name} {enrollment.user?.last_name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {enrollment.course?.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentEnrollments.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Belum ada pendaftaran</p>
                                )}
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Metrik Platform</h3>
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Tingkat Penyelesaian</span>
                                        <span className="font-medium">{completion_rate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${completion_rate}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Engagement Rate</span>
                                        <span className="font-medium">{Math.round((active_enrollments / total_enrollments) * 100) || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${Math.round((active_enrollments / total_enrollments) * 100) || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Course Quality</span>
                                        <span className="font-medium">{Math.round((total_courses / Math.max(total_instructors, 1)) * 10) || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${Math.min(Math.round((total_courses / Math.max(total_instructors, 1)) * 10), 100) || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <QuickActions userRole="admin" />
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}