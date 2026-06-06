import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import GroupModal from '../../../Components/GroupModal';
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
    Calendar,
    MapPin,
    Globe,
    Users,
    Crown,
    Shield,
    Plus,
    RefreshCw
} from 'lucide-react';

export default function SubAdminForm({ subAdmin = null, userGroups: initialUserGroups = [] }) {
    const isEditing = !!subAdmin;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [userGroups, setUserGroups] = useState(initialUserGroups);
    const [isRefreshingGroups, setIsRefreshingGroups] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: subAdmin?.first_name || '',
        last_name: subAdmin?.last_name || '',
        email: subAdmin?.email || '',
        phone: subAdmin?.phone || '',
        password: '',
        password_confirmation: '',
        status: subAdmin?.status || 'active',
        date_of_birth: subAdmin?.date_of_birth || '',
        address: subAdmin?.address || '',
        city: subAdmin?.city || '',
        country: subAdmin?.country || 'Indonesia',
        bio: subAdmin?.bio || '',
        user_group_id: subAdmin?.user_group_id || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!data.first_name || !data.last_name || !data.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!isEditing && (!data.password || data.password !== data.password_confirmation)) {
            toast.error('Password is required and must match confirmation');
            return;
        }

        if (!validateEmail(data.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (isEditing) {
            put(`/admin/sub-admins/${subAdmin.id}`, {
                onSuccess: () => {
                    toast.success('Sub Admin updated successfully!');
                },
                onError: (errors) => {
                    const errorMessage = errors.message || Object.values(errors)[0] || 'Failed to update Sub Admin';
                    toast.error(errorMessage);
                }
            });
        } else {
            post('/admin/sub-admins', {
                onSuccess: () => {
                    toast.success('Sub Admin created successfully!');
                    reset();
                },
                onError: (errors) => {
                    const errorMessage = errors.message || Object.values(errors)[0] || 'Failed to create Sub Admin';
                    toast.error(errorMessage);
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

    const refreshGroups = async () => {
        setIsRefreshingGroups(true);
        try {
            const response = await fetch(route('admin.sub-admins.groups.list'));
            const result = await response.json();
            if (result.success) {
                setUserGroups(result.groups || []);
            }
        } catch (error) {
            console.error('Error refreshing groups:', error);
            toast.error('Failed to refresh groups');
        } finally {
            setIsRefreshingGroups(false);
        }
    };

    const handleGroupCreated = (newGroup) => {
        setUserGroups(prev => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)));
        setData('user_group_id', newGroup.id);
        toast.success(`Group "${newGroup.name}" created and selected!`);
    };

    return (
        <AppLayout title={isEditing ? 'Edit Sub Admin' : 'Add New Sub Admin'}>
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
                                <Crown className="w-8 h-8 text-purple-600" />
                                <span>{isEditing ? 'Edit Sub Admin' : 'Add New Sub Admin'}</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update sub admin information' : 'Create a new sub administrator account'}
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
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-purple-600" />
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
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Group Assignment */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Group Assignment</h3>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* User Group */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Assigned User Group
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={refreshGroups}
                                            disabled={isRefreshingGroups}
                                            className={`flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors ${
                                                isRefreshingGroups ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            title="Refresh groups list"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${isRefreshingGroups ? 'animate-spin' : ''}`} />
                                            <span>Refresh</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowGroupModal(true)}
                                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Add Group</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={data.user_group_id}
                                        onChange={(e) => setData('user_group_id', e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            errors.user_group_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select a group (Optional)...</option>
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
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        Sub admins can be assigned to manage specific groups of students from organizations/companies.
                                    </p>
                                    {userGroups.length === 0 && (
                                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                                            No groups available. Click "Add Group" to create a new group.
                                        </p>
                                    )}
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
                                                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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
                                                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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

                    {/* Additional Information */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Add any additional notes or bio information"
                                />
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
                            href={route('admin.sub-admins.index')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                                processing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : (isEditing ? 'Update Sub Admin' : 'Create Sub Admin')}</span>
                        </button>
                    </motion.div>
                </form>

                {/* Group Modal */}
                <GroupModal
                    isOpen={showGroupModal}
                    onClose={() => setShowGroupModal(false)}
                    onGroupCreated={handleGroupCreated}
                />
            </div>
        </AppLayout>
    );
}