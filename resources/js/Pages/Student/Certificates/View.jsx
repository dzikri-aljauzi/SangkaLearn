import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';

export default function ViewCertificate({ certificate, isQueueCertificate = false }) {
    const handleDownload = () => {
        // Use appropriate route based on certificate type
        const downloadRoute = isQueueCertificate
            ? route('student.certificates.queue.download', certificate.id)
            : route('student.certificates.download', certificate.id);
        window.open(downloadRoute, '_blank');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Detail Sertifikat
                    </h2>
                    <Link
                        href={route('student.dashboard')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Detail Sertifikat" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <motion.div 
                        className="bg-white overflow-hidden shadow-sm sm:rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Certificate Preview */}
                                <div className="space-y-6">
                                    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sertifikat Penyelesaian</h3>
                                            <p className="text-gray-600 mb-4">{certificate.title}</p>
                                            
                                            {certificate.certificate_file && (
                                                <button
                                                    onClick={handleDownload}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Download Sertifikat</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Certificate Details */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Informasi Sertifikat</h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nomor Sertifikat
                                                </label>
                                                <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                                                    {certificate.certificate_number}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pelatihan
                                                </label>
                                                <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {certificate.course?.title}
                                                </p>
                                            </div>

                                            {certificate.course?.instructor && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Instruktur
                                                    </label>
                                                    <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded border">
                                                        {certificate.course.instructor.avatar ? (
                                                            <img
                                                                src={`/storage/${certificate.course.instructor.avatar}`}
                                                                alt={`${certificate.course.instructor.first_name} ${certificate.course.instructor.last_name}`}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                                <span className="text-gray-600 text-sm font-medium">
                                                                    {certificate.course.instructor.first_name[0]}
                                                                    {certificate.course.instructor.last_name[0]}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-gray-900">
                                                            {certificate.course.instructor.first_name} {certificate.course.instructor.last_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tanggal Terbit
                                                </label>
                                                <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {formatDate(certificate.issued_at)}
                                                </p>
                                            </div>

                                            {certificate.expires_at && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Berlaku Hingga
                                                    </label>
                                                    <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                                                        {formatDate(certificate.expires_at)}
                                                    </p>
                                                </div>
                                            )}

                                            {certificate.grade && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nilai
                                                    </label>
                                                    <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                                                        {certificate.grade}
                                                    </p>
                                                </div>
                                            )}

                                            {certificate.completion_percentage && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Persentase Penyelesaian
                                                    </label>
                                                    <div className="bg-white px-3 py-2 rounded border">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-gray-900">{certificate.completion_percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${certificate.completion_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {certificate.verification_code && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Kode Verifikasi
                                                    </label>
                                                    <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                                                        {certificate.verification_code}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Certificate Status */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Status Sertifikat</h4>
                                        
                                        <div className="flex items-center space-x-2">
                                            {certificate.is_revoked ? (
                                                <>
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <span className="text-red-700 font-medium">Dibatalkan</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-green-700 font-medium">Aktif</span>
                                                </>
                                            )}
                                        </div>

                                        {certificate.is_revoked && certificate.revoked_reason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                                <p className="text-red-700 text-sm">
                                                    <strong>Alasan Pembatalan:</strong> {certificate.revoked_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {certificate.description && (
                                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Deskripsi</h4>
                                    <p className="text-gray-700 leading-relaxed">
                                        {certificate.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}