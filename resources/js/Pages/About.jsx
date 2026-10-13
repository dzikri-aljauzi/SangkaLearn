import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
// import ChatbotWidget from '@/Components/ChatbotWidget'; // COMMENTED: Chatbot diganti dengan WhatsApp Button
import WhatsAppButton from '@/Components/WhatsAppButton';
import { 
    PlayCircle, 
    Users, 
    Award, 
    BookOpen, 
    Star, 
    ArrowRight,
    CheckCircle,
    Clock,
    Globe,
    TrendingUp,
    Zap,
    Target,
    Shield,
    Rocket,
    Building,
    Briefcase,
    GraduationCap,
    Trophy,
    Monitor,
    Smartphone,
    Brain,
    Database,
    Code,
    Headphones,
    Video,
    FileText,
    BarChart3,
    MessageSquare,
    Camera,
    Palette,
    Heart,
    MapPin,
    Mail,
    Phone,
    Send,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function About({ auth, stats = {}, flash = {} }) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        topic: '',
        message: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    return (
        <>
            <Head title="Tentang Kami - SangkaLearn" />
            
            <div className="min-h-screen bg-blue-50 overflow-x-visible">
                <Navbar auth={auth} />

                {/* Hero Section */}
                <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative overflow-visible">
                    {/* Background Decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 bg-petrol-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full opacity-30 animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-700 font-bold shadow-lg text-sm sm:text-base">
                                <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                <span className="hidden sm:inline">Cerita Tentang Kami</span>
                                <span className="sm:hidden">Tentang Kami</span>
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 ml-2 sm:ml-3 text-yellow-500" />
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 px-2 overflow-visible">
                                <span className="block sm:inline" style={{ lineHeight: '1.4' }}>Membangun Masa Depan</span>
                                <span className="block mt-2 text-blue-600" style={{ lineHeight: '1.4', paddingBottom: '0.15em' }}>
                                    Karier Profesional Indonesia
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-2">
                                Kami percaya bahwa setiap orang Indonesia berhak mendapatkan akses <span className="text-blue-700 font-bold">pendidikan bisnis digital berkualitas tinggi</span> untuk mengubah hidup mereka menjadi <span className="text-sogan-600 font-bold">lebih baik</span>
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow duration-300">
                                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-700">
                                        20,000+
                                    </div>
                                    <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Alumni Sukses</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow duration-300">
                                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-700">
                                        {stats.total_courses || 0}
                                    </div>
                                    <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Pelatihan Tersedia</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow duration-300">
                                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-700">
                                        {stats.total_students || 0}
                                    </div>
                                    <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Siswa Aktif</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-12 sm:py-16 lg:py-20 xl:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 px-2">
                                        Perjalanan Kami
                                    </h2>
                                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed px-2 text-justify">
                                        Dimulai pada tahun 2020 dengan visi sederhana: memberikan akses pendidikan bisnis digital terbaik untuk semua orang Indonesia. Kami melihat kesenjangan besar antara kebutuhan industri bisnis digital dengan keterampilan yang dimiliki para pekerja Indonesia.
                                    </p>
                                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed px-2 text-justify">
                                        Dengan tim yang terdiri dari praktisi industri, akademisi, dan teknolog berpengalaman, kami menciptakan platform pembelajaran yang tidak hanya memberikan pengetahuan, tetapi juga pengalaman praktis yang relevan dengan kebutuhan industri saat ini.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                    {[
                                        { number: '20,000+', label: 'Alumni Sukses' },
                                        { number: stats.total_courses || 0, label: 'Pelatihan Tersedia' },
                                        { number: stats.total_students || 0, label: 'Siswa Aktif' }
                                    ].map((stat, index) => (
                                        <div key={index} className="text-center lg:text-left">
                                            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-600 mb-1 sm:mb-2">
                                                {stat.number}
                                            </div>
                                            <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 transform rotate-1 sm:rotate-2 hover:rotate-0 transition-all duration-500">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto">
                                            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">Misi Kami</h3>
                                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-justify">
                                                "Menjadi katalisator transformasi bisnis digital Indonesia melalui pendidikan berkualitas yang accessible, affordable, dan actionable untuk semua kalangan."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-petrol-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                                    <Star className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Video Section */}
                <section className="py-12 sm:py-16 lg:py-20 xl:py-32 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Demo Platform
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Video Demo Platform SangkaLearn
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                                Panduan Lengkap - Saksikan bagaimana platform kami bekerja dalam mendukung pembelajaran digital terdepan
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                                <div className="aspect-video">
                                    <video
                                        controls
                                        className="w-full h-full object-cover"
                                        poster="/images/video-thumbnail.jpg"
                                    >
                                        <source src="/storage/videos/demo_dashboard.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                    🎥 Demo Lengkap
                                </div>
                            </div>

                            {/* Video Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
                                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <PlayCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Interface Tour</h4>
                                    <p className="text-gray-600 text-sm">Panduan lengkap navigasi platform</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Fitur Utama</h4>
                                    <p className="text-gray-600 text-sm">Demonstrasi semua fitur unggulan</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-12 h-12 bg-sogan-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Trophy className="w-6 h-6 text-sogan-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Best Practices</h4>
                                    <p className="text-gray-600 text-sm">Tips maksimalkan penggunaan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="py-12 sm:py-16 lg:py-20 bg-blue-600 relative overflow-visible">
                    <div className="absolute inset-0">
                        <div 
                            className="absolute top-0 left-0 w-full h-full opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 sm:mb-6 px-2">
                                Nilai-Nilai Kami
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto px-2">
                                Prinsip fundamental yang memandu setiap keputusan dan tindakan kami
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {[
                                { 
                                    icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />, 
                                    title: "Integritas", 
                                    desc: "Transparansi dan kejujuran dalam setiap aspek layanan kami" 
                                },
                                { 
                                    icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />, 
                                    title: "Inovasi", 
                                    desc: "Terus berinovasi menghadirkan metode pembelajaran terdepan" 
                                },
                                { 
                                    icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, 
                                    title: "Kolaborasi", 
                                    desc: "Membangun komunitas pembelajar yang saling mendukung" 
                                },
                                { 
                                    icon: <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />, 
                                    title: "Keunggulan", 
                                    desc: "Berkomitmen memberikan kualitas terbaik dalam setiap program" 
                                }
                            ].map((value, index) => (
                                <div 
                                    key={index}
                                    className="group bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-center"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-petrol-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-petrol-700/30 transition-all duration-300">
                                        <div className="text-white">
                                            {value.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{value.title}</h4>
                                    <p className="text-blue-100 leading-relaxed text-sm sm:text-base">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-12 sm:py-16 lg:py-20 xl:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Tim Visioner Kami
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                                Dipimpin oleh para ahli industri dengan pengalaman puluhan tahun
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {[
                                {
                                    name: "Raka Mahendra, S.T., M.M.",
                                    role: "CEO & Founder",
                                    bio: "Mantan konsultan manajemen dengan pengalaman memimpin program pelatihan korporat dan transformasi pembelajaran. (Profil contoh untuk demo)",
                                    photo: "/images/dummy/team-1.svg"
                                },
                                {
                                    name: "Dian Kusuma Wardani, M.M.",
                                    role: "Co-Founder & Director",
                                    bio: "Co-Founder dengan fokus pada pengembangan kurikulum, mutu pelatihan, dan kemitraan lembaga sertifikasi. (Profil contoh untuk demo)",
                                    photo: "/images/dummy/team-2.svg"
                                },
                                {
                                    name: "Laras Anindya Putri, M.Kom.",
                                    role: "CTO",
                                    bio: "Leader teknologi dan inovasi digital dengan latar belakang rekayasa perangkat lunak, berfokus pada platform pembelajaran berbasis AI. (Profil contoh untuk demo)",
                                    photo: "/images/dummy/team-3.svg"
                                },
                                {
                                    name: "Bima Aditya Pratama",
                                    role: "Tim Engineer",
                                    bio: "Developer full-stack dengan keahlian React, Laravel, dan sistem database, berdedikasi mengembangkan solusi teknologi pembelajaran. (Profil contoh untuk demo)",
                                    photo: "/images/dummy/team-4.svg"
                                }
                            ].map((member, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                >
                                    <div className="text-center">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300 ring-4 ring-blue-100">
                                            <img
                                                src={member.photo}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `<div class="w-full h-full bg-blue-500 flex items-center justify-center"><span class="text-white font-bold text-2xl">${member.name.charAt(0)}</span></div>`;
                                                }}
                                            />
                                        </div>
                                        <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2">{member.name}</h4>
                                        <p className="text-blue-600 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{member.role}</p>
                                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-justify">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-petrol-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight px-2">
                                        <span className="block sm:inline">Mari Berkolaborasi</span>
                                        <span className="block">Membangun Masa Depan</span>
                                    </h2>
                                    <p className="text-base sm:text-lg lg:text-xl text-petrol-300 leading-relaxed px-2">
                                        Kami selalu terbuka untuk kolaborasi, partnership, atau sekadar berbagi ide tentang masa depan pendidikan binsis digital Indonesia. Kantor Sangkala Technology:
                                    </p>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {[
                                        { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Jl. Contoh Raya No. 123, Jakarta 12345" },
                                        { icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6" />, text: "hello@sangkalearn.id" },
                                        { icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6" />, text: "021-0000-0000" }
                                    ].map((contact, index) => (
                                        <div key={index} className="flex items-center space-x-3 sm:space-x-4 text-white">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                {contact.icon}
                                            </div>
                                            <span className="text-base sm:text-lg font-semibold">{contact.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Hubungi Kami</h3>
                                        <p className="text-gray-600 text-sm sm:text-base">Kami akan merespon dalam 24 jam</p>
                                    </div>

                                    {/* Success Message */}
                                    {showSuccess && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-green-800 font-semibold text-sm">Pesan Berhasil Dikirim!</p>
                                                <p className="text-green-700 text-sm">Terima kasih telah menghubungi kami. Tim kami akan merespon dalam 24 jam.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {errors.message && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-red-800 font-semibold text-sm">Gagal Mengirim Pesan</p>
                                                <p className="text-red-700 text-sm">{errors.message}</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Nama Depan"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                                                    disabled={processing}
                                                />
                                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Nama Belakang"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                                    disabled={processing}
                                                />
                                                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={processing}
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <select
                                                value={data.topic}
                                                onChange={(e) => setData('topic', e.target.value)}
                                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${errors.topic ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={processing}
                                            >
                                                <option value="">Pilih Topik</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Media Inquiry">Media Inquiry</option>
                                                <option value="Career">Career</option>
                                                <option value="Pelatihan">Pelatihan & Sertifikasi</option>
                                                <option value="Technical Support">Technical Support</option>
                                                <option value="General">General</option>
                                            </select>
                                            {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Pesan Anda"
                                                rows="4"
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={processing}
                                            ></textarea>
                                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 text-sm sm:text-base flex items-center justify-center space-x-2 ${
                                                processing
                                                    ? 'opacity-75 cursor-not-allowed'
                                                    : 'hover:shadow-lg transform hover:scale-105'
                                            }`}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Mengirim...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Kirim Pesan</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
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
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base text-justify">
                                    Membangun masa depan bisnis digital Indonesia melalui pendidikan berkualitas tinggi dan transformasi pembelajaran yang inovatif dengan teknologi terdepan.
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
                                    title: "Platform",
                                    links: [
                                        { label: "Semua Pelatihan", href: "/courses" },
                                        { label: "Fitur Platform", href: "/features" }
                                    ]
                                },
                                {
                                    title: "Akun",
                                    links: [
                                        { label: "Masuk", href: "/login" },
                                        { label: "Daftar", href: "/register" },
                                        { label: "Dashboard", href: "/dashboard" }
                                    ]
                                },
                                {
                                    title: "Informasi",
                                    links: [
                                        { label: "Tentang Kami", href: "/about" },
                                        { label: "Syarat & Ketentuan", href: "/terms" },
                                        { label: "Kebijakan Privasi", href: "/privacy" }
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