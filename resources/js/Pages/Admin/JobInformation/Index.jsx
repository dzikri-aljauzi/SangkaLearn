import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Briefcase,
    MapPin,
    Clock,
    Calendar,
    ExternalLink,
    X,
    Save,
    AlertCircle,
    Upload,
    Building2,
    Users,
    TrendingUp
} from 'lucide-react';

export default function JobInformationIndex({ jobs, locations = [], filters = {} }) {
    const { errors: pageErrors } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || '');
    const [requirementInput, setRequirementInput] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        company: '',
        company_logo: null,
        location: '',
        type: 'full-time',
        deadline: '',
        requirements: [],
        description: '',
        apply_url: '',
        is_active: true,
    });

    // Combine errors from useForm and page props
    const allErrors = { ...errors, ...pageErrors, ...formErrors };

    const openCreateModal = () => {
        reset();
        setEditingJob(null);
        setShowModal(true);
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setData({
            title: job.title,
            company: job.company,
            company_logo: null,
            location: job.location,
            type: job.type,
            deadline: job.deadline ? job.deadline.split('T')[0] : '',
            requirements: job.requirements || [],
            description: job.description || '',
            apply_url: job.apply_url || '',
            is_active: job.is_active,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingJob(null);
        reset();
        setRequirementInput('');
        setFormErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'requirements') {
                // Send requirements as array format for Laravel
                if (Array.isArray(data[key])) {
                    data[key].forEach((req, index) => {
                        formData.append(`requirements[${index}]`, req);
                    });
                }
            } else if (key === 'company_logo' && data[key]) {
                formData.append(key, data[key]);
            } else if (key === 'is_active') {
                // Send boolean as 1 or 0 for Laravel
                formData.append(key, data[key] ? '1' : '0');
            } else if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        if (editingJob) {
            formData.append('_method', 'PUT');
            router.post(route('admin.job-information.update', editingJob.id), formData, {
                onSuccess: () => {
                    setFormErrors({});
                    closeModal();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    setFormErrors(errors);
                },
                preserveScroll: true,
            });
        } else {
            router.post(route('admin.job-information.store'), formData, {
                onSuccess: () => {
                    setFormErrors({});
                    closeModal();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    setFormErrors(errors);
                },
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (id) => {
        router.delete(route('admin.job-information.destroy', id), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleToggleActive = (job) => {
        router.post(route('admin.job-information.toggle-active', job.id));
    };

    const handleFilter = () => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (typeFilter) params.type = typeFilter;

        router.get(route('admin.job-information.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        router.get(route('admin.job-information.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const addRequirement = () => {
        if (requirementInput.trim()) {
            setData('requirements', [...data.requirements, requirementInput.trim()]);
            setRequirementInput('');
        }
    };

    const removeRequirement = (index) => {
        setData('requirements', data.requirements.filter((_, i) => i !== index));
    };

    const jobTypes = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' },
    ];

    // Stats
    const totalJobs = jobs?.total || jobs?.data?.length || 0;
    const activeJobs = jobs?.data?.filter(j => j.is_active).length || 0;
    const expiredJobs = jobs?.data?.filter(j => j.deadline && new Date(j.deadline) < new Date()).length || 0;

    return (
        <AppLayout title="Kelola Lowongan Kerja">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Lowongan Kerja</h1>
                        <p className="text-gray-600 mt-1">Kelola informasi lowongan kerja untuk alumni</p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Lowongan</span>
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Lowongan</p>
                                <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
                                <p className="text-xs text-blue-600 mt-1">Terdaftar di sistem</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Lowongan Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                                <p className="text-xs text-green-600 mt-1">Tampil di halaman publik</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sudah Expired</p>
                                <p className="text-2xl font-bold text-gray-900">{expiredJobs}</p>
                                <p className="text-xs text-red-600 mt-1">Melewati deadline</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-red-600" />
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
                                    placeholder="Cari judul, perusahaan, lokasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setTimeout(handleFilter, 100);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Semua Tipe</option>
                                {jobTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cari
                            </button>
                            {(searchQuery || typeFilter) && (
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

                {/* Jobs Table */}
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
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lowongan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lokasi
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data lowongan</h3>
                                            <p className="text-gray-500 mb-6">
                                                Klik "Tambah Lowongan" untuk menambahkan lowongan kerja baru
                                            </p>
                                            <button
                                                onClick={openCreateModal}
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Tambah Lowongan</span>
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    jobs?.data?.map((job, index) => (
                                        <motion.tr
                                            key={job.id}
                                            className="hover:bg-gray-50 transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                            {job.company_logo ? (
                                                                <img
                                                                    src={`/storage/${job.company_logo}`}
                                                                    alt={job.company}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Building2 className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                                                        <p className="text-xs text-gray-500">{job.company}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                    {job.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    job.type === 'full-time' ? 'bg-blue-100 text-blue-800' :
                                                    job.type === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
                                                    job.type === 'contract' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {job.type === 'full-time' ? 'Full-time' :
                                                     job.type === 'part-time' ? 'Part-time' :
                                                     job.type === 'contract' ? 'Contract' : 'Internship'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {job.deadline ? (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                        {new Date(job.deadline).toLocaleDateString('id-ID')}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(job)}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        job.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {job.is_active ? (
                                                        <>
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Aktif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3 mr-1" />
                                                            Nonaktif
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {job.apply_url && (
                                                        <a
                                                            href={job.apply_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Buka Link Apply"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(job)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(job.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {jobs?.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan {jobs.from || 1} - {jobs.to || jobs.data?.length} dari {jobs.total} lowongan
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const params = { page: jobs.current_page - 1 };
                                        if (searchQuery) params.search = searchQuery;
                                        if (typeFilter) params.type = typeFilter;
                                        router.get(route('admin.job-information.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!jobs.prev_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        jobs.prev_page_url
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Page {jobs.current_page} of {jobs.last_page}
                                </span>
                                <button
                                    onClick={() => {
                                        const params = { page: jobs.current_page + 1 };
                                        if (searchQuery) params.search = searchQuery;
                                        if (typeFilter) params.type = typeFilter;
                                        router.get(route('admin.job-information.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!jobs.next_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        jobs.next_page_url
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50" onClick={closeModal}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingJob ? 'Edit Lowongan' : 'Tambah Lowongan'}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Global Error Display */}
                                {Object.keys(allErrors).length > 0 && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center text-red-700 mb-2">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">Terdapat kesalahan:</span>
                                        </div>
                                        <ul className="list-disc list-inside text-sm text-red-600">
                                            {Object.entries(allErrors).map(([key, message]) => (
                                                <li key={key}>{message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Judul Posisi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: Risk Manager"
                                        />
                                        {allErrors.title && <p className="mt-1 text-sm text-red-600">{allErrors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Perusahaan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: Bank BPD Jateng"
                                        />
                                        {allErrors.company && <p className="mt-1 text-sm text-red-600">{allErrors.company}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Logo Perusahaan
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        {editingJob?.company_logo && (
                                            <img
                                                src={`/storage/${editingJob.company_logo}`}
                                                alt="Current logo"
                                                className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                        )}
                                        <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <Upload className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {data.company_logo ? data.company_logo.name : 'Upload Logo'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setData('company_logo', e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lokasi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: Jakarta Selatan"
                                        />
                                        {allErrors.location && <p className="mt-1 text-sm text-red-600">{allErrors.location}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipe Pekerjaan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {jobTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deadline
                                        </label>
                                        <input
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e) => setData('deadline', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Link Apply
                                        </label>
                                        <input
                                            type="url"
                                            value={data.apply_url}
                                            onChange={(e) => setData('apply_url', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Persyaratan
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={requirementInput}
                                            onChange={(e) => setRequirementInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ketik persyaratan dan tekan Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={addRequirement}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                    {data.requirements.length > 0 && (
                                        <ul className="space-y-1">
                                            {data.requirements.map((req, index) => (
                                                <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                                    <span className="text-sm">{req}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRequirement(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Deskripsi tambahan tentang lowongan..."
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                        Tampilkan di halaman publik
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Lowongan?</h3>
                                <p className="text-gray-600 mb-6">
                                    Data lowongan akan dihapus secara permanen dan tidak dapat dikembalikan.
                                </p>
                                <div className="flex justify-center space-x-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
