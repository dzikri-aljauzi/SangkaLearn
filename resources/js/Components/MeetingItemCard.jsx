import React from 'react';
import { router } from '@inertiajs/react';
import { Video, Edit, Trash2, Calendar, Clock, Users, Eye, Bell, CheckCircle, XCircle } from 'lucide-react';

export default function MeetingItemCard({ meeting, onEdit, course }) {
    const handleDelete = () => {
        if (confirm('Yakin ingin menghapus meeting ini?')) {
            router.delete(
                route('admin.courses.meetings.destroy', {
                    course: course.slug,
                    section: meeting.section_id,
                    meeting: meeting.id
                }),
                {
                    preserveScroll: true
                }
            );
        }
    };

    const handleSendAlert = () => {
        if (confirm(`Kirim email alert ke semua peserta yang terdaftar?`)) {
            router.post(
                route('admin.courses.meetings.send-alert', meeting.id),
                {},
                {
                    preserveScroll: true
                }
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMeetingStatus = () => {
        if (!meeting.is_published) {
            return {
                label: 'Draft',
                class: 'bg-gray-100 text-gray-700',
                icon: XCircle
            };
        }

        const now = new Date();
        const scheduledDate = new Date(meeting.scheduled_at);

        if (scheduledDate > now) {
            return {
                label: 'Akan Datang',
                class: 'bg-green-100 text-green-700',
                icon: CheckCircle
            };
        } else {
            return {
                label: 'Selesai',
                class: 'bg-gray-100 text-gray-700',
                icon: CheckCircle
            };
        }
    };

    const status = getMeetingStatus();
    const StatusIcon = status.icon;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Video className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-base font-semibold text-gray-900 truncate">
                                {meeting.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.class}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                            </span>
                            {meeting.alert_sent && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Alert Sent
                                </span>
                            )}
                        </div>

                        {meeting.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {meeting.description.substring(0, 150)}
                                {meeting.description.length > 150 ? '...' : ''}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                                {formatDate(meeting.scheduled_at)}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                {meeting.duration_minutes} menit
                            </div>
                            {meeting.attendance_stats && (
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                                    {meeting.attendance_stats.attended}/{meeting.attendance_stats.total} hadir
                                </div>
                            )}
                        </div>

                        {meeting.zoom_link && (
                            <div className="mt-3">
                                <a
                                    href={meeting.zoom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview Zoom Link
                                </a>
                            </div>
                        )}

                        {meeting.alert_sent_at && (
                            <p className="mt-2 text-xs text-gray-500">
                                Alert terakhir dikirim: {new Date(meeting.alert_sent_at).toLocaleString('id-ID')}
                                {meeting.alert_recipients_count && ` ke ${meeting.alert_recipients_count} peserta`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={handleSendAlert}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Kirim Alert ke Peserta"
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Meeting"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Meeting"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
