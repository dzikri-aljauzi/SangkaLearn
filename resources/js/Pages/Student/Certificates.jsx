import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { 
    Award, 
    Download, 
    Share2,
    Calendar,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Grid,
    List,
    Trophy,
    Star,
    Clock,
    User,
    Shield,
    Bookmark,
    BookOpen
} from 'lucide-react';

export default function StudentCertificates({ 
    certificates = { data: [] }, 
    stats = {},
    user,
    filters = {}
}) {
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');

    const { 
        total_certificates = 0,
        valid_certificates = 0,
        expired_certificates = 0,
        this_month_certificates = 0
    } = stats;

    // Get certificates data array from paginated response
    // Laravel paginated collection is converted to object with 'data' property by Inertia
    const certificatesData = certificates?.data || [];

    // Filter certificates based on search and status
    const filteredCertificates = certificatesData.filter(cert => {
        const matchesSearch = !searchTerm || 
            cert.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'valid' && cert.is_valid) ||
            (filterStatus === 'expired' && !cert.is_valid && cert.expires_at && new Date(cert.expires_at) < new Date()) ||
            (filterStatus === 'revoked' && cert.is_revoked);
            
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCertificateStatus = (certificate) => {
        if (certificate.is_revoked) {
            return { status: 'revoked', color: 'text-red-600 bg-red-100', label: 'Dicabut' };
        }
        if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
            return { status: 'expired', color: 'text-orange-600 bg-orange-100', label: 'Kedaluwarsa' };
        }
        return { status: 'valid', color: 'text-green-600 bg-green-100', label: 'Valid' };
    };

    const handleDownload = (certificate) => {
        // In real implementation, this would trigger certificate download
        window.open(certificate.download_url || `/student/certificates/queue/${certificate.id}/download`, '_blank');
    };

    const handleShare = (certificate) => {
        if (navigator.share) {
            navigator.share({
                title: `Sertifikat ${certificate.course?.title}`,
                text: `Saya baru saja menyelesaikan pelatihan ${certificate.course?.title}!`,
                url: certificate.verification_url || window.location.href,
            });
        } else {
            // Fallback to copying URL to clipboard
            navigator.clipboard.writeText(certificate.verification_url || window.location.href);
            // You could add a toast notification here
        }
    };

    return (
        <AppLayout title="Sertifikat Saya">
            <Head title="Sertifikat Saya" />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10">
                        <motion.h1 
                            className="text-3xl font-bold mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Sertifikat Saya 🏆
                        </motion.h1>
                        <motion.p 
                            className="text-orange-100 text-lg mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Koleksi sertifikat dan pencapaian pembelajaran Anda
                        </motion.p>
                        
                        {/* Certificate Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="text-2xl font-bold">{total_certificates}</div>
                                <div className="text-orange-100 text-sm">Total Sertifikat</div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="text-2xl font-bold">{valid_certificates}</div>
                                <div className="text-orange-100 text-sm">Valid</div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className="text-2xl font-bold">{this_month_certificates}</div>
                                <div className="text-orange-100 text-sm">Bulan Ini</div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <div className="text-2xl font-bold">{expired_certificates}</div>
                                <div className="text-orange-100 text-sm">Kedaluwarsa</div>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
                        <div className="absolute bottom-4 right-16 w-20 h-20 rounded-full bg-white/10"></div>
                        <div className="absolute top-16 right-32 w-16 h-16 rounded-full bg-white/15"></div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari sertifikat atau pelatihan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                />
                            </div>
                            
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="valid">Valid</option>
                                <option value="expired">Kedaluwarsa</option>
                                <option value="revoked">Dicabut</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Certificates List */}
                <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {filteredCertificates.length} Sertifikat Ditemukan
                        </h2>
                    </div>

                    {filteredCertificates.length > 0 ? (
                        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                            {filteredCertificates.map((certificate, index) => {
                                const statusInfo = getCertificateStatus(certificate);
                                
                                return (
                                    <motion.div
                                        key={certificate.id}
                                        className={`bg-white rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 1.0 + (index * 0.1) }}
                                    >
                                        {/* Certificate Preview/Thumbnail */}
                                        <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-[4/3]'} bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 flex items-center justify-center`}>
                                            {certificate.course?.thumbnail ? (
                                                <img
                                                    src={`/storage/${certificate.course.thumbnail}`}
                                                    alt={certificate.course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                                                    <div className="text-xs text-gray-600 font-medium">CERTIFICATE</div>
                                                </div>
                                            )}
                                            
                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.status === 'valid' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {statusInfo.status === 'expired' && <Clock className="w-3 h-3 mr-1" />}
                                                    {statusInfo.status === 'revoked' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            {/* Certificate Number */}
                                            {certificate.certificate_number && (
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded text-center font-mono">
                                                        #{certificate.certificate_number}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Certificate Info */}
                                        <div className="p-6 flex-1">
                                            <div className="mb-4">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                                    {certificate.certificate_title || certificate.course?.title || 'Certificate'}
                                                </h3>
                                                {certificate.certificate_title && certificate.course?.title && (
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Pelatihan: {certificate.course.title}
                                                    </p>
                                                )}
                                                {certificate.course?.instructor && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Instructor: {certificate.course.instructor.first_name} {certificate.course.instructor.last_name}
                                                    </p>
                                                )}
                                                {certificate.grade && (
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Star className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            Grade: {certificate.grade}
                                                        </span>
                                                        {certificate.completion_percentage && (
                                                            <span className="text-sm text-gray-500">
                                                                ({certificate.completion_percentage}% completion)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Certificate Details */}
                                            <div className="space-y-2 mb-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Issued: {formatDate(certificate.issued_at)}</span>
                                                </div>
                                                {certificate.expires_at && (
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Expires: {formatDate(certificate.expires_at)}</span>
                                                    </div>
                                                )}
                                                {certificate.verification_code && (
                                                    <div className="flex items-center space-x-2">
                                                        <Shield className="w-4 h-4" />
                                                        <span>Verification: {certificate.verification_code.substring(0, 8)}...</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDownload(certificate)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                                                    title="Download Certificate"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Download</span>
                                                </button>
                                                
                                                
                                                <button
                                                    onClick={() => handleShare(certificate)}
                                                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                                    title="Share Certificate"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div 
                            className="text-center py-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {searchTerm || filterStatus !== 'all' ? 'Tidak ada sertifikat ditemukan' : 'Belum ada sertifikat'}
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'Coba sesuaikan kriteria pencarian atau filter Anda'
                                    : 'Selesaikan pelatihan untuk mendapatkan sertifikat pertama Anda'
                                }
                            </p>
                            <Link 
                                href="/student/browse-courses" 
                                className="bg-yellow-600 text-white px-8 py-3 rounded-xl hover:bg-yellow-700 transition-colors inline-flex items-center space-x-2"
                            >
                                <BookOpen className="w-5 h-5" />
                                <span>Jelajahi Pelatihan</span>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}