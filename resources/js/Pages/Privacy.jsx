import React from 'react';
import { Head, Link } from '@inertiajs/react';
// import ChatbotWidget from '@/Components/ChatbotWidget'; // COMMENTED: Chatbot diganti dengan WhatsApp Button
import WhatsAppButton from '@/Components/WhatsAppButton';
import {
    Shield,
    Lock,
    Eye,
    CheckCircle,
    Star,
    ArrowLeft,
    Clock,
    Users,
    Database,
    AlertCircle,
    FileText,
    Globe,
    Settings
} from 'lucide-react';

export default function Privacy({ auth }) {
    return (
        <>
            <Head title="Kebijakan Privasi - SangkaLearn" />
            
            <div className="min-h-screen bg-blue-50 overflow-x-hidden">

                {/* Hero Section */}
                <section className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 relative overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 bg-petrol-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full opacity-30 animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-100 rounded-full text-green-700 font-bold shadow-lg text-sm sm:text-base">
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span>Perlindungan Data Pribadi</span>
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-2 sm:ml-3 text-blue-500" />
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight px-2">
                                <span className="block text-green-600">
                                    Kebijakan Privasi
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-2">
                                Komitmen kami dalam melindungi dan menjaga keamanan data pribadi Anda dengan standar keamanan tinggi
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link 
                                    href="/" 
                                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Kembali ke Beranda
                                </Link>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-12 sm:py-16 lg:py-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-8 sm:p-12 lg:p-16">
                            
                            {/* Quick Navigation */}
                            <div className="bg-green-50 rounded-xl p-6 mb-10">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                                    Daftar Isi
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                    <a href="#section-1" className="text-green-600 hover:text-green-800 transition-colors">1. Pengantar</a>
                                    <a href="#section-2" className="text-green-600 hover:text-green-800 transition-colors">2. Informasi yang Dikumpulkan</a>
                                    <a href="#section-3" className="text-green-600 hover:text-green-800 transition-colors">3. Penggunaan Informasi</a>
                                    <a href="#section-4" className="text-green-600 hover:text-green-800 transition-colors">4. Berbagi Informasi</a>
                                    <a href="#section-5" className="text-green-600 hover:text-green-800 transition-colors">5. Keamanan Data</a>
                                    <a href="#section-6" className="text-green-600 hover:text-green-800 transition-colors">6. Hak Pengguna</a>
                                </div>
                            </div>

                            {/* Security Promise */}
                            <div className="bg-green-600 rounded-xl p-8 text-white mb-10">
                                <div className="text-center">
                                    <Shield className="w-16 h-16 mx-auto mb-4 text-white" />
                                    <h3 className="text-2xl font-bold mb-4">Jaminan Keamanan Data</h3>
                                    <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                                        Kami menggunakan enkripsi tingkat militer dan standar keamanan internasional untuk melindungi setiap data pribadi Anda
                                    </p>
                                
                                </div>
                            </div>

                            {/* Content Sections */}
                            <div className="space-y-8">
                                
                                <section id="section-1" className="scroll-mt-20">
                                    <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                                            1. Pengantar
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi 
                                            informasi pribadi Anda saat menggunakan platform Learning Management System (LMS) kami. 
                                            Kami berkomitmen untuk melindungi privasi dan keamanan data Anda.
                                        </p>
                                    </div>
                                </section>

                                <section id="section-2" className="scroll-mt-20">
                                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Database className="w-6 h-6 mr-3 text-blue-600" />
                                            2. Informasi yang Kami Kumpulkan
                                        </h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informasi Pribadi</h3>
                                                <ul className="space-y-1 text-gray-700">
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Nama lengkap dan alamat email
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Nomor telepon dan foto profil 
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Informasi pembayaran dan transaksi
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Pembelajaran</h3>
                                                <ul className="space-y-1 text-gray-700">
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Progress pelatihan dan hasil evaluasi
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Interaksi dalam chat
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                        Sertifikat dan pencapaian
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section-3" className="scroll-mt-20">
                                    <div className="bg-sogan-50 rounded-xl p-6 border-l-4 border-petrol-600">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Settings className="w-6 h-6 mr-3 text-sogan-600" />
                                            3. Penggunaan Informasi
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Data yang kami kumpulkan digunakan untuk:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <Users className="w-8 h-8 text-blue-500 mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Layanan Pembelajaran</h4>
                                                <p className="text-sm text-gray-600">Menyediakan dan meningkatkan pengalaman belajar</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <Shield className="w-8 h-8 text-green-500 mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Keamanan Platform</h4>
                                                <p className="text-sm text-gray-600">Mencegah penyalahgunaan dan aktivitas berbahaya</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section-4" className="scroll-mt-20">
                                    <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
                                            4. Berbagi Informasi
                                        </h2>
                                        <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                                            <p className="text-red-800 font-semibold">
                                                ⚠️ Kami TIDAK menjual atau menyewakan data pribadi Anda kepada pihak ketiga!
                                            </p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            Data hanya dibagikan dalam situasi terbatas: dengan persetujuan Anda, kepada penyedia layanan terpercaya, 
                                            atau untuk mematuhi kewajiban hukum.
                                        </p>
                                    </div>
                                </section>

                                <section id="section-5" className="scroll-mt-20">
                                    <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Lock className="w-6 h-6 mr-3 text-purple-600" />
                                            5. Keamanan Data
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                                                <Lock className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800">Enkripsi SSL</h4>
                                                <p className="text-sm text-gray-600 mt-1">Semua data dienkripsi saat transmisi</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                                                <Database className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800">Backup Aman</h4>
                                                <p className="text-sm text-gray-600 mt-1">Data di-backup secara teratur</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                                                <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800">Monitoring 24/7</h4>
                                                <p className="text-sm text-gray-600 mt-1">Pemantauan keamanan berkelanjutan</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="section-6" className="scroll-mt-20">
                                    <div className="bg-teal-50 rounded-xl p-6 border-l-4 border-teal-500">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Eye className="w-6 h-6 mr-3 text-teal-600" />
                                            6. Hak Pengguna
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Anda memiliki hak penuh atas data pribadi Anda:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                                <Eye className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Akses Data</h4>
                                                <p className="text-sm text-gray-600">Melihat data yang kami simpan</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                                <Settings className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Koreksi Data</h4>
                                                <p className="text-sm text-gray-600">Memperbaiki informasi yang salah</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Hapus Data</h4>
                                                <p className="text-sm text-gray-600">Meminta penghapusan data</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* Contact Section */}
                            <div className="mt-12 bg-green-600 rounded-xl p-8 text-white">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-4">Data Protection Officer</h3>
                                    <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                                        Tim khusus yang menangani perlindungan data pribadi dan siap membantu Anda dengan segala pertanyaan privasi
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                            <div className="text-sm font-semibold mb-1">Email</div>
                                            <div className="text-green-100">hello@sangkalearn.id</div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                            <div className="text-sm font-semibold mb-1">WhatsApp Support</div>
                                            <div className="text-green-100">+62 800-0000-0000</div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                            <div className="text-sm font-semibold mb-1">Response Time</div>
                                            <div className="text-green-100">Maksimal 24 Jam</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-petrol-900 text-white py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black mb-4">
                                <span className="text-blue-400">
                                    SangkaLearn
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                                Platform pembelajaran digital terdepan untuk membangun masa depan yang lebih cerah
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link 
                                    href="/" 
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href="/courses"
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Pelatihan
                                </Link>
                                <Link 
                                    href="/about" 
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Tentang Kami
                                </Link>
                                <Link 
                                    href="/terms" 
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Syarat & Ketentuan
                                </Link>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm">
                                © 2026 SangkaLearn. Semua hak cipta dilindungi.
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Chatbot Widget - COMMENTED: Diganti dengan WhatsApp Button */}
                {/* <ChatbotWidget /> */}

                {/* WhatsApp Button - Menggantikan Chatbot */}
                <WhatsAppButton />
            </div>
        </>
    )
}