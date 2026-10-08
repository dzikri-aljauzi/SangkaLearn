import React from 'react';
import { Head, Link } from '@inertiajs/react';
// import ChatbotWidget from '@/Components/ChatbotWidget'; // COMMENTED: Chatbot diganti dengan WhatsApp Button
import WhatsAppButton from '@/Components/WhatsAppButton';
import {
    Shield,
    FileText,
    Scale,
    CheckCircle,
    Star,
    ArrowLeft,
    Clock,
    Users,
    Lock,
    AlertTriangle
} from 'lucide-react';

export default function Terms({ auth }) {
    return (
        <>
            <Head title="Syarat & Ketentuan - SangkaLearn" />
            
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
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-700 font-bold shadow-lg text-sm sm:text-base">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span>Kebijakan & Aturan</span>
                                <Scale className="w-3 h-3 sm:w-4 sm:h-4 ml-2 sm:ml-3 text-yellow-500" />
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight px-2">
                                <span className="block text-blue-600">
                                    Syarat & Ketentuan
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-2">
                                Ketentuan penggunaan platform pembelajaran digital yang perlu Anda pahami sebelum bergabung dengan kami
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
                            <div className="bg-blue-50 rounded-xl p-6 mb-10">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Daftar Isi
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <a href="#section-1" className="text-blue-600 hover:text-blue-800 transition-colors">1. Penerimaan Syarat</a>
                                    <a href="#section-2" className="text-blue-600 hover:text-blue-800 transition-colors">2. Definisi Layanan</a>
                                    <a href="#section-3" className="text-blue-600 hover:text-blue-800 transition-colors">3. Akun Pengguna</a>
                                    <a href="#section-4" className="text-blue-600 hover:text-blue-800 transition-colors">4. Pembayaran & Pengembalian</a>
                                    <a href="#section-5" className="text-blue-600 hover:text-blue-800 transition-colors">5. Hak Kekayaan Intelektual</a>
                                    <a href="#section-6" className="text-blue-600 hover:text-blue-800 transition-colors">6. Perilaku Pengguna</a>
                                </div>
                            </div>

                            <div className="space-y-10">
                            
                                <section id="section-1" className="scroll-mt-20">
                                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500 mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
                                            1. Penerimaan Syarat
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            Dengan mengakses dan menggunakan platform Learning Management System (LMS) ini, 
                                            Anda menyetujui untuk terikat oleh syarat dan ketentuan yang tercantum di bawah ini. 
                                            Jika Anda tidak setuju dengan syarat ini, mohon untuk tidak menggunakan layanan kami.
                                        </p>
                                    </div>
                                </section>

                                <section id="section-2" className="scroll-mt-20">
                                    <div className="bg-sogan-50 rounded-xl p-6 border-l-4 border-petrol-600 mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Users className="w-6 h-6 mr-3 text-sogan-600" />
                                            2. Definisi Layanan
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            LMS kami menyediakan platform pembelajaran online yang memungkinkan pengguna untuk:
                                        </p>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                Mengakses pelatihan dan materi pembelajaran berkualitas tinggi
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                Berinteraksi dengan instruktur expert
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                Mengikuti quiz interaktif dan tugas praktis
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                Memperoleh sertifikat setelah menyelesaikan pelatihan
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <section id="section-3" className="scroll-mt-20">
                                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500 mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <Lock className="w-6 h-6 mr-3 text-blue-600" />
                                            3. Akun Pengguna
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            Untuk menggunakan layanan kami, Anda perlu membuat akun dengan menyediakan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk:
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <Shield className="w-8 h-8 text-blue-500 mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Keamanan Login</h4>
                                                <p className="text-sm text-gray-600">Menjaga kerahasiaan informasi login Anda</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Penggunaan Bertanggung Jawab</h4>
                                                <p className="text-sm text-gray-600">Menggunakan akun sesuai dengan ketentuan</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
                                                <h4 className="font-semibold text-gray-800 mb-2">Pelaporan Masalah</h4>
                                                <p className="text-sm text-gray-600">Memberitahu jika ada penggunaan tidak sah</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    4. Pembayaran dan Pengembalian Dana
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Untuk kursus:
                                </p>
                                <ul className="list-disc pl-6 text-gray-700 mb-4">
                                    <li>Pembayaran harus dilakukan sepenuhnya sebelum mengakses kursus</li>
                                    <li>Tidak ada pengembalian dana ketika sudah melakukan pembayaran kursus</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    5. Hak Kekayaan Intelektual
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Semua konten dalam platform ini, termasuk tetapi tidak terbatas pada teks, gambar, video, 
                                    dan materi pembelajaran lainnya, adalah milik kami atau pemberi lisensi. Pengguna dilarang:
                                </p>
                                <ul className="list-disc pl-6 text-gray-700 mb-4">
                                    <li>Menyalin, mendistribusikan, atau menggunakan konten untuk tujuan komersial</li>
                                    <li>Memodifikasi atau membuat karya turunan dari konten</li>
                                    <li>Menghapus atau mengubah tanda hak cipta</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    6. Perilaku Pengguna
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Pengguna diharapkan untuk berperilaku dengan hormat dan profesional. Tindakan berikut dilarang:
                                </p>
                                <ul className="list-disc pl-6 text-gray-700 mb-4">
                                    <li>Menggunakan bahasa yang kasar, ofensif, atau diskriminatif</li>
                                    <li>Melakukan spam atau mengirim konten yang tidak relevan</li>
                                    <li>Berbagi informasi palsu atau menyesatkan</li>
                                    <li>Melanggar privasi pengguna lain</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    7. Pembatasan Tanggung Jawab
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Kami menyediakan layanan "sebagaimana adanya" dan tidak memberikan jaminan bahwa layanan akan:
                                </p>
                                <ul className="list-disc pl-6 text-gray-700 mb-4">
                                    <li>Selalu tersedia atau bebas dari kesalahan</li>
                                    <li>Memenuhi kebutuhan spesifik Anda</li>
                                    <li>Bebas dari virus atau komponen berbahaya lainnya</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    8. Perubahan Syarat
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. 
                                    Perubahan akan diberitahukan melalui platform atau email. 
                                    Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui syarat yang baru.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    9. Penghentian Layanan
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Kami dapat menghentikan atau menangguhkan akun Anda jika Anda melanggar syarat dan ketentuan ini. 
                                    Anda juga dapat menghentikan akun Anda kapan saja dengan menghubungi dukungan pelanggan.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    10. Kontak
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami:
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">Email: leadership.nasional@gmail.com</p>
                                    <p className="text-gray-700">Telepon: 021-29538817</p>
                                    <p className="text-gray-700">Alamat: Pondok Indah Office Tower 3, Lt. 17, Jl. Sultan Iskandar Muda Kavling V-TA Pondok Indah, Jakarta 12310</p>
                                </div>
                            </section>
                            </div>
                            
                            {/* Contact Section */}
                            <div className="mt-12 bg-blue-600 rounded-xl p-8 text-white">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-4">Butuh Bantuan?</h3>
                                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                        Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, jangan ragu untuk menghubungi tim support kami
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                            <div className="text-sm font-semibold mb-1">Email Support</div>
                                            <div className="text-blue-100">leadership.nasional@gmail.com</div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                                            <div className="text-sm font-semibold mb-1">WhatsApp</div>
                                            <div className="text-blue-100">+62 822-6000-7045</div>
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
                                    Kursus
                                </Link>
                                <Link 
                                    href="/about" 
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Tentang Kami
                                </Link>
                                <Link 
                                    href="/privacy" 
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                                >
                                    Kebijakan Privasi
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