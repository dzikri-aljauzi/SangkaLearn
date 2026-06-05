import { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ certificates, stats, filters }) {
    const { flash } = usePage().props;
    const [currentStatus, setCurrentStatus] = useState(filters?.status || 'pending');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleFilterChange = (status) => {
        setCurrentStatus(status);
        router.get(route('admin.certificate-queue.index'), { status, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.certificate-queue.index'), { status: currentStatus, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getAttendanceBadge = (cert) => {
        if (cert.total_meetings_count === 0) {
            return (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    Tidak ada meeting
                </span>
            );
        }

        if (cert.all_meetings_attended) {
            return (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                    ✅ Semua hadir ({cert.meetings_attended_count}/{cert.total_meetings_count})
                </span>
            );
        }

        return (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded font-medium">
                ❌ Tidak lengkap ({cert.meetings_attended_count}/{cert.total_meetings_count})
            </span>
        );
    };

    // Stats now come from backend props
    const certificateList = certificates.data || certificates;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Antrian Sertifikat
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Kelola review dan persetujuan sertifikat peserta
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Antrian Sertifikat" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            ❌ {flash.error}
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                            <p className="text-sm text-gray-600">Menunggu Review</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <p className="text-sm text-gray-600">Disetujui</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                            <p className="text-sm text-gray-600">Ditolak</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama atau email peserta..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                🔍 Cari
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get(route('admin.certificate-queue.index'), { status: currentStatus });
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    ✕ Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-6 flex gap-3">
                        <button
                            onClick={() => handleFilterChange('pending')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                currentStatus === 'pending'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            ⏳ Pending ({stats?.pending || 0})
                        </button>
                        <button
                            onClick={() => handleFilterChange('approved')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                currentStatus === 'approved'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            ✅ Approved ({stats?.approved || 0})
                        </button>
                        <button
                            onClick={() => handleFilterChange('rejected')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                currentStatus === 'rejected'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            ❌ Rejected ({stats?.rejected || 0})
                        </button>
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                currentStatus === 'all'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            📋 Semua ({stats?.total || 0})
                        </button>
                    </div>

                    {/* Certificates Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {certificateList.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-600 text-lg mb-2">
                                    Tidak ada sertifikat dengan status "{currentStatus}"
                                </p>
                                <p className="text-sm text-gray-500">
                                    {currentStatus === 'pending' &&
                                        'Sertifikat akan muncul di sini ketika peserta menyelesaikan 100% pelatihan'}
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
                                                Peserta
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Pelatihan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Kehadiran Meeting
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Selesai
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {certificateList.map((cert, index) => (
                                            <tr key={cert.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {cert.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {cert.user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {cert.course.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getAttendanceBadge(cert)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDateTime(cert.completed_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {getStatusBadge(cert.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Link
                                                        href={route('admin.certificate-queue.show', cert.id)}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                                                    >
                                                        {cert.status === 'pending' ? '🔍 Review' : '👁️ Lihat Detail'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {certificates.links && certificates.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {certificates.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Help Info */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3">💡 Panduan Antrian Sertifikat</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• <strong>Status Pending:</strong> Peserta telah menyelesaikan 100% materi, menunggu review admin</li>
                            <li>• <strong>Kehadiran Meeting:</strong> Cek apakah peserta hadir di semua meeting (jika ada)</li>
                            <li>• <strong>Review:</strong> Klik tombol "Review" untuk melihat detail dan approve/reject</li>
                            <li>• <strong>Approve:</strong> Upload file sertifikat (PDF/JPG/PNG) jika peserta memenuhi syarat</li>
                            <li>• <strong>Reject:</strong> Tolak dengan alasan jika peserta tidak memenuhi syarat (misal: tidak hadir meeting)</li>
                            <li>• <strong>Meeting tidak dihitung dalam progress</strong> - tetapi kehadiran wajib untuk sertifikat</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
