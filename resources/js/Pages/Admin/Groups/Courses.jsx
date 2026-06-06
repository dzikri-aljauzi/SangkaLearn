import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    ArrowLeft,
    Plus,
    BookOpen,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Edit,
    Eye,
    UserPlus
} from 'lucide-react';

export default function GroupCourses({ 
    group, 
    assignedCourses = [], 
    availableCourses = [], 
    specialStudentsCount = 0 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);

    const { data, setData, processing } = useForm({
        course_id: '',
        expires_at: ''
    });

    const filteredAssignedCourses = assignedCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAvailableCourses = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssignCourse = async (courseId, expiresAt = null) => {
        try {
            const response = await fetch(route('admin.groups.courses.assign', group.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    course_id: courseId,
                    expires_at: expiresAt
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                window.location.reload(); // Refresh to show updated data
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error assigning course:', error);
            toast.error('Failed to assign course');
        }
    };

    const handleRemoveCourse = async (courseId) => {
        if (!confirm('Are you sure you want to remove this course from the group?')) {
            return;
        }

        try {
            const response = await fetch(route('admin.groups.courses.remove', [group.id, courseId]), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                window.location.reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error removing course:', error);
            toast.error('Failed to remove course');
        }
    };

    const handleBulkAssign = async () => {
        if (selectedCourses.length === 0) {
            toast.error('Please select at least one course');
            return;
        }

        setIsAssigning(true);
        try {
            const response = await fetch(route('admin.groups.courses.bulk-assign', group.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    course_ids: selectedCourses,
                    expires_at: data.expires_at || null
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setSelectedCourses([]);
                setShowAssignModal(false);
                window.location.reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error bulk assigning courses:', error);
            toast.error('Failed to assign courses');
        } finally {
            setIsAssigning(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout title={`${group.name} - Course Assignments`}>
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
                            href={route('admin.sub-admins.index')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <BookOpen className="w-8 h-8 text-blue-600" />
                                <span>{group.name} Courses</span>
                            </h1>
                            <p className="text-gray-600 mt-1 flex items-center space-x-4">
                                <span>Group Code: <strong>{group.code}</strong></span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{specialStudentsCount} Special Students</span>
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Assign Courses</span>
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
                                <p className="text-2xl font-bold text-gray-900">{assignedCourses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Auto Enrollments</p>
                                <p className="text-2xl font-bold text-gray-900">{assignedCourses.length * specialStudentsCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available Courses</p>
                                <p className="text-2xl font-bold text-gray-900">{availableCourses.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </motion.div>

                {/* Assigned Courses */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Courses ({filteredAssignedCourses.length})</h3>
                    </div>
                    
                    <div className="p-6">
                        {filteredAssignedCourses.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAssignedCourses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">{course.title}</h4>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        Assigned: {formatDate(course.pivot.assigned_at)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Expires: {formatDate(course.pivot.expires_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                                                Active
                                            </span>
                                            <button
                                                onClick={() => handleRemoveCourse(course.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove course"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned</h3>
                                <p className="text-gray-600 mb-4">Assign courses to automatically enroll all special students in this group.</p>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Assign First Course</span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Assign Courses Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Assign Courses to {group.name}</h3>
                                <button
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCourses([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 max-h-96 overflow-y-auto">
                                {filteredAvailableCourses.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredAvailableCourses.map((course) => (
                                            <label key={course.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(course.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCourses([...selectedCourses, course.id]);
                                                        } else {
                                                            setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{course.description || 'No description available'}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No courses available for assignment</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            {filteredAvailableCourses.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <label className="text-sm font-medium text-gray-700">
                                                Expiry Date (Optional):
                                            </label>
                                            <input
                                                type="date"
                                                value={data.expires_at}
                                                onChange={(e) => setData('expires_at', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setShowAssignModal(false);
                                                    setSelectedCourses([]);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleBulkAssign}
                                                disabled={selectedCourses.length === 0 || isAssigning}
                                                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${
                                                    (selectedCourses.length === 0 || isAssigning) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>
                                                    {isAssigning ? 'Assigning...' : `Assign ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    {selectedCourses.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            This will automatically enroll {specialStudentsCount} special students in the selected courses.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}