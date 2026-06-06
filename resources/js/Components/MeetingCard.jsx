import { useState } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import MeetingAlertModal from '@/Components/MeetingAlertModal';

export default function MeetingCard({ meeting, course, onEdit, isAdmin = false }) {
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const scheduledDate = new Date(meeting.scheduled_at);
    const now = new Date();
    const isPast = scheduledDate < now;
    const isToday = scheduledDate.toDateString() === now.toDateString();
    const isSoon = !isPast && (scheduledDate - now) < (24 * 60 * 60 * 1000); // Within 24 hours

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

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus meeting ini?')) {
            router.delete(route('admin.meetings.destroy', { course: course.slug, meeting: meeting.id }), {
                preserveScroll: true
            });
        }
        setShowDeleteConfirm(false);
    };

    const handleJoinZoom = () => {
        window.open(meeting.zoom_link, '_blank');
    };

    const handleViewAttendance = () => {
        router.visit(route('admin.meetings.attendance', { course: course.slug, meeting: meeting.id }));
    };

    return (
        <>
            <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                isPast ? 'border-gray-400' :
                isToday ? 'border-red-500' :
                isSoon ? 'border-yellow-500' :
                'border-blue-500'
            }`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                            {!meeting.is_published && (
                                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                                    Draft
                                </span>
                            )}
                        </div>

                        {/* Status Badges */}
                        <div className="flex gap-2 mb-3">
                            {isPast && (
                                <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                    ✅ Selesai
                                </span>
                            )}
                            {isToday && !isPast && (
                                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium animate-pulse">
                                    🔴 HARI INI!
                                </span>
                            )}
                            {isSoon && !isToday && (
                                <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                                    ⚠️ Segera
                                </span>
                            )}
                            {meeting.alert_sent && (
                                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                    📧 Alert Terkirim
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meeting Info */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                            <p className="text-sm text-gray-500">Waktu Pelaksanaan</p>
                            <p className="font-semibold text-gray-900">{formatDateTime(meeting.scheduled_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⏱️</span>
                        <div>
                            <p className="text-sm text-gray-500">Durasi</p>
                            <p className="font-semibold text-gray-900">{meeting.duration_minutes} menit</p>
                        </div>
                    </div>

                    {meeting.meeting_id && (
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🆔</span>
                            <div>
                                <p className="text-sm text-gray-500">Meeting ID</p>
                                <p className="font-mono font-semibold text-gray-900">{meeting.meeting_id}</p>
                            </div>
                        </div>
                    )}

                    {meeting.passcode && (
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🔒</span>
                            <div>
                                <p className="text-sm text-gray-500">Passcode</p>
                                <p className="font-mono font-semibold text-gray-900">{meeting.passcode}</p>
                            </div>
                        </div>
                    )}

                    {meeting.description && (
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📝</span>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                                    {meeting.description}
                                </div>
                            </div>
                        </div>
                    )}

                    {isAdmin && meeting.alert_sent && (
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <p className="text-sm text-gray-500">Email Alert</p>
                                <p className="text-sm text-gray-700">
                                    Terkirim ke <strong>{meeting.alert_recipients_count}</strong> peserta
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDateTime(meeting.alert_sent_at)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {/* Student Actions */}
                    {!isAdmin && (
                        <PrimaryButton onClick={handleJoinZoom}>
                            🎥 Join Zoom Meeting
                        </PrimaryButton>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                        <>
                            <PrimaryButton onClick={handleJoinZoom}>
                                🎥 Join Zoom
                            </PrimaryButton>

                            <SecondaryButton
                                onClick={() => setShowAlertModal(true)}
                                disabled={isPast}
                            >
                                📧 {meeting.alert_sent ? 'Kirim Ulang Alert' : 'Kirim Alert'}
                            </SecondaryButton>

                            <SecondaryButton onClick={handleViewAttendance}>
                                📋 Kelola Absensi
                            </SecondaryButton>

                            <SecondaryButton onClick={onEdit}>
                                ✏️ Edit
                            </SecondaryButton>

                            <DangerButton onClick={handleDelete}>
                                🗑️ Hapus
                            </DangerButton>
                        </>
                    )}
                </div>

                {/* Admin Notes */}
                {isAdmin && meeting.notes && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-1">📌 Catatan Admin (Internal)</p>
                        <p className="text-sm text-gray-700 italic">{meeting.notes}</p>
                    </div>
                )}
            </div>

            {/* Alert Modal */}
            {isAdmin && (
                <MeetingAlertModal
                    show={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    meeting={meeting}
                    course={course}
                />
            )}
        </>
    );
}
