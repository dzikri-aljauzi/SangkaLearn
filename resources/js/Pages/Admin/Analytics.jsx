import React from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { 
    BarChart3,
    Users,
    BookOpen,
    TrendingUp,
    DollarSign,
    UserPlus,
    Calendar,
    Activity,
    Award,
    Target
} from 'lucide-react';
import StatCard from '../../Components/StatCard';
import SimpleChart from '../../Components/SimpleChart';

export default function Analytics({ analytics }) {
    const statCards = [
        {
            title: "Total Pengguna",
            value: analytics.total_users,
            icon: Users,
            color: "bg-blue-500",
            change: "+12%",
            changeType: "positive"
        },
        {
            title: "Total Pelatihan",
            value: analytics.total_courses,
            icon: BookOpen,
            color: "bg-green-500",
            change: "+8%",
            changeType: "positive"
        },
        {
            title: "Total Pendaftaran",
            value: analytics.total_enrollments,
            icon: UserPlus,
            color: "bg-purple-500",
            change: "+25%",
            changeType: "positive"
        },
        {
            title: "Pengguna Aktif Hari Ini",
            value: analytics.active_users_today,
            icon: Activity,
            color: "bg-orange-500",
            change: "+5%",
            changeType: "positive"
        }
    ];

    const monthlyStats = [
        {
            title: "Pengguna Baru Bulan Ini",
            value: analytics.new_users_this_month,
            icon: UserPlus,
            color: "bg-cyan-500"
        },
        {
            title: "Pelatihan Baru Bulan Ini",
            value: analytics.courses_this_month,
            icon: BookOpen,
            color: "bg-indigo-500"
        },
        {
            title: "Pendaftaran Bulan Ini",
            value: analytics.enrollments_this_month,
            icon: Target,
            color: "bg-pink-500"
        },
        {
            title: "Revenue Bulan Ini",
            value: `Rp ${analytics.revenue_this_month.toLocaleString('id-ID')}`,
            icon: DollarSign,
            color: "bg-emerald-500"
        }
    ];

    return (
        <AppLayout title="Analytics Dashboard">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-blue-600 rounded-2xl p-6 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                                <p className="text-blue-100">Pantau performa dan aktivitas sistem secara real-time</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-100">Last Updated</div>
                            <div className="text-lg font-semibold">{new Date().toLocaleDateString('id-ID')}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* User Growth Chart */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pertumbuhan Pengguna</h3>
                                <p className="text-sm text-gray-500">12 bulan terakhir</p>
                            </div>
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        
                        <SimpleChart 
                            data={analytics.user_growth.data}
                            labels={analytics.user_growth.labels}
                            type="line"
                            color="#2A7C82"
                            height={300}
                        />
                    </motion.div>

                    {/* Enrollment Trends Chart */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Tren Pendaftaran</h3>
                                <p className="text-sm text-gray-500">12 bulan terakhir</p>
                            </div>
                            <Award className="w-6 h-6 text-purple-500" />
                        </div>
                        
                        <SimpleChart 
                            data={analytics.enrollment_trends.data}
                            labels={analytics.enrollment_trends.labels}
                            type="bar"
                            color="#2A7C82"
                            height={300}
                        />
                    </motion.div>
                </div>

                {/* Monthly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {monthlyStats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Popular Courses */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Pelatihan Terpopuler</h3>
                            <p className="text-sm text-gray-500">Top 10 pelatihan dengan pendaftaran terbanyak</p>
                        </div>
                        <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    
                    <div className="space-y-4">
                        {analytics.course_popularity.map((course, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{course.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {course.enrollments} pendaftar
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}