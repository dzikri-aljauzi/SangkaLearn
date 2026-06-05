import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Modal from './Modal';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { Video, Calendar, Clock, Link as LinkIcon, Lock, FileText, Bell, Users } from 'lucide-react';

export default function MeetingFormModal({ show, onClose, course, section, meeting = null }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        zoom_link: '',
        scheduled_at: '',
        duration_minutes: 60,
        notes: '',
        meeting_id: '',
        passcode: '',
        is_published: true,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (meeting) {
            setFormData({
                title: meeting.title || '',
                description: meeting.description || '',
                zoom_link: meeting.zoom_link || '',
                scheduled_at: meeting.scheduled_at ? meeting.scheduled_at.split('.')[0] : '',
                duration_minutes: meeting.duration_minutes || 60,
                notes: meeting.notes || '',
                meeting_id: meeting.meeting_id || '',
                passcode: meeting.passcode || '',
                is_published: meeting.is_published ?? true,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                zoom_link: '',
                scheduled_at: '',
                duration_minutes: 60,
                notes: '',
                meeting_id: '',
                passcode: '',
                is_published: true,
            });
        }
        setErrors({});
    }, [meeting, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const loadEnrolledStudents = async () => {
        if (!meeting) return;

        setLoadingStudents(true);
        try {
            const response = await fetch(route('admin.courses.meetings.enrolled-students', meeting.id));
            const data = await response.json();
            setEnrolledStudents(data.students);
        } catch (error) {
            console.error('Failed to load enrolled students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleShowEnrolledStudents = () => {
        setShowEnrolledStudents(true);
        loadEnrolledStudents();
    };

    const handleSendAlert = () => {
        if (!meeting) return;

        if (confirm(`Kirim email alert ke ${enrolledStudents.length} peserta yang terdaftar?`)) {
            router.post(route('admin.courses.meetings.send-alert', meeting.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = meeting
            ? route('admin.courses.meetings.update', { course: course.slug, section: section.id, meeting: meeting.id })
            : route('admin.courses.meetings.store', { course: course.slug, section: section.id });

        const method = meeting ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    const useDefaultTemplate = () => {
        const defaultDescription = `📹 **Zoom Meeting Details**

**Jadwal Pelaksanaan:**
- Tanggal: [Akan diisi otomatis]
- Durasi: ${formData.duration_minutes} menit

**Informasi Meeting:**
- Meeting ID: ${formData.meeting_id || '[Akan diisi]'}
- Passcode: ${formData.passcode || '[Akan diisi]'}

**Catatan Penting:**
✅ Pastikan Anda bergabung 10 menit sebelum meeting dimulai
✅ Gunakan nama lengkap saat join meeting
✅ Pastikan koneksi internet stabil
✅ Siapkan kamera dan mikrofon

**Apa yang akan dipelajari:**
- [Topik 1]
- [Topik 2]
- [Topik 3]

**Link Zoom Meeting:**
${formData.zoom_link || '[Akan diisi dari field Link Zoom]'}`;

        setFormData(prev => ({
            ...prev,
            description: defaultDescription
        }));
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Video className="w-6 h-6 text-blue-600 mr-3" />
                        <h2 className="text-xl font-bold text-gray-900">
                            {meeting ? 'Edit Zoom Meeting' : 'Tambah Zoom Meeting Baru'}
                        </h2>
                    </div>
                    {meeting && (
                        <button
                            type="button"
                            onClick={handleShowEnrolledStudents}
                            className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                            <Users className="w-4 h-4 mr-1" />
                            Lihat Peserta
                        </button>
                    )}
                </div>

                {showEnrolledStudents && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-blue-900">Peserta Terdaftar ({enrolledStudents.length})</h3>
                            <button
                                type="button"
                                onClick={() => setShowEnrolledStudents(false)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                        {loadingStudents ? (
                            <p className="text-sm text-blue-700">Loading...</p>
                        ) : (
                            <>
                                <div className="max-h-40 overflow-y-auto mb-3">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-blue-200">
                                                <th className="text-left py-2 text-blue-900">Nama</th>
                                                <th className="text-left py-2 text-blue-900">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-blue-100">
                                                    <td className="py-2 text-blue-800">{student.name}</td>
                                                    <td className="py-2 text-blue-700">{student.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendAlert}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Kirim Email Alert ke Semua Peserta
                                </button>
                                {meeting?.alert_sent && (
                                    <p className="mt-2 text-xs text-green-700 text-center">
                                        ✅ Alert terakhir dikirim: {new Date(meeting.alert_sent_at).toLocaleString('id-ID')}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Title */}
                    <div>
                        <InputLabel htmlFor="title" value="Judul Meeting *" />
                        <TextInput
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Pertemuan Kick-off Pelatihan"
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    {/* Zoom Link */}
                    <div>
                        <InputLabel htmlFor="zoom_link" value="Link Zoom *" />
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <TextInput
                                id="zoom_link"
                                name="zoom_link"
                                value={formData.zoom_link}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-10"
                                placeholder="https://zoom.us/j/..."
                                required
                            />
                        </div>
                        <InputError message={errors.zoom_link} className="mt-2" />
                    </div>

                    {/* Meeting ID & Passcode */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="meeting_id" value="Meeting ID (Opsional)" />
                            <TextInput
                                id="meeting_id"
                                name="meeting_id"
                                value={formData.meeting_id}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                placeholder="123 456 789"
                            />
                            <InputError message={errors.meeting_id} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="passcode" value="Passcode (Opsional)" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <TextInput
                                    id="passcode"
                                    name="passcode"
                                    value={formData.passcode}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-10"
                                    placeholder="******"
                                />
                            </div>
                            <InputError message={errors.passcode} className="mt-2" />
                        </div>
                    </div>

                    {/* Scheduled At & Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="scheduled_at" value="Tanggal & Waktu *" />
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    id="scheduled_at"
                                    name="scheduled_at"
                                    value={formData.scheduled_at}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <InputError message={errors.scheduled_at} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="duration_minutes" value="Durasi (Menit) *" />
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    id="duration_minutes"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    min="15"
                                    max="480"
                                    className="mt-1 block w-full pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <InputError message={errors.duration_minutes} className="mt-2" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <InputLabel htmlFor="description" value="Deskripsi Meeting" />
                            <button
                                type="button"
                                onClick={useDefaultTemplate}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Gunakan Template Default
                            </button>
                        </div>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="8"
                            className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                            placeholder="Deskripsi lengkap tentang meeting ini..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Mendukung Markdown untuk formatting</p>
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    {/* Notes */}
                    <div>
                        <InputLabel htmlFor="notes" value="Catatan Internal (Tidak ditampilkan ke peserta)" />
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                placeholder="Catatan untuk admin/instruktur..."
                            />
                        </div>
                        <InputError message={errors.notes} className="mt-2" />
                    </div>

                    {/* Is Published */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                            Publish meeting (tampilkan ke peserta)
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <SecondaryButton type="button" onClick={onClose}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : (meeting ? 'Update Meeting' : 'Simpan Meeting')}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
