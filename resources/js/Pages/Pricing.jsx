import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
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
    Menu,
    X,
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
    Crown,
    Infinity
} from 'lucide-react';

export default function Pricing({ auth }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation items
    const navItems = [
        { label: 'Beranda', href: '/', id: 'home' },
        { label: 'Fitur', href: '/features', id: 'features' },
        { label: 'Pelatihan', href: '/courses', id: 'courses' },
        { label: 'Harga', href: '/pricing', id: 'pricing' },
        { label: 'Tentang', href: '/about', id: 'about' }
    ];

    return (
        <>
            <Head title="Harga & Paket - SangkaLearn" />
            
            <div className="min-h-screen bg-blue-50 overflow-x-hidden">
                {/* Header */}
                <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${
                    scrollY > 50 
                        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-blue-200/50' 
                        : 'bg-white/90 backdrop-blur-lg border-b border-blue-100/30'
                }`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-3 lg:py-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
                                <ApplicationLogo 
                                    className="h-12 lg:h-16 w-auto" 
                                    width="180" 
                                    height="56" 
                                />
                                <div className="hidden sm:block">
                                    <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-blue-600">
                                        SangkaLearn
                                    </h1>
                                    <p className="text-xs text-blue-600 font-bold tracking-wider opacity-80">
                                        BISNIS DIGITAL INDONESIA
                                    </p>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center">
                                <div className="flex items-center space-x-1 bg-blue-50/50 rounded-2xl p-1 border border-blue-100/50">
                                    {navItems.map((item) => {
                                        const isActive = (item.id === 'home' && url === '/') || 
                                                        (item.id === 'features' && url === '/features') ||
                                                        (item.id === 'courses' && url.startsWith('/courses')) ||
                                                        (item.id === 'pricing' && url === '/pricing') ||
                                                        (item.id === 'about' && url === '/about');
                                        
                                        return item.href.startsWith('#') ? (
                                            <a
                                                key={item.id}
                                                href={item.href}
                                                className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-white/60'
                                                }`}
                                            >
                                                {item.label}
                                                {isActive && (
                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                                )}
                                            </a>
                                        ) : (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-white/60'
                                                }`}
                                            >
                                                {item.label}
                                                {isActive && (
                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>

                            {/* Auth Buttons */}
                            <div className="hidden lg:flex items-center space-x-3">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="group bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-gray-700 hover:text-blue-600 font-bold text-sm transition-all duration-300 px-4 py-2 rounded-xl hover:bg-blue-50"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="group bg-petrol-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center">
                                                <Rocket className="w-4 h-4 mr-2" />
                                                Daftar Sekarang
                                            </span>
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden p-2.5 rounded-2xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 border border-blue-100"
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="lg:hidden py-4 border-t border-blue-100 bg-white/95 backdrop-blur-md rounded-b-2xl">
                                <div className="space-y-2">
                                    {navItems.map((item) => {
                                        const isActive = (item.id === 'home' && url === '/') || 
                                                        (item.id === 'features' && url === '/features') ||
                                                        (item.id === 'courses' && url.startsWith('/courses')) ||
                                                        (item.id === 'pricing' && url === '/pricing') ||
                                                        (item.id === 'about' && url === '/about');
                                        
                                        return item.href.startsWith('#') ? (
                                            <a
                                                key={item.id}
                                                href={item.href}
                                                className={`block px-4 py-3 mx-2 rounded-xl font-semibold transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={`block px-4 py-3 mx-2 rounded-xl font-semibold transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                    
                                    <div className="px-2 pt-4 space-y-2">
                                        {auth?.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-2xl text-center font-bold"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/login"
                                                    className="block w-full text-center text-gray-700 hover:text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors duration-300"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Masuk
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    className="block w-full bg-petrol-600 text-white px-6 py-3 rounded-2xl text-center font-bold"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Daftar Sekarang
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <section className="pt-32 pb-20 relative overflow-hidden">
                    {/* Background Decorations */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-20 left-10 w-24 h-24 bg-petrol-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-8">
                            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full text-blue-700 font-bold shadow-lg">
                                <Crown className="w-5 h-5 mr-3" />
                                Paket Berlangganan Premium
                                <Star className="w-4 h-4 ml-3 text-yellow-500" />
                            </div>
                            
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                                Pilih Paket Yang
                                <span className="block text-blue-600">
                                    Tepat Untuk Anda
                                </span>
                            </h1>
                            
                            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                                Dapatkan akses tak terbatas ke semua pelatihan premium dengan harga yang terjangkau. Mulai transformasi karir digital Anda hari ini!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pricing Plans */}
                <section className="py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Basic Plan */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-30 transform translate-x-16 -translate-y-16"></div>
                                
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Rocket className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Basic</h3>
                                    <p className="text-gray-600">Untuk pemula yang ingin memulai</p>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl font-black text-gray-900">Rp 99</span>
                                        <span className="text-xl text-gray-500 ml-2">/bulan</span>
                                    </div>
                                    <p className="text-gray-500 mt-2">Ditagih bulanan</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {[
                                        'Akses 50+ pelatihan dasar',
                                        'Video pembelajaran HD',
                                        'Sertifikat penyelesaian',
                                        'Forum diskusi',
                                        'Mobile app access'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/register"
                                    className="block w-full bg-blue-600 text-white text-center py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Mulai Basic
                                </Link>
                            </div>

                            {/* Pro Plan - Popular */}
                            <div className="bg-white rounded-3xl shadow-2xl border-2 border-petrol-400 p-8 relative overflow-hidden transform scale-105 hover:shadow-3xl transition-all duration-500 hover:-translate-y-3">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sogan-50 rounded-full opacity-40 transform translate-x-16 -translate-y-16"></div>
                                
                                {/* Popular Badge */}
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-petrol-400 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                        🔥 PALING POPULER
                                    </div>
                                </div>

                                <div className="text-center mb-8 mt-4">
                                    <div className="w-20 h-20 bg-petrol-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                        <Crown className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2">Pro</h3>
                                    <p className="text-gray-600">Untuk profesional yang serious</p>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-6xl font-black text-sogan-600">Rp 199</span>
                                        <span className="text-xl text-gray-500 ml-2">/bulan</span>
                                    </div>
                                    <p className="text-gray-500 mt-2">Hemat 20% dengan paket tahunan</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {[
                                        'Akses SEMUA pelatihan premium',
                                        'Video 4K + materials',
                                        'Sertifikat terverifikasi',
                                        'Live mentoring session',
                                        'Priority support',
                                        'Offline download',
                                        'Career guidance',
                                        'Networking events'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/register"
                                    className="block w-full bg-petrol-600 text-white text-center py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                >
                                    Pilih Pro - Best Value
                                </Link>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-30 transform translate-x-16 -translate-y-16"></div>
                                
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Building className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Enterprise</h3>
                                    <p className="text-gray-600">Untuk tim dan perusahaan</p>
                                </div>

                                <div className="text-center mb-8">
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl font-black text-gray-900">Rp 999</span>
                                        <span className="text-xl text-gray-500 ml-2">/bulan</span>
                                    </div>
                                    <p className="text-gray-500 mt-2">Untuk 10+ pengguna</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {[
                                        'Semua fitur Pro',
                                        'Custom learning path',
                                        'Team analytics & reports',
                                        'Dedicated account manager',
                                        'On-site training option',
                                        'API integration',
                                        'White-label solution',
                                        'SLA guarantee'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/contact"
                                    className="block w-full bg-blue-600 text-white text-center py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Hubungi Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div 
                            className="absolute top-0 left-0 w-full h-full opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-xl text-blue-100">
                                Temukan jawaban untuk pertanyaan umum tentang paket berlangganan kami
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    question: "Apakah saya bisa upgrade atau downgrade paket kapan saja?",
                                    answer: "Ya, Anda dapat mengubah paket berlangganan kapan saja. Perubahan akan berlaku pada periode penagihan berikutnya."
                                },
                                {
                                    question: "Apakah ada garansi uang kembali?",
                                    answer: "Kami menawarkan garansi uang kembali 30 hari tanpa syarat. Jika tidak puas, kami akan mengembalikan uang Anda 100%."
                                },
                                {
                                    question: "Bisakah saya mengakses pelatihan secara offline?",
                                    answer: "Ya, dengan paket Pro dan Enterprise, Anda dapat mendownload video dan materi untuk diakses secara offline melalui aplikasi mobile kami."
                                },
                                {
                                    question: "Apakah sertifikat yang diberikan diakui industri?",
                                    answer: "Ya, sertifikat kami diakui oleh lebih dari 500+ perusahaan partner dan dapat diverifikasi secara online melalui blockchain."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                    <h4 className="text-lg font-bold text-white mb-3">{faq.question}</h4>
                                    <p className="text-blue-100 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 lg:py-32 bg-petrol-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <div className="space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                                Siap Memulai Perjalanan
                                <span className="block">Pembelajaran Anda?</span>
                            </h2>
                            <p className="text-xl lg:text-2xl text-petrol-300 max-w-4xl mx-auto leading-relaxed">
                                Bergabunglah dengan 78,000+ profesional yang telah mengubah karir mereka. Dapatkan akses ke semua pelatihan premium dengan harga terbaik!
                            </p>
                            
                            {!auth?.user && (
                                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                    <Link
                                        href="/register"
                                        className="group bg-white text-sogan-600 px-12 py-6 rounded-full text-xl font-black hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center"
                                    >
                                        Mulai Trial Gratis 7 Hari
                                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </Link>
                                    <Link
                                        href="/courses"
                                        className="group border-2 border-white text-white px-12 py-6 rounded-full text-xl font-black hover:bg-white hover:text-sogan-600 transition-all duration-300 flex items-center justify-center"
                                    >
                                        Lihat Semua Pelatihan
                                    </Link>
                                </div>
                            )}

                            <div className="pt-12">
                                <p className="text-yellow-200 font-semibold text-lg">
                                    🎉 Promo Khusus: Hemat 50% untuk 100 pendaftar pertama bulan ini!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-petrol-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <ApplicationLogo variant="dark" 
                                    className="h-18 lg:h-22 w-auto" 
                                    width="200" 
                                    height="64" 
                                />
                            </div>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Platform pembelajaran digital terdepan yang menghadirkan revolusi pendidikan untuk masa depan Indonesia yang lebih baik.
                            </p>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                            <p className="font-semibold">
                                &copy; 2026 SangkaLearn. Hak Cipta Dilindungi.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}