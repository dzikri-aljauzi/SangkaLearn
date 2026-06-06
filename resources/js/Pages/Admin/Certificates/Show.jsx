import React, { useState, useRef } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Award,
    User,
    BookOpen,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Upload,
    RefreshCw,
    Trash2,
    Eye,
    FileText,
    Sparkles,
    AlertCircle,
    Video,
    Image as ImageIcon,
    ChevronRight
} from 'lucide-react';

export default function CertificateShow({ enrollment, certificates, timeline, progress, meetingAttendances }) {
    const { flash } = usePage().props;
    const [showUploadModal, setShowUploadModal] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        enrollment_id: enrollment.id,
        certificate_file: null,
        certificate_title: '',
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle upload additional certificate
    const handleUploadAdditional = (e) => {
        e.preventDefault();
        if (!data.certificate_title.trim()) {
            toast.error('Masukkan judul sertifikat terlebih dahulu');
            return;
        }
        if (!data.certificate_file) {
            toast.error('Pilih file PDF terlebih dahulu');
            return;
        }

        post(route('admin.certificates.upload-additional'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowUploadModal(false);
                toast.success('Sertifikat tambahan berhasil diupload!');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error(errors.certificate_file || errors.error || 'Gagal upload sertifikat');
            }
        });
    };

    // Handle regenerate
    const handleRegenerate = (enrollmentId) => {
        if (!confirm('Yakin ingin regenerate sertifikat utama? File lama akan dihapus.')) return;

        router.post(route('admin.certificates.regenerate', enrollmentId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sertifikat berhasil di-generate ulang!');
            },
            onError: (errors) => {
                toast.error(errors.error || 'Gagal regenerate sertifikat');
            }
        });
    };

    // Handle delete certificate
    const handleDelete = (certificateId) => {
        if (!confirm('Yakin ingin menghapus sertifikat ini?')) return;

        router.delete(route('admin.certificates.delete-certificate', certificateId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sertifikat berhasil dihapus');
            },
            onError: (errors) => {
                toast.error(errors.error || 'Gagal menghapus sertifikat');
            }
        });
    };

    // Get type badge
    const getTypeBadge = (type, isPrimary) => {
        if (type === 'auto_generated') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Sparkles className="w-3 h-3" />
                    {isPrimary ? 'Utama (Auto)' : 'Auto'}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Upload className="w-3 h-3" />
                    Upload
                </span>
            );
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Disetujui
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3" />
                        Ditolak
                    </span>
                );
            default:
                return null;
        }
    };

    // Get timeline icon
    const getTimelineIcon = (type) => {
        switch (type) {
            case 'certificate_created':
                return <FileText className="w-5 h-5 text-blue-600" />;
            case 'certificate_approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'certificate_rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <AppLayout title="Tracking Sertifikat">
            <Head title="Tracking Sertifikat" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.certificates.index')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tracking Sertifikat</h1>
                            <p className="text-gray-600 mt-1">Lihat semua sertifikat dan riwayat</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Sertifikat Tambahan
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Student & Progress Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Student Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Peserta</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{enrollment.user.name}</p>
                                        <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Pelatihan:</span>
                                        <span className="font-medium text-gray-900">{enrollment.course.title}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Selesai:</span>
                                        <span className="font-medium text-gray-900">{formatDate(enrollment.completed_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Award className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Progress:</span>
                                        <span className="font-medium text-green-600">{enrollment.progress_percentage}%</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Video className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Kehadiran:</span>
                                        <span className="font-medium text-gray-900">
                                            {enrollment.meetings_attended_count}/{enrollment.total_meetings_count} meeting
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Details */}
                        {progress && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Progress</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Lessons</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {progress.lessons.completed}/{progress.lessons.total}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Quizzes</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {progress.quizzes.completed}/{progress.quizzes.total}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Assignments</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {progress.assignments.completed}/{progress.assignments.total}
                                        </span>
                                    </div>
                                    {progress.zoom_screenshot.required && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Zoom Screenshot</span>
                                            <span className={`text-sm font-medium ${progress.zoom_screenshot.uploaded ? 'text-green-600' : 'text-red-600'}`}>
                                                {progress.zoom_screenshot.uploaded ? 'Uploaded' : 'Belum'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Certificates & Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Certificates List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Sertifikat</h3>
                                <span className="text-sm text-gray-500">{certificates.length} sertifikat</span>
                            </div>

                            {certificates.length === 0 ? (
                                <div className="text-center py-8">
                                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Belum ada sertifikat</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {certificates.map((cert) => (
                                        <motion.div
                                            key={cert.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getTypeBadge(cert.certificate_type, cert.is_primary)}
                                                        {getStatusBadge(cert.status)}
                                                        {cert.auto_approved && (
                                                            <span className="text-xs text-gray-500">(Auto-approved)</span>
                                                        )}
                                                    </div>

                                                    {cert.certificate_title && (
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            {cert.certificate_title}
                                                        </p>
                                                    )}

                                                    {cert.certificate_number && (
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            No: <span className="font-mono">{cert.certificate_number}</span>
                                                        </p>
                                                    )}

                                                    <p className="text-xs text-gray-500">
                                                        Dibuat: {formatDate(cert.created_at)}
                                                    </p>

                                                    {cert.approved_at && (
                                                        <p className="text-xs text-gray-500">
                                                            Disetujui: {formatDate(cert.approved_at)}
                                                            {cert.reviewer && ` oleh ${cert.reviewer.name}`}
                                                        </p>
                                                    )}

                                                    {cert.rejection_reason && (
                                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                            <p className="text-xs text-red-700">
                                                                <strong>Alasan ditolak:</strong> {cert.rejection_reason}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {cert.is_primary && (
                                                        <button
                                                            onClick={() => handleRegenerate(enrollment.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Regenerate"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {!cert.is_primary && (
                                                        <button
                                                            onClick={() => handleDelete(cert.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline & Riwayat</h3>

                            {timeline.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Belum ada riwayat</p>
                            ) : (
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                    <div className="space-y-6">
                                        {timeline.map((item, index) => (
                                            <div key={index} className="relative flex gap-4">
                                                {/* Icon */}
                                                <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                                                    {getTimelineIcon(item.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pb-6">
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(item.timestamp)}
                                                    </p>
                                                    {item.reason && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            Alasan: {item.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Upload Sertifikat Tambahan
                        </h3>

                        <form onSubmit={handleUploadAdditional} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Sertifikat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.certificate_title}
                                    onChange={(e) => setData('certificate_title', e.target.value)}
                                    placeholder="Contoh: Sertifikat Kompetensi BNSP"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Masukkan judul sertifikat yang akan ditampilkan
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File Sertifikat (PDF) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setData('certificate_file', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Max 10MB, format PDF
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        reset();
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.certificate_file || !data.certificate_title.trim()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    );
}
