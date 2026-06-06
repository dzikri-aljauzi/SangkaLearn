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
    Users,
    Building,
    Shield,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Activity,
    Hash,
    FileText,
    UserCheck,
    BookOpen,
    Trophy,
    MoreVertical,
    Archive,
    RefreshCw,
    Download
} from 'lucide-react';

export default function GroupsIndex({ 
    groups = { data: [], total: 0, current_page: 1, per_page: 15 }, 
    stats = {},
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const groupData = groups.data && groups.data.length > 0 ? groups.data : [];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const filteredGroups = groupData.filter(group =>
        `${group.name} ${group.code} ${group.description || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.groups.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSelectGroup = (groupId) => {
        setSelectedGroups(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSelectAll = () => {
        if (selectedGroups.length === filteredGroups.length) {
            setSelectedGroups([]);
        } else {
            setSelectedGroups(filteredGroups.map(group => group.id));
        }
    };

    const handleBulkAction = (action) => {
        if (selectedGroups.length === 0) {
            toast.error('Please select groups first');
            return;
        }

        const actionLabels = {
            activate: 'activate',
            deactivate: 'deactivate',
            delete: 'delete'
        };

        if (action === 'delete' && !confirm(`Are you sure you want to ${actionLabels[action]} ${selectedGroups.length} selected groups?`)) {
            return;
        }

        router.post(route('admin.groups.bulk-action'), {
            action: action,
            group_ids: selectedGroups
        }, {
            onSuccess: () => {
                toast.success(`Groups ${actionLabels[action]}d successfully!`);
                setSelectedGroups([]);
                setShowBulkActions(false);
            },
            onError: () => {
                toast.error(`Failed to ${actionLabels[action]} groups`);
            }
        });
    };

    const handleDeleteGroup = (groupId) => {
        if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            router.delete(route('admin.groups.destroy', groupId), {
                onSuccess: () => {
                    toast.success('Group deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete group');
                }
            });
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <AppLayout title="Group Management">
            <Head title="Group Management" />

            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                            <Building className="w-8 h-8 text-blue-600" />
                            <span>Group Management</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Manage user groups and their permissions</p>
                    </div>
                    
                    <Link
                        href={route('admin.groups.create')}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Group</span>
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Building className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_groups || 0}</p>
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
                                <p className="text-sm font-medium text-gray-600">Active Groups</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active_groups || 0}</p>
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
                                <p className="text-sm font-medium text-gray-600">Inactive Groups</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.inactive_groups || 0}</p>
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
                                <p className="text-sm font-medium text-gray-600">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_members || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Special Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.special_students || 0}</p>
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
                                    placeholder="Search groups..."
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

                            {selectedGroups.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {selectedGroups.length} selected
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <span>Actions</span>
                                        </button>
                                        {showBulkActions && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                <button
                                                    onClick={() => handleBulkAction('activate')}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span>Activate</span>
                                                </button>
                                                <button
                                                    onClick={() => handleBulkAction('deactivate')}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                                                >
                                                    <Archive className="w-4 h-4 text-yellow-600" />
                                                    <span>Deactivate</span>
                                                </button>
                                                <button
                                                    onClick={() => handleBulkAction('delete')}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Groups Table */}
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
                                            checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Group Info
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Members
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
                                {filteredGroups.map((group, index) => (
                                    <motion.tr 
                                        key={group.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(group.id)}
                                                onChange={() => handleSelectGroup(group.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                                        <Building className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {group.name}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <Hash className="w-3 h-3" />
                                                            <span>{group.code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {group.description && (
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                        <FileText className="w-3 h-3" />
                                                        <span className="truncate max-w-xs">{group.description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {group.users_count || 0} total
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center space-x-1">
                                                        <UserCheck className="w-3 h-3 text-purple-500" />
                                                        <span>{group.special_students_count || 0} special</span>
                                                    </div>
                                                   
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(group.status)}`}>
                                                {group.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={route('admin.groups.show', group.id)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.groups.edit', group.id)}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteGroup(group.id)}
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

                    {filteredGroups.length === 0 && (
                        <div className="text-center py-12">
                            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first group.</p>
                            <Link
                                href={route('admin.groups.create')}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Group</span>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                {groups.total > groups.per_page && (
                    <motion.div 
                        className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="text-sm text-gray-700">
                            Showing {((groups.current_page - 1) * groups.per_page) + 1} to{' '}
                            {Math.min(groups.current_page * groups.per_page, groups.total)} of{' '}
                            {groups.total} results
                        </div>
                        <div className="flex space-x-1">
                            {groups.links?.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-1 text-sm rounded ${
                                        link.active 
                                            ? 'bg-blue-600 text-white' 
                                            : link.url 
                                                ? 'text-gray-700 hover:bg-gray-100' 
                                                : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}