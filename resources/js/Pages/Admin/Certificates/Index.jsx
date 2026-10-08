import React, { useState } from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    Search,
    Trash2,
    Eye,
    Calendar,
    CheckCircle,
    AlertCircle,
    Download,
    Upload,
    Trophy,
    Award,
    Video,
    Camera,
    Settings,
    Sparkles,
    FileCheck,
    X
} from 'lucide-react';

export default function CertificateIndex({
    completedEnrollments = { data: [], total: 0, from: 0, to: 0, last_page: 1, links: [] },
    certificates = { data: [], total: 0, from: 0, to: 0, last_page: 1, links: [] },
    stats = { ready_for_certificate: 0, total_certificates: 0, this_month: 0 },
    courses = [],
    filters = { search: '', course_id: '' }
}) {
    const { flash } = usePage().props;
    const [uploadingFor, setUploadingFor] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [zoomModal, setZoomModal] = useState({ show: false, data: null });
    
    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        course_id: '',
        certificate_file: null,
        grade: ''
    });

    const { delete: deleteMethod } = useForm();

    const handleFileUpload = (enrollment) => {
        setUploadingFor(enrollment.id);
        setData({
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
            certificate_file: null,
            grade: ''
        });
    };

    const submitCertificate = (e) => {
        e.preventDefault();
        
        post(route('admin.certificates.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setUploadingFor(null);
                toast.success('Sertifikat berhasil diupload!');
            },
            onError: (errors) => {
                console.error('Certificate upload errors:', errors);
                toast.error('Gagal mengupload sertifikat');
            }
        });
    };

    const deleteCertificate = (certificateId) => {
        if (confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) {
            deleteMethod(route('admin.certificates.delete-certificate', certificateId), {
                onSuccess: () => {
                    toast.success('Sertifikat berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus sertifikat');
                }
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.certificates.index'), {
            search: searchTerm,
            course_id: selectedCourse
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleCourseFilter = (courseId) => {
        setSelectedCourse(courseId);
        router.get(route('admin.certificates.index'), {
            search: searchTerm,
            course_id: courseId
        }, {
            preserveState: true,
            replace: true
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout title="Certificate Management">
            <div className="p-3 sm:p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Certificate Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola sertifikat untuk siswa yang telah menyelesaikan course
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
                    >
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>{flash.success}</span>
                        </div>
                    </motion.div>
                )}

                {flash?.error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
                    >
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{flash.error}</span>
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sertifikat</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {stats.total_certificates || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Telah diterbitkan
                                </p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Auto Generate</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {stats.auto_generated || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Otomatis sistem
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upload Manual</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {stats.uploaded || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Diupload admin
                                </p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <Upload className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {stats.this_month || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Sertifikat baru
                                </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari siswa, course, atau no sertifikat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </form>

                        <div className="flex items-center space-x-3">
                            {/* Course Filter */}
                            <select
                                value={selectedCourse}
                                onChange={(e) => handleCourseFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Semua Pelatihan</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>

                            {/* Clear Filter Button */}
                            {(searchTerm || selectedCourse) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCourse('');
                                        router.get(route('admin.certificates.index'), {}, {
                                            preserveState: true,
                                            replace: true
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Issued Certificates */}
                <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Award className="w-6 h-6 text-green-600" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Sertifikat Yang Telah Diterbitkan
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {certificates.data?.length || 0} sertifikat telah diterbitkan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {certificates.data && certificates.data.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No. Sertifikat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Siswa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kehadiran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Diterbitkan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {certificates.data.map((certificate) => (
                                            <tr key={certificate.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.certificate_number || '-'}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            certificate.status === 'approved'
                                                                ? 'bg-green-100 text-green-800'
                                                                : certificate.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {certificate.status === 'approved' ? 'Disetujui' : certificate.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            {certificate.user?.avatar ? (
                                                                <img
                                                                    src={certificate.user.avatar.startsWith('http') 
                                                                        ? certificate.user.avatar 
                                                                        : `/storage/${certificate.user.avatar}`}
                                                                    alt={`${certificate.user.first_name} ${certificate.user.last_name}`}
                                                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                                    {certificate.user?.first_name?.charAt(0)}{certificate.user?.last_name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {certificate.user?.first_name} {certificate.user?.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {certificate.user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.course?.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {certificate.course?.category?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {certificate.certificate_type === 'auto_generated' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <Sparkles className="w-3 h-3" />
                                                            Auto
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            <Upload className="w-3 h-3" />
                                                            Upload
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {certificate.meetings_info?.total_count > 0 ? (
                                                        <div className="flex items-center space-x-1">
                                                            <Video className="w-4 h-4 text-gray-400" />
                                                            <span className={`text-sm font-medium ${
                                                                certificate.meetings_info?.all_attended
                                                                    ? 'text-green-600' : 'text-yellow-600'
                                                            }`}>
                                                                {certificate.meetings_info?.attended_count || 0}/{certificate.meetings_info?.total_count || 0}
                                                            </span>
                                                            {certificate.meetings_info?.all_attended && (
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {certificate.approved_at ? formatDate(certificate.approved_at) : (certificate.completed_at ? formatDate(certificate.completed_at) : '-')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Foto Zoom Button - enabled/disabled based on require_zoom_screenshot */}
                                                        {certificate.course?.require_zoom_screenshot ? (
                                                            certificate.zoom_screenshot_path ? (
                                                                <button
                                                                    onClick={() => setZoomModal({
                                                                        show: true,
                                                                        data: {
                                                                            userName: `${certificate.user?.first_name} ${certificate.user?.last_name}`,
                                                                            courseName: certificate.course?.title,
                                                                            screenshotPath: certificate.zoom_screenshot_path,
                                                                            uploadedAt: certificate.zoom_screenshot_uploaded_at
                                                                        }
                                                                    })}
                                                                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                                    title="Lihat Foto Zoom"
                                                                >
                                                                    <Camera className="w-3.5 h-3.5" />
                                                                    <span>Foto Zoom</span>
                                                                </button>
                                                            ) : (
                                                                <span
                                                                    className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                                    title="Belum upload foto zoom"
                                                                >
                                                                    <Camera className="w-3.5 h-3.5" />
                                                                    <span>Belum Upload</span>
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span
                                                                className="flex items-center space-x-1 bg-gray-300 text-gray-500 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed"
                                                                title="Foto Zoom tidak dibutuhkan untuk pelatihan ini"
                                                            >
                                                                <Camera className="w-3.5 h-3.5" />
                                                                <span>Foto Zoom</span>
                                                            </span>
                                                        )}

                                                        {/* Review Detail Button */}
                                                        <Link
                                                            href={route('admin.certificates.show', certificate.enrollment_id)}
                                                            className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="Review Detail"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Review Detail</span>
                                                        </Link>

                                                        {/* Upload Sertifikat Tambahan Button */}
                                                        <Link
                                                            href={route('admin.certificates.show', certificate.enrollment_id) + '#upload-certificate'}
                                                            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="Upload Sertifikat Tambahan"
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>Upload Sertifikat</span>
                                                        </Link>

                                                        {/* Adjustment Button */}
                                                        <Link
                                                            href={route('admin.certificates.preview', certificate.enrollment_id)}
                                                            className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="Adjustment"
                                                        >
                                                            <Settings className="w-3.5 h-3.5" />
                                                            <span>Adjustment</span>
                                                        </Link>

                                                        {/* Generate Certificate Button - links to preview-html */}
                                                        <a
                                                            href={route('admin.certificates.preview-html', certificate.enrollment_id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="Generate Certificate"
                                                        >
                                                            <FileCheck className="w-3.5 h-3.5" />
                                                            <span>Generate</span>
                                                        </a>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => deleteCertificate(certificate.id)}
                                                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                            title="Hapus Sertifikat"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12">
                                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Belum ada sertifikat yang diterbitkan
                                    </h3>
                                    <p className="text-gray-500">
                                        Sertifikat akan muncul di sini setelah diupload
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
            </div>

            {/* Foto Zoom Modal */}
            {zoomModal.show && zoomModal.data && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setZoomModal({ show: false, data: null })}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-teal-100 rounded-full">
                                        <Camera className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Foto Zoom Meeting</h3>
                                        <p className="text-sm text-gray-500">{zoomModal.data.userName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setZoomModal({ show: false, data: null })}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Image */}
                            <div className="p-4 bg-gray-100">
                                <img
                                    src={zoomModal.data.screenshotPath.startsWith('http')
                                        ? zoomModal.data.screenshotPath
                                        : `/storage/${zoomModal.data.screenshotPath}`}
                                    alt="Zoom Screenshot"
                                    className="w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Course:</span> {zoomModal.data.courseName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Uploaded:</span> {zoomModal.data.uploadedAt ? formatDate(zoomModal.data.uploadedAt) : '-'}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setZoomModal({ show: false, data: null })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Tutup
                                </button>
                                <a
                                    href={zoomModal.data.screenshotPath.startsWith('http')
                                        ? zoomModal.data.screenshotPath
                                        : `/storage/${zoomModal.data.screenshotPath}`}
                                    download
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Foto</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}