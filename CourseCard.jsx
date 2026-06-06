import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Eye, 
    Edit3, 
    MoreVertical, 
    Users, 
    Star, 
    Clock, 
    DollarSign,
    Play,
    Pause,
    Trash2,
    Settings,
    TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function CourseCard({ 
    course, 
    variant = 'instructor', // 'instructor' | 'student' | 'admin'
    onPlay,
    onEdit,
    onDelete,
    className = '',
    delay = 0
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const statusColors = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        pending: 'bg-orange-100 text-orange-800',
        archived: 'bg-gray-100 text-gray-800'
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <motion.div
            className={cn(
                "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Course Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
                <img 
                    src={course.thumbnail || '/images/course-placeholder.jpg'} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className={cn(
                    "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center",
                    variant === 'instructor' && "cursor-pointer"
                )}>
                    {variant === 'instructor' && (
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => onEdit?.(course)}
                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            >
                                <Edit3 className="w-5 h-5 text-white" />
                            </button>
                            <Link 
                                href={`/courses/${course.slug}`}
                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            >
                                <Eye className="w-5 h-5 text-white" />
                            </Link>
                        </div>
                    )}
                    
                    {variant === 'student' && (
                        <button 
                            onClick={() => onPlay?.(course)}
                            className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                            <Play className="w-8 h-8 text-white" />
                        </button>
                    )}
                </div>
                
                {/* Status Badge */}
                {variant === 'instructor' && (
                    <div className="absolute top-3 left-3">
                        <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            statusColors[course.status] || statusColors.draft
                        )}>
                            {course.status || 'draft'}
                        </span>
                    </div>
                )}
                
                {/* Duration */}
                <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                        {course.duration_hours || 0}h
                    </span>
                </div>
                
                {/* Progress bar for students */}
                {variant === 'student' && course.progress_percentage !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-yellow-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress_percentage}%` }}
                            transition={{ duration: 1, delay: delay + 0.3 }}
                        />
                    </div>
                )}
            </div>
            
            {/* Course Content */}
            <div className="p-6 flex flex-col flex-1">
                {/* Title and Menu */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 pr-3">
                        {course.title}
                    </h3>
                    
                    {variant === 'instructor' && (
                        <div className="relative flex-shrink-0">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {showMenu && (
                                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    <button 
                                        onClick={() => { onEdit?.(course); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit Course</span>
                                    </button>
                                    <Link 
                                        href={`/instructor/courses/${course.id}/lessons`}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Manage Content</span>
                                    </Link>
                                    <Link 
                                        href={`/instructor/courses/${course.id}/analytics`}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        <span>View Analytics</span>
                                    </Link>
                                    <button 
                                        onClick={() => { onDelete?.(course); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Course</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Instructor Name */}
                {course.instructor && (
                    <p className="text-sm text-gray-500 mb-4 truncate">
                        by {course.instructor.first_name} {course.instructor.last_name}
                    </p>
                )}
                
                {/* Stats Row - Fixed Layout */}
                <div className="flex items-center justify-between mb-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{course.enrollments_count || 0}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{course.rating || '4.8'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_hours || 0}h</span>
                        </div>
                    </div>
                    
                    {/* Price and Progress on the right */}
                    <div className="flex items-center space-x-3">
                        {variant === 'instructor' && course.price && (
                            <div className="flex items-center space-x-1 text-green-600 font-medium">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-sm">{formatCurrency(course.price)}</span>
                            </div>
                        )}
                        
                        {variant === 'student' && course.progress_percentage !== undefined && (
                            <div className="text-blue-600 font-medium text-sm">
                                {course.progress_percentage}%
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Description */}
                {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                        {course.description}
                    </p>
                )}
                
                {/* Action Buttons - Fixed Layout */}
                <div className="flex items-center space-x-3 mt-auto pt-4 border-t border-gray-100">
                    {variant === 'instructor' && (
                        <>
                            <Link 
                                href={`/instructor/courses/${course.id}/edit`}
                                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                            >
                                Edit Course
                            </Link>
                            <Link 
                                href={`/courses/${course.slug}`}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-sm font-medium"
                            >
                                Preview
                            </Link>
                        </>
                    )}
                    
                    {variant === 'student' && (
                        <Link 
                            href={`/courses/${course.slug}`}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-yellow-500 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 text-center text-sm font-medium"
                        >
                            Continue Learning
                        </Link>
                    )}
                    
                    {variant === 'admin' && (
                        <>
                            <Link 
                                href={`/admin/courses/${course.id}`}
                                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                            >
                                Manage
                            </Link>
                            <Link 
                                href={`/courses/${course.slug}`}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-sm font-medium"
                            >
                                View
                            </Link>
                        </>
                    )}
                </div>
            </div>
            
            {/* Click outside to close menu */}
            {showMenu && (
                <div 
                    className="fixed inset-0 z-5" 
                    onClick={() => setShowMenu(false)}
                />
            )}
        </motion.div>
    );
}