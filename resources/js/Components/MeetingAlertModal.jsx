import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function MeetingAlertModal({ show, onClose, meeting, course }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (show) {
            fetchEnrolledStudents();
        }
    }, [show]);

    const fetchEnrolledStudents = async () => {
        setLoading(true);
        try {
            const url = route('admin.meetings.enrolled-students', { course: course.slug, meeting: meeting.id });
            console.log('Fetching students from:', url);

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            alert('Gagal memuat data peserta: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendAlert = () => {
        if (students.length === 0) {
            alert('Tidak ada peserta terdaftar untuk menerima alert.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin mengirim email alert ke ${students.length} peserta?`)) {
            setSending(true);
            router.post(
                route('admin.meetings.send-alert', { course: course.slug, meeting: meeting.id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSending(false);
                        onClose();
                    },
                    onError: (errors) => {
                        setSending(false);
                        console.error('Error sending alert:', errors);
                        alert('Gagal mengirim alert. Silakan coba lagi.');
                    }
                }
            );
        }
    };

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

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    📧 Kirim Email Alert - Zoom Meeting
                </h2>

                {/* Meeting Summary */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Detail Meeting</h3>
                    <div className="space-y-1 text-sm">
                        <p><strong>Pelatihan:</strong> {course.title}</p>
                        <p><strong>Meeting:</strong> {meeting.title}</p>
                        <p><strong>Waktu:</strong> {formatDateTime(meeting.scheduled_at)}</p>
                        <p><strong>Durasi:</strong> {meeting.duration_minutes} menit</p>
                        {meeting.meeting_id && <p><strong>Meeting ID:</strong> {meeting.meeting_id}</p>}
                        {meeting.passcode && <p><strong>Passcode:</strong> {meeting.passcode}</p>}
                    </div>
                </div>

                {/* Email Preview Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-yellow-900 mb-2">📨 Isi Email yang Akan Dikirim:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        <li>Subject: 🚨 ALERT: Zoom Meeting - {meeting.title}</li>
                        <li>Detail meeting lengkap (judul, waktu, durasi, link)</li>
                        <li><strong>KETENTUAN PENTING:</strong> 4 poin persyaratan</li>
                        <li><strong>PERHATIAN:</strong> 3 peringatan tentang ketepatan waktu</li>
                        <li>Tombol "Join Zoom Meeting" langsung ke link Zoom</li>
                    </ul>
                </div>

                {/* Recipients List */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                        📋 Daftar Penerima ({students.length} peserta)
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Memuat data peserta...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <p className="text-gray-600">
                                ⚠️ Tidak ada peserta terdaftar di pelatihan ini.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">No</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Nama</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Terdaftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2 font-medium">{student.name}</td>
                                            <td className="px-4 py-2 text-gray-600">{student.email}</td>
                                            <td className="px-4 py-2 text-xs text-gray-500">
                                                {new Date(student.enrolled_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Alert Status */}
                {meeting.alert_sent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800">
                            ✅ <strong>Alert sudah pernah dikirim</strong><br/>
                            Terkirim ke {meeting.alert_recipients_count} peserta pada {formatDateTime(meeting.alert_sent_at)}
                        </p>
                        <p className="text-xs text-green-700 mt-2">
                            Mengirim ulang akan mengirim email baru ke semua peserta yang terdaftar saat ini.
                        </p>
                    </div>
                )}

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-red-900 mb-2">⚠️ PERHATIAN</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                        <li>• Email akan dikirim ke <strong>SEMUA</strong> peserta yang terdaftar</li>
                        <li>• Email akan masuk ke antrian (queue) dan dikirim secara otomatis</li>
                        <li>• Pastikan queue worker sudah berjalan di server</li>
                        <li>• Proses pengiriman mungkin memerlukan beberapa menit</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <SecondaryButton onClick={onClose} disabled={sending}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSendAlert}
                        disabled={sending || students.length === 0}
                    >
                        {sending ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Mengirim...
                            </>
                        ) : (
                            <>
                                📧 Kirim Alert ke {students.length} Peserta
                            </>
                        )}
                    </PrimaryButton>
                </div>

                {/* Queue Info */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                        💡 Setelah diklik, email akan masuk ke antrian dan dikirim secara otomatis oleh sistem.
                        <br/>
                        Pastikan queue worker aktif dengan command: <code className="bg-gray-100 px-2 py-1 rounded">php artisan queue:work</code>
                    </p>
                </div>
            </div>
        </Modal>
    );
}
