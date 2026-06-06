import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    ArrowLeft,
    Save,
    Building,
    Hash,
    FileText,
    AlertCircle,
    CheckCircle,
    Users,
    BookOpen,
    Eye,
    Plus,
    X,
    Search,
    Activity
} from 'lucide-react';

export default function GroupForm({ group = null, courses: availableCourses = [] }) {
    const isEditing = !!group;
    const [searchCourse, setSearchCourse] = useState('');
    const [showCourseSelector, setShowCourseSelector] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: group?.name || '',
        code: group?.code || '',
        description: group?.description || '',
        status: group?.status || 'active',
        assigned_courses: group?.assigned_courses || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (!data.name || !data.code) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (data.code.length < 2) {
            toast.error('Group code must be at least 2 characters');
            return;
        }
        
        if (isEditing) {
            put(route('admin.groups.update', group.id), {
                onSuccess: () => {
                    toast.success('Group updated successfully!');
                },
                onError: (errors) => {
                    const errorMessage = errors.message || 'Failed to update group';
                    toast.error(errorMessage);
                }
            });
        } else {
            post(route('admin.groups.store'), {
                onSuccess: () => {
                    toast.success('Group created successfully!');
                    reset();
                },
                onError: (errors) => {
                    const errorMessage = errors.message || 'Failed to create group';
                    toast.error(errorMessage);
                }
            });
        }
    };

    const generateCode = () => {
        if (data.name) {
            const code = data.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 8);
            setData('code', code);
        }
    };

    const filteredCourses = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchCourse.toLowerCase()) &&
        !data.assigned_courses.includes(course.id)
    );

    const selectedCourses = availableCourses.filter(course =>
        data.assigned_courses.includes(course.id)
    );

    const addCourse = (courseId) => {
        if (!data.assigned_courses.includes(courseId)) {
            setData('assigned_courses', [...data.assigned_courses, courseId]);
            setSearchCourse('');
        }
    };

    const removeCourse = (courseId) => {
        setData('assigned_courses', data.assigned_courses.filter(id => id !== courseId));
    };

    return (
        <AppLayout title={isEditing ? 'Edit Group' : 'Add New Group'}>
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
                                <span>{isEditing ? 'Edit Group' : 'Add New Group'}</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update group information and settings' : 'Create a new user group for organizing members'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Group Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            onBlur={generateCode}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter group name"
                                        />
                                        {errors.name && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Group Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Code *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter unique code"
                                            maxLength={50}
                                        />
                                        {data.code && data.code.length >= 2 && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                        {errors.code && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Auto-generated from name or enter manually (2-50 characters)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter group description (optional)"
                                        maxLength={1000}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    {data.description.length}/1000 characters
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Course Assignment */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Course Assignment</h3>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} assigned
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Course Search */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search & Add Courses
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchCourse}
                                        onChange={(e) => {
                                            setSearchCourse(e.target.value);
                                            setShowCourseSelector(e.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowCourseSelector(searchCourse.length > 0)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                        placeholder="Search courses to assign..."
                                    />
                                </div>

                                {/* Course Dropdown */}
                                {showCourseSelector && filteredCourses.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCourses.slice(0, 10).map((course) => (
                                            <button
                                                key={course.id}
                                                type="button"
                                                onClick={() => {
                                                    addCourse(course.id);
                                                    setShowCourseSelector(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                                                    <p className="text-xs text-gray-500">Course ID: {course.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Courses */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Assigned Courses ({selectedCourses.length})
                                </label>
                                
                                {selectedCourses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCourses.map((course) => (
                                            <motion.div 
                                                key={course.id}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                                                        <p className="text-xs text-gray-500">ID: {course.id}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCourse(course.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Remove course"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No courses assigned yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Search and add courses above</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Course Assignment Info</p>
                                        <p className="mt-1">Assigned courses will be automatically accessible to all members of this group. Members can enroll and access these courses immediately.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                        className="flex items-center justify-end space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link
                            href={route('admin.groups.index')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                                processing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Group' : 'Create Group')}</span>
                        </button>
                    </motion.div>
                </form>
            </div>
        </AppLayout>
    );
}