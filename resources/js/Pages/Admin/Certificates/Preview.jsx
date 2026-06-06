import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AppLayout from '../../../Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    FileText,
    Edit,
    Save,
    X,
    CheckCircle,
    Calendar,
    User,
    Award,
    BookOpen,
    Download,
    Eye,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

export default function Preview({ enrollment, certificateData }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(certificateData.is_saved || false);
    const [hasChanges, setHasChanges] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        user_name: certificateData.user_name || enrollment.user.name,
        course_title: certificateData.course_title || enrollment.course.title,
        completion_date: certificateData.completion_date || new Date().toISOString().split('T')[0],
        certificate_number: certificateData.certificate_number || `CERT-${Date.now()}`,
        grade: certificateData.grade || 'Excellent',
        instructor_name: certificateData.instructor_name || enrollment.course.instructor_name,
    });

    // Track changes when form data is modified
    const handleDataChange = (field, value) => {
        setData(field, value);
        setHasChanges(true);
        setIsSaved(false);
    };

    // Save certificate data to session
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await axios.post(route('admin.certificates.save-data', enrollment.id), {
                user_name: data.user_name,
                course_title: data.course_title,
                completion_date: data.completion_date,
                certificate_number: data.certificate_number,
                grade: data.grade,
                instructor_name: data.instructor_name,
            });

            if (response.data.success) {
                toast.success('Data sertifikat berhasil disimpan!');
                setIsSaved(true);
                setHasChanges(false);
                setIsEditing(false);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan data sertifikat.';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    // Open Perfect Layout in new tab (will use saved data)
    const handleOpenPerfectLayout = () => {
        if (hasChanges && !isSaved) {
            toast.error('Silakan simpan data terlebih dahulu sebelum membuka Perfect Layout!');
            return;
        }
        window.open(route('admin.certificates.preview-html', enrollment.id), '_blank');
    };

    const handleGenerate = () => {
        post(route('admin.certificates.generate-confirm', enrollment.id), {
            onSuccess: () => {
                toast.success('Sertifikat berhasil di-generate dan diterbitkan!');
                router.visit(route('admin.certificates.index'));
            },
            onError: (errors) => {
                const errorMsg = errors.error || 'Gagal generate sertifikat.';
                toast.error(errorMsg);
            }
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.certificates.index'));
    };

    return (
        <AppLayout title="Preview Sertifikat">
            <Head title="Preview Sertifikat" />

            <div className="p-3 sm:p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Preview Sertifikat
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Review dan edit data sertifikat sebelum generate
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <SecondaryButton onClick={handleCancel} disabled={processing || isSaving}>
                            <X className="w-4 h-4 mr-2" />
                            Batal
                        </SecondaryButton>

                        {/* Perfect Layout Button */}
                        <SecondaryButton
                            onClick={handleOpenPerfectLayout}
                            disabled={processing || isSaving}
                            className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Perfect Layout
                        </SecondaryButton>

                        {!isEditing ? (
                            <SecondaryButton onClick={() => setIsEditing(true)} disabled={processing || isSaving}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Data
                            </SecondaryButton>
                        ) : (
                            <>
                                <SecondaryButton onClick={() => setIsEditing(false)} disabled={isSaving}>
                                    <X className="w-4 h-4 mr-2" />
                                    Batal Edit
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={handleSave}
                                    disabled={isSaving || !hasChanges}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Simpan Data
                                        </>
                                    )}
                                </PrimaryButton>
                            </>
                        )}

                        {/* Status Indicator */}
                        {isSaved && !hasChanges && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Tersimpan
                            </span>
                        )}
                        {hasChanges && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                                Belum disimpan
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Certificate Data Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Data Sertifikat
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {isEditing ? 'Edit informasi yang akan muncul di sertifikat' : 'Informasi yang akan muncul di sertifikat'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Certificate Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Award className="w-4 h-4 inline mr-2" />
                                    Nomor Sertifikat
                                </label>
                                <input
                                    type="text"
                                    value={data.certificate_number}
                                    onChange={(e) => handleDataChange('certificate_number', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${
                                        isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                                {errors.certificate_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.certificate_number}</p>
                                )}
                            </div>

                            {/* Student Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Nama Peserta
                                </label>
                                <input
                                    type="text"
                                    value={data.user_name}
                                    onChange={(e) => handleDataChange('user_name', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${
                                        isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                                {errors.user_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.user_name}</p>
                                )}
                            </div>

                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BookOpen className="w-4 h-4 inline mr-2" />
                                    Nama Course
                                </label>
                                <input
                                    type="text"
                                    value={data.course_title}
                                    onChange={(e) => handleDataChange('course_title', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${
                                        isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                                {errors.course_title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.course_title}</p>
                                )}
                            </div>

                            {/* Instructor Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Nama Instruktur
                                </label>
                                <input
                                    type="text"
                                    value={data.instructor_name}
                                    onChange={(e) => handleDataChange('instructor_name', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${
                                        isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                                {errors.instructor_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.instructor_name}</p>
                                )}
                            </div>

                            {/* Completion Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Tanggal Selesai
                                </label>
                                <input
                                    type="date"
                                    value={data.completion_date}
                                    onChange={(e) => handleDataChange('completion_date', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${
                                        isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                    }`}
                                />
                                {errors.completion_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.completion_date}</p>
                                )}
                            </div>

                            {/* Grade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Award className="w-4 h-4 inline mr-2" />
                                    Grade / Predikat
                                </label>
                                {isEditing ? (
                                    <select
                                        value={data.grade}
                                        onChange={(e) => handleDataChange('grade', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Excellent">Excellent</option>
                                        <option value="Very Good">Very Good</option>
                                        <option value="Good">Good</option>
                                        <option value="Satisfactory">Satisfactory</option>
                                        <option value="Pass">Pass</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={data.grade}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                                    />
                                )}
                                {errors.grade && (
                                    <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-green-50 p-3 rounded-lg">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Preview Sertifikat
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Tampilan sertifikat yang akan di-generate
                                </p>
                            </div>
                        </div>

                        {/* Certificate Preview Template - Matching Real Certificate */}
                        <div className="border-8 border-blue-700 rounded-lg p-4 bg-white min-h-[600px] relative">
                            <div className="border-2 border-blue-400 p-6 h-full relative">
                                {/* Header with 3 Logos */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-xs font-bold text-blue-600 border border-blue-300 px-2 py-1 rounded">
                                        PROBISDI
                                    </div>
                                    <div className="text-xs font-bold text-blue-600 border border-blue-300 px-2 py-1 rounded">
                                        LNA
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl font-bold text-blue-700 text-center tracking-wider mb-2">
                                    SERTIFIKAT PELATIHAN
                                </h1>
                                <p className="text-xs text-center text-gray-600 mb-3">
                                    Dengan ini Menyatakan
                                </p>

                                {/* Student Name */}
                                <div className="text-center mb-2">
                                    <div className="text-xl font-bold text-black border-b-2 border-blue-700 inline-block pb-1 px-8">
                                        {data.user_name}
                                    </div>
                                </div>

                                {/* Certificate Number */}
                                <p className="text-xs text-center text-gray-600 mb-2">
                                    No. Sertifikat: {data.certificate_number}
                                </p>

                                {/* Description */}
                                <p className="text-xs text-center text-gray-600 mb-1">
                                    Telah Mengikuti Kegiatan
                                </p>
                                <p className="text-sm font-bold text-blue-700 text-center mb-2">
                                    {data.course_title}
                                </p>

                                {/* Organization */}
                                <div className="text-center mb-2">
                                    <p className="text-xs text-gray-600">Diselenggarakan Oleh:</p>
                                    <p className="text-xs font-bold">PT. Leadership Nasional Asia</p>
                                </div>

                                {/* Narasumber */}
                                <div className="text-center mb-2">
                                    <p className="text-xs font-bold mb-1">Narasumber/Pembicara:</p>
                                    <p className="text-[10px] text-gray-600">
                                        Ferry Hermansyah, GRCE, CIB, CRP, WPPE, CRM, FRM
                                    </p>
                                </div>

                                {/* Unit Kompetensi */}
                                <div className="mb-2">
                                    <p className="text-xs font-bold text-center mb-2">Unit Kompetensi:</p>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-gray-600 max-w-[95%] mx-auto">
                                        <div>1. J.62DMS00.006.1 – Merancang Basis Data</div>
                                        <div>5. J.62DMS00.022.1 – Mengelola Keamanan Data</div>
                                        <div>2. J.62DMS00.010.1 – Membuat Basis Data</div>
                                        <div>6. J.62DMS00.001.1 – Mengidentifikasi Kebutuhan...</div>
                                        <div>3. J.62DMS00.011.1 – Membuat Integrasi Data</div>
                                        <div>7. J.62DMS00.015.1 – Membuat Business Intelligence</div>
                                        <div>4. J.62DMS00.012.1 – Mengelola Kualitas Data</div>
                                    </div>
                                </div>

                                {/* Date */}
                                <p className="text-xs text-center text-gray-600 mb-1">
                                    Tanggal: <span className="font-bold">
                                        {new Date(data.completion_date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </p>

                                {/* Company */}
                                <p className="text-xs text-center font-bold mb-3">
                                    PT. Leadership Nasional Asia (Leadership LNA)
                                </p>

                                {/* Signatures */}
                                <div className="flex justify-around mb-2">
                                    <div className="text-center">
                                        <div className="border-t-2 border-black w-32 mx-auto mb-1 mt-8"></div>
                                        <p className="text-[10px] font-bold">Ferry Hermansyah, GRCE, CIB, CRP, WPPE, CRM, FRM</p>
                                        <p className="text-[9px] text-gray-600">Commissioner</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-t-2 border-black w-32 mx-auto mb-1 mt-8"></div>
                                        <p className="text-[10px] font-bold">Ir. Pipip Sasati, CRP</p>
                                        <p className="text-[9px] text-gray-600">Direktur</p>
                                    </div>
                                </div>

                                {/* BlockXLab Logo (Bottom Left) */}
                                <div className="absolute bottom-3 left-3">
                                    <div className="text-xs font-bold text-blue-600 border border-blue-300 px-2 py-1 rounded">
                                        BlockXLab
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Cara Penggunaan:</strong>
                                </p>
                                <ol className="text-sm text-blue-800 mt-2 list-decimal list-inside space-y-1">
                                    <li>Klik <strong>"Edit Data"</strong> untuk mengubah data sertifikat</li>
                                    <li>Ubah data sesuai kebutuhan (nama, nomor sertifikat, tanggal, dll)</li>
                                    <li>Klik <strong>"Simpan Data"</strong> untuk menyimpan perubahan</li>
                                    <li>Klik <strong>"Perfect Layout"</strong> untuk melihat sertifikat dengan layout final</li>
                                </ol>
                            </div>
                            {isSaved && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        <CheckCircle className="w-4 h-4 inline mr-2" />
                                        <strong>Data tersinkronisasi!</strong> Data yang sudah disimpan akan otomatis muncul di Perfect Layout.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Student & Course Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Student Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Informasi Peserta
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{enrollment.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{enrollment.user.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Progress:</span>
                                <span className="font-medium text-green-600">{enrollment.progress_percentage}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Course Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Informasi Course
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Instructor:</span>
                                <span className="font-medium">{enrollment.course.instructor_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Meetings Attended:</span>
                                <span className="font-medium">
                                    {enrollment.meetings_attended_count}/{enrollment.total_meetings_count}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${
                                    enrollment.all_meetings_attended
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {enrollment.all_meetings_attended ? '✅ Memenuhi Syarat' : '❌ Belum Memenuhi Syarat'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
