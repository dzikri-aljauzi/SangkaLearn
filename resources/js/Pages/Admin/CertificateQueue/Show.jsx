import { useState, useRef, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Show({ certificate, progress, meetingAttendances }) {
    const { flash } = usePage().props;
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'auto'
    const [selectedFile, setSelectedFile] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [allScreenshots, setAllScreenshots] = useState([]);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef(null);

    // Keyboard support for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex, allScreenshots.length]);

    const uploadForm = useForm({
        certificate_file: null,
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Collect all screenshots from all meetings
    const collectAllScreenshots = () => {
        const screenshots = [];
        meetingAttendances?.forEach(attendance => {
            if (attendance.screenshots && attendance.screenshots.length > 0) {
                attendance.screenshots.forEach(screenshot => {
                    screenshots.push({
                        ...screenshot,
                        meetingTitle: attendance.meeting.title
                    });
                });
            }
        });
        return screenshots;
    };

    const openLightbox = (index) => {
        const screenshots = collectAllScreenshots();
        setAllScreenshots(screenshots);
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allScreenshots.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allScreenshots.length) % allScreenshots.length);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File terlalu besar! Maksimal 10MB');
                return;
            }
            setSelectedFile(file);
            uploadForm.setData('certificate_file', file);
        }
    };

    const handleUploadCertificate = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Silakan pilih file sertifikat untuk diupload');
            return;
        }

        uploadForm.post(route('admin.certificate-queue.upload', certificate.id), {
            forceFormData: true,
            onSuccess: () => {
                alert('Certificate uploaded successfully!');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errors) => {
                alert('Failed to upload: ' + (errors.certificate_file || 'Unknown error'));
            }
        });
    };

    const handleGenerateCertificate = () => {
        if (confirm('Generate certificate automatically? Sistem akan membuat PDF certificate dengan template profesional.')) {
            setProcessing(true);
            router.post(route('admin.certificate-queue.generate', certificate.id), {}, {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    alert('Certificate generated successfully! You can now preview and approve it.');
                },
                onError: () => {
                    alert('Failed to generate certificate. Please check the logs.');
                }
            });
        }
    };

    const handleApprove = () => {
        if (!certificate.certificate_file) {
            alert('Please upload or generate a certificate first!');
            return;
        }
        if (confirm('Approve and send certificate to student?')) {
            router.post(route('admin.certificate-queue.approve', certificate.id));
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectForm.data.rejection_reason.trim()) {
            alert('Silakan masukkan alasan penolakan');
            return;
        }
        if (confirm('Apakah Anda yakin ingin menolak sertifikat ini?')) {
            rejectForm.post(route('admin.certificate-queue.reject', certificate.id), {
                onSuccess: () => setShowRejectModal(false)
            });
        }
    };

    const handleRecalculate = () => {
        if (confirm('Recalculate data kehadiran meeting?')) {
            router.post(route('admin.certificate-queue.recalculate-attendance', certificate.id));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
        };
        const labels = {
            pending: '⏳ Menunggu Review',
            approved: '✅ Disetujui',
            rejected: '❌ Ditolak',
        };
        return (
            <span className={`px-4 py-2 text-sm font-medium rounded-full border ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Review Sertifikat
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Detail dan persetujuan sertifikat peserta
                    </p>
                </div>
            }
        >
            <Head title={`Review Sertifikat - ${certificate.user.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            ✅ {flash.success}
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mb-6">
                        <SecondaryButton
                            onClick={() => router.visit(route('admin.certificate-queue.index'))}
                        >
                            ← Kembali ke Daftar Antrian
                        </SecondaryButton>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Status Sertifikat</h3>
                            {getStatusBadge(certificate.status)}
                        </div>
                        {certificate.status === 'rejected' && certificate.rejection_reason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm font-medium text-red-900">Alasan Penolakan:</p>
                                <p className="text-sm text-red-800 mt-1">{certificate.rejection_reason}</p>
                            </div>
                        )}
                        {certificate.status === 'approved' && certificate.reviewed_at && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-800">
                                    Disetujui pada: {formatDateTime(certificate.reviewed_at)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Student Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Peserta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Nama Lengkap</p>
                                <p className="font-semibold text-gray-900">{certificate.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-gray-900">{certificate.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pelatihan</p>
                                <p className="font-semibold text-gray-900">{certificate.course.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Selesai Pada</p>
                                <p className="font-semibold text-gray-900">{formatDateTime(certificate.completed_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Breakdown Detail */}
                    {progress && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Progress Completion Detail</h3>

                            {/* Overall Progress */}
                            <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-bold text-green-900">Overall Completion</span>
                                    <span className="text-3xl font-black text-green-700">{progress.overall_completion}%</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-6">
                                    <div
                                        className="bg-green-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                                        style={{ width: `${progress.overall_completion}%` }}
                                    >
                                        {progress.overall_completion >= 10 && `${progress.overall_completion}%`}
                                    </div>
                                </div>
                                {progress.is_complete && (
                                    <p className="mt-2 text-sm font-medium text-green-800">
                                        ✅ Peserta telah menyelesaikan 100% materi pelatihan!
                                    </p>
                                )}
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-4">
                                {/* Lessons */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-gray-900">📚 Lessons</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {progress.lessons.completed} / {progress.lessons.total} ({progress.lessons.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all"
                                            style={{ width: `${progress.lessons.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Quizzes */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-gray-900">📝 Quizzes</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {progress.quizzes.completed} / {progress.quizzes.total} ({progress.quizzes.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-purple-600 h-3 rounded-full transition-all"
                                            style={{ width: `${progress.quizzes.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Assignments */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-gray-900">📋 Assignments</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {progress.assignments.completed} / {progress.assignments.total} ({progress.assignments.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-orange-600 h-3 rounded-full transition-all"
                                            style={{ width: `${progress.assignments.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meeting Attendance */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Kehadiran Meeting</h3>
                            <button
                                onClick={handleRecalculate}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                🔄 Recalculate
                            </button>
                        </div>

                        <div className={`mb-4 p-4 rounded-lg border-2 ${certificate.all_meetings_attended ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {certificate.meetings_attended_count} dari {certificate.total_meetings_count} Meeting
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {certificate.total_meetings_count === 0
                                            ? 'Tidak ada meeting untuk pelatihan ini'
                                            : certificate.all_meetings_attended
                                                ? 'Peserta hadir di semua meeting ✅'
                                                : 'Peserta tidak hadir di beberapa meeting ❌'}
                                    </p>
                                </div>
                                <div className="text-4xl">
                                    {certificate.total_meetings_count === 0 ? '➖' :
                                     certificate.all_meetings_attended ? '✅' : '❌'}
                                </div>
                            </div>
                        </div>

                        {meetingAttendances && meetingAttendances.length > 0 ? (
                            <div className="space-y-6">
                                {meetingAttendances.map((item, meetingIndex) => (
                                    <div key={item.meeting?.id || meetingIndex} className="border border-gray-200 rounded-lg p-4">
                                        {/* Meeting Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.meeting?.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    📅 {item.meeting?.scheduled_at ? formatDateTime(item.meeting.scheduled_at) : '-'}
                                                </p>
                                                {item.meeting?.duration_minutes && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        ⏱️ Durasi: {item.meeting.duration_minutes} menit
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {item.attended ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                        ✅ Hadir
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                        ❌ Tidak Hadir
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Meeting Notes */}
                                        {item.notes && (
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-3">
                                                💬 {item.notes}
                                            </p>
                                        )}

                                        {/* Screenshots Gallery */}
                                        {item.screenshots && item.screenshots.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                                    📷 Screenshots ({item.screenshots.length})
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {item.screenshots.map((screenshot, screenshotIndex) => {
                                                        const globalIndex = meetingAttendances
                                                            .slice(0, meetingIndex)
                                                            .reduce((sum, m) => sum + (m.screenshots?.length || 0), 0) + screenshotIndex;

                                                        return (
                                                            <div
                                                                key={screenshot.id}
                                                                className="relative group cursor-pointer"
                                                                onClick={() => openLightbox(globalIndex)}
                                                            >
                                                                <img
                                                                    src={screenshot.url}
                                                                    alt={`Screenshot ${screenshotIndex + 1}`}
                                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition"
                                                                />
                                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-center justify-center">
                                                                    <span className="text-white opacity-0 group-hover:opacity-100 text-2xl transition">
                                                                        🔍
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1 truncate">
                                                                    👤 {screenshot.uploaded_by}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    🕐 {screenshot.created_at}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">
                                📭 Tidak ada meeting untuk pelatihan ini
                            </p>
                        )}
                    </div>

                    {/* Actions - Only for Pending */}
                    {certificate.status === 'pending' && (
                        <>
                            {/* Warning if not attended meetings */}
                            {certificate.total_meetings_count > 0 && !certificate.all_meetings_attended && (
                                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <span className="text-4xl">⚠️</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-red-900">
                                                Tidak Dapat Menerbitkan Sertifikat
                                            </h3>
                                            <p className="text-red-800 mt-2">
                                                Peserta <strong>tidak hadir di semua meeting</strong> yang diwajibkan.
                                                Hanya hadir di <strong>{certificate.meetings_attended_count}</strong> dari <strong>{certificate.total_meetings_count}</strong> meeting.
                                            </p>
                                            <p className="text-red-700 mt-2 text-sm">
                                                Untuk dapat menerbitkan sertifikat, peserta harus hadir di semua meeting.
                                                Silakan update status kehadiran di menu <strong>Kelola Meetings</strong> jika ada kesalahan data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Certificate Upload/Generate - Only if attended all meetings or no meetings */}
                            {(certificate.total_meetings_count === 0 || certificate.all_meetings_attended) && (
                                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        📄 Upload Sertifikat
                                    </h3>

                                    {/* Mode Toggle */}
                                    <div className="flex gap-3 mb-6">
                                        <button
                                            onClick={() => setUploadMode('manual')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                                                uploadMode === 'manual'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            📤 Upload Manual
                                        </button>
                                        <button
                                            onClick={() => setUploadMode('auto')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                                                uploadMode === 'auto'
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            🤖 Generate Otomatis
                                        </button>
                                    </div>

                                    {/* Manual Upload Mode */}
                                    {uploadMode === 'manual' && (
                                        <div>
                                            <form onSubmit={handleUploadCertificate}>
                                                <div>
                                                    <InputLabel htmlFor="certificate_file" value="Upload File Sertifikat (PDF Only) *" />
                                                    <input
                                                        ref={fileInputRef}
                                                        id="certificate_file"
                                                        type="file"
                                                        className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        accept=".pdf"
                                                        onChange={handleFileSelect}
                                                    />
                                                    <InputError message={uploadForm.errors.certificate_file} className="mt-2" />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Format: PDF only | Max: 10MB
                                                    </p>
                                                </div>

                                                {selectedFile && (
                                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-900">File selected:</p>
                                                        <p className="text-sm text-blue-800">{selectedFile.name}</p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <PrimaryButton type="submit" disabled={uploadForm.processing || !selectedFile}>
                                                        {uploadForm.processing ? 'Uploading...' : '📤 Upload Certificate'}
                                                    </PrimaryButton>
                                                </div>
                                            </form>

                                            {certificate.uploaded_certificate_path && (
                                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm font-medium text-green-900">✅ Certificate uploaded!</p>
                                                    <p className="text-xs text-green-700 mt-1">Mode: Manual Upload</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Auto Generate Mode */}
                                    {uploadMode === 'auto' && (
                                        <div>
                                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">🤖</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-purple-900 mb-2">
                                                            Generate Certificate Otomatis
                                                        </p>
                                                        <p className="text-sm text-purple-800">
                                                            Sistem akan membuat certificate PDF menggunakan template profesional dengan data:
                                                        </p>
                                                        <ul className="text-xs text-purple-700 mt-2 space-y-1 ml-4 list-disc">
                                                            <li>Nama peserta: <strong>{certificate.user.name}</strong></li>
                                                            <li>Judul pelatihan: <strong>{certificate.course.title}</strong></li>
                                                            <li>Instruktur: <strong>{certificate.course.instructor_name || 'LMS Admin'}</strong></li>
                                                            <li>Tanggal selesai: <strong>{formatDateTime(certificate.completed_at)}</strong></li>
                                                            <li>Nomor sertifikat: <strong>CERT/{new Date(certificate.completed_at).getFullYear()}/...</strong></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleGenerateCertificate}
                                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 shadow-md"
                                                disabled={processing}
                                            >
                                                {processing ? '⏳ Generating...' : '🤖 Generate Certificate Now'}
                                            </button>

                                            {certificate.auto_generated_certificate_path && (
                                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xl">✅</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-green-900">Certificate generated successfully!</p>
                                                            <p className="text-xs text-green-700 mt-1">Mode: Auto Generated</p>
                                                            <p className="text-xs text-green-600 mt-2">
                                                                File: {certificate.auto_generated_certificate_path}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Approve Button */}
                                    {certificate.certificate_file && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex gap-4 items-center">
                                                <PrimaryButton onClick={handleApprove} className="flex-1">
                                                    ✅ Approve & Send to Student
                                                </PrimaryButton>
                                                <a
                                                    href={route('admin.certificate-queue.download', certificate.id)}
                                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition text-center"
                                                    target="_blank"
                                                >
                                                    💾 Download Preview
                                                </a>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                ⚠️ Setelah approve, sertifikat akan dikirim ke email student dan tidak bisa diubah lagi.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reject Button */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    ❌ Tolak Sertifikat
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Jika peserta tidak memenuhi syarat (misalnya tidak hadir di meeting), Anda dapat menolak permohonan sertifikat.
                                </p>
                                <DangerButton onClick={() => setShowRejectModal(true)}>
                                    ❌ Tolak Sertifikat
                                </DangerButton>
                            </div>
                        </>
                    )}

                    {/* Reject Modal */}
                    {showRejectModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                                <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Tolak Sertifikat
                                    </h3>
                                    <form onSubmit={handleReject}>
                                        <div>
                                            <InputLabel htmlFor="rejection_reason" value="Alasan Penolakan *" />
                                            <textarea
                                                id="rejection_reason"
                                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                                rows="4"
                                                value={rejectForm.data.rejection_reason}
                                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                                required
                                                placeholder="Contoh: Tidak hadir di meeting tanggal 10 November 2025"
                                            />
                                            <InputError message={rejectForm.errors.rejection_reason} className="mt-2" />
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => setShowRejectModal(false)}
                                            >
                                                Batal
                                            </SecondaryButton>
                                            <DangerButton type="submit" disabled={rejectForm.processing}>
                                                {rejectForm.processing ? 'Memproses...' : 'Konfirmasi Penolakan'}
                                            </DangerButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Info */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-900 mb-3">💡 Panduan Review Sertifikat</h4>
                        <ul className="text-sm text-yellow-800 space-y-2">
                            <li>• <strong>Cek Progress:</strong> Pastikan peserta sudah 100% (lessons + quizzes + assignments)</li>
                            <li>• <strong>Cek Kehadiran Meeting:</strong> Verifikasi kehadiran di semua meeting (jika ada)</li>
                            <li>• <strong>Lihat Screenshots:</strong> Klik screenshot meeting untuk view full size</li>
                            <li>• <strong>Upload Sertifikat:</strong> Pilih mode Manual Upload (PDF) atau Auto Generate (Phase 5)</li>
                            <li>• <strong>Approve:</strong> Approve dan kirim ke student setelah upload certificate</li>
                            <li>• <strong>Reject:</strong> Tolak dengan alasan jelas jika tidak memenuhi syarat</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Screenshot Lightbox Modal */}
            {lightboxOpen && allScreenshots.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition z-10"
                    >
                        ×
                    </button>

                    {/* Previous Button */}
                    {allScreenshots.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            className="absolute left-4 text-white text-5xl hover:text-gray-300 transition z-10"
                        >
                            ‹
                        </button>
                    )}

                    {/* Next Button */}
                    {allScreenshots.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            className="absolute right-4 text-white text-5xl hover:text-gray-300 transition z-10"
                        >
                            ›
                        </button>
                    )}

                    {/* Image Display */}
                    <div className="max-w-6xl max-h-screen p-8" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={allScreenshots[currentImageIndex]?.url}
                            alt={`Screenshot ${currentImageIndex + 1}`}
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                        />

                        {/* Image Info */}
                        <div className="mt-4 text-center text-white">
                            <p className="text-lg font-semibold">
                                {allScreenshots[currentImageIndex]?.meetingTitle}
                            </p>
                            <p className="text-sm text-gray-300 mt-1">
                                Uploaded by: {allScreenshots[currentImageIndex]?.uploaded_by} • {allScreenshots[currentImageIndex]?.created_at}
                            </p>
                            {allScreenshots[currentImageIndex]?.notes && (
                                <p className="text-sm text-gray-300 mt-1">
                                    Notes: {allScreenshots[currentImageIndex].notes}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                {currentImageIndex + 1} / {allScreenshots.length}
                            </p>
                        </div>
                    </div>

                    {/* Keyboard hint */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                        <p>Press ESC to close • Use arrow keys or click arrows to navigate</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
