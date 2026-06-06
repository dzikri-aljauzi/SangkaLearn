import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function MeetingForm({ course, meeting = null, onCancel }) {
    const isEditing = meeting !== null;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: meeting?.title || '',
        description: meeting?.description || '',
        zoom_link: meeting?.zoom_link || '',
        scheduled_at: meeting?.scheduled_at ?
            new Date(meeting.scheduled_at).toISOString().slice(0, 16) : '',
        duration_minutes: meeting?.duration_minutes || 60,
        meeting_id: meeting?.meeting_id || '',
        passcode: meeting?.passcode || '',
        notes: meeting?.notes || '',
        is_published: meeting?.is_published ?? true,
        sort_order: meeting?.sort_order || 0,
    });

    const getDefaultTemplate = () => {
        const scheduledDate = data.scheduled_at ?
            new Date(data.scheduled_at).toLocaleString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '[Tanggal belum diisi]';

        return `Pelatihan ${course.title}
Sesi Zoom: ${data.title || '[Judul belum diisi]'}

📅 Waktu Pelaksanaan: ${scheduledDate}
⏱️ Durasi: ${data.duration_minutes} menit

⚠️ KETENTUAN PENTING:
1. ✅ WAJIB HADIR TEPAT WAKTU - Meeting dimulai sesuai jadwal
2. 📸 WAJIB mengambil SCREENSHOT kehadiran sebagai bukti
3. 📋 Kehadiran akan dicatat secara MANUAL oleh admin
4. 🎓 Kehadiran di Zoom adalah SYARAT MENDAPATKAN SERTIFIKAT

❗ PERHATIAN - TIDAK BOLEH TELAT!
- Absensi ditutup setelah meeting dimulai
- Pastikan koneksi internet stabil
- Siapkan perangkat untuk screenshot
- Login ke Zoom 5 menit sebelum waktu dimulai

Mohon persiapkan diri dengan baik. Terima kasih!`;
    };

    const useTemplate = () => {
        setData('description', getDefaultTemplate());
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('admin.meetings.update', { course: course.slug, meeting: meeting.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    if (onCancel) onCancel();
                }
            });
        } else {
            post(route('admin.meetings.store', course.slug), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    if (onCancel) onCancel();
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                    <InputLabel htmlFor="title" value="Judul Meeting *" />
                    <TextInput
                        id="title"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        placeholder="Contoh: Sesi Pembahasan Materi A"
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                {/* Scheduled At */}
                <div>
                    <InputLabel htmlFor="scheduled_at" value="Waktu Pelaksanaan *" />
                    <TextInput
                        id="scheduled_at"
                        type="datetime-local"
                        className="mt-1 block w-full"
                        value={data.scheduled_at}
                        onChange={(e) => setData('scheduled_at', e.target.value)}
                        required
                    />
                    <InputError message={errors.scheduled_at} className="mt-2" />
                </div>

                {/* Duration */}
                <div>
                    <InputLabel htmlFor="duration_minutes" value="Durasi (Menit) *" />
                    <TextInput
                        id="duration_minutes"
                        type="number"
                        className="mt-1 block w-full"
                        value={data.duration_minutes}
                        onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                        required
                        min="15"
                        step="15"
                    />
                    <InputError message={errors.duration_minutes} className="mt-2" />
                </div>

                {/* Zoom Link */}
                <div className="md:col-span-2">
                    <InputLabel htmlFor="zoom_link" value="Link Zoom *" />
                    <TextInput
                        id="zoom_link"
                        type="url"
                        className="mt-1 block w-full"
                        value={data.zoom_link}
                        onChange={(e) => setData('zoom_link', e.target.value)}
                        required
                        placeholder="https://zoom.us/j/1234567890"
                    />
                    <InputError message={errors.zoom_link} className="mt-2" />
                </div>

                {/* Meeting ID */}
                <div>
                    <InputLabel htmlFor="meeting_id" value="Meeting ID (Opsional)" />
                    <TextInput
                        id="meeting_id"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.meeting_id}
                        onChange={(e) => setData('meeting_id', e.target.value)}
                        placeholder="123 456 7890"
                    />
                    <InputError message={errors.meeting_id} className="mt-2" />
                </div>

                {/* Passcode */}
                <div>
                    <InputLabel htmlFor="passcode" value="Passcode (Opsional)" />
                    <TextInput
                        id="passcode"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.passcode}
                        onChange={(e) => setData('passcode', e.target.value)}
                        placeholder="abc123"
                    />
                    <InputError message={errors.passcode} className="mt-2" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                        <InputLabel htmlFor="description" value="Deskripsi" />
                        <button
                            type="button"
                            onClick={useTemplate}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            📋 Gunakan Template Default
                        </button>
                    </div>
                    <textarea
                        id="description"
                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        rows="12"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Klik 'Gunakan Template Default' untuk mengisi deskripsi otomatis atau tulis deskripsi kustom Anda..."
                    />
                    <InputError message={errors.description} className="mt-2" />
                    <p className="mt-1 text-sm text-gray-500">
                        💡 Tip: Klik tombol "Gunakan Template Default" untuk mengisi deskripsi dengan format lengkap termasuk ketentuan dan peringatan.
                    </p>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                    <InputLabel htmlFor="notes" value="Catatan Admin (Internal)" />
                    <textarea
                        id="notes"
                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        rows="3"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Catatan internal untuk admin (tidak terlihat oleh peserta)"
                    />
                    <InputError message={errors.notes} className="mt-2" />
                </div>

                {/* Sort Order */}
                <div>
                    <InputLabel htmlFor="sort_order" value="Urutan Tampilan" />
                    <TextInput
                        id="sort_order"
                        type="number"
                        className="mt-1 block w-full"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                        min="0"
                    />
                    <InputError message={errors.sort_order} className="mt-2" />
                    <p className="mt-1 text-sm text-gray-500">
                        Semakin kecil nomor, semakin atas urutan tampilan
                    </p>
                </div>

                {/* Is Published */}
                <div>
                    <InputLabel htmlFor="is_published" value="Status Publikasi" />
                    <div className="mt-3 flex items-center">
                        <input
                            id="is_published"
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                            Tampilkan ke peserta
                        </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Jika tidak dicentang, meeting hanya terlihat oleh admin
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                {onCancel && (
                    <SecondaryButton type="button" onClick={onCancel}>
                        Batal
                    </SecondaryButton>
                )}
                <PrimaryButton type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : (isEditing ? 'Update Meeting' : 'Buat Meeting')}
                </PrimaryButton>
            </div>
        </form>
    );
}
