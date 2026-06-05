import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    BookOpenIcon,
    ClockIcon,
    UserIcon,
    PlayIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function MyCourses({ auth, enrolledCourses, error }) {
    return (
        <AppLayout title="My Courses">
            <Head title="My Courses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                                <p className="text-gray-600">Continue your learning journey</p>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {enrolledCourses && enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enrolledCourses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                        >
                                            {/* Course Thumbnail */}
                                            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpenIcon className="h-16 w-16 text-white opacity-80" />
                                                    </div>
                                                )}

                                                {/* Progress Badge */}
                                                <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {Math.round(course.enrollment.progress_percentage || 0)}%
                                                    </span>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="absolute top-3 left-3">
                                                    {course.enrollment.status === 'completed' ? (
                                                        <div className="bg-green-500 text-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
                                                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                            Completed
                                                        </div>
                                                    ) : (
                                                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
                                                            <PlayIcon className="h-3 w-3 mr-1" />
                                                            In Progress
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                {/* Course Title */}
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {course.title}
                                                </h3>

                                                {/* Course Description */}
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                    {course.description}
                                                </p>

                                                {/* Course Meta */}
                                                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                                                    {course.instructor && (
                                                        <div className="flex items-center">
                                                            <UserIcon className="h-4 w-4 mr-1" />
                                                            <span>{course.instructor.name}</span>
                                                        </div>
                                                    )}
                                                    {course.duration_hours && course.duration_hours > 0 && (
                                                        <div className="flex items-center">
                                                            <ClockIcon className="h-4 w-4 mr-1" />
                                                            <span>{course.duration_hours}h</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {course.level?.charAt(0)?.toUpperCase() + course.level?.slice(1) || 'Beginner'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>Progress</span>
                                                        <span>{Math.round(course.enrollment.progress_percentage || 0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.round(course.enrollment.progress_percentage || 0)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-2">
                                                    {course.can_access ? (
                                                        <Link
                                                            href={course.study_url}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center text-sm transition-colors duration-200 flex items-center justify-center"
                                                        >
                                                            <PlayIcon className="h-4 w-4 mr-1" />
                                                            {(course.enrollment.progress_percentage || 0) > 0 ? 'Continue Learning' : 'Start Learning'}
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="flex-1 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg text-center text-sm cursor-not-allowed"
                                                        >
                                                            Access Restricted
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={course.study_url}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center"
                                                    >
                                                        <BookOpenIcon className="h-4 w-4 mr-1" />
                                                        View Content
                                                    </Link>
                                                </div>

                                                {/* Enrollment Info */}
                                                <div className="mt-3 text-xs text-gray-500">
                                                    <div>Enrolled: {new Date(course.enrollment.enrolled_at).toLocaleDateString()}</div>
                                                    {course.enrollment.last_accessed_at && (
                                                        <div>Last accessed: {new Date(course.enrollment.last_accessed_at).toLocaleDateString()}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpenIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                                    <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course.</p>
                                    <Link
                                        href={route('courses.index')}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                                    >
                                        <BookOpenIcon className="h-5 w-5 mr-2" />
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}