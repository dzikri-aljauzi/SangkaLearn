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
    GraduationCap,
    Linkedin,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Users,
    Award,
    Building2,
    Briefcase,
    Upload,
    UserPlus,
    Filter
} from 'lucide-react';

export default function AlumniIndex({ alumni, certifiedUsers = [], filters = {} }) {
    const { errors: pageErrors } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showSelectCertifiedModal, setShowSelectCertifiedModal] = useState(false);
    const [editingAlumni, setEditingAlumni] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [certifiedSearchQuery, setCertifiedSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: null,
        certificate_id: null,
        name: '',
        program: '',
        company: '',
        job_title: '',
        testimonial: '',
        linkedin_url: '',
        photo: null,
        is_active: true,
    });

    // Combine errors from useForm and page props
    const allErrors = { ...errors, ...pageErrors, ...formErrors };

    const openCreateModal = () => {
        reset();
        setEditingAlumni(null);
        setShowModal(true);
    };

    const openEditModal = (alumniItem) => {
        setEditingAlumni(alumniItem);
        setData({
            user_id: alumniItem.user_id || null,
            certificate_id: alumniItem.certificate_id || null,
            name: alumniItem.name,
            program: alumniItem.program,
            company: alumniItem.company || '',
            job_title: alumniItem.job_title || '',
            testimonial: alumniItem.testimonial,
            linkedin_url: alumniItem.linkedin_url || '',
            photo: null,
            is_active: alumniItem.is_active,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAlumni(null);
        reset();
        setFormErrors({});
    };

    const openSelectCertifiedModal = () => {
        setCertifiedSearchQuery('');
        setShowSelectCertifiedModal(true);
    };

    const closeSelectCertifiedModal = () => {
        setShowSelectCertifiedModal(false);
        setCertifiedSearchQuery('');
    };

    const selectCertifiedUser = (certUser) => {
        setData({
            user_id: certUser.user_id,
            certificate_id: certUser.id,
            name: certUser.user_name,
            program: certUser.course_title,
            company: certUser.user_company || '',
            job_title: certUser.user_job_title || '',
            testimonial: '',
            linkedin_url: certUser.user_linkedin_url || '',
            photo: null,
            is_active: true,
        });
        closeSelectCertifiedModal();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'photo' && data[key]) {
                formData.append(key, data[key]);
            } else if (key === 'is_active') {
                // Send boolean as 1 or 0 for Laravel
                formData.append(key, data[key] ? '1' : '0');
            } else if (key === 'user_id' || key === 'certificate_id') {
                // Only send if not null
                if (data[key] !== null) {
                    formData.append(key, data[key]);
                }
            } else if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        if (editingAlumni) {
            formData.append('_method', 'PUT');
            router.post(route('admin.alumni.update', editingAlumni.id), formData, {
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
            router.post(route('admin.alumni.store'), formData, {
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
        router.delete(route('admin.alumni.destroy', id), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleToggleActive = (alumniItem) => {
        router.post(route('admin.alumni.toggle-active', alumniItem.id));
    };

    const handleFilter = () => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (statusFilter) params.status = statusFilter;

        router.get(route('admin.alumni.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        router.get(route('admin.alumni.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter certified users based on search
    const filteredCertifiedUsers = certifiedUsers.filter(user => {
        if (!certifiedSearchQuery) return true;
        const query = certifiedSearchQuery.toLowerCase();
        return (
            user.user_name?.toLowerCase().includes(query) ||
            user.course_title?.toLowerCase().includes(query) ||
            user.user_company?.toLowerCase().includes(query)
        );
    });

    // Stats
    const totalAlumni = alumni?.total || alumni?.data?.length || 0;
    const activeAlumni = alumni?.data?.filter(a => a.is_active).length || 0;
    const availableCertified = certifiedUsers.filter(u => !u.is_alumni).length;

    return (
        <AppLayout title="Kelola Alumni">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Alumni</h1>
                        <p className="text-gray-600 mt-1">Kelola data alumni yang ditampilkan di halaman publik</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={openSelectCertifiedModal}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Award className="w-4 h-4" />
                            <span>Pilih dari Sertifikat</span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Manual</span>
                        </button>
                    </div>
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
                                <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                                <p className="text-2xl font-bold text-gray-900">{totalAlumni}</p>
                                <p className="text-xs text-blue-600 mt-1">Terdaftar di sistem</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Alumni Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">{activeAlumni}</p>
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
                                <p className="text-sm font-medium text-gray-600">Peserta Lulus Tersedia</p>
                                <p className="text-2xl font-bold text-gray-900">{availableCertified}</p>
                                <p className="text-xs text-yellow-600 mt-1">Belum jadi alumni</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-600" />
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
                                    placeholder="Cari nama, program, perusahaan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setTimeout(handleFilter, 100);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cari
                            </button>
                            {(searchQuery || statusFilter) && (
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

                {/* Alumni Table */}
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
                                        Alumni
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Program
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Perusahaan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        LinkedIn
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
                                {alumni?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data alumni</h3>
                                            <p className="text-gray-500 mb-6">
                                                Klik "Pilih dari Sertifikat" untuk menambahkan alumni dari peserta yang sudah lulus
                                            </p>
                                            <button
                                                onClick={openSelectCertifiedModal}
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Award className="w-4 h-4" />
                                                <span>Pilih dari Sertifikat</span>
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    alumni?.data?.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                                            {item.photo ? (
                                                                <img src={`/storage/${item.photo}`} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                item.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                        {item.job_title && (
                                                            <p className="text-xs text-gray-500">{item.job_title}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">{item.program}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.company ? (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                                                        {item.company}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.linkedin_url ? (
                                                    <a
                                                        href={item.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Linkedin className="w-4 h-4 mr-1" />
                                                        <span className="text-sm">LinkedIn</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(item)}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        item.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {item.is_active ? (
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
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(item.id)}
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
                    {alumni?.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan {alumni.from || 1} - {alumni.to || alumni.data?.length} dari {alumni.total} alumni
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const params = { page: alumni.current_page - 1 };
                                        if (searchQuery) params.search = searchQuery;
                                        if (statusFilter) params.status = statusFilter;
                                        router.get(route('admin.alumni.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!alumni.prev_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        alumni.prev_page_url
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Page {alumni.current_page} of {alumni.last_page}
                                </span>
                                <button
                                    onClick={() => {
                                        const params = { page: alumni.current_page + 1 };
                                        if (searchQuery) params.search = searchQuery;
                                        if (statusFilter) params.status = statusFilter;
                                        router.get(route('admin.alumni.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    disabled={!alumni.next_page_url}
                                    className={`px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg transition-colors ${
                                        alumni.next_page_url
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

            {/* Select Certified User Modal */}
            {showSelectCertifiedModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50" onClick={closeSelectCertifiedModal}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Pilih dari Peserta Lulus</h3>
                                    <p className="text-sm text-gray-500 mt-1">Pilih peserta yang sudah mendapat sertifikat untuk dijadikan alumni</p>
                                </div>
                                <button onClick={closeSelectCertifiedModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama, program, atau perusahaan..."
                                        value={certifiedSearchQuery}
                                        onChange={(e) => setCertifiedSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {filteredCertifiedUsers.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Tidak ada peserta lulus yang ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredCertifiedUsers.map((certUser) => (
                                            <div
                                                key={certUser.id}
                                                className={`p-4 border rounded-xl transition-colors ${
                                                    certUser.is_alumni
                                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                                                }`}
                                                onClick={() => !certUser.is_alumni && selectCertifiedUser(certUser)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {certUser.user_avatar ? (
                                                                <img src={`/storage/${certUser.user_avatar}`} alt={certUser.user_name} className="w-full h-full object-cover rounded-full" />
                                                            ) : (
                                                                certUser.user_name?.charAt(0)?.toUpperCase() || '?'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{certUser.user_name}</p>
                                                            <p className="text-sm text-gray-500">{certUser.user_email}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                    <Award className="w-3 h-3 mr-1" />
                                                                    {certUser.course_title}
                                                                </span>
                                                                {certUser.user_company && (
                                                                    <span className="inline-flex items-center text-xs text-gray-500">
                                                                        <Building2 className="w-3 h-3 mr-1" />
                                                                        {certUser.user_company}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {certUser.is_alumni ? (
                                                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Sudah Alumni
                                                        </span>
                                                    ) : (
                                                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                                            <UserPlus className="w-4 h-4 mr-1" />
                                                            Pilih
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50" onClick={closeModal}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingAlumni ? 'Edit Alumni' : 'Tambah Alumni'}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {data.certificate_queue_id && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center text-green-700">
                                        <Award className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">Data diambil dari peserta lulus sertifikasi</span>
                                    </div>
                                </div>
                            )}

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    {allErrors.name && <p className="mt-1 text-sm text-red-600">{allErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Program/Pelatihan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.program}
                                        onChange={(e) => setData('program', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Contoh: Sertifikasi Manajemen Risiko Level 4"
                                    />
                                    {allErrors.program && <p className="mt-1 text-sm text-red-600">{allErrors.program}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={data.company}
                                                onChange={(e) => setData('company', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nama perusahaan"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={data.job_title}
                                                onChange={(e) => setData('job_title', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Jabatan/Posisi"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Testimonial <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.testimonial}
                                        onChange={(e) => setData('testimonial', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Masukkan testimonial alumni..."
                                    />
                                    {allErrors.testimonial && <p className="mt-1 text-sm text-red-600">{allErrors.testimonial}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="url"
                                            value={data.linkedin_url}
                                            onChange={(e) => setData('linkedin_url', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    {allErrors.linkedin_url && <p className="mt-1 text-sm text-red-600">{allErrors.linkedin_url}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Alumni</label>
                                    <div className="flex items-center space-x-4">
                                        {editingAlumni?.photo && (
                                            <img
                                                src={`/storage/${editingAlumni.photo}`}
                                                alt="Current photo"
                                                className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                        )}
                                        <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <Upload className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {data.photo ? data.photo.name : 'Upload Foto'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setData('photo', e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {allErrors.photo && <p className="mt-1 text-sm text-red-600">{allErrors.photo}</p>}
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Alumni?</h3>
                                <p className="text-gray-600 mb-6">
                                    Data alumni akan dihapus secara permanen dan tidak dapat dikembalikan.
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
