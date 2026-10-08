import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, Eye, EyeOff, Rocket, ArrowLeft, Shield, Star, Sparkles, CheckCircle, Trophy, PlayCircle, Monitor, Info, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Daftar Akun Baru" />

            {/* Background Decorations */}
            <div className="absolute inset-0">
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-sogan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-lg w-full space-y-8 relative">
                {/* Back to Home Link */}
                <div className="flex justify-start">
                    <Link
                        href="/"
                        className="group flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 transform hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 bg-petrol-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Rocket className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                        Mulai Perjalanan Digital Anda!
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                        Bergabung dengan <span className="text-sogan-600 font-bold">20,000+ alumni sukses</span> di SangkaLearn
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-sogan-50 rounded-full text-blue-800 text-sm font-bold border border-sogan-200/50">
                        <Sparkles className="w-4 h-4 mr-2 text-sogan-600" />
                        Daftar Gratis - Akses Seumur Hidup
                    </div>
                </div>

                {/* Notice: Registration for Individual Students */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center">
                                <Info className="w-4 h-4 text-blue-600 mr-2" />
                                Pendaftaran Khusus Mahasiswa & Peserta Individu
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Halaman registrasi ini diperuntukkan bagi <span className="font-semibold text-blue-700">mahasiswa dan peserta individu</span> yang ingin mengikuti pelatihan.
                            </p>
                            <div className="flex items-start mt-2">
                                <span className="inline-block w-2 h-2 bg-petrol-600 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                                <p className="text-xs text-gray-500">
                                    Untuk pendaftaran dari <span className="font-semibold">instansi pemerintah</span> atau <span className="font-semibold">perusahaan</span>, silakan hubungi admin kami.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Panduan Registrasi */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-blue-600 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-50 blur-sm transition-opacity duration-500"></div>

                    <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                        {/* Video Header Bar */}
                        <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-petrol-400"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                                </div>
                                <span className="text-white/90 font-semibold text-xs sm:text-sm">Panduan Registrasi Akun SangkaLearn</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                                <span className="text-white/70 text-xs hidden sm:inline">Video Tutorial</span>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="aspect-video bg-gray-900">
                            <video
                                className="w-full h-full object-contain"
                                controls
                                controlsList="nodownload"
                                disablePictureInPicture
                                preload="metadata"
                                poster=""
                                playsInline
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <source src="/panduan.mp4" type="video/mp4" />
                                Browser Anda tidak mendukung pemutar video.
                            </video>
                        </div>

                        {/* Video Footer Info */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm sm:text-base font-bold text-gray-900">Tonton panduan sebelum mendaftar</p>
                                    <p className="text-xs sm:text-sm text-gray-500">Registrasi mudah, hanya beberapa langkah</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Register Card */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-blue-100/50 relative overflow-hidden">
                    {/* Card Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sogan-50 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
                    
                    {/* Benefits Banner */}
                    <div className="mb-8 bg-blue-50 rounded-2xl p-4 border border-blue-200/50">
                        <h3 className="font-black text-gray-800 text-center mb-3 text-sm flex items-center justify-center">
                            <Trophy className="w-4 h-4 mr-2 text-sogan-600" />
                            Yang Anda Dapatkan
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 font-semibold">Pelatihan Premium</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 font-semibold">Sertifikat BNSP</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 font-semibold">Mentor Profesional</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 font-semibold">Job Recomendation</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <InputLabel 
                                htmlFor="name" 
                                value="Nama Lengkap" 
                                className="text-gray-700 font-bold text-sm mb-2 flex items-center"
                            />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="pl-12 pr-4 py-4 w-full rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Masukkan nama lengkap Anda"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2 text-red-600 font-medium" />
                        </div>

                        {/* Email Field */}
                        <div>
                            <InputLabel 
                                htmlFor="email" 
                                value="Alamat Email" 
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
                                    placeholder="masukkan@email.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2 text-red-600 font-medium" />
                        </div>

                        {/* Password Field */}
                        <div>
                            <InputLabel 
                                htmlFor="password" 
                                value="Kata Sandi" 
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
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
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

                        {/* Confirm Password Field */}
                        <div>
                            <InputLabel 
                                htmlFor="password_confirmation" 
                                value="Konfirmasi Kata Sandi" 
                                className="text-gray-700 font-bold text-sm mb-2 flex items-center"
                            />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="pl-12 pr-12 py-4 w-full rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Ulangi kata sandi Anda"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2 text-red-600 font-medium" />
                        </div>

                        {/* Terms Agreement */}
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-sm text-gray-600">
                                Dengan mendaftar, Anda menyetujui{' '}
                                <a href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                                    Syarat & Ketentuan
                                </a>{' '}
                                dan{' '}
                                <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                                    Kebijakan Privasi
                                </a>{' '}
                                kami
                            </p>
                        </div>

                        {/* Register Button */}
                        <div className="pt-2">
                            <PrimaryButton 
                                className="group w-full bg-petrol-600 hover:bg-petrol-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center relative overflow-hidden"
                                disabled={processing}
                            >
                                <span className="relative z-10 flex items-center">
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sedang mendaftar...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                            Daftar Sekarang - GRATIS!
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </PrimaryButton>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600 font-medium">
                                Sudah punya akun?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-300 hover:underline"
                                >
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                
            </div>
        </div>
    );
}