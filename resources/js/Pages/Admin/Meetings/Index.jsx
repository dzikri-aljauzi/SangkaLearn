import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MeetingForm from '@/Components/MeetingForm';
import MeetingCard from '@/Components/MeetingCard';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ course, meetings }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, past, draft

    const handleEdit = (meeting) => {
        setEditingMeeting(meeting);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMeeting(null);
    };

    const now = new Date();
    const filteredMeetings = meetings.filter(meeting => {
        const scheduledDate = new Date(meeting.scheduled_at);

        switch (filterStatus) {
            case 'upcoming':
                return scheduledDate >= now && meeting.is_published;
            case 'past':
                return scheduledDate < now;
            case 'draft':
                return !meeting.is_published;
            default:
                return true;
        }
    });

    const stats = {
        total: meetings.length,
        upcoming: meetings.filter(m => new Date(m.scheduled_at) >= now && m.is_published).length,
        past: meetings.filter(m => new Date(m.scheduled_at) < now).length,
        draft: meetings.filter(m => !m.is_published).length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Meeting Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Pelatihan: <span className="font-semibold">{course.title}</span>
                        </p>
                    </div>
                    <PrimaryButton onClick={() => setShowForm(!showForm)}>
                        {showForm ? '❌ Tutup Form' : '➕ Tambah Meeting Baru'}
                    </PrimaryButton>
                </div>
            }
        >
            <Head title={`Meetings - ${course.title}`} />

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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <p className="text-sm text-gray-600">Total Meetings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                            <p className="text-sm text-gray-600">Akan Datang</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
                            <p className="text-sm text-gray-600">Sudah Selesai</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.past}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                            <p className="text-sm text-gray-600">Draft</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    {showForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {editingMeeting ? '✏️ Edit Meeting' : '➕ Tambah Meeting Baru'}
                            </h3>
                            <MeetingForm
                                course={course}
                                meeting={editingMeeting}
                                onCancel={handleCloseForm}
                            />
                        </div>
                    )}

                    {/* Filter Buttons */}
                    <div className="mb-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Semua ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilterStatus('upcoming')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === 'upcoming'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Akan Datang ({stats.upcoming})
                        </button>
                        <button
                            onClick={() => setFilterStatus('past')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === 'past'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Selesai ({stats.past})
                        </button>
                        <button
                            onClick={() => setFilterStatus('draft')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === 'draft'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Draft ({stats.draft})
                        </button>
                    </div>

                    {/* Meetings List */}
                    <div className="space-y-6">
                        {filteredMeetings.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-gray-600 text-lg mb-4">
                                    {filterStatus === 'all'
                                        ? '📅 Belum ada meeting untuk pelatihan ini.'
                                        : `📅 Tidak ada meeting dengan status "${filterStatus}".`}
                                </p>
                                {filterStatus === 'all' && (
                                    <PrimaryButton onClick={() => setShowForm(true)}>
                                        ➕ Tambah Meeting Pertama
                                    </PrimaryButton>
                                )}
                                {filterStatus !== 'all' && (
                                    <SecondaryButton onClick={() => setFilterStatus('all')}>
                                        Lihat Semua Meeting
                                    </SecondaryButton>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-600 mb-4">
                                    Menampilkan {filteredMeetings.length} dari {stats.total} meeting
                                </div>
                                {filteredMeetings.map((meeting) => (
                                    <MeetingCard
                                        key={meeting.id}
                                        meeting={meeting}
                                        course={course}
                                        onEdit={() => handleEdit(meeting)}
                                        isAdmin={true}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    {/* Help Info */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3">💡 Panduan Meeting Management</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• <strong>Tambah Meeting:</strong> Klik tombol "Tambah Meeting Baru" dan isi form</li>
                            <li>• <strong>Template Deskripsi:</strong> Gunakan tombol "Gunakan Template Default" untuk format lengkap</li>
                            <li>• <strong>Kirim Alert:</strong> Klik tombol "Kirim Alert" pada meeting card untuk kirim email ke peserta</li>
                            <li>• <strong>Kelola Absensi:</strong> Klik "Kelola Absensi" untuk tandai kehadiran peserta</li>
                            <li>• <strong>Meeting tidak dihitung dalam progress</strong> - hanya lessons, quizzes, dan assignments</li>
                            <li>• <strong>Kehadiran meeting wajib untuk sertifikat</strong> - admin cross-check saat approve</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
