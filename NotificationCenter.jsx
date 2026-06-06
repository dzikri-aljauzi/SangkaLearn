import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    Bell, 
    X, 
    AlertCircle, 
    CheckCircle, 
    Info, 
    AlertTriangle,
    Settings,
    Users,
    BookOpen,
    TrendingUp,
    Shield,
    Database,
    Clock,
    Eye,
    Trash2
} from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';
import { cn } from '../lib/utils';

export default function NotificationCenter({
    initialNotifications = [],
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, system, user
    const [notifications, setNotifications] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Detect user role from URL to determine correct endpoint
    const getNotificationEndpoint = () => {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
            return '/admin/notifications';
        } else if (path.startsWith('/instructor')) {
            return '/instructor/notifications';
        } else if (path.startsWith('/student')) {
            return '/student/notifications';
        }
        // Default to student
        return '/student/notifications';
    };

    // Fetch notifications when component mounts or opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        } else {
            // Fetch unread count even when closed
            fetchUnreadCount();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const endpoint = getNotificationEndpoint();
            const response = await axios.get(endpoint);
            const fetchedNotifications = response.data.notifications.map(n => ({
                id: n.id,
                type: n.data.type || 'user',
                category: n.data.category || 'system',
                title: n.data.title || 'Notifikasi',
                message: n.data.message || '',
                read: n.read,
                priority: n.data.priority || 'low',
                created_at: n.created_at,
                action_url: n.data.action_url || null
            }));
            setNotifications(fetchedNotifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const endpoint = getNotificationEndpoint();
            const response = await axios.get(`${endpoint}/unread-count`);
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const getNotificationIcon = (category, priority) => {
        const iconMap = {
            security: Shield,
            enrollment: Users,
            performance: TrendingUp,
            payment: CheckCircle,
            update: Settings,
            course: BookOpen,
            system: Database
        };

        const Icon = iconMap[category] || Info;
        
        const colorMap = {
            high: 'text-red-600',
            medium: 'text-yellow-600',
            low: 'text-blue-600'
        };

        const bgMap = {
            high: 'bg-red-100',
            medium: 'bg-yellow-100',
            low: 'bg-blue-100'
        };

        return {
            icon: Icon,
            color: colorMap[priority] || 'text-gray-600',
            bg: bgMap[priority] || 'bg-gray-100'
        };
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'system') return notification.type === 'system';
        if (filter === 'user') return notification.type === 'user';
        return true;
    });

    const handleMarkAsRead = async (id) => {
        try {
            const endpoint = getNotificationEndpoint();
            await axios.post(`${endpoint}/${id}/read`);
            // Update local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const endpoint = getNotificationEndpoint();
            await axios.post(`${endpoint}/read-all`);
            // Update local state
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const endpoint = getNotificationEndpoint();
            await axios.delete(`${endpoint}/${id}`);
            // Update local state
            setNotifications(notifications.filter(n => n.id !== id));
            const deletedNotification = notifications.find(n => n.id === id);
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className={cn("relative", className)}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <motion.span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        {/* Panel */}
                        <motion.div
                            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Notifikasi
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: 'unread', label: 'Belum Dibaca' },
                                        { key: 'system', label: 'Sistem' },
                                        { key: 'user', label: 'Pengguna' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setFilter(tab.key)}
                                            className={cn(
                                                "flex-1 py-1 px-2 text-xs font-medium rounded transition-colors",
                                                filter === tab.key
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-900"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Actions */}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Tandai semua sebagai dibaca
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-64 overflow-y-auto">
                                {filteredNotifications.length > 0 ? (
                                    <div className="p-2">
                                        {filteredNotifications.map((notification, index) => {
                                            const { icon: Icon, color, bg } = getNotificationIcon(
                                                notification.category, 
                                                notification.priority
                                            );

                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    className={cn(
                                                        "p-3 rounded-lg mb-2 border transition-all duration-200 hover:shadow-sm group",
                                                        notification.read 
                                                            ? "bg-gray-50 border-gray-100" 
                                                            : "bg-blue-50 border-blue-200"
                                                    )}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        {/* Icon */}
                                                        <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", bg)}>
                                                            <Icon className={cn("w-4 h-4", color)} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className={cn(
                                                                        "text-sm font-medium mb-1",
                                                                        notification.read ? "text-gray-700" : "text-gray-900"
                                                                    )}>
                                                                        {notification.title}
                                                                    </h4>
                                                                    <p className={cn(
                                                                        "text-xs mb-2",
                                                                        notification.read ? "text-gray-500" : "text-gray-600"
                                                                    )}>
                                                                        {notification.message}
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={cn(
                                                                            "text-xs",
                                                                            notification.read ? "text-gray-400" : "text-gray-500"
                                                                        )}>
                                                                            {formatRelativeTime(notification.created_at)}
                                                                        </span>
                                                                        
                                                                        {/* Priority Badge */}
                                                                        {notification.priority === 'high' && (
                                                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                                                                Penting
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {notification.action_url && (
                                                                        <Link
                                                                            href={notification.action_url}
                                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                                            onClick={() => {
                                                                                handleMarkAsRead(notification.id);
                                                                                setIsOpen(false);
                                                                            }}
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                        </Link>
                                                                    )}
                                                                    
                                                                    {!notification.read && (
                                                                        <button
                                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                                            className="p-1 text-gray-400 hover:text-green-600 rounded"
                                                                            title="Tandai sebagai dibaca"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    
                                                                    <button
                                                                        onClick={() => handleDelete(notification.id)}
                                                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                        title="Hapus notifikasi"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">
                                            {filter === 'unread' ? 'Tidak ada notifikasi baru' : 'Tidak ada notifikasi'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {filteredNotifications.length > 0 && (
                                <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                                    <span className="text-xs text-gray-500">
                                        {filteredNotifications.length} notifikasi
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}