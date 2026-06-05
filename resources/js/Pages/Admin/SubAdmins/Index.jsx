import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    Mail, 
    Phone, 
    User,
    Users,
    UserCheck,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Activity,
    Crown,
    Shield,
    BarChart3
} from 'lucide-react';

export default function SubAdminsIndex({
    subAdmins = {
        data: [],
        total: 0,
        current_page: 1,
        per_page: 15,
        last_page: 1,
        from: 0,
        to: 0
    },
    stats = {
        total_sub_admins: 0,
        active_sub_admins: 0,
        inactive_sub_admins: 0,
        total_assigned_students: 0
    },
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSubAdmins, setSelectedSubAdmins] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const subAdminData = subAdmins.data && subAdmins.data.length > 0 ? subAdmins.data : [];

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const filteredSubAdmins = subAdminData.filter(subAdmin =>
        `${subAdmin.first_name} ${subAdmin.last_name} ${subAdmin.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.sub-admins.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSelectSubAdmin = (subAdminId) => {
        setSelectedSubAdmins(prev => 
            prev.includes(subAdminId) 
                ? prev.filter(id => id !== subAdminId)
                : [...prev, subAdminId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSubAdmins.length === filteredSubAdmins.length) {
            setSelectedSubAdmins([]);
        } else {
            setSelectedSubAdmins(filteredSubAdmins.map(subAdmin => subAdmin.id));
        }
    };

    const handleDeleteSubAdmin = (subAdminId) => {
        if (confirm('Are you sure you want to delete this Sub Admin? All assigned students will be unassigned.')) {
            router.delete(route('admin.sub-admins.destroy', subAdminId), {
                onSuccess: () => {
                    toast.success('Sub Admin deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete Sub Admin');
                }
            });
        }
    };

    return (
        <AppLayout title="Sub Admin Management">
            <Head title="Sub Admin Management" />

            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sub Admin Management</h1>
                        <p className="text-gray-600 mt-1">Manage sub administrators and their assigned students</p>
                    </div>
                    
                    <Link
                        href={route('admin.sub-admins.create')}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Sub Admin</span>
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sub Admins</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_sub_admins || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Sub Admins</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active_sub_admins || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive Sub Admins</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.inactive_sub_admins || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Assigned Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_assigned_students || 0}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search sub admins..."
                                />
                            </div>
                        </form>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>

                            {selectedSubAdmins.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {selectedSubAdmins.length} selected
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Sub Admins Table */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="w-12 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubAdmins.length === filteredSubAdmins.length && filteredSubAdmins.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sub Admin
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Group & Students
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubAdmins.map((subAdmin, index) => (
                                    <motion.tr 
                                        key={subAdmin.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedSubAdmins.includes(subAdmin.id)}
                                                onChange={() => handleSelectSubAdmin(subAdmin.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {subAdmin.avatar ? (
                                                        <img
                                                            src={subAdmin.avatar.startsWith('http')
                                                                ? subAdmin.avatar
                                                                : `/storage/${subAdmin.avatar}`}
                                                            alt={subAdmin.first_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {getInitials(subAdmin.first_name, subAdmin.last_name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                                        <span>{subAdmin.first_name} {subAdmin.last_name}</span>
                                                        <Crown className="w-4 h-4 text-purple-500" />
                                                    </p>
                                                    <p className="text-sm text-gray-500">{subAdmin.email}</p>
                                                    {subAdmin.phone && (
                                                        <p className="text-xs text-gray-400">{subAdmin.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {subAdmin.user_group && (
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {subAdmin.user_group.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2">
                                                    <UserCheck className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm text-gray-600">
                                                        {subAdmin.assigned_students_count} students assigned
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                subAdmin.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {subAdmin.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={route('admin.sub-admins.show', subAdmin.id)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.sub-admins.edit', subAdmin.id)}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteSubAdmin(subAdmin.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSubAdmins.length === 0 && (
                        <div className="text-center py-12">
                            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sub Admins Found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first sub admin.</p>
                            <Link
                                href={route('admin.sub-admins.create')}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Sub Admin</span>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                {subAdmins.data && subAdmins.data.length > 0 && subAdmins.last_page > 1 && (
                    <motion.div
                        className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="text-sm text-gray-700">
                            Showing {subAdmins.from || 1} to {subAdmins.to || subAdmins.data.length} of {subAdmins.total || 0} results
                        </div>
                        <div className="flex items-center space-x-2">
                            {subAdmins.current_page > 1 && (
                                <Link
                                    href={route('admin.sub-admins.index')}
                                    data={{
                                        page: subAdmins.current_page - 1,
                                        search: searchTerm
                                    }}
                                    preserveState
                                    preserveScroll
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </Link>
                            )}

                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                Page {subAdmins.current_page} of {subAdmins.last_page}
                            </span>

                            {subAdmins.current_page < subAdmins.last_page && (
                                <Link
                                    href={route('admin.sub-admins.index')}
                                    data={{
                                        page: subAdmins.current_page + 1,
                                        search: searchTerm
                                    }}
                                    preserveState
                                    preserveScroll
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}