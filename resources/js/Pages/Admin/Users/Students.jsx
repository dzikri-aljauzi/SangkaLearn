import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    Eye, 
    Mail, 
    Phone, 
    Calendar,
    User,
    BookOpen,
    Users,
    Star,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Download,
    Upload,
    Clock,
    Trophy,
    GraduationCap,
    Activity
} from 'lucide-react';

export default function Students({
    students = { data: [], total: 0, current_page: 1, per_page: 15 },
    stats = {},
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search - trigger after user stops typing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilter();
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    const handleFilter = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;

        router.get(route('admin.users.students'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('admin.users.students'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);

        const url = route('admin.users.students.export') + (params.toString() ? '?' + params.toString() : '');
        window.open(url, '_blank');
    };

    // Always use real data from props - no sample data fallback
    // Handle both pagination object and direct array
    const studentData = Array.isArray(students?.data)
        ? students.data
        : (Array.isArray(students) ? students : []);

    // Use data directly from server (already filtered)
    const studentList = studentData;

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 bg-green-100';
        if (progress >= 60) return 'text-yellow-600 bg-yellow-100';
        if (progress >= 40) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        setSelectedStudents(
            selectedStudents.length === studentList.length
                ? []
                : studentList.map(student => student.id)
        );
    };

    const handleViewStudent = (studentId) => {
        console.log('View student clicked:', studentId);
        try {
            router.visit(`/admin/users/students/${studentId}`, {
                method: 'get'
            });
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = `/admin/users/students/${studentId}`;
        }
    };

    const handleEditStudent = (studentId) => {
        console.log('Edit student clicked:', studentId);
        try {
            router.visit(`/admin/users/students/${studentId}/edit`, {
                method: 'get'
            });
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = `/admin/users/students/${studentId}/edit`;
        }
    };

    const handleDeleteStudent = (studentId) => {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            router.delete(route('admin.users.students.destroy', studentId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Student deleted successfully');
                },
                onError: (errors) => {
                    console.error('Error deleting student:', errors);
                    toast.error(errors.error || 'Failed to delete student. Please try again.');
                }
            });
        }
    };

    const handleBulkAction = (action) => {
        if (selectedStudents.length === 0) {
            toast.error('Please select students first');
            return;
        }

        switch (action) {
            case 'activate':
                router.post(route('admin.users.bulk-update'), {
                    user_ids: selectedStudents,
                    status: 'active'
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`${selectedStudents.length} students activated`);
                        setSelectedStudents([]);
                    },
                    onError: () => {
                        toast.error('Failed to activate students');
                    }
                });
                break;
            case 'deactivate':
                router.post(route('admin.users.bulk-update'), {
                    user_ids: selectedStudents,
                    status: 'inactive'
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`${selectedStudents.length} students deactivated`);
                        setSelectedStudents([]);
                    },
                    onError: () => {
                        toast.error('Failed to deactivate students');
                    }
                });
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`)) {
                    router.post(route('admin.users.bulk-delete'), {
                        user_ids: selectedStudents
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedStudents.length} students deleted`);
                            setSelectedStudents([]);
                        },
                        onError: () => {
                            toast.error('Failed to delete students');
                        }
                    });
                }
                break;
        }
    };

    return (
        <AppLayout title="Kelola Siswa">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Siswa</h1>
                        <p className="text-gray-600 mt-1">Manage and monitor all students on your platform</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                        
                        <Link
                            href="/admin/users/students/create"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah Siswa</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_students || students.total || 0}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {stats.total_students > 0 ? `${stats.total_students} terdaftar` : 'Belum ada data'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Siswa Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.active_students || 0}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {stats.total_students > 0
                                        ? `${Math.round((stats.active_students / stats.total_students) * 100)}% dari total`
                                        : 'Belum ada data'
                                    }
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pendaftaran</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_enrollments || 0}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Semua pelatihan</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Penyelesaian</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.completed_enrollments || 0}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    {stats.completion_rate ? `${stats.completion_rate}% completion rate` : 'Course selesai'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {(searchTerm || statusFilter) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                                    showFilters
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>

                            {selectedStudents.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {selectedStudents.length} selected
                                    </span>
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Students Table */}
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
                                            checked={selectedStudents.length === studentList.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type & Group
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Courses
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Learning Hours
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Certificates
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
                                {studentList.map((student, index) => (
                                    <motion.tr 
                                        key={student.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.id)}
                                                onChange={() => handleSelectStudent(student.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar.startsWith('http')
                                                                ? student.avatar
                                                                : `/storage/${student.avatar}`}
                                                            alt={student.first_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {getInitials(student.first_name, student.last_name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{student.email}</p>
                                                    {student.phone && (
                                                        <p className="text-xs text-gray-400">{student.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    {student.user_type === 'special' ? (
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                                            <UserPlus className="w-3 h-3 mr-1" />
                                                            Special
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            <User className="w-3 h-3 mr-1" />
                                                            General
                                                        </span>
                                                    )}
                                                </div>
                                                {student.user_type === 'special' && student.user_group && (
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            {student.user_group.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {student.user_type === 'special' && student.accessible_courses && student.accessible_courses.length > 0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <BookOpen className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            {student.accessible_courses.length} direct access
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="text-gray-900">
                                                    {student.enrolled_courses_count} enrolled
                                                </div>
                                                <div className="text-gray-500">
                                                    {student.completed_courses_count} completed
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                        style={{width: `${student.progress_average}%`}}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getProgressColor(student.progress_average)}`}>
                                                    {student.progress_average}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {student.total_learning_hours}h
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <Trophy className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {student.certificates_count}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center text-center px-3 py-1 text-xs font-semibold rounded-full ${
                                                student.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewStudent(student.id)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                    type="button"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditStudent(student.id)}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                    type="button"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
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

                    {studentList.length === 0 && (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first student'}
                            </p>
                            <Link
                                href="/admin/users/students/create"
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Tambah Siswa</span>
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {students.data && students.data.length > 0 && students.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {students.from || 1} to {students.to || students.data.length} of {students.total} students
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const params = { page: students.current_page - 1 };
                                        if (searchTerm) params.search = searchTerm;
                                        if (statusFilter) params.status = statusFilter;
                                        router.get(route('admin.users.students'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!students.prev_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        students.prev_page_url
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>

                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Page {students.current_page} of {students.last_page}
                                </span>

                                <button
                                    onClick={() => {
                                        const params = { page: students.current_page + 1 };
                                        if (searchTerm) params.search = searchTerm;
                                        if (statusFilter) params.status = statusFilter;
                                        router.get(route('admin.users.students'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!students.next_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        students.next_page_url
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}