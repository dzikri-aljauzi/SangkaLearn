import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { 
    BookOpen, 
    PlayCircle, 
    Trophy, 
    Clock, 
    TrendingUp, 
    Calendar,
    Users,
    Star,
    ChevronRight,
    Target,
    Award,
    BarChart3
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    enrolledCourses = [], 
    recentActivity = [], 
    upcomingDeadlines = [],
    stats = {}
}) {
    const { completedCourses = 0, totalHours = 0, certificates = 0, currentStreak = 0 } = stats;

    return (
        <AppLayout title="Dashboard">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {auth.user.first_name}! 👋
                        </h1>
                        <p className="text-blue-100 text-lg">
                            You're making great progress. Keep up the momentum!
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{completedCourses}</div>
                                        <div className="text-blue-100 text-sm">Completed</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{totalHours}</div>
                                        <div className="text-blue-100 text-sm">Hours Learned</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{certificates}</div>
                                        <div className="text-blue-100 text-sm">Certificates</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{currentStreak}</div>
                                        <div className="text-blue-100 text-sm">Day Streak</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Continue Learning */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                                <Link 
                                    href="/my-learning" 
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {enrolledCourses.slice(0, 3).map((course, index) => (
                                    <div key={index} className="group">
                                        <Link 
                                            href={`/my-learning/course/${course.slug}`}
                                            className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                        >
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
                                                        by {course.instructor_name}
                                                    </p>
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Progress</span>
                                                            <span className="text-blue-600 font-medium">
                                                                {course.progress_percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                                                                style={{width: `${course.progress_percentage}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <PlayCircle className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                {enrolledCourses.length === 0 && (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                                        <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course.</p>
                                        <Link 
                                            href="/courses" 
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                            Browse Courses
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                            
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {activity.type === 'completed_lesson' && (
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <PlayCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                            )}
                                            {activity.type === 'quiz_passed' && (
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Trophy className="w-4 h-4 text-blue-600" />
                                                </div>
                                            )}
                                            {activity.type === 'course_enrolled' && (
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.created_at}</p>
                                        </div>
                                    </div>
                                ))}

                                {recentActivity.length === 0 && (
                                    <div className="text-center py-4">
                                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Deadlines */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span>Upcoming Deadlines</span>
                            </h3>
                            
                            <div className="space-y-3">
                                {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                                    <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{deadline.course_title}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-orange-600 font-medium">
                                                Due {deadline.due_date}
                                            </span>
                                            <Link 
                                                href={deadline.url}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                {upcomingDeadlines.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
                                )}
                            </div>
                        </div>

                        {/* Learning Goals */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Target className="w-5 h-5 text-green-600" />
                                <span>Learning Goals</span>
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Monthly Goal</span>
                                        <span className="text-sm text-blue-600">12/20 hours</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Courses to Complete</span>
                                        <span className="text-sm text-blue-600">2/3</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '67%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            
                            <div className="space-y-3">
                                <Link 
                                    href="/courses"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 block"
                                >
                                    Browse New Courses
                                </Link>
                                
                                <Link 
                                    href="/certificates"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    View Certificates
                                </Link>
                                
                                <Link 
                                    href="/forums"
                                    className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg text-center hover:border-blue-600 hover:text-blue-600 transition-all duration-300 block"
                                >
                                    Join Discussions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}