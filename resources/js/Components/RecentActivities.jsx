import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    User, 
    BookOpen, 
    UserPlus, 
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    MessageSquare,
    Award,
    TrendingUp,
    Calendar,
    Eye
} from 'lucide-react';
import { formatRelativeTime, getInitials, generateColor } from '../lib/utils';
import { cn } from '../lib/utils';

export default function RecentActivities({ 
    activities = [], 
    userRole = 'admin', 
    className = '',
    maxItems = 8 
}) {
    // Sample activities if none provided
    const defaultActivities = [
        {
            id: 1,
            type: 'user_registered',
            user: { first_name: 'Ahmad', last_name: 'Ridwan', email: 'ahmad@example.com' },
            description: 'Pengguna baru mendaftar',
            created_at: '2024-01-15T10:30:00Z',
            metadata: { role: 'student' }
        },
        {
            id: 2,
            type: 'course_enrolled',
            user: { first_name: 'Sari', last_name: 'Dewi', email: 'sari@example.com' },
            course: { title: 'JavaScript Fundamentals', slug: 'javascript-fundamentals' },
            description: 'Mendaftar pelatihan JavaScript Fundamentals',
            created_at: '2024-01-15T09:15:00Z'
        },
        {
            id: 3,
            type: 'course_completed',
            user: { first_name: 'Budi', last_name: 'Santoso', email: 'budi@example.com' },
            course: { title: 'React Basics', slug: 'react-basics' },
            description: 'Menyelesaikan pelatihan React Basics',
            created_at: '2024-01-15T08:45:00Z'
        },
        {
            id: 4,
            type: 'course_created',
            user: { first_name: 'Dr. Lisa', last_name: 'Putri', email: 'lisa@example.com' },
            course: { title: 'Advanced Python', slug: 'advanced-python' },
            description: 'Membuat pelatihan baru: Advanced Python',
            created_at: '2024-01-15T08:00:00Z',
            metadata: { role: 'instructor' }
        },
        {
            id: 5,
            type: 'certificate_issued',
            user: { first_name: 'Andi', last_name: 'Pratama', email: 'andi@example.com' },
            course: { title: 'Web Development', slug: 'web-development' },
            description: 'Mendapat sertifikat Web Development',
            created_at: '2024-01-14T16:20:00Z'
        },
        {
            id: 6,
            type: 'payment_completed',
            user: { first_name: 'Maya', last_name: 'Sari', email: 'maya@example.com' },
            description: 'Pembayaran berhasil untuk 2 pelatihan',
            created_at: '2024-01-14T15:30:00Z',
            metadata: { amount: 299000 }
        },
        {
            id: 7,
            type: 'review_posted',
            user: { first_name: 'Rudi', last_name: 'Hermawan', email: 'rudi@example.com' },
            course: { title: 'UI/UX Design', slug: 'ui-ux-design' },
            description: 'Memberikan review 5 bintang',
            created_at: '2024-01-14T14:15:00Z',
            metadata: { rating: 5 }
        },
        {
            id: 8,
            type: 'lesson_completed',
            user: { first_name: 'Tina', last_name: 'Wijaya', email: 'tina@example.com' },
            course: { title: 'Digital Marketing', slug: 'digital-marketing' },
            description: 'Menyelesaikan pelajaran "Email Marketing Strategy"',
            created_at: '2024-01-14T13:45:00Z'
        }
    ];

    const activityData = activities.length > 0 ? activities : defaultActivities;

    const getActivityIcon = (type) => {
        switch (type) {
            case 'user_registered':
                return { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' };
            case 'course_enrolled':
                return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'course_completed':
                return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
            case 'course_created':
                return { icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' };
            case 'certificate_issued':
                return { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' };
            case 'payment_completed':
                return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
            case 'review_posted':
                return { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' };
            case 'lesson_completed':
                return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' };
            default:
                return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <motion.div 
            className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-6", className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
                </div>
                <Link 
                    href="/admin/activities"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                    <span>Lihat Semua</span>
                    <Eye className="w-4 h-4" />
                </Link>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityData.slice(0, maxItems).map((activity, index) => {
                    const { icon: Icon, color, bg } = getActivityIcon(activity.type);
                    
                    return (
                        <motion.div 
                            key={activity.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            {/* Activity Icon */}
                            <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", bg)}>
                                <Icon className={cn("w-5 h-5", color)} />
                            </div>
                            
                            {/* Activity Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-2 mb-1">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white",
                                                generateColor(activity.user?.first_name || 'Unknown')
                                            )}>
                                                {getInitials(activity.user?.first_name, activity.user?.last_name)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {activity.user?.first_name} {activity.user?.last_name}
                                            </span>
                                            {activity.metadata?.role && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                                                    {activity.metadata.role}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Description */}
                                        <p className="text-sm text-gray-600 mb-1">
                                            {activity.description}
                                        </p>
                                        
                                        {/* Additional Info */}
                                        {activity.course && (
                                            <Link 
                                                href={`/courses/${activity.course.slug}`}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                {activity.course.title}
                                            </Link>
                                        )}
                                        
                                        {activity.metadata?.amount && (
                                            <span className="text-xs text-green-600 font-medium">
                                                {formatAmount(activity.metadata.amount)}
                                            </span>
                                        )}
                                        
                                        {activity.metadata?.rating && (
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <span 
                                                        key={i} 
                                                        className={cn(
                                                            "text-xs",
                                                            i < activity.metadata.rating ? "text-yellow-400" : "text-gray-300"
                                                        )}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Timestamp */}
                                    <div className="flex-shrink-0 ml-4">
                                        <span className="text-xs text-gray-500">
                                            {formatRelativeTime(activity.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                
                {activityData.length === 0 && (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
                    </div>
                )}
            </div>
            
            {/* Show More Button */}
            {activityData.length > maxItems && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                        href="/admin/activities"
                        className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium block"
                    >
                        Lihat {activityData.length - maxItems} aktivitas lainnya
                    </Link>
                </div>
            )}
        </motion.div>
    );
}