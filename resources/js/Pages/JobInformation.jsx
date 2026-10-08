import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppButton from '@/Components/WhatsAppButton';
import {
    Briefcase,
    Building2,
    MapPin,
    Clock,
    Search,
    ArrowRight,
    CheckCircle,
    GraduationCap,
    Calendar,
    ExternalLink
} from 'lucide-react';

export default function JobInformation({ auth, jobs = [], locations = [], filters = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    const jobTypes = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' },
    ];

    const handleFilter = () => {
        router.get(route('job-information'), {
            location: selectedLocation,
            type: selectedType,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSelectedLocation('');
        setSelectedType('');
        router.get(route('job-information'), {}, { preserveState: true });
    };

    const filteredJobs = jobs.filter(job => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return job.title.toLowerCase().includes(query) ||
                   job.company.toLowerCase().includes(query) ||
                   job.location.toLowerCase().includes(query);
        }
        return true;
    });

    return (
        <>
            <Head title="Job Information - SangkaLearn" />

            <div className="min-h-screen bg-blue-50 overflow-x-hidden">
                <Navbar auth={auth} />

                {/* Hero Section */}
                <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-blue-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-24 h-24 sm:w-40 sm:h-40 bg-petrol-400 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-700 font-bold shadow-lg text-sm sm:text-base">
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span>Job Information</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 px-2">
                                <span className="block sm:inline">Informasi</span>
                                <span className="block mt-2 text-blue-600" style={{ lineHeight: '1.4', paddingBottom: '0.15em' }}>
                                    Lowongan Kerja
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-2">
                                Temukan <span className="text-blue-700 font-bold">peluang karir</span> dari berbagai perusahaan
                                yang bekerja sama dengan SangkaLearn
                            </p>
                        </div>
                    </div>
                </section>

                {/* Search & Filter Section */}
                <section className="py-8 bg-white/50 backdrop-blur-sm border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari posisi atau perusahaan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-end w-full lg:w-auto">
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm flex-1 lg:flex-none min-w-[150px]"
                                >
                                    <option value="">Semua Lokasi</option>
                                    {locations.map((loc, index) => (
                                        <option key={index} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm flex-1 lg:flex-none min-w-[150px]"
                                >
                                    <option value="">Semua Tipe</option>
                                    {jobTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Filter
                                </button>
                                {(selectedLocation || selectedType) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Job Listings Section */}
                <section className="py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Lowongan Tersedia</h2>
                                <p className="text-gray-600 mt-1">Menampilkan {filteredJobs.length} lowongan</p>
                            </div>
                        </div>

                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Lowongan</h3>
                                <p className="text-gray-500">
                                    {jobs.length === 0
                                        ? 'Belum ada lowongan yang tersedia saat ini.'
                                        : 'Tidak ada lowongan yang sesuai dengan filter Anda.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-200"
                                    >
                                        <div className="p-6 sm:p-8">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                                {/* Company Logo */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-blue-100 flex items-center justify-center">
                                                        {job.company_logo ? (
                                                            <img src={`/storage/${job.company_logo}`} alt={job.company} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Job Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            job.type === 'full-time' ? 'bg-blue-100 text-blue-800' :
                                                            job.type === 'part-time' ? 'bg-sogan-50 text-sogan-700' :
                                                            job.type === 'contract' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {job.type === 'full-time' ? 'Full-time' :
                                                             job.type === 'part-time' ? 'Part-time' :
                                                             job.type === 'contract' ? 'Contract' : 'Internship'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                        {job.title}
                                                    </h3>

                                                    <p className="text-gray-700 font-semibold mb-3">{job.company}</p>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                            {job.location}
                                                        </div>
                                                        {job.deadline && (
                                                            <div className="flex items-center text-red-600 font-semibold">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                Deadline: {new Date(job.deadline).toLocaleDateString('id-ID')}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Requirements Preview */}
                                                    {job.requirements && job.requirements.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Persyaratan:</p>
                                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                                                {job.requirements.slice(0, 4).map((req, index) => (
                                                                    <li key={index} className="flex items-start text-sm text-gray-600">
                                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                                                        <span>{req}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {job.description && (
                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                                                    )}

                                                    <div className="flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                                        {job.apply_url ? (
                                                            <a
                                                                href={job.apply_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                                            >
                                                                <span>Lamar Sekarang</span>
                                                                <ExternalLink className="w-4 h-4 ml-2" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-gray-500 italic">
                                                                Hubungi perusahaan untuk melamar
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-blue-600">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-6">
                            Tingkatkan Peluang Karir Anda
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Ikuti pelatihan dan sertifikasi untuk meningkatkan kualifikasi dan daya saing Anda di dunia kerja
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/courses"
                                className="inline-flex items-center justify-center px-8 py-4 bg-petrol-600 text-white rounded-xl font-bold hover:bg-petrol-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Lihat Pelatihan
                            </Link>
                            <Link
                                href="/alumni"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300"
                            >
                                <span>Lihat Alumni</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-petrol-900 text-white py-12 sm:py-16 lg:py-20 relative">
                    <div className="absolute inset-0 bg-petrol-900"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                            <div className="space-y-4 sm:space-y-6 col-span-1 sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center">
                                    <ApplicationLogo variant="dark"
                                        className="h-16 sm:h-20 lg:h-24 w-auto"
                                        width="200"
                                        height="64"
                                    />
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                    Membangun masa depan digital Indonesia melalui pendidikan berkualitas tinggi dan transformasi pembelajaran yang inovatif dengan teknologi terdepan.
                                </p>
                            </div>

                            {[
                                {
                                    title: 'Platform',
                                    links: [
                                        { label: 'Semua Pelatihan', href: '/courses' },
                                        { label: 'Fitur Platform', href: '/features' }
                                    ]
                                },
                                {
                                    title: 'Komunitas',
                                    links: [
                                        { label: 'Alumni', href: '/alumni' },
                                        { label: 'Job Information', href: '/job-information' }
                                    ]
                                },
                                {
                                    title: 'Informasi',
                                    links: [
                                        { label: 'Tentang Kami', href: '/about' },
                                        { label: 'Syarat & Ketentuan', href: '/terms' },
                                        { label: 'Kebijakan Privasi', href: '/privacy' }
                                    ]
                                }
                            ].map((column, index) => (
                                <div key={index} className="space-y-4">
                                    <h4 className="font-black text-base sm:text-lg text-blue-400">{column.title}</h4>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {column.links.map((link, linkIndex) => (
                                            <li key={linkIndex}>
                                                <a
                                                    href={link.href}
                                                    className="text-gray-300 hover:text-sogan-200 transition-colors duration-300 font-medium text-sm sm:text-base"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 sm:pt-8">
                            <div className="text-center text-gray-400 space-y-2">
                                <p className="font-semibold text-sm sm:text-base">
                                    © 2026 SangkaLearn. All Rights Reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>

                <WhatsAppButton />
            </div>
        </>
    );
}
