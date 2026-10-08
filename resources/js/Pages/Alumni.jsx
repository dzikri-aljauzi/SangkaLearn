import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppButton from '@/Components/WhatsAppButton';
import {
    GraduationCap,
    Trophy,
    Linkedin,
    ArrowRight,
    Quote,
    Building2,
    Briefcase
} from 'lucide-react';

export default function Alumni({ auth, alumni = [] }) {
    return (
        <>
            <Head title="Alumni - SangkaLearn" />

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
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span>Alumni SangkaLearn</span>
                                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 ml-2 sm:ml-3 text-yellow-500" />
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 px-2">
                                <span className="block sm:inline">Testimoni dari</span>
                                <span className="block mt-2 text-blue-600" style={{ lineHeight: '1.4', paddingBottom: '0.15em' }}>
                                    Alumni SangkaLearn
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-2">
                                Dengarkan pengalaman langsung dari para alumni yang telah mengikuti
                                <span className="text-blue-700 font-bold"> program pelatihan dan sertifikasi</span> di SangkaLearn
                            </p>
                        </div>
                    </div>
                </section>

                {/* Alumni Grid Section */}
                <section className="py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {alumni.length === 0 ? (
                            <div className="text-center py-20">
                                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Data Alumni</h3>
                                <p className="text-gray-500">Data alumni akan segera ditampilkan di sini.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {alumni.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                    >
                                        {/* Header */}
                                        <div className="bg-blue-600 p-6 text-center relative">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 bg-petrol-400 flex items-center justify-center">
                                                {item.photo ? (
                                                    <img
                                                        src={`/storage/${item.photo}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-bold text-2xl sm:text-3xl">
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{item.name}</h3>
                                            {item.job_title && (
                                                <p className="text-blue-100 text-sm flex items-center justify-center">
                                                    <Briefcase className="w-3 h-3 mr-1" />
                                                    {item.job_title}
                                                </p>
                                            )}
                                            {item.company && (
                                                <p className="text-blue-200 text-xs flex items-center justify-center mt-1">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {item.company}
                                                </p>
                                            )}
                                            <p className="text-yellow-300 text-xs mt-2 font-medium">{item.program}</p>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Testimonial */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                                                <Quote className="absolute top-2 left-2 w-6 h-6 text-blue-200" />
                                                <p className="text-gray-600 text-sm italic leading-relaxed pl-6">
                                                    "{item.testimonial}"
                                                </p>
                                            </div>

                                            {/* LinkedIn Link */}
                                            {item.linkedin_url && (
                                                <div className="flex items-center justify-center">
                                                    <a
                                                        href={item.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Linkedin className="w-4 h-4 mr-2" />
                                                        <span className="text-sm font-medium">LinkedIn Profile</span>
                                                    </a>
                                                </div>
                                            )}
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
                            Mulai Perjalanan Anda Bersama SangkaLearn
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Tingkatkan kompetensi dan raih sertifikasi profesional untuk mendukung karir Anda
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
                                href="/job-information"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300"
                            >
                                <span>Informasi Lowongan</span>
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
