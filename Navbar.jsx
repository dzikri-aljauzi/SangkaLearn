import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    Menu,
    X,
    Monitor,
    Rocket
} from 'lucide-react';

export default function Navbar({ auth }) {
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
        { label: 'Kursus', href: '/courses', id: 'courses' },
        { label: 'Tentang', href: '/about', id: 'about' }
    ];

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${
            scrollY > 50 
                ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-blue-200/50' 
                : 'bg-white/90 backdrop-blur-lg border-b border-blue-100/30'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group flex-shrink-0 transition-all duration-300 hover:scale-105">
                        <ApplicationLogo 
                            className="h-12 sm:h-16 lg:h-20 w-auto" 
                            width="200" 
                            height="64" 
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center flex-1 justify-center">
                        <div className="flex items-center space-x-1 bg-blue-50/70 rounded-2xl p-1.5 border border-blue-100/70 shadow-sm">
                            {navItems.map((item) => {
                                const isActive = (item.id === 'home' && url === '/') || 
                                                (item.id === 'features' && url === '/features') ||
                                                (item.id === 'courses' && url.startsWith('/courses')) ||
                                                (item.id === 'about' && url === '/about');
                                
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                                : 'text-gray-700 hover:text-blue-700 hover:bg-white/80'
                                        }`}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center">
                                    <Monitor className="w-4 h-4 mr-2" />
                                    Dashboard
                                </span>
                                <div className="absolute inset-0 bg-yellow-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-700 font-bold text-sm transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-blue-50"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
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
                        className="lg:hidden p-2.5 rounded-2xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 border border-blue-100 flex-shrink-0"
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
                                                (item.id === 'about' && url === '/about');
                                
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`block px-4 py-3 mx-2 rounded-xl font-semibold transition-all duration-300 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            
                            <div className="px-2 pt-4 space-y-2">
                                <div className="flex justify-center pb-2">
                                            </div>
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl text-center font-bold"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block w-full text-center text-gray-700 hover:text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors duration-300"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-2xl text-center font-bold"
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
    );
}