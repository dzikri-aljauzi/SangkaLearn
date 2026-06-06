import React, { useRef, useState } from 'react';
import { Calendar, Clock, Award, Video, Monitor, Users, Plus, Minus, FileText, Trash2, Camera, Download, Image, Upload, X } from 'lucide-react';

export default function CourseTrainingFields({
    formData,
    setFormData,
    courseTypes = [],
    onAddCourseType,
    virtualBackground = null,
    onVirtualBackgroundUpload,
    onVirtualBackgroundDelete,
    isUploadingVirtualBackground = false
}) {
    const virtualBackgroundInputRef = useRef(null);
    const [virtualBackgroundPreview, setVirtualBackgroundPreview] = useState(null);
    // Helper functions for certificate_unit_kompetensi array management
    const getCertificateUnitKompetensi = () => {
        return Array.isArray(formData.certificate_unit_kompetensi) ? formData.certificate_unit_kompetensi : [];
    };

    const addCertificateUnitKompetensi = () => {
        const currentUnits = getCertificateUnitKompetensi();
        setFormData({ ...formData, certificate_unit_kompetensi: [...currentUnits, ''] });
    };

    const removeCertificateUnitKompetensi = (index) => {
        const currentUnits = getCertificateUnitKompetensi();
        setFormData({ ...formData, certificate_unit_kompetensi: currentUnits.filter((_, i) => i !== index) });
    };

    const updateCertificateUnitKompetensi = (index, value) => {
        const currentUnits = getCertificateUnitKompetensi();
        const newUnits = [...currentUnits];
        newUnits[index] = value;
        setFormData({ ...formData, certificate_unit_kompetensi: newUnits });
    };

    // Legacy helper functions for competency_units (kept for backward compatibility)
    const addCompetencyUnit = () => {
        const currentUnits = Array.isArray(formData.competency_units) ? formData.competency_units : [];
        setFormData({ ...formData, competency_units: [...currentUnits, ''] });
    };

    const removeCompetencyUnit = (index) => {
        const currentUnits = Array.isArray(formData.competency_units) ? formData.competency_units : [];
        setFormData({ ...formData, competency_units: currentUnits.filter((_, i) => i !== index) });
    };

    const updateCompetencyUnit = (index, value) => {
        const currentUnits = Array.isArray(formData.competency_units) ? formData.competency_units : [];
        const newUnits = [...currentUnits];
        newUnits[index] = value;
        setFormData({ ...formData, competency_units: newUnits });
    };
    // Handle virtual background file selection
    const handleVirtualBackgroundChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('Format file harus JPG, JPEG, PNG, atau WEBP');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB');
                return;
            }
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setVirtualBackgroundPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle virtual background upload
    const handleVirtualBackgroundUpload = async () => {
        const file = virtualBackgroundInputRef.current?.files[0];
        if (!file) {
            alert('Pilih file terlebih dahulu');
            return;
        }

        if (onVirtualBackgroundUpload) {
            await onVirtualBackgroundUpload(file);
            setVirtualBackgroundPreview(null);
            if (virtualBackgroundInputRef.current) {
                virtualBackgroundInputRef.current.value = '';
            }
        }
    };

    // Handle virtual background delete
    const handleVirtualBackgroundDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus virtual background ini?')) return;

        if (onVirtualBackgroundDelete) {
            await onVirtualBackgroundDelete();
        }
    };

    // Cancel virtual background preview
    const cancelVirtualBackgroundPreview = () => {
        setVirtualBackgroundPreview(null);
        if (virtualBackgroundInputRef.current) {
            virtualBackgroundInputRef.current.value = '';
        }
    };

    // Group course types by parent
    const groupedCourseTypes = React.useMemo(() => {
        const groups = {};
        courseTypes.forEach((type) => {
            const parentName = type.parent?.name || 'Lainnya';
            if (!groups[parentName]) {
                groups[parentName] = [];
            }
            groups[parentName].push(type);
        });
        return groups;
    }, [courseTypes]);

    return (
        <div className="space-y-6">
            {/* Course Type / Jenis Pelatihan & Sertifikat */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-2" />
                    Jenis Pelatihan & Sertifikat
                </label>
                <div className="flex gap-2">
                    <select
                        value={formData.course_type_id || ''}
                        onChange={(e) => setFormData({ ...formData, course_type_id: e.target.value || null })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Pilih Jenis Pelatihan & Sertifikat --</option>
                        {Object.entries(groupedCourseTypes).map(([parentName, types]) => (
                            <optgroup key={parentName} label={parentName}>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    {onAddCourseType && (
                        <button
                            type="button"
                            onClick={onAddCourseType}
                            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Pilih jenis pelatihan dan sertifikat yang akan diberikan
                </p>
            </div>

            {/* Access Duration Configuration */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Durasi Akses</h3>

                {/* Access Duration Per User */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2 text-green-600" />
                        Durasi Akses Per Peserta (hari)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.access_duration_days || ''}
                        onChange={(e) => setFormData({ ...formData, access_duration_days: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Kosongkan untuk akses selamanya"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                        <strong>Contoh:</strong> Jika diisi 90, maka setiap peserta memiliki akses 90 hari sejak tanggal pembelian/pendaftaran.
                        <br />
                        <span className="text-green-700">Kosongkan atau isi 0 untuk akses selamanya (unlimited).</span>
                    </p>
                </div>
            </div>

            {/* Certificate Configuration */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Konfigurasi Sertifikat</h3>

                {/* Certificate Title */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Judul/Gelar Sertifikat (opsional)
                    </label>
                    <input
                        type="text"
                        value={formData.certificate_title || ''}
                        onChange={(e) => setFormData({ ...formData, certificate_title: e.target.value })}
                        placeholder="contoh: Certified Digital Banking Professional"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Instructor Name for Certificate */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Nama Narasumber/Pembicara (untuk Sertifikat)
                    </label>
                    <input
                        type="text"
                        value={formData.instructor_name || ''}
                        onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                        placeholder="contoh: Ferry Hermansyah, GRCE, CIB, CRP, WPPE, CRM, FRM"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Nama lengkap dengan gelar yang akan ditampilkan di sertifikat
                    </p>
                </div>

                {/* Unit Kompetensi - Dynamic Fields */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Unit Kompetensi (untuk Sertifikat)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                        Tambahkan unit kompetensi yang akan ditampilkan di sertifikat. Klik tombol "Tambah" untuk menambahkan unit baru.
                    </p>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                        {getCertificateUnitKompetensi().length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Belum ada unit kompetensi.</p>
                                <p className="text-xs">Klik tombol "Tambah Unit Kompetensi" di bawah untuk menambahkan.</p>
                            </div>
                        ) : (
                            getCertificateUnitKompetensi().map((unit, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                                        {index + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={unit || ''}
                                        onChange={(e) => updateCertificateUnitKompetensi(index, e.target.value)}
                                        placeholder={`Contoh: J.62DMS00.00${index + 1}.1 – Nama Unit Kompetensi`}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCertificateUnitKompetensi(index)}
                                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus unit kompetensi"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}

                        {/* Add Button */}
                        <button
                            type="button"
                            onClick={addCertificateUnitKompetensi}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Tambah Unit Kompetensi</span>
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        💡 Tip: Anda dapat menambahkan sebanyak mungkin unit kompetensi sesuai kebutuhan. Unit kompetensi akan ditampilkan secara otomatis di sertifikat dengan urutan sesuai nomor.
                    </p>
                </div>
            </div>

            {/* Delivery Method */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Metode Pembelajaran</h3>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Monitor className="w-4 h-4 inline mr-2" />
                        Pilih Metode
                    </label>
                    <select
                        value={formData.delivery_method || 'hybrid'}
                        onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="hybrid">Hybrid (Recording + Zoom Interaktif)</option>
                        <option value="online_recording">Online Recording (Video Saja)</option>
                        <option value="zoom_interactive">Zoom Interaktif (Live Only)</option>
                    </select>
                </div>

                {/* Zoom Configuration - Show if not online_recording */}
                {formData.delivery_method !== 'online_recording' && (
                    <div className="space-y-4 pl-8 border-l-2 border-green-200">
                        {/* Zoom Link */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Video className="w-4 h-4 inline mr-2" />
                                Link Zoom Meeting
                            </label>
                            <input
                                type="url"
                                value={formData.zoom_link || ''}
                                onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
                                placeholder="https://zoom.us/j/..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Zoom Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Catatan Zoom (opsional)
                            </label>
                            <textarea
                                value={formData.zoom_notes || ''}
                                onChange={(e) => setFormData({ ...formData, zoom_notes: e.target.value })}
                                rows={3}
                                placeholder="Catatan tambahan untuk peserta, seperti persiapan, agenda, dll."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Zoom Screenshot Requirement - Available for ALL delivery methods */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bukti Kehadiran Zoom</h3>

                {/* Require Zoom Screenshot */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <label className="flex items-start cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.require_zoom_screenshot || false}
                            onChange={(e) => setFormData({ ...formData, require_zoom_screenshot: e.target.checked })}
                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                        />
                        <div className="ml-3">
                            <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-orange-600" />
                                Wajib Upload Foto Screenshot Zoom
                            </span>
                            <p className="mt-1 text-xs text-gray-600">
                                Jika diaktifkan, peserta harus upload bukti screenshot zoom mereka di halaman pelatihan untuk menyelesaikan pelatihan ini.
                                Foto akan dihitung sebagai bagian dari progress penyelesaian pelatihan.
                            </p>
                        </div>
                    </label>
                </div>

                {/* Show Zoom Link input ONLY if: online_recording method AND require_zoom_screenshot is enabled */}
                {formData.delivery_method === 'online_recording' && formData.require_zoom_screenshot && (
                    <div className="mt-4 space-y-4 pl-8 border-l-2 border-orange-200">
                        {/* Zoom Link for Screenshot */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Video className="w-4 h-4 inline mr-2" />
                                Link Zoom Meeting (untuk Screenshot)
                            </label>
                            <input
                                type="url"
                                value={formData.zoom_link || ''}
                                onChange={(e) => setFormData({ ...formData, zoom_link: e.target.value })}
                                placeholder="https://zoom.us/j/..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Link ini akan ditampilkan ke peserta untuk mengikuti Zoom meeting dan upload screenshot.
                            </p>
                        </div>

                        {/* Zoom Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Catatan Zoom (opsional)
                            </label>
                            <textarea
                                value={formData.zoom_notes || ''}
                                onChange={(e) => setFormData({ ...formData, zoom_notes: e.target.value })}
                                rows={3}
                                placeholder="Catatan tambahan untuk peserta, seperti persiapan, agenda, dll."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Info: Link Zoom from above will be used */}
                {formData.delivery_method !== 'online_recording' && formData.require_zoom_screenshot && formData.zoom_link && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Link Zoom yang akan digunakan:</p>
                                <p className="text-sm text-blue-700 break-all mt-1">{formData.zoom_link}</p>
                                <p className="text-xs text-blue-600 mt-2">
                                    Link ini diambil dari konfigurasi Zoom Meeting di atas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Virtual Background Upload Section - Only show if zoom screenshot is required AND upload handler is available */}
                {formData.require_zoom_screenshot && onVirtualBackgroundUpload && (
                    <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-4">
                            <Image className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-purple-900">Virtual Background Zoom</h4>
                                <p className="text-xs text-purple-700 mt-1">
                                    Upload gambar virtual background yang bisa didownload peserta untuk digunakan saat Zoom meeting.
                                    Format: JPG, PNG, WEBP (maks. 5MB)
                                </p>
                            </div>
                        </div>

                        {/* Current Virtual Background Preview */}
                        {virtualBackground && !virtualBackgroundPreview && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-purple-800 mb-2">Virtual Background Saat Ini:</label>
                                <div className="relative inline-block">
                                    <img
                                        src={virtualBackground}
                                        alt="Virtual Background"
                                        className="max-w-full h-auto max-h-40 rounded-xl border border-purple-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVirtualBackgroundDelete}
                                        disabled={isUploadingVirtualBackground}
                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Hapus virtual background"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* File Input */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-purple-800 mb-2">
                                    {virtualBackground ? 'Ganti Virtual Background:' : 'Upload Virtual Background:'}
                                </label>
                                <input
                                    ref={virtualBackgroundInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleVirtualBackgroundChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2.5 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-purple-100 file:text-purple-700
                                        hover:file:bg-purple-200
                                        cursor-pointer border border-purple-200 rounded-xl"
                                />
                            </div>

                            {/* New Image Preview */}
                            {virtualBackgroundPreview && (
                                <div>
                                    <label className="block text-sm font-semibold text-purple-800 mb-2">Preview:</label>
                                    <div className="relative inline-block">
                                        <img
                                            src={virtualBackgroundPreview}
                                            alt="Preview"
                                            className="max-w-full h-auto max-h-40 rounded-xl border border-purple-200 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={cancelVirtualBackgroundPreview}
                                            className="absolute top-2 right-2 p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-colors"
                                            title="Batal"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            {virtualBackgroundPreview && (
                                <button
                                    type="button"
                                    onClick={handleVirtualBackgroundUpload}
                                    disabled={isUploadingVirtualBackground}
                                    className={`w-full py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                        isUploadingVirtualBackground
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {isUploadingVirtualBackground ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Virtual Background
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Tips:</strong> Gunakan pelatihan permanen untuk course yang selalu tersedia.
                            Gunakan periode untuk batch/angkatan tertentu. Auto-archive akan memindahkan
                            course ke arsip setelah periode berakhir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
