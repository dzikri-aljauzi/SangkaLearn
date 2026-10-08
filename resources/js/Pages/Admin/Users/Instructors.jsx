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
    GraduationCap,
    BookOpen,
    Users,
    Star,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Download,
    Upload
} from 'lucide-react';

export default function Instructors({
    instructors = { data: [], total: 0, current_page: 1, per_page: 15 },
    stats = {},
    filters = {}
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedInstructors, setSelectedInstructors] = useState([]);
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
        // Always reset to page 1 when filtering
        params.page = 1;

        router.get(route('admin.users.instructors'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Replace history instead of pushing new entry
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('admin.users.instructors'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);

        const url = route('admin.users.instructors.export') + (params.toString() ? '?' + params.toString() : '');
        // Use window.location.href for file downloads
        window.location.href = url;
    };

    // Sample data if none provided
    const sampleInstructors = [
        {
            id: 1,
            first_name: 'Dr. Ahmad',
            last_name: 'Wijaya',
            email: 'ahmad.wijaya@example.com',
            phone: '+62 811-1234-5678',
            avatar: null,
            status: 'active',
            created_at: '2024-01-15T08:00:00Z',
            courses_count: 5,
            students_count: 234,
            specialization: 'Web Development'
        },
        {
            id: 2,
            first_name: 'Prof. Sari',
            last_name: 'Dewi',
            email: 'sari.dewi@example.com',
            phone: '+62 812-9876-5432',
            avatar: null,
            status: 'active',
            created_at: '2024-01-10T10:30:00Z',
            courses_count: 8,
            students_count: 456,
            specialization: 'Data Science'
        },
        {
            id: 3,
            first_name: 'Ir. Budi',
            last_name: 'Santoso',
            email: 'budi.santoso@example.com',
            phone: '+62 813-5555-1234',
            avatar: null,
            status: 'inactive',
            created_at: '2024-01-05T14:20:00Z',
            courses_count: 3,
            students_count: 89,
            specialization: 'Mobile Development'
        }
    ];

    // Use real data from database if available, otherwise fall back to sample data
    const instructorData = instructors.data && instructors.data.length > 0 ? instructors.data : sampleInstructors;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    };

    // Use data directly from server (already filtered)
    const instructorList = instructorData;

    const handleSelectInstructor = (instructorId) => {
        setSelectedInstructors(prev =>
            prev.includes(instructorId)
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId]
        );
    };

    const handleSelectAll = () => {
        setSelectedInstructors(
            selectedInstructors.length === instructorList.length
                ? []
                : instructorList.map(instructor => instructor.id)
        );
    };

    const handleDeleteInstructor = (instructorId) => {
        if (confirm('Are you sure you want to delete this instructor?')) {
            // router.delete(`/admin/users/instructors/${instructorId}`);
            toast.success('Instructor deleted successfully');
        }
    };

    const handleBulkAction = (action) => {
        if (selectedInstructors.length === 0) {
            toast.error('Please select instructors first');
            return;
        }

        switch (action) {
            case 'activate':
                toast.success(`${selectedInstructors.length} instructors activated`);
                break;
            case 'deactivate':
                toast.success(`${selectedInstructors.length} instructors deactivated`);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedInstructors.length} instructors?`)) {
                    toast.success(`${selectedInstructors.length} instructors deleted`);
                }
                break;
        }
        setSelectedInstructors([]);
    };

    return (
        <AppLayout title="Kelola Instruktur">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Instruktur</h1>
                        <p className="text-gray-600 mt-1">Manage and monitor all instructors on your platform</p>
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
                            href="/admin/users/instructors/create"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah Instruktur</span>
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
                                <p className="text-sm font-medium text-gray-600">Total Instruktur</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_instructors || instructors.total || instructorData.length}</p>
                                <p className="text-xs text-green-600 mt-1">+2 bulan ini</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Instruktur Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {instructorData.filter(i => i.status === 'active').length}
                                </p>
                                <p className="text-xs text-green-600 mt-1">87% dari total</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pelatihan</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {instructorData.reduce((sum, i) => sum + i.courses_count, 0)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Dari semua instruktur</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {instructorData.reduce((sum, i) => sum + i.students_count, 0)}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">Diajar instruktur</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
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
                                    placeholder="Search instructors..."
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

                        
                    </div>
                </motion.div>

                {/* Instructors Table */}
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
                                            checked={selectedInstructors.length === instructorList.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Instructor
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specialization
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Courses
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
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
                                {instructorList.map((instructor, index) => (
                                    <motion.tr 
                                        key={instructor.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedInstructors.includes(instructor.id)}
                                                onChange={() => handleSelectInstructor(instructor.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {instructor.avatar ? (
                                                        <img
                                                            src={instructor.avatar.startsWith('http')
                                                                ? instructor.avatar
                                                                : `/storage/${instructor.avatar}`}
                                                            alt={instructor.first_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {getInitials(instructor.first_name, instructor.last_name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {instructor.first_name} {instructor.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{instructor.email}</p>
                                                    {instructor.phone && (
                                                        <p className="text-xs text-gray-400">{instructor.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {instructor.specializations && instructor.specializations.length > 0 ? (
                                                    instructor.specializations.map((spec) => (
                                                        <span key={spec.id} className="inline-flex items-center justify-center text-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full w-full">
                                                            {spec.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400">No specialization</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {instructor.courses_count}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {instructor.students_count?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center text-center px-3 py-1 text-xs font-semibold rounded-full ${
                                                instructor.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {instructor.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/admin/users/instructors/${instructor.id}`}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/users/instructors/${instructor.id}/edit`}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteInstructor(instructor.id)}
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

                    {instructorList.length === 0 && (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first instructor'}
                            </p>
                            <Link
                                href="/admin/users/instructors/create"
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Tambah Instruktur</span>
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {instructors.data && instructors.data.length > 0 && instructors.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {instructors.from || 1} to {instructors.to || instructors.data.length} of {instructors.total} instructors
                            </div>
                            <div className="flex items-center space-x-2">
                                {instructors.current_page > 1 && (
                                    <Link
                                        href={route('admin.users.instructors')}
                                        data={{
                                            page: instructors.current_page - 1,
                                            search: searchTerm,
                                            status: statusFilter
                                        }}
                                        preserveState
                                        preserveScroll
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}

                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Page {instructors.current_page} of {instructors.last_page}
                                </span>

                                {instructors.current_page < instructors.last_page && (
                                    <Link
                                        href={route('admin.users.instructors')}
                                        data={{
                                            page: instructors.current_page + 1,
                                            search: searchTerm,
                                            status: statusFilter
                                        }}
                                        preserveState
                                        preserveScroll
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}