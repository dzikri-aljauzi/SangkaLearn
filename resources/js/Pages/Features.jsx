import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Palette
} from 'lucide-react';

export default function Features({ auth, stats = {} }) {
    return (
        <>
            <Head title="Fitur Unggulan - SangkaLearn" />
            
            <div className="min-h-screen bg-blue-50 overflow-x-hidden">
                <Navbar auth={auth} />

                {/* Hero Section */}
                <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative overflow-hidden">
                    {/* Modern Background Decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 bg-petrol-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full opacity-30 animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold shadow-lg text-sm sm:text-base">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Fitur Platform Terdepan
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-yellow-500" />
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight px-2">
                                <span className="block sm:inline">Fitur Unggulan</span>
                                <span className="block text-blue-600">
                                    Platform Pembelajaran
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-2 text-justify">
                                Discover all the <span className="text-blue-700 font-bold">cutting-edge features</span> that make our platform the <span className="text-sogan-600 font-bold">most comprehensive learning ecosystem</span> in Indonesia
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
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

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                                <Link
                                    href="/courses"
                                    className="group bg-blue-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 flex items-center justify-center relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <PlayCircle className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                                        <span className="hidden sm:inline">Coba Sekarang Gratis</span>
                                        <span className="sm:hidden">Coba Gratis</span>
                                        <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-petrol-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </Link>
                                <Link
                                    href="#detailed-features"
                                    className="group border-2 border-petrol-600 text-sogan-700 px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-petrol-700 hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg"
                                >
                                    <Trophy className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="hidden sm:inline">Jelajahi Fitur</span>
                                    <span className="sm:hidden">Lihat Fitur</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Features Grid */}
                <section className="py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-sogan-50 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Fitur Utama Platform
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Everything You Need to Succeed
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 text-justify">
                                Comprehensive suite of learning tools designed to accelerate your professional growth
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {[
                                {
                                    icon: <Monitor className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Interactive Learning Dashboard",
                                    description: "Personalized learning experience with progress tracking, recommendations, and achievement system"
                                },
                                {
                                    icon: <Video className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "HD Video Streaming",
                                    description: "High-definition video content with adaptive streaming, offline download, and mobile optimization"
                                },
                                {
                                    icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Live Mentoring Sessions",
                                    description: "1-on-1 and group sessions with industry experts, including Q&A and code review sessions"
                                },
                                {
                                    icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Industry-Recognized Certificates",
                                    description: "Blockchain-verified certificates with QR codes for instant verification by employers"
                                },
                                {
                                    icon: <Code className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Integrated Code Lab",
                                    description: "Browser-based IDE with auto-completion, version control, and real-time collaboration"
                                },
                                {
                                    icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "AI-Powered Learning Path",
                                    description: "Machine learning algorithms create personalized curricula based on your goals and pace"
                                },
                                {
                                    icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "24/7 Global Access",
                                    description: "Learn anywhere, anytime with offline sync and multi-device progression tracking"
                                },
                                {
                                    icon: <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Community Forum",
                                    description: "Connect with peers, share projects, get help, and participate in coding challenges"
                                },
                                {
                                    icon: <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />,
                                    title: "Mobile-First Design",
                                    description: "Native mobile apps with push notifications, offline content, and AR/VR support"
                                }
                            ].map((feature, index) => (
                                <div 
                                    key={index}
                                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-blue-300"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base text-justify">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Advanced Features */}
                <section id="detailed-features" className="py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 sm:mb-6 text-sm sm:text-base">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Advanced Platform Features
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
                                Next-Generation Learning Technology
                            </h2>
                        </div>

                        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
                            {[
                                {
                                    icon: <Database className="w-8 h-8 sm:w-12 sm:h-12" />,
                                    title: "Smart Analytics & Insights",
                                    description: "Get detailed insights into your learning patterns, strengths, and areas for improvement with advanced analytics",
                                    features: ["Learning velocity tracking", "Skill gap analysis", "Performance benchmarking", "Career path recommendations"]
                                },
                                {
                                    icon: <Building className="w-8 h-8 sm:w-12 sm:h-12" />,
                                    title: "Enterprise Integration",
                                    description: "Seamlessly integrate with your organization's learning management system and HR platforms",
                                    features: ["SSO integration", "SCORM compliance", "API access", "Custom branding"]
                                },
                                {
                                    icon: <Shield className="w-8 h-8 sm:w-12 sm:h-12" />,
                                    title: "Security & Compliance",
                                    description: "Enterprise-grade security with data protection and compliance standards",
                                    features: ["GDPR compliant", "ISO 27001 certified", "End-to-end encryption", "Regular security audits"]
                                }
                            ].map((feature, index) => (
                                <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 sm:gap-12 lg:gap-16`}>
                                    <div className="flex-1 text-center lg:text-left">
                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center ${index % 2 === 0 ? 'mx-auto lg:mx-0' : 'mx-auto lg:ml-auto lg:mr-0'} mb-4 sm:mb-6`}>
                                            <div className="text-white">
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-3 sm:mb-4">
                                            {feature.title}
                                        </h3>
                                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed text-justify">
                                            {feature.description}
                                        </p>
                                        <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                            {feature.features.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-center justify-center lg:justify-start space-x-3">
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg">
                                            <div className="aspect-video bg-white/80 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                                <div className="text-6xl sm:text-8xl text-blue-200">
                                                    {feature.icon}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div 
                            className="absolute top-0 left-0 w-full h-full"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <div className="space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-bold shadow-lg text-sm sm:text-base">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
                                Ready to Experience the Future?
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight px-2">
                                <span className="block sm:inline">Start Your Learning</span>
                                <span className="block text-yellow-400">Journey Today!</span>
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-2 text-justify">
                                Join thousands of professionals who are already transforming their careers with our <span className="text-yellow-400 font-bold">cutting-edge learning platform</span>
                            </p>
                            
                            {!auth?.user && (
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
                                    <Link
                                        href="/register"
                                        className="group bg-petrol-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center relative overflow-hidden w-full sm:w-auto"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                            <span className="hidden sm:inline">Get Started Free</span>
                                            <span className="sm:hidden">Mulai Gratis</span>
                                            <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                    <Link
                                        href="/courses"
                                        className="group border-2 border-white text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:bg-white hover:text-blue-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                                    >
                                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="hidden sm:inline">Browse Courses</span>
                                        <span className="sm:hidden">Lihat Pelatihan</span>
                                    </Link>
                                </div>
                            )}
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
                                            src="/images/logo-lna.jpeg"
                                            alt="LNA Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/probisdi.png"
                                            alt="Probisdi Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/logo-bdi.jpeg"
                                            alt="BDI Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/blockxlab.png"
                                            alt="Blockxlab Logo"
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