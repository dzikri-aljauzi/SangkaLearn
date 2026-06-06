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
    GraduationCap,
    Award,
    BookOpen,
    Plus,
    X
} from 'lucide-react';

export default function InstructorForm({ instructor = null, specializations: initialSpecializations = [] }) {
    const isEditing = !!instructor;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [showSpecializationModal, setShowSpecializationModal] = useState(false);
    const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
    const [specializations, setSpecializations] = useState(initialSpecializations);
    const [newSpecialization, setNewSpecialization] = useState({ name: '', description: '' });
    const [isAddingSpecialization, setIsAddingSpecialization] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: instructor?.first_name || '',
        last_name: instructor?.last_name || '',
        email: instructor?.email || '',
        phone: instructor?.phone || '',
        password: '',
        password_confirmation: '',
        status: instructor?.status || 'active',
        specializations: instructor?.specializations?.map(s => s.id) || [],
        bio: instructor?.bio || '',
        experience_years: instructor?.experience_years || '',
        education: instructor?.education || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Exclude password fields when editing
            const updateData = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                status: data.status,
                specializations: data.specializations,
                bio: data.bio,
                experience_years: data.experience_years,
                education: data.education
            };
            
            put(route('admin.users.instructors.update', instructor.id), {
                data: updateData,
                onSuccess: () => {
                    toast.success('Instructor updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update instructor');
                }
            });
        } else {
            post(route('admin.users.instructors.store'), {
                onSuccess: () => {
                    toast.success('Instructor created successfully!');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create instructor');
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

    const toggleSpecialization = (specializationId) => {
        const currentSpecializations = data.specializations || [];
        if (currentSpecializations.includes(specializationId)) {
            // Remove if already selected
            setData('specializations', currentSpecializations.filter(id => id !== specializationId));
        } else {
            // Add if not selected
            setData('specializations', [...currentSpecializations, specializationId]);
        }
    };

    const removeSpecialization = (specializationId) => {
        setData('specializations', (data.specializations || []).filter(id => id !== specializationId));
    };

    const handleAddSpecialization = async (e) => {
        e.preventDefault();

        if (!newSpecialization.name.trim()) {
            toast.error('Specialization name is required');
            return;
        }

        setIsAddingSpecialization(true);

        try {
            const response = await fetch(route('admin.specializations.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(newSpecialization)
            });

            const result = await response.json();

            if (result.success) {
                // Add new specialization to the list
                setSpecializations([...specializations, result.data]);
                // Add to selected specializations
                setData('specializations', [...(data.specializations || []), result.data.id]);
                // Close modal and reset form
                setShowSpecializationModal(false);
                setNewSpecialization({ name: '', description: '' });
                toast.success('Specialization added successfully!');
            } else {
                toast.error(result.message || 'Failed to add specialization');
            }
        } catch (error) {
            console.error('Error adding specialization:', error);
            toast.error('Failed to add specialization');
        } finally {
            setIsAddingSpecialization(false);
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Instructor' : 'Add New Instructor'}>
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
                            href={route('admin.users.instructors')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update instructor information' : 'Create a new instructor account'}
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

                            <div className="grid grid-cols-1 gap-6">
                                {/* Specializations (Multi-Select) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specializations
                                    </label>

                                    {/* Selected Specializations (Tags) */}
                                    {data.specializations && data.specializations.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {data.specializations.map((specId) => {
                                                const spec = specializations.find(s => s.id === specId);
                                                return spec ? (
                                                    <span
                                                        key={spec.id}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                    >
                                                        {spec.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSpecialization(spec.id)}
                                                            className="ml-1 hover:text-blue-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {data.specializations && data.specializations.length > 0
                                                            ? `${data.specializations.length} selected`
                                                            : 'Select Specializations'}
                                                    </span>
                                                </div>
                                                <svg className={`w-5 h-5 text-gray-400 transition-transform ${showSpecializationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown with Checkboxes */}
                                            {showSpecializationDropdown && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {specializations.length === 0 ? (
                                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                            No specializations available
                                                        </div>
                                                    ) : (
                                                        specializations.map((spec) => (
                                                            <label
                                                                key={spec.id}
                                                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(data.specializations || []).includes(spec.id)}
                                                                    onChange={() => toggleSpecialization(spec.id)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900">{spec.name}</div>
                                                                    {spec.description && (
                                                                        <div className="text-xs text-gray-500">{spec.description}</div>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowSpecializationModal(true)}
                                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                            title="Add New Specialization"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="hidden sm:inline">Add</span>
                                        </button>
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

                    {/* Account Security */}
                    {!isEditing && (
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
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
                                                placeholder="Enter password"
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
                                            Confirm Password *
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
                                                placeholder="Confirm password"
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
                    )}

                    {/* Professional Information */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-4 h-4 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Experience Years */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        value={data.experience_years}
                                        onChange={(e) => setData('experience_years', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="e.g., 5"
                                        min="0"
                                        max="50"
                                    />
                                </div>

                                {/* Education */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Education Level
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <GraduationCap className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={data.education}
                                            onChange={(e) => setData('education', e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Select education level</option>
                                            <option value="diploma">Diploma</option>
                                            <option value="bachelor">Bachelor's Degree</option>
                                            <option value="master">Master's Degree</option>
                                            <option value="doctorate">Doctorate</option>
                                            <option value="professional">Professional Certification</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio / Professional Background
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Describe the instructor's background, expertise, and teaching philosophy"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                        className="flex items-center justify-end space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Link
                            href={route('admin.users.instructors')}
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
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Instructor' : 'Create Instructor')}</span>
                        </button>
                    </motion.div>
                </form>

                {/* Add Specialization Modal */}
                {showSpecializationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Specialization</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSpecializationModal(false);
                                        setNewSpecialization({ name: '', description: '' });
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddSpecialization} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSpecialization.name}
                                        onChange={(e) => setNewSpecialization({ ...newSpecialization, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="e.g., Machine Learning"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newSpecialization.description}
                                        onChange={(e) => setNewSpecialization({ ...newSpecialization, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                        placeholder="Brief description of this specialization"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSpecializationModal(false);
                                            setNewSpecialization({ name: '', description: '' });
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAddingSpecialization}
                                        className={`flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                                            isAddingSpecialization ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{isAddingSpecialization ? 'Adding...' : 'Add Specialization'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}