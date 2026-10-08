import { useState, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Attendance({ meeting, course, attendanceStats, screenshots: initialScreenshots = [] }) {
    const { flash } = usePage().props;
    const attendances = meeting.attendances || [];
    const [selectedStudents, setSelectedStudents] = useState(
        attendances.filter(a => a.attended).map(a => a.user_id)
    );
    const [notes, setNotes] = useState({});
    const [saving, setSaving] = useState(false);

    // Screenshot states
    const [screenshots, setScreenshots] = useState(initialScreenshots);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fileInputRef = useRef(null);

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleToggle = (userId) => {
        setSelectedStudents(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === attendances.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(attendances.map(a => a.user_id));
        }
    };

    const handleSave = () => {
        setSaving(true);

        const attendanceData = attendances.map(attendance => ({
            user_id: attendance.user_id,
            attended: selectedStudents.includes(attendance.user_id),
            notes: notes[attendance.user_id] || null
        }));

        router.post(
            route('admin.meetings.mark-attendance', { course: course.slug, meeting: meeting.id }),
            { attendances: attendanceData },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                    alert('Gagal menyimpan absensi. Silakan coba lagi.');
                }
            }
        );
    };

    // Screenshot handlers
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            alert('Maksimal 10 file sekaligus');
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} bukan file gambar`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert(`${file.name} terlalu besar (max 5MB)`);
                return false;
            }
            return true;
        });

        setSelectedFiles(validFiles);
        if (validFiles.length > 0) {
            handleUploadScreenshots(validFiles);
        }
    };

    const handleUploadScreenshots = (files) => {
        setUploading(true);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('screenshots[]', file);
        });

        router.post(
            route('admin.meetings.screenshots.upload', { course: course.slug, meeting: meeting.id }),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setUploading(false);
                    setSelectedFiles([]);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    // Update screenshots from response
                    if (page.props.meeting && page.props.meeting.screenshots) {
                        setScreenshots(page.props.meeting.screenshots);
                    }
                },
                onError: (errors) => {
                    setUploading(false);
                    alert('Gagal upload screenshot: ' + (errors.error || 'Unknown error'));
                }
            }
        );
    };

    const handleDeleteScreenshot = (screenshotId) => {
        if (!confirm('Hapus screenshot ini?')) {
            return;
        }

        router.delete(
            route('admin.meetings.screenshots.delete', { screenshot: screenshotId }),
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Update screenshots from response
                    if (page.props.meeting && page.props.meeting.screenshots) {
                        setScreenshots(page.props.meeting.screenshots);
                    }
                },
                onError: (errors) => {
                    alert('Gagal hapus screenshot: ' + (errors.error || 'Unknown error'));
                }
            }
        );
    };

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % screenshots.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    const stats = {
        total: attendances.length,
        attended: selectedStudents.length,
        notAttended: attendances.length - selectedStudents.length,
        percentage: attendances.length > 0
            ? Math.round((selectedStudents.length / attendances.length) * 100)
            : 0
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Kelola Absensi Meeting
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Pelatihan: <span className="font-semibold">{course.title}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Meeting: <span className="font-semibold">{meeting.title}</span>
                    </p>
                </div>
            }
        >
            <Head title={`Absensi - ${meeting.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            ✅ {flash.success}
                        </div>
                    )}

                    {/* Meeting Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Detail Meeting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Waktu Pelaksanaan</p>
                                <p className="font-semibold">{formatDateTime(meeting.scheduled_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Durasi</p>
                                <p className="font-semibold">{meeting.duration_minutes} menit</p>
                            </div>
                            {meeting.meeting_id && (
                                <div>
                                    <p className="text-sm text-gray-600">Meeting ID</p>
                                    <p className="font-mono font-semibold">{meeting.meeting_id}</p>
                                </div>
                            )}
                            {meeting.zoom_link && (
                                <div>
                                    <p className="text-sm text-gray-600">Link Zoom</p>
                                    <a
                                        href={meeting.zoom_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-semibold"
                                    >
                                        Buka Zoom Meeting →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <p className="text-sm text-gray-600">Total Peserta</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <p className="text-sm text-gray-600">Hadir</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.attended}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                            <p className="text-sm text-gray-600">Tidak Hadir</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.notAttended}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                            <p className="text-sm text-gray-600">Persentase Hadir</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
                        </div>
                    </div>

                    {/* Screenshot Management Section */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                        <div className="p-6 border-b bg-blue-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <span className="text-2xl mr-3">📷</span>
                                Screenshot Meeting
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Upload screenshot untuk dokumentasi kehadiran peserta
                            </p>
                        </div>

                        <div className="p-6">
                            {/* Upload Area */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Upload Screenshot
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {uploading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="text-gray-600 font-medium">Uploading screenshots...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-6xl mb-3">📁</div>
                                            <p className="text-gray-700 font-medium mb-2">
                                                Klik atau drag & drop file di sini
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Maksimal 10 file • 5MB per file • Format: JPG, PNG
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Screenshots Gallery */}
                            {screenshots.length > 0 ? (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                        Screenshot Tersimpan ({screenshots.length})
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {screenshots.map((screenshot, index) => (
                                            <div
                                                key={screenshot.id}
                                                className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <img
                                                    src={screenshot.url}
                                                    alt={`Screenshot ${index + 1}`}
                                                    className="w-full h-48 object-cover cursor-pointer"
                                                    onClick={() => openLightbox(index)}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openLightbox(index)}
                                                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                                                    >
                                                        🔍 Lihat
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteScreenshot(screenshot.id)}
                                                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 hover:bg-red-700"
                                                    >
                                                        🗑️ Hapus
                                                    </button>
                                                </div>
                                                {screenshot.uploader && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                                                        <p className="text-xs text-white font-medium">
                                                            {screenshot.uploader.name}
                                                        </p>
                                                        <p className="text-xs text-gray-300">
                                                            {new Date(screenshot.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-5xl mb-3">📷</div>
                                    <p className="font-medium">Belum ada screenshot yang diupload</p>
                                    <p className="text-sm mt-1">Upload screenshot untuk dokumentasi meeting</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lightbox Modal */}
                    {lightboxOpen && screenshots.length > 0 && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
                            onClick={closeLightbox}
                        >
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
                            >
                                ×
                            </button>

                            {screenshots.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="absolute left-4 text-white text-5xl hover:text-gray-300 transition"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="absolute right-4 text-white text-5xl hover:text-gray-300 transition"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            <div className="max-w-6xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
                                <img
                                    src={screenshots[currentImageIndex]?.url}
                                    alt={`Screenshot ${currentImageIndex + 1}`}
                                    className="max-w-full max-h-screen object-contain rounded-lg"
                                />
                                <div className="text-center mt-4 text-white">
                                    <p className="font-medium">
                                        Screenshot {currentImageIndex + 1} dari {screenshots.length}
                                    </p>
                                    {screenshots[currentImageIndex]?.uploader && (
                                        <p className="text-sm text-gray-300 mt-1">
                                            Diupload oleh: {screenshots[currentImageIndex].uploader.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                Daftar Kehadiran Peserta
                            </h3>
                            <SecondaryButton onClick={handleSelectAll}>
                                {selectedStudents.length === attendances.length
                                    ? '❌ Unselect All'
                                    : '✅ Select All'}
                            </SecondaryButton>
                        </div>

                        {attendances.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-600">
                                    Tidak ada peserta terdaftar di pelatihan ini.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Nama Peserta
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status Kehadiran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendances.map((attendance, index) => (
                                            <tr
                                                key={attendance.id}
                                                className={selectedStudents.includes(attendance.user_id)
                                                    ? 'bg-green-50'
                                                    : 'hover:bg-gray-50'}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {attendance.user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {attendance.user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleToggle(attendance.user_id)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                                            selectedStudents.includes(attendance.user_id)
                                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                                : 'bg-red-100 text-red-800 border border-red-300'
                                                        }`}
                                                    >
                                                        {selectedStudents.includes(attendance.user_id)
                                                            ? '✅ Hadir'
                                                            : '❌ Tidak Hadir'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Catatan (opsional)"
                                                        value={notes[attendance.user_id] || ''}
                                                        onChange={(e) => setNotes(prev => ({
                                                            ...prev,
                                                            [attendance.user_id]: e.target.value
                                                        }))}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-between items-center">
                        <SecondaryButton
                            onClick={() => router.visit(route('admin.meetings.index', course.slug))}
                        >
                            ← Kembali ke Daftar Meeting
                        </SecondaryButton>

                        <PrimaryButton
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                '💾 Simpan Absensi'
                            )}
                        </PrimaryButton>
                    </div>

                    {/* Help Info */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-900 mb-3">💡 Panduan Absensi</h4>
                        <ul className="text-sm text-yellow-800 space-y-2">
                            <li>• <strong>Tandai Kehadiran:</strong> Klik tombol status untuk toggle antara Hadir/Tidak Hadir</li>
                            <li>• <strong>Select/Unselect All:</strong> Gunakan tombol di atas tabel untuk tandai semua sekaligus</li>
                            <li>• <strong>Catatan:</strong> Tambahkan catatan khusus untuk peserta tertentu (opsional)</li>
                            <li>• <strong>Simpan:</strong> Klik "Simpan Absensi" setelah selesai menandai</li>
                            <li>• <strong>Kehadiran diperlukan untuk sertifikat:</strong> Data ini akan dicek saat admin approve sertifikat</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
