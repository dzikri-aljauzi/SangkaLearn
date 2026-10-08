import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Shield, Star, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { startAutoRefresh, stopAutoRefresh, restoreScrollPosition, REFRESH_CONFIGS } from '@/Utils/autoRefresh';
import { immediateRefreshWithMessage, restoreAfterRefresh, shouldSkipNormalRefresh } from '@/Utils/immediateRefresh';
import ImmediateRefreshIndicator from '@/Components/ImmediateRefreshIndicator';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState("");
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Token refresh dan setup untuk halaman login
    useEffect(() => {
        console.log('🔑 Login page loaded');
        
        // Clear any lingering session storage dari navigasi sebelumnya
        // kecuali jika ini adalah hasil dari immediate refresh
        const currentRefreshFlag = sessionStorage.getItem('isImmediateRefresh');
        if (!currentRefreshFlag || currentRefreshFlag !== 'true') {
            sessionStorage.removeItem('isImmediateRefresh');
            sessionStorage.removeItem('refreshMessage');
        }
        
        // Cek apakah ini dari tombol "Mulai Belajar Sekarang"
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        const isFromStartLearning = ref === 'start-learning';
        
        console.log('🔍 Debug info:', {
            isFromStartLearning,
            ref,
            url: window.location.href
        });
        
        // Cek apakah ini setelah immediate refresh
        const wasImmediateRefresh = restoreAfterRefresh();
        const skipRefresh = shouldSkipNormalRefresh();
        
        console.log('🔍 Refresh status:', {
            wasImmediateRefresh,
            skipRefresh,
            sessionStorage: {
                isImmediateRefresh: sessionStorage.getItem('isImmediateRefresh')
            }
        });
        
        // Always refresh CSRF token when login page loads
        const refreshToken = async () => {
            console.log('🔄 Refreshing CSRF token...');
            if (window.refreshCSRFToken) {
                try {
                    await window.refreshCSRFToken();
                    console.log('✅ CSRF token refreshed successfully');
                } catch (error) {
                    console.warn('⚠️ CSRF token refresh failed:', error);
                }
            }
        };
        
        if (!wasImmediateRefresh && !skipRefresh) {
            // Immediate refresh saat pertama kali masuk halaman login
            console.log('🔄 Starting token preparation...');
            
            const message = isFromStartLearning 
                ? 'Mempersiapkan sesi belajar Anda. Mohon tunggu...'
                : 'Mempersiapkan token keamanan dan sesi login...';
            
            console.log('📝 Token preparation message:', message);
            
            setRefreshMessage(message);
            setShowRefreshIndicator(true);
            
            // First refresh token, then do page refresh
            refreshToken().finally(() => {
                setTimeout(() => {
                    const refreshMsg = isFromStartLearning
                        ? 'Memulai sesi belajar - mempersiapkan lingkungan pembelajaran'
                        : 'Mempersiapkan token keamanan - refreshing untuk sesi fresh';
                    console.log('🔄 Executing refresh with message:', refreshMsg);
                    immediateRefreshWithMessage(refreshMsg, 0);
                }, 2000);
            });
            return;
        } else {
            // If no immediate refresh needed, just refresh token silently
            refreshToken();
        }
        
        console.log('✅ Login page ready after refresh');
        
        // Cleanup saat component unmount
        return () => {
            // No cleanup needed for immediate refresh
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        // Refresh CSRF token before submitting form
        try {
            if (window.refreshCSRFToken) {
                console.log('🔄 Refreshing CSRF token before login...');
                await window.refreshCSRFToken();
                console.log('✅ CSRF token ready for login');
            }
        } catch (error) {
            console.warn('⚠️ CSRF token refresh before login failed:', error);
        }

        post(route('login'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
            onError: (errors) => {
                // Jika ada error, tampilkan pesan
                console.log('❌ Login error:', errors);
                
                // Jika error 419 (CSRF), refresh token dan coba lagi
                if (errors && (errors.message?.includes('419') || errors.csrf)) {
                    console.log('🔄 CSRF error detected, refreshing token...');
                    if (window.refreshCSRFToken) {
                        window.refreshCSRFToken().then(() => {
                            console.log('✅ Token refreshed, please try login again');
                        });
                    }
                }
            },
            onSuccess: () => {
                console.log('✅ Login berhasil!');
                // Show indicator sebelum refresh
                setRefreshMessage('Login berhasil! Mempersiapkan dashboard Anda...');
                setShowRefreshIndicator(true);
                
                // Immediate refresh setelah login berhasil
                setTimeout(() => {
                    immediateRefreshWithMessage('Login berhasil - mempersiapkan dashboard dengan sesi fresh', 0);
                }, 2000);
            }
        });
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Login" />

            {/* Background Decorations */}
            <div className="absolute inset-0">
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-sogan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative">
                {/* Back to Home Link */}
                <div className="flex justify-start">
                    <Link
                        href="/"
                        className="group flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 transform hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back ke Home
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-petrol-400 rounded-full flex items-center justify-center shadow-sm">
                                <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                        Login
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                        Masuk ke akun Anda untuk melanjutkan pembelajaran
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-bold border border-blue-200/50">
                        <Sparkles className="w-4 h-4 mr-2 text-sogan-600" />
                        Platform Learning Digital Terdepan
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-blue-100/50 relative overflow-hidden">
                    {/* Card Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
                    
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-green-800 font-semibold">{status}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <InputLabel 
                                htmlFor="email" 
                                value="Email" 
                                className="text-gray-700 font-bold text-sm mb-2 flex items-center"
                            />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="pl-12 pr-4 py-4 w-full rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="email@example.com"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2 text-red-600 font-medium" />
                        </div>

                        {/* Password Field */}
                        <div>
                            <InputLabel 
                                htmlFor="password" 
                                value="Password" 
                                className="text-gray-700 font-bold text-sm mb-2 flex items-center"
                            />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="pl-12 pr-12 py-4 w-full rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2 text-red-600 font-medium" />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center group cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded-lg border-2 border-blue-200 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="ml-3 text-sm text-gray-700 font-semibold group-hover:text-blue-700 transition-colors">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors duration-300 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Login Button */}
                        <div className="pt-2">
                            <PrimaryButton 
                                className="group w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center relative overflow-hidden"
                                disabled={processing}
                            >
                                <span className="relative z-10 flex items-center">
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                                            Login
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-petrol-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center pt-6 border-t border-gray-200">
                        <p className="text-gray-600 font-medium">
                            Belum punya akun?{' '}
                            <Link
                                href={route('register')}
                                className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-300 hover:underline"
                            >
                                Daftar sekarang
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Bergabunglah dengan <span className="text-sogan-600 font-bold">20,000+ alumni sukses</span>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
                        <Shield className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700 font-semibold">
                            Keamanan data terjamin dengan enkripsi SSL
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Immediate Refresh Indicator */}
            {showRefreshIndicator && (
                <ImmediateRefreshIndicator
                    message={refreshMessage}
                    countdown={3}
                    onComplete={() => {
                        // This will be called when countdown reaches 0
                        console.log('Refresh indicator completed');
                    }}
                />
            )}
        </div>
    );
}