import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Users,
    Shield,
    Plus,
    Search,
    Calendar,
    Clock,
    Check,
    X,
    UserPlus,
    UserMinus,
    AlertTriangle,
    Info,
    Filter,
    Mail,
    Edit,
    Trash2
} from 'lucide-react';

export default function CourseAccessIndex({ course, students, currentAccess, stats }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [showGrantForm, setShowGrantForm] = useState(false);
    const [editingAccess, setEditingAccess] = useState(null);

    // Single user access form
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        access_reason: '',
        expires_at: '',
    });

    // Bulk access form
    const { data: bulkData, setData: setBulkData, post: postBulk, processing: processingBulk, errors: bulkErrors, reset: resetBulk } = useForm({
        user_ids: [],
        access_reason: '',
        expires_at: '',
    });

    // Edit access form
    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: editErrors } = useForm({
        access_reason: '',
        expires_at: '',
    });

    // Filter students who don't have access
    const availableStudents = students.filter(student => 
        !currentAccess.some(access => access.user.id === student.id) &&
        (student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleGrantAccess = (e) => {
        e.preventDefault();
        post(route('admin.courses.access.grant', course.id), {
            onSuccess: () => {
                toast.success('Access granted successfully!');
                reset();
                setShowGrantForm(false);
            },
            onError: (errors) => {
                toast.error('Failed to grant access');
            }
        });
    };

    const handleBulkGrant = (e) => {
        e.preventDefault();
        setBulkData('user_ids', selectedUsers);
        postBulk(route('admin.courses.access.bulk-grant', course.id), {
            onSuccess: () => {
                toast.success('Bulk access granted successfully!');
                resetBulk();
                setSelectedUsers([]);
                setShowBulkForm(false);
            },
            onError: (errors) => {
                toast.error('Failed to grant bulk access');
            }
        });
    };

    const handleRevokeAccess = (accessId) => {
        if (confirm('Are you sure you want to revoke access for this user?')) {
            router.delete(route('admin.courses.access.revoke', [course.id, accessId]), {
                onSuccess: () => {
                    toast.success('Access revoked successfully!');
                },
                onError: () => {
                    toast.error('Failed to revoke access');
                }
            });
        }
    };

    const handleEditAccess = (access) => {
        setEditingAccess(access);
        setEditData({
            access_reason: access.access_reason || '',
            expires_at: access.expires_at ? access.expires_at.split('T')[0] : '',
        });
    };

    const handleUpdateAccess = (e) => {
        e.preventDefault();
        putEdit(route('admin.courses.access.update', [course.id, editingAccess.id]), {
            onSuccess: () => {
                toast.success('Access updated successfully!');
                setEditingAccess(null);
            },
            onError: () => {
                toast.error('Failed to update access');
            }
        });
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <AppLayout title={`Access Management - ${course.title}`}>
            <Head title={`Access Management - ${course.title}`} />
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Access Management</h1>
                            <p className="text-gray-600 mt-1">{course.title}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Private Course
                        </span>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Users with Access</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_users_with_access}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Recent Grants (7d)</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.recent_grants}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Expired Access</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.expired_access}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Grant Access Section */}
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <span>Grant Access</span>
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowGrantForm(!showGrantForm)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add Single User</span>
                                    </button>
                                    <button
                                        onClick={() => setShowBulkForm(!showBulkForm)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Bulk Grant</span>
                                    </button>
                                </div>
                            </div>

                            {/* Search Users */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Single User Grant Form */}
                            {showGrantForm && (
                                <motion.form 
                                    onSubmit={handleGrantAccess}
                                    className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <h4 className="font-medium text-blue-900 mb-3">Grant Access to Single User</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <select
                                                value={data.user_id}
                                                onChange={(e) => setData('user_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select User</option>
                                                {availableStudents.map((student) => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.first_name} {student.last_name} ({student.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-900 mb-1">
                                                Reason for Access (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: Special access untuk beta tester"
                                                value={data.access_reason}
                                                onChange={(e) => setData('access_reason', e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-xs text-blue-700 mt-1">
                                                Alasan pemberian akses (untuk catatan internal).
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-900 mb-1">
                                                Expiry Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                placeholder="Expiry date (optional)"
                                                value={data.expires_at}
                                                onChange={(e) => setData('expires_at', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-xs text-blue-700 mt-1">
                                                Tanggal kapan akses user akan kadaluarsa. Kosongkan jika akses permanen.
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processing ? 'Granting...' : 'Grant Access'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowGrantForm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.form>
                            )}

                            {/* Bulk Grant Form */}
                            {showBulkForm && (
                                <motion.form 
                                    onSubmit={handleBulkGrant}
                                    className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <h4 className="font-medium text-green-900 mb-3">Bulk Grant Access</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-green-700 mb-2">Selected Users: {selectedUsers.length}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-green-900 mb-1">
                                                Reason for Access (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: Batch training untuk perusahaan X"
                                                value={bulkData.access_reason}
                                                onChange={(e) => setBulkData('access_reason', e.target.value)}
                                                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                            <p className="text-xs text-green-700 mt-1">
                                                Alasan pemberian akses untuk semua user yang dipilih.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-green-900 mb-1">
                                                Expiry Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                placeholder="Expiry date (optional)"
                                                value={bulkData.expires_at}
                                                onChange={(e) => setBulkData('expires_at', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                            <p className="text-xs text-green-700 mt-1">
                                                Tanggal kapan akses akan kadaluarsa. Kosongkan jika permanen.
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                disabled={processingBulk || selectedUsers.length === 0}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {processingBulk ? 'Granting...' : `Grant Access to ${selectedUsers.length} Users`}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowBulkForm(false);
                                                    setSelectedUsers([]);
                                                }}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.form>
                            )}

                            {/* Available Users List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {availableStudents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No available users found</p>
                                    </div>
                                ) : (
                                    availableStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                                selectedUsers.includes(student.id) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {showBulkForm && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(student.id)}
                                                        onChange={() => toggleUserSelection(student.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span>{student.email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Current Access Section */}
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                                <Users className="w-5 h-5 text-green-600" />
                                <span>Users with Access ({currentAccess.length})</span>
                            </h3>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {currentAccess.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No users have access yet</p>
                                    </div>
                                ) : (
                                    currentAccess.map((access) => (
                                        <div
                                            key={access.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">
                                                        {access.user.first_name} {access.user.last_name}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditAccess(access)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Edit access"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRevokeAccess(access.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Revoke access"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 flex items-center space-x-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{access.user.email}</span>
                                                </p>
                                                {access.access_reason && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Reason: {access.access_reason}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>
                                                        Granted: {new Date(access.granted_at).toLocaleDateString()}
                                                    </span>
                                                    {access.expires_at && (
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Expires: {new Date(access.expires_at).toLocaleDateString()}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Edit Access Modal */}
                {editingAccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div 
                            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Edit Access - {editingAccess.user.first_name} {editingAccess.user.last_name}
                            </h3>
                            <form onSubmit={handleUpdateAccess} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Access Reason
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.access_reason}
                                        onChange={(e) => setEditData('access_reason', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Reason for access..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={editData.expires_at}
                                        onChange={(e) => setEditData('expires_at', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processingEdit}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processingEdit ? 'Updating...' : 'Update Access'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingAccess(null)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
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