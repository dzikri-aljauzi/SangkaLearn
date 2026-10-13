import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PartnerCarousel from '@/Components/PartnerCarousel';
import LSPCarousel from '@/Components/LSPCarousel';
// import ChatbotWidget from '@/Components/ChatbotWidget'; // COMMENTED: Chatbot diganti dengan WhatsApp Button
import WhatsAppButton from '@/Components/WhatsAppButton';
import {
    PlayCircle,
    Users,
    Award,
    BookOpen,
    ArrowRight,
    CheckCircle,
    Globe,
    TrendingUp,
    Zap,
    Target,
    Shield,
    Rocket,
    Trophy,
    Monitor,
    Smartphone,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Building2,
    GraduationCap,
    Camera,
    Image
} from 'lucide-react';

export default function Welcome({ auth, stats = {}, targetCategories = [] }) {
    // State for active target category tab
    const [activeTargetCategory, setActiveTargetCategory] = useState(
        targetCategories && targetCategories.length > 0 ? targetCategories[0]?.slug : null
    );
    // Static content data
    const staticContent = {
        gallery: [
            {
                title: 'Workshop Budaya Risiko dan Kepatuhan untuk Bank Arunika',
                image: '/images/1.png'
            },
            {
                title: 'Paparan Investasi Karbon Berkelanjutan untuk Yayasan Hijau Nusantara',
                image: '/images/2.png'
            },
            {
                title: 'Workshop Turn Around Business untuk BPR Sekar Mulia',
                image: '/images/3.png'
            },
            {
                title: 'Sertifikasi Manajemen Risiko Level 1 di Makassar',
                image: '/images/4.png'
            },
            {
                title: 'Penentuan Industri Unggulan dan Efisiensi Portofolio untuk Bank Lintang',
                image: '/images/5.png'
            },
            {
                title: 'Blueprint Manajemen Risiko Bersama Bank Wiyata',
                image: '/images/6.png'
            },
            {
                title: 'Workshop Manajemen Risiko TI di Bank Arunika',
                image: '/images/7.png'
            },
            {
                title: 'Internalisasi Budaya, Tata Kelola, dan Pengendalian Internal Bersama Bank Wiyata',
                image: '/images/8.png'
            },
            {
                title: 'Peningkatan Fungsi Manajemen Risiko Menuju Enterprise Risk Management Bersama Bank Lintang',
                image: '/images/9.png'
            },
            {
                title: 'Workshop Optimalisasi Pengelolaan Risiko untuk Daya Saing Bank Lintang dan Mitranya',
                image: '/images/10.png'
            },
            {
                title: 'Pelatihan Manajemen Risiko Teknologi Digital untuk Bank Lintang',
                image: '/images/11.jpeg'
            },
            {
                title: 'Pelatihan Pembekalan Sertifikasi Manajemen Risiko Level 1',
                image: '/images/12.png'
            },
            {
                title: 'Pelatihan dan Uji Sertifikasi Manajemen Risiko Level 2 Bersama Bank Candrakala',
                image: '/images/13.png'
            },
            {
                title: 'Workshop Business Judgement Rule Bank Samudra Raya dan Bank Kirana',
                image: '/images/14.jpeg'
            },
            {
                title: 'Risk Management Refreshment Training Bersama Bank Lintang',
                image: '/images/15.png'
            },
            {
                title: 'Persiapan Sertifikasi Manajemen Risiko Jenjang 7 Bersama Bank Wiyata',
                image: '/images/16.png'
            },
            {
                title: 'Pelatihan dan Sertifikasi GRC Eksekutif Bersama LSP Mandala Risiko',
                image: '/images/17.png'
            },
            {
                title: 'Sertifikasi SDM untuk Divisi SDM (Kadiv, Manajer, Supervisor) Bersama LSP Mahardika SDM',
                image: '/images/18.png'
            },
            {
                title: 'Pelatihan Masa Persiapan Pensiun (MPP 40) Bank Wiyata',
                image: '/images/19.png'
            },
            {
                title: 'Sertifikasi GRC untuk Eksekutif dan Dewan Komisaris Mitra Perbankan',
                image: '/images/20.png'
            },
            {
                title: 'Climate Risk Management System untuk Analis Kredit Bank Arunika',
                image: '/images/21.jpeg'
            },
            {
                title: 'Risk Leadership Assessment untuk Calon Kepala Divisi Bank Arunika',
                image: '/images/22.jpeg'
            },
            {
                title: 'Workshop Strategi ESG untuk Bank Sekar Syariah',
                image: '/images/23.jpeg'
            },
            {
                title: 'Pelatihan GRC dan Business Judgement Rule untuk Aerotek Nusantara Group',
                image: '/images/24.jpeg'
            }
        ],
        features: {
            items: [
                {
                    title: 'Learning Management System Terpadu',
                    description: 'Platform all-in-one untuk pembelajaran, assessment, dan tracking progress yang seamless'
                },
                {
                    title: 'Mentor Berpengalaman',
                    description: 'Belajar langsung dari praktisi industri dengan track record terbukti'
                },
                {
                    title: 'Sertifikat Terakreditasi',
                    description: 'Dapatkan sertifikat yang diakui industri dan tingkatkan value di market'
                },
                {
                    title: '24/7 Lifetime Access',
                    description: 'Belajar kapan saja, dimana saja dengan akses seumur hidup ke materi course tertentu'
                },
                {
                    title: 'Mobile-First Design',
                    description: 'Optimized untuk semua device - desktop, tablet, dan smartphone'
                },
                {
                    title: 'Career Development',
                    description: 'Program mentoring karir dan job information untuk alumni'
                }
            ]
        },
        faq: {
            questions: [
                {
                    question: 'Apa itu SangkaLearn Learning Management System?',
                    answer: 'SangkaLearn adalah platform pembelajaran online komprehensif yang menyediakan pelatihan premium, mentoring ahli, dan program pengembangan karir. Kami membantu profesional transformasi karir mereka melalui pembelajaran bisnis digital dengan sertifikasi yang diakui industri. Dalam menghadapi disrupsi digital,ketahanan dan daya saing organisasi bergantung pada kualitas Sumber Daya Manusia. SangkaLearn hadir sebagai mitra strategis Anda untuk membangun talenta digital yang tidak hanya paham teori, tetapi juga mampu menerapkan  hasil pembelajaran yang langsung meningkatkan kinerja institusi. Kami menyediakan kurikulum komprehensif yang dirancang oleh pakar industri dan akademisi, menjawab tantangan spesifik di berbagai sektor Bisnis Digital mulai dari Digital Banking, AI For Business, IT GRC, Digital Risk Management, Digital ESG, Blockchain, Aset Digital, Marketing Digital, Budaya Digital, hingga Strategi Transformasi Digital untuk berbagai perusahaan, BUMD, BUMN dan Pembangunan Pola Pikir (digital mindset) Kewirausahaan di lingkungan universitas. Dengan platform yang scalable dan andal, fokus kami adalah pada hasil yang terukur: peningkatan produktivitas, inovasi layanan, dan kesiapan SDM Digital dalam menghadapi masa depan.'
                },
                {
                    question: 'Bagaimana cara akses pelatihan setelah daftar?',
                    answer: 'Setelah pendaftaran dan pembayaran berhasil, Anda akan dapat akses instan ke pelatihan melalui platform kami. Anda bisa akses materi 24 jam sehari dari perangkat apa pun. Semua progress otomatis disimpan dan sinkronisasi antar perangkat.'
                },
                {
                    question: 'Apakah sertifikat diakui industri?',
                    answer: 'Ya, sertifikat kami terakreditasi dan diakui oleh partner industri. Kami juga menyediakan sertifikat BNSP untuk program tertentu, yang sangat dihargai oleh perusahaan di Indonesia.'
                },
                {
                    question: 'Apakah ada contoh pelatihan yang sering digunakan oleh industri?',
                    answer: '1. Pembekalan sertifikasi Manajemen Risiko Jenjang 4 untuk bank umum \n2. ⁠Pembekalan Sertifikasi manajemen Riaiko jenjang 4 LSPKS untuk syariah\n3. ⁠CHRO (Certified Human Resource  Operasional ) bagi yang ingin berkarir dibagian SDM untuk semua industri \n4. ⁠CRO (certified risk operasional) bagi yang ingin mendalami manajemen risiko ERM untuk semua industri'
                },
                {
                    question: 'Dukungan apa saja yang tersedia selama proses belajar?',
                    answer: 'Kami menyediakan dukungan komprehensif termasuk technical support 24 jam, sesi zoom dengan ahli industri, forum diskusi, dan career guidance. Tim support kami selalu siap membantu kesuksesan perjalanan belajar Anda.'
                },
                {
                    question: 'Apakah ada bantuan job information setelah selesai pelatihan?',
                    answer: 'Ya, kami menawarkan job information dan program career development untuk alumni. Ini termasuk kesempatan magang dengan persyaratan tertentu dan networking opportunity dengan partner industri kami.'
                },
                {
                    question: 'Bisakah saya belajar sesuai pace sendiri?',
                    answer: 'Tentu saja! Platform kami dirancang untuk pembelajaran yang fleksibel. Anda bisa akses pelatihan kapan saja, belajar sesuai kecepatan sendiri, dan mengulang materi sebanyak yang diperlukan. Dengan lifetime access, Anda bisa terus belajar bahkan setelah menyelesaikan pelatihan.'
                },
                {
                    question: 'Bagaimana prosedur lengkap pendaftaran umum di platform SangkaLearn?',
                    answer: 'Prosedur pendaftaran umum di SangkaLearn sangat mudah dan dapat diselesaikan dalam beberapa langkah: 1) Kunjungi halaman utama SangkaLearn dan klik tombol "Daftar Sekarang" yang berwarna petrol, 2) Isi formulir pendaftaran dengan lengkap mencakup nama lengkap (akan dipecah menjadi nama depan dan belakang), alamat email yang valid, dan kata sandi yang kuat sesuai dengan konfirmasi kata sandi, 3) Sistem akan otomatis mengirimkan kode verifikasi 6 digit ke email yang Anda daftarkan dalam waktu maksimal 15 menit, 4) Masukkan kode verifikasi tersebut untuk memverifikasi kepemilikan email Anda, 5) Setelah verifikasi berhasil, akun Anda akan aktif dengan status "student" secara otomatis, 6) Anda akan diarahkan ke dashboard pribadi dan dapat mulai menjelajahi pelatihan yang tersedia. Zona waktu default adalah Asia/Jakarta dan bahasa Indonesia sebagai pengaturan awal.'
                },
                {
                    question: 'Bagaimana prosedur penggunaan platform untuk pengguna khusus dan apa perbedaannya dengan pengguna umum?',
                    answer: 'Platform SangkaLearn memiliki sistem pengguna berlapis dengan hak akses yang berbeda-beda: PENGGUNA UMUM (Siswa Reguler): Dapat mendaftar sendiri melalui website, mengakses semua pelatihan publik secara gratis, membeli dan mengikuti pelatihan berbayar, mendapat sertifikat setelah menyelesaikan pelatihan, dan mengelola profil pribadi mereka. PENGGUNA KHUSUS (Siswa Spesial): Didaftarkan langsung oleh administrator, memiliki akses otomatis ke pelatihan-pelatihan tertentu yang sudah ditentukan tanpa perlu membeli, dikelola oleh Sub Admin yang ditugaskan khusus, dapat mengikuti pelatihan privat yang tidak tersedia untuk umum, dan mendapat bimbingan personal dari Sub Admin. SUB ADMIN: Mengelola grup siswa spesial yang ditugaskan kepada mereka, memberikan akses pelatihan kepada siswa dalam grup mereka, memantau progress belajar siswa, dan melaporkan perkembangan kepada Admin utama. ADMIN UTAMA: Memiliki kontrol penuh atas platform, dapat mengelola semua pengguna dan pelatihan, mengatur akses pelatihan privat, menugaskan siswa kepada Sub Admin, dan mengelola sistem secara keseluruhan.'
                }
            ]
        },
        cta: {
            promo_features: [
                'Sertifikat Terakreditasi',
                'Job Information',
                'Career Support'
            ]
        }
    };
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <>
            <Head title="SangkaLearn - Platform Pembelajaran Digital Terdepan" />
            <meta name="description" content="Platform pembelajaran online terdepan untuk transformasi digital Indonesia" />
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes countUp {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            
            <div className="min-h-screen bg-blue-50 overflow-x-hidden">
                <Navbar auth={auth} />

                {/* Hero Section */}
                <section className="pt-24 sm:pt-28 lg:pt-32 xl:pt-36 pb-16 sm:pb-20 lg:pb-24 relative overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-blue-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-24 h-24 sm:w-40 sm:h-40 bg-petrol-400 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-20 h-20 sm:w-32 sm:h-32 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 relative">
                        <div className="grid lg:grid-cols-[1.3fr,0.9fr] gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-start">
                            {/* Left Column - Content */}
                            <div className="space-y-5 sm:space-y-6 lg:space-y-8 lg:pr-6">
                                {/* Badge */}
                                <div className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-100 rounded-full text-blue-700 font-bold shadow-md text-xs sm:text-sm">
                                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span>Platform Learning Digital Terdepan</span>
                                </div>

                                {/* Main Heading */}
                                <h1 className="text-[32px] sm:text-3xl md:text-4xl lg:text-[44px] xl:text-5xl font-black text-gray-900">

  {/* Judul utama */}
  <span className="block text-blue-600" style={{ lineHeight: '1.4', paddingBottom: '0.15em' }}>
    Transformasi Digital Dimulai dari Sini
  </span>

  {/* Subjudul */}
  <span className="block mt-1 text-gray-900 font-semibold
    text-[18px] sm:text-xl md:text-2xl lg:text-[28px] xl:text-3xl" style={{ lineHeight: '1.4', paddingBottom: '0.1em' }}>
    Wujudkan Daya Saing Bisnis Digital yang Unggul
  </span>

</h1>



                                {/* Description Card */}
                                <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-9 shadow-xl border border-blue-100/50 hover:shadow-2xl transition-shadow duration-300">
                                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-5 text-justify">
                                        <span className="font-bold text-blue-700">SangkaLearn</span> adalah <span className="font-semibold text-blue-600">Learning Management System (LMS)</span> platform terbaik berbasis Artificial Intelligence dengan konsep <span className="font-semibold text-sogan-600">hybrid dua arah</span> yaitu:
                                    </p>

                                    {/* Hybrid Methods */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-5">
                                        <div className="flex items-center space-x-3 bg-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-blue-200/30">
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                                <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-800 text-sm sm:text-base">Online Recording</span>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-sogan-50 rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-sogan-200/30">
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-petrol-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-800 text-sm sm:text-base">Interaktif Zoom Online</span>
                                        </div>
                                    </div>

                                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed text-justify">
                                        Platform pembelajaran <span className="font-semibold text-blue-700">pilihan terpercaya</span> bagi <span className="font-semibold text-sogan-600">Bank dan Lembaga Keuangan terkemuka</span>, <span className="font-semibold text-sogan-600">Universitas</span>, dan <span className="font-semibold text-sogan-600">BUMN</span> untuk membekali SDM dengan kompetensi digital (Digital Talent) yang berdampak nyata.
                                    </p>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 pt-2">
                                    <Link
                                        href="/login?ref=start-learning"
                                        className="group bg-blue-600 text-white px-6 sm:px-10 lg:px-12 py-3.5 sm:py-4 lg:py-5 rounded-2xl text-base sm:text-lg lg:text-xl font-bold hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <PlayCircle className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                                            <span>Mulai Belajar Sekarang</span>
                                            <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-petrol-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="group border-2 border-petrol-600 text-sogan-700 px-6 sm:px-10 lg:px-12 py-3.5 sm:py-4 lg:py-5 rounded-2xl text-base sm:text-lg lg:text-xl font-bold hover:bg-petrol-700 hover:text-white transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl"
                                    >
                                        <Trophy className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                                        <span>Lihat Fitur Unggulan</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column - Modern Stats Cards */}
                            <div className="lg:sticky lg:top-24 mt-8 lg:mt-0">
                                <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-5 sm:p-6 lg:p-8 animate-[fadeInUp_0.8s_ease-out]">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Statistik Platform</h3>
                                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs sm:text-sm text-gray-600 font-medium">Live</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                                        {/* Large Featured Card */}
                                        <div className="col-span-2 bg-blue-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl">
                                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                
                                            </div>
                                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1">20,000+</div>
                                            <div className="text-blue-100 font-medium text-sm sm:text-base">Alumni Sukses</div>
                                        </div>

                                        {/* Regular Cards */}
                                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sogan-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-sogan-600" />
                                                </div>
                                            </div>
                                            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-0.5 sm:mb-1">{stats.total_courses || 0}</div>
                                            <div className="text-gray-600 font-medium text-xs sm:text-sm">Pelatihan Tersedia</div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-0.5 sm:mb-1">{stats.total_students || 0}</div>
                                            <div className="text-gray-600 font-medium text-xs sm:text-sm">Siswa Aktif</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Courses by Target Category Section with Tabs */}
                {targetCategories && targetCategories.length > 0 && (
                    <section id="courses-by-category" className="py-12 sm:py-16 lg:py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-8 sm:mb-12">
                                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Pelatihan Unggulan
                                </div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                    Pelatihan Berdasarkan Target Peserta
                                </h2>
                                <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                                    Temukan pelatihan yang sesuai dengan kebutuhan Anda
                                </p>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex justify-center mb-8">
                                <div className="inline-flex flex-wrap justify-center gap-2 sm:gap-3 p-2 bg-gray-100 rounded-2xl">
                                    {targetCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveTargetCategory(category.slug)}
                                            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                                                activeTargetCategory === category.slug
                                                    ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                            }`}
                                            style={{
                                                borderLeft: activeTargetCategory === category.slug ? `4px solid ${category.color}` : 'none'
                                            }}
                                        >
                                            <div
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                {category.icon === 'academic-cap' && <GraduationCap className="w-4 h-4" />}
                                                {category.icon === 'building-library' && <Building2 className="w-4 h-4" />}
                                                {category.icon === 'building-office' && <Building2 className="w-4 h-4" />}
                                                {!['academic-cap', 'building-library', 'building-office'].includes(category.icon) && category.name.charAt(0)}
                                            </div>
                                            <span>{category.name}</span>
                                            {category.courses && category.courses.length > 0 && (
                                                <span className="hidden sm:inline-flex bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                                    {category.courses.length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Category Content */}
                            {targetCategories.map((category) => (
                                activeTargetCategory === category.slug && (
                                    <div key={category.id} className="animate-fadeIn">
                                        {/* Category Description */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {category.icon === 'academic-cap' && <GraduationCap className="w-6 h-6" />}
                                                    {category.icon === 'building-library' && <Building2 className="w-6 h-6" />}
                                                    {category.icon === 'building-office' && <Building2 className="w-6 h-6" />}
                                                    {!['academic-cap', 'building-library', 'building-office'].includes(category.icon) && category.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Pelatihan untuk {category.name}</h3>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-600">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/courses?target_category=${category.slug}`}
                                                className="hidden sm:inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                            >
                                                Lihat Semua
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>

                                        {/* Course Cards Grid */}
                                        {category.courses && category.courses.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {category.courses.map((course) => (
                                                    <div
                                                        key={course.id}
                                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="relative aspect-video">
                                                            <img
                                                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.svg'}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    e.target.src = '/images/course-placeholder.svg';
                                                                    e.target.onerror = null;
                                                                }}
                                                            />
                                                            {course.is_private && (
                                                                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                    <Building2 className="w-3 h-3 mr-1" />
                                                                    Khusus
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-5">
                                                            <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                                                {course.title}
                                                            </h4>
                                                            {course.instructor && (
                                                                <p className="text-sm text-gray-500 mb-3">
                                                                    by {course.instructor.name}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                                                                <Link
                                                                    href={`/courses-details/${course.slug}`}
                                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                                                >
                                                                    Lihat Detail
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500">Belum ada pelatihan untuk kategori ini</p>
                                            </div>
                                        )}

                                        {/* Mobile: Show All Link */}
                                        <div className="sm:hidden mt-6 text-center">
                                            <Link
                                                href={`/courses?target_category=${category.slug}`}
                                                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                                            >
                                                Lihat Semua Pelatihan {category.name}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>
                )}

                {/* About SangkaLearn Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Tentang SangkaLearn
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-6 sm:mb-8 px-2">
                                Dibangun oleh <span className="text-blue-600">Sangkala Technology</span>
                            </h2>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            {/* Main Description */}
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-start space-x-4 mb-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Training Provider Terkemuka di Indonesia</h3>
                                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-justify">
                                            SangkaLearn adalah produk dari Sangkala Technology, platform pelatihan dan sertifikasi profesional yang berfokus pada masa berlaku dan penanda waktu sertifikasi. Platform ini bekerja sama dengan LSP berlisensi BNSP untuk memberikan pelatihan berkualitas tinggi.
                                        </p>
                                    </div>
                                </div>

                                {/* LSP Certifications - Carousel */}
                                <div className="mt-6">
                                    <h4 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 flex items-center justify-center">
                                        <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                                        Terdaftar di LSP (Berlisensi BNSP)
                                    </h4>
                                    <LSPCarousel />
                                </div>
                            </div>

                            {/* Partners Section */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                                    Dipercaya oleh Mitra Terbaik
                                </h3>
                                <p className="text-gray-600 text-base sm:text-lg text-center">
                                    Bekerja sama dengan institusi keuangan dan pendidikan terkemuka di Indonesia
                                </p>
                            </div>

                            {/* Partner Carousel */}
                            <div className="bg-blue-50 rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                                <PartnerCarousel />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-sogan-50 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Fitur Unggulan Platform
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Mengapa Pilih Platform Kami?
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                                Dapatkan pengalaman pembelajaran bisnis digital terdepan dengan teknologi dan metodologi terbaru
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {staticContent.features.items.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-blue-300"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                        <div className="text-white">
                                            {index === 0 && <Monitor className="w-6 h-6 sm:w-8 sm:h-8" />}
                                            {index === 1 && <Users className="w-6 h-6 sm:w-8 sm:h-8" />}
                                            {index === 2 && <Award className="w-6 h-6 sm:w-8 sm:h-8" />}
                                            {index === 3 && <Globe className="w-6 h-6 sm:w-8 sm:h-8" />}
                                            {index === 4 && <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />}
                                            {index === 5 && <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />}
                                        </div>
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Documentation Gallery Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Dokumentasi Kegiatan
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Kegiatan & Pencapaian Kami
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                                Dokumentasi berbagai pelatihan, sertifikasi, dan kerjasama yang telah kami laksanakan
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {staticContent.gallery.map((item, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-300"
                                >
                                    {/* Image Container */}
                                    <div className="aspect-[4/3] overflow-hidden relative bg-blue-50">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Badge Number */}
                                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold shadow-lg">
                                            #{index + 1}
                                        </div>

                                        {/* Hover Overlay Title */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <p className="text-xs sm:text-sm font-semibold leading-snug line-clamp-3">
                                                {item.title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info Container */}
                                    <div className="p-3 sm:p-4">
                                        <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                FAQ
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                                Temukan jawaban untuk pertanyaan umum tentang Sistem Manajemen Pembelajaran kami
                            </p>
                        </div>

                        <div className="space-y-4">
                            {staticContent.faq.questions.map((faq, index) => {
                                const isOpen = openFaqIndex === index;
                                return (
                                    <div 
                                        key={index}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full px-6 py-4 sm:px-8 sm:py-6 text-left flex items-center justify-between hover:bg-blue-50 transition-colors duration-200"
                                        >
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 pr-4">
                                                {faq.question}
                                            </h3>
                                            {isOpen ? (
                                                <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-4 sm:px-8 sm:pb-6">
                                                <div className="border-t border-gray-100 pt-4 sm:pt-6">
                                                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-justify">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-blue-600 relative overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <div className="space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-bold shadow-lg text-sm sm:text-base">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
                                Bergabung dengan Ribuan Profesional
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight px-2">
                                <span className="block sm:inline">Wujudkan Impian Karir</span>
                                <span className="block text-yellow-400">Bisnis Digital Anda Hari Ini!</span>
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-2">
                                Investment terbaik adalah investment pada diri sendiri. Mulai journey transformasi karir Anda dengan 20,000+ alumni sukses lainnya
                            </p>
                            
                            {/* Enhanced CTA Buttons */}
                            {!auth?.user && (
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
                                    <Link
                                        href="/register"
                                        className="group bg-petrol-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center relative overflow-hidden w-full sm:w-auto"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                            <span className="hidden sm:inline">Mulai Belajar Gratis</span>
                                            <span className="sm:hidden">Daftar Gratis</span>
                                            <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                    <Link
                                        href="/courses"
                                        className="group border-2 border-white text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:bg-white hover:text-blue-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                                    >
                                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="hidden sm:inline">Jelajahi Pelatihan</span>
                                        <span className="sm:hidden">Lihat Pelatihan</span>
                                    </Link>
                                </div>
                            )}

                            {/* Special Offer */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 max-w-4xl mx-auto">
                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                    <h3 className="text-xl sm:text-2xl font-black text-white text-center sm:text-left">Promo Special Terbatas!</h3>
                                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                </div>
                                <p className="text-yellow-400 font-bold text-base sm:text-lg mb-4 text-center">
                                    🎉 Hemat 50% + Bonus Diskon Sertifikasi BNSP untuk 100 pendaftar pertama!
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base">
                                    {staticContent.cta.promo_features.map((feature, index) => {
                                        return (
                                            <div key={index} className="flex items-center justify-center space-x-2">
                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                                                <span className="text-blue-100">{feature}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                                <div className="flex space-x-3 sm:space-x-4">
                                    {['f', 't', 'yt', 'in'].map((social, idx) => (
                                        <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                                            <span className="text-white font-bold text-xs sm:text-sm">{social}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {[
                                {
                                    title: 'Platform',
                                    links: [
                                        { label: 'Semua Pelatihan', href: "/courses" },
                                        { label: 'Fitur Platform', href: "/features" },
                                    ]
                                },
                                {
                                    title: 'Akun',
                                    links: [
                                        { label: 'Masuk', href: "/login" },
                                        { label: 'Daftar', href: "/register" },
                                        { label: 'Dashboard', href: "/dashboard" }
                                    ]
                                },
                                {
                                    title: 'Informasi',
                                    links: [
                                        { label: 'Tentang Kami', href: "/about" },
                                        { label: 'Syarat & Ketentuan', href: "/terms" },
                                        { label: 'Kebijakan Privasi', href: "/privacy" }
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
                                                    className="text-gray-300 hover:text-sogan-200 transition-colors duration-300 font-medium hover:translate-x-1 transform transition-transform inline-block text-sm sm:text-base"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Powered by Section */}
                        <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 sm:pt-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <h4 className="text-gray-400 font-semibold text-base sm:text-lg mb-4 sm:mb-6">Didukung oleh:</h4>
                                <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-8">
                                    <div className="group">
                                        <img
                                            src="/images/dummy/arunika-institute.svg"
                                            alt="Arunika Institute (logo contoh)"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/dummy/lintang-profesi.svg"
                                            alt="Lintang Profesi (logo contoh)"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/dummy/wiyata-digital.svg"
                                            alt="Wiyata Digital (logo contoh)"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/dummy/candrakala-labs.svg"
                                            alt="Candrakala Labs (logo contoh)"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center text-gray-400 space-y-2">
                                <p className="font-semibold text-sm sm:text-base">
                                    © 2026 SangkaLearn. All Rights Reserved.
                                </p>
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
    );
}