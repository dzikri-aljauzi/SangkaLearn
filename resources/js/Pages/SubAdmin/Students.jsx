import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { 
    Users, 
    Search, 
    Filter,
    Eye,
    TrendingUp,
    Award,
    BookOpen,
    Calendar,
    ArrowLeft,
    UserCheck,
    UserX,
    Clock
} from 'lucide-react';

export default function SubAdminStudents({ students, filters, subAdmin }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get('/subadmin/students', { preserveState: true });
    };

    const handleFilterChange = (field, value) => {
        setData(field, value);
        get('/subadmin/students', {
            preserveState: true,
            data: { ...data, [field]: value }
        });
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 bg-green-100';
        if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <AppLayout title="My Students">
            <Head title="My Students" />
            
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
                            href="/subadmin/dashboard"
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                                <Users className="w-8 h-8 text-blue-600" />
                                <span>My Students</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {subAdmin.user_group ? (
                                    <>Managing students from <strong>{subAdmin.user_group.name}</strong></>
                                ) : (
                                    'Manage and track your assigned students'
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Summary */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{students.total || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.data ? students.data.filter(s => s.is_active).length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.data ? students.data.reduce((sum, s) => sum + s.enrolled_courses_count, 0) : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Certificates</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.data ? students.data.reduce((sum, s) => sum + s.certificates_count, 0) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Search students by name or email..."
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <select
                            value={data.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                    </form>
                </motion.div>

                {/* Students List */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Students ({students.total || 0})
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    Showing {students.data ? students.data.length : 0} of {students.total || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {students.data && students.data.length > 0 ? (
                            students.data.map((student) => (
                                <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="w-12 h-12 rounded-full" />
                                                ) : (
                                                    <span className="text-blue-600 font-medium">
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </h4>
                                                    <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        student.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {student.is_active ? (
                                                            <><UserCheck className="w-3 h-3 mr-1" /> Active</>
                                                        ) : (
                                                            <><UserX className="w-3 h-3 mr-1" /> Inactive</>
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                    <span className="flex items-center space-x-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>{student.enrolled_courses_count} courses</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{student.completed_courses_count} completed</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Award className="w-4 h-4" />
                                                        <span>{student.certificates_count} certificates</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Last: {formatDate(student.last_login)}</span>
                                                    </span>
                                                </div>
                                                {student.user_group && (
                                                    <div className="mt-2">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                            {student.user_group.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(student.average_progress)}`}>
                                                    {Math.round(student.average_progress)}% avg progress
                                                </div>
                                            </div>
                                            <Link
                                                href={`/subadmin/students/${student.id}`}
                                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-600 mb-6">
                                    {filters.search ? 
                                        'No students match your search criteria.' : 
                                        'You don\'t have any students assigned yet.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {students.links && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{students.from}</span> to{' '}
                                    <span className="font-medium">{students.to}</span> of{' '}
                                    <span className="font-medium">{students.total}</span> results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {students.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}