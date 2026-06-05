import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    UserPlus,
    Calendar,
    MapPin,
    Globe,
    Users,
    BookOpen,
    UserCheck,
    Settings,
    Linkedin
} from 'lucide-react';

export default function StudentForm({ student = null, userGroups = [], courses = [], subAdmins = [] }) {
    const isEditing = !!student;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        password: '',
        password_confirmation: '',
        status: student?.status || 'active',
        date_of_birth: student?.date_of_birth || '',
        address: student?.address || '',
        city: student?.city || '',
        country: student?.country || 'Indonesia',
        bio: student?.bio || '',
        linkedin_url: student?.linkedin_url || '',
        user_type: student?.user_type || 'general',
        user_group_id: student?.user_group_id || '',
        accessible_courses: student?.accessible_courses || [],
        assigned_sub_admin_id: student?.assigned_sub_admin_id || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Send complete data for updates
            const updateData = {
                first_name: data.first_name.trim(),
                last_name: data.last_name.trim(),
                email: data.email.trim(),
                phone: data.phone?.trim() || '',
                status: data.status,
                date_of_birth: data.date_of_birth || '',
                address: data.address?.trim() || '',
                city: data.city?.trim() || '',
                country: data.country?.trim() || '',
                bio: data.bio?.trim() || '',
                linkedin_url: data.linkedin_url?.trim() || '',
                user_type: data.user_type,
                // Only include course IDs for special students
                accessible_courses: data.user_type === 'special' ? (data.accessible_courses || []) : [],
                user_group_id: data.user_type === 'special' ? (data.user_group_id || '') : '',
                assigned_sub_admin_id: data.user_type === 'special' ? (data.assigned_sub_admin_id || '') : ''
            };

            // Include password if provided (optional for editing)
            if (data.password && data.password.trim() !== '') {
                updateData.password = data.password;
                updateData.password_confirmation = data.password_confirmation;
            }

            put(route('admin.users.students.update', student.id), updateData, {
                preserveScroll: true,
                preserveState: false,
                timeout: 30000, // 30 second timeout for course updates
                onStart: () => {
                    console.log('Starting update with data:', updateData);
                },
                onSuccess: (response) => {
                    toast.success('Student updated successfully!');
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                    toast.error('Failed to update student. Please try again.');
                },
                onFinish: () => {
                    console.log('Update finished');
                }
            });
        } else {
            post(route('admin.users.students.store'), {
                onSuccess: () => {
                    toast.success('Student created successfully!');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create student');
                }
            });
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const handleCourseSelection = (courseId, checked) => {
        if (checked) {
            setData('accessible_courses', [...data.accessible_courses, courseId]);
        } else {
            setData('accessible_courses', data.accessible_courses.filter(id => id !== courseId));
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Student' : 'Add New Student'}>
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
                            href={route('admin.users.students')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {isEditing ? 'Edit Student' : 'Add New Student'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update student information' : 'Create a new student account'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter first name"
                                        />
                                        {errors.first_name && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter last name"
                                        />
                                        {errors.last_name && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter email address"
                                        />
                                        {data.email && validateEmail(data.email) && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                        {errors.email && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="+62 xxx-xxxx-xxxx"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        />
                                    </div>
                                </div>

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
                        </div>
                    </motion.div>

                    {/* Student Type Configuration */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Student Type Configuration</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Student Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Student Type *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                        data.user_type === 'general' 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="user_type"
                                                value="general"
                                                checked={data.user_type === 'general'}
                                                onChange={(e) => setData('user_type', e.target.value)}
                                                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-5 h-5 text-gray-600" />
                                                    <span className="font-medium text-gray-900">General Student</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Regular student with standard access to public courses. Can purchase courses individually.
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                        data.user_type === 'special' 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="user_type"
                                                value="special"
                                                checked={data.user_type === 'special'}
                                                onChange={(e) => setData('user_type', e.target.value)}
                                                className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                            />
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <UserCheck className="w-5 h-5 text-gray-600" />
                                                    <span className="font-medium text-gray-900">Special Student</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Special student with direct access to specific courses without purchase. Part of a group.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {errors.user_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_type}</p>
                                )}
                            </div>

                            {/* Special Student Configuration */}
                            {data.user_type === 'special' && (
                                <motion.div 
                                    className="space-y-6 border-t border-gray-200 pt-6"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* User Group */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Student Group *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <select
                                                    value={data.user_group_id}
                                                    onChange={(e) => setData('user_group_id', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                        errors.user_group_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Select a group...</option>
                                                    {userGroups.map(group => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name} ({group.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.user_group_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.user_group_id}</p>
                                            )}
                                        </div>

                                        {/* Assigned Sub Admin */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assigned Sub Admin *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                    <UserCheck className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <select
                                                    value={data.assigned_sub_admin_id}
                                                    onChange={(e) => setData('assigned_sub_admin_id', e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                                        errors.assigned_sub_admin_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Select sub admin...</option>
                                                    {subAdmins.map(admin => (
                                                        <option key={admin.id} value={admin.id}>
                                                            {admin.first_name} {admin.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.assigned_sub_admin_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.assigned_sub_admin_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Course Access */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Direct Course Access
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    Select courses this student can access directly without purchase
                                                </span>
                                            </div>
                                            
                                            {courses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                                    {courses.map(course => (
                                                        <label key={course.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.accessible_courses.includes(course.id)}
                                                                onChange={(e) => handleCourseSelection(course.id, e.target.checked)}
                                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">{course.title}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>No courses available</p>
                                                </div>
                                            )}
                                            
                                            {data.accessible_courses.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                    <p className="text-xs text-gray-600">
                                                        Selected {data.accessible_courses.length} course(s)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {errors.accessible_courses && (
                                            <p className="mt-1 text-sm text-red-600">{errors.accessible_courses}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Account Security */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                                    {isEditing && (
                                        <p className="text-sm text-gray-500">Kosongkan jika tidak ingin mengubah password</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {isEditing && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Ubah Password (Opsional)</p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Isi field password di bawah hanya jika Anda ingin mengubah password student ini.
                                                Biarkan kosong jika tidak ingin mengubah password.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isEditing ? 'New Password' : 'Password'} {!isEditing && '*'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder={isEditing ? "Masukkan password baru (opsional)" : "Enter password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {data.password && (
                                        <div className="mt-2">
                                            <div className={`text-xs ${validatePassword(data.password) ? 'text-green-600' : 'text-red-600'}`}>
                                                Password must be at least 8 characters long
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isEditing ? 'Confirm New Password' : 'Confirm Password'} {!isEditing && '*'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder={isEditing ? "Konfirmasi password baru" : "Confirm password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {data.password_confirmation && data.password && (
                                        <div className="mt-2">
                                            <div className={`text-xs ${data.password === data.password_confirmation ? 'text-green-600' : 'text-red-600'}`}>
                                                {data.password === data.password_confirmation ? 'Passwords match' : 'Passwords do not match'}
                                            </div>
                                        </div>
                                    )}
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Additional Information */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter city"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Enter country"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Enter complete address"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio / Notes
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Add any additional notes or bio information"
                                />
                            </div>

                            {/* LinkedIn URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    LinkedIn URL
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Linkedin className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={data.linkedin_url}
                                        onChange={(e) => setData('linkedin_url', e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                {errors.linkedin_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                        className="flex items-center justify-end space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                    >
                        <Link
                            href={route('admin.users.students')}
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
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Student' : 'Create Student')}</span>
                        </button>
                    </motion.div>
                </form>
            </div>
        </AppLayout>
    );
}