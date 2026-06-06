import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Building,
    Hash,
    FileText,
    Users,
    UserCheck,
    Shield,
    BookOpen,
    Trophy,
    Activity,
    TrendingUp,
    Star,
    Download,
    Eye,
    CheckCircle,
    AlertCircle,
    Award,
    BarChart3,
    Target,
    PlayCircle,
    Clock,
    Calendar,
    Globe,
    User,
    Phone,
    Mail,
    Plus
} from 'lucide-react';

export default function GroupShow({
    group,
    members = [],
    specialStudents = [],
    subAdmins = [],
    memberStats = {},
    learningStats = {},
    enrolledCourses = []
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    const handleDelete = () => {
        router.delete(route('admin.groups.destroy', group.id), {
            onSuccess: () => {
                toast.success('Group deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete group');
            }
        });
        setShowDeleteModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'members', label: 'Members', icon: Users, count: members.length },
        { id: 'courses', label: 'Courses', icon: BookOpen, count: enrolledCourses?.length || 0 }
    ];

    return (
        <AppLayout title={`${group.name} - Group Details`}>
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.groups.index')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <Building className="w-8 h-8 text-blue-600" />
                                <span>Group Details</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage group information and members
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.groups.edit', group.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Group Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                        <Building className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                                    <div className="flex items-center justify-center space-x-2 mt-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-600 font-medium">{group.code}</p>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-3 ${getStatusColor(group.is_active ? 'active' : 'inactive')}`}>
                                        {group.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-sm">Created {formatDate(group.created_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Clock className="w-5 h-5" />
                                        <span className="text-sm">Updated {formatDate(group.updated_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Users className="w-5 h-5" />
                                        <span className="text-sm">{memberStats.total_members || 0} total members</span>
                                    </div>
                                </div>

                                {group.description && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                            <FileText className="w-4 h-4" />
                                            <span>Description</span>
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{group.description}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Stats Card */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <span>Group Statistics</span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Active Members</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{memberStats.active_members || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <UserCheck className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Special Students</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{memberStats.special_students || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Sub Admins</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{memberStats.sub_admins || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Enrolled Courses</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{enrolledCourses?.length || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-sm text-gray-600">Certificates</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{learningStats.total_certificates || 0}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Tabs Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex border-b border-gray-200">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && (
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-6">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Learning Progress Section */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                                <span>Learning Progress</span>
                                            </h4>

                                            {learningStats.total_enrollments > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Overall Completion Rate</span>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {learningStats.average_progress ? Math.round(learningStats.average_progress) : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                                                            style={{width: `${learningStats.average_progress ? Math.round(learningStats.average_progress) : 0}%`}}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4">
                                                        <div className="p-3 bg-green-50 rounded-lg">
                                                            <div className="text-lg font-bold text-green-600">{enrolledCourses?.length || 0}</div>
                                                            <div className="text-xs text-gray-600">Total Courses</div>
                                                        </div>
                                                        <div className="p-3 bg-blue-50 rounded-lg">
                                                            <div className="text-lg font-bold text-blue-600">{learningStats.total_enrollments || 0}</div>
                                                            <div className="text-xs text-gray-600">Total Enrollments</div>
                                                        </div>
                                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                                            <div className="text-lg font-bold text-yellow-600">{learningStats.in_progress_courses || 0}</div>
                                                            <div className="text-xs text-gray-600">In Progress</div>
                                                        </div>
                                                        <div className="p-3 bg-purple-50 rounded-lg">
                                                            <div className="text-lg font-bold text-purple-600">{learningStats.completed_courses || 0}</div>
                                                            <div className="text-xs text-gray-600">Completed</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500">No learning data available yet.</p>
                                                    <p className="text-sm text-gray-400 mt-1">Enroll special students to courses to see progress.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Certificates Section */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                                <Trophy className="w-5 h-5 text-yellow-600" />
                                                <span>Certificates Earned</span>
                                            </h4>
                                            <div className="p-4 bg-yellow-50 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                                        <Award className="w-6 h-6 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-yellow-600">{learningStats.total_certificates || 0}</div>
                                                        <div className="text-sm text-gray-600">Total Certificates</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Members Tab */}
                                {activeTab === 'members' && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                            <Users className="w-5 h-5 text-blue-600" />
                                            <span>Group Members</span>
                                            <span className="text-sm text-gray-500">({members.length})</span>
                                        </h4>
                                        
                                        {members.length > 0 ? (
                                            <div className="space-y-3">
                                                {members.map((member) => (
                                                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center space-x-4">
                                                            {member.avatar ? (
                                                                <img
                                                                    src={member.avatar}
                                                                    alt={member.first_name}
                                                                    className="w-10 h-10 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                    {getInitials(member.first_name, member.last_name)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900">
                                                                    {member.first_name} {member.last_name}
                                                                </h5>
                                                                <p className="text-sm text-gray-500">{member.email}</p>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    {member.roles?.map((role) => (
                                                                        <span key={role.id} className={`px-2 py-1 text-xs rounded-full ${
                                                                            role.name === 'sub_admin' 
                                                                                ? 'bg-orange-100 text-orange-800' 
                                                                                : role.name === 'student' && member.user_type === 'special'
                                                                                ? 'bg-purple-100 text-purple-800'
                                                                                : 'bg-blue-100 text-blue-800'
                                                                        }`}>
                                                                            {role.name === 'sub_admin' ? 'Sub Admin' : 
                                                                             role.name === 'student' && member.user_type === 'special' ? 'Special Student' : 
                                                                             role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                                        </span>
                                                                    ))}
                                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                                        member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {member.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={member.roles?.some(r => r.name === 'student') 
                                                                    ? route('admin.users.students.show', member.id)
                                                                    : member.roles?.some(r => r.name === 'sub_admin')
                                                                    ? route('admin.sub-admins.show', member.id)
                                                                    : '#'}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h4 className="text-lg font-medium text-gray-900 mb-2">No Members</h4>
                                                <p className="text-gray-500">This group doesn't have any members yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Courses Tab */}
                                {activeTab === 'courses' && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                            <BookOpen className="w-5 h-5 text-green-600" />
                                            <span>Enrolled Courses</span>
                                            <span className="text-sm text-gray-500">({enrolledCourses?.length || 0})</span>
                                        </h4>

                                        {enrolledCourses && enrolledCourses.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {enrolledCourses.map((course) => (
                                                    <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                                                        <div className="flex items-start space-x-4">
                                                            {course.thumbnail ? (
                                                                <img
                                                                    src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                                                    alt={course.title}
                                                                    className="w-20 h-14 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-20 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                                                                    <BookOpen className="w-8 h-8 text-green-600" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900 mb-1">{course.title}</h5>
                                                                <p className="text-sm text-gray-500 mb-3">{course.short_description || `Course ID: ${course.id}`}</p>

                                                                {/* Enrollment Stats */}
                                                                {course.enrollment_stats && (
                                                                    <div className="grid grid-cols-4 gap-2 text-center">
                                                                        <div className="p-2 bg-blue-50 rounded-lg">
                                                                            <div className="text-sm font-bold text-blue-600">{course.enrollment_stats.total_enrolled}</div>
                                                                            <div className="text-xs text-gray-500">Enrolled</div>
                                                                        </div>
                                                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                                                            <div className="text-sm font-bold text-yellow-600">{course.enrollment_stats.in_progress}</div>
                                                                            <div className="text-xs text-gray-500">In Progress</div>
                                                                        </div>
                                                                        <div className="p-2 bg-green-50 rounded-lg">
                                                                            <div className="text-sm font-bold text-green-600">{course.enrollment_stats.completed}</div>
                                                                            <div className="text-xs text-gray-500">Completed</div>
                                                                        </div>
                                                                        <div className="p-2 bg-purple-50 rounded-lg">
                                                                            <div className="text-sm font-bold text-purple-600">{course.enrollment_stats.average_progress}%</div>
                                                                            <div className="text-xs text-gray-500">Avg Progress</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Enrolled</h4>
                                                <p className="text-gray-500 mb-4">Special students in this group haven't been enrolled in any courses yet.</p>
                                                <Link
                                                    href={route('admin.users.students')}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Manage Students</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div 
                            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Group</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{group.name}</strong>? 
                                This will permanently remove the group and all its assignments.
                            </p>
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Group
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}