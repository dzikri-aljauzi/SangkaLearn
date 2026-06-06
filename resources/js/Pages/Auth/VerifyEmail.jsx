import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Mail, 
    CheckCircle, 
    RefreshCw, 
    ArrowLeft, 
    Send,
    Clock,
    Shield,
    Key
} from 'lucide-react';

export default function VerifyEmail({ status, flash = {}, warning }) {
    const [isResending, setIsResending] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [errors, setErrors] = useState({});

    const handleResendEmail = () => {
        setIsResending(true);
        router.post('/email/verification-notification', {}, {
            onFinish: () => setIsResending(false)
        });
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        if (!verificationCode || verificationCode.length !== 6) {
            setErrors({ code: 'Kode verifikasi harus 6 digit' });
            return;
        }
        
        setIsVerifying(true);
        setErrors({});
        
        router.post('/email/verify-code', {
            code: verificationCode
        }, {
            onFinish: () => setIsVerifying(false),
            onError: (errors) => setErrors(errors)
        });
    };

    const handleCodeChange = (value) => {
        // Only allow numbers and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').substring(0, 6);
        setVerificationCode(numericValue);
        if (errors.code) setErrors({});
    };

    return (
        <>
            <Head title="Verifikasi Email" />
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mx-auto h-20 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                            <Key className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Verifikasi Email Anda
                        </h2>
                        <p className="text-gray-600">
                            Masukkan 6 digit kode yang telah dikirim ke email Anda
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Success Message */}
                        {(status === 'verification-link-sent' || flash.success) && (
                            <motion.div 
                                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                                    <p className="text-green-800 text-sm font-medium">
                                        {flash.success || 'Link verifikasi baru telah dikirim ke email Anda!'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Warning Message - Email sending failed */}
                        {(flash.warning || warning) && (
                            <motion.div 
                                className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-orange-800 text-sm font-medium mb-2">
                                            {flash.warning || warning}
                                        </p>
                                        <p className="text-orange-700 text-xs">
                                            Gunakan tombol "Kirim Ulang Email" di bawah untuk mencoba mengirim email verifikasi lagi.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            {/* Verification Code Form */}
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Verifikasi
                                    </label>
                                    <input
                                        type="text"
                                        id="verification-code"
                                        value={verificationCode}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="000000"
                                        maxLength={6}
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                    {errors.code && (
                                        <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                                    )}
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isVerifying || verificationCode.length !== 6}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isVerifying ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2 inline" />
                                            Verifikasi Email
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-blue-900 mb-2">
                                            Cara Verifikasi:
                                        </h3>
                                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                            <li>Cek kotak masuk email Anda</li>
                                            <li>Temukan email dari LMS Bisnis Digital Indonesia</li>
                                            <li>Salin 6 digit kode verifikasi</li>
                                            <li>Masukkan kode di form di atas</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Notice */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                                    <p className="text-yellow-800 text-sm">
                                        Kode verifikasi akan kedaluwarsa dalam <strong>15 menit</strong> untuk keamanan akun Anda.
                                    </p>
                                </div>
                            </div>

                            {/* Resend Button */}
                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-4">
                                    Tidak menerima email atau kode kedaluwarsa?
                                </p>
                                <motion.button
                                    onClick={handleResendEmail}
                                    disabled={isResending}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Mengirim Ulang...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Kirim Ulang Kode
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Troubleshooting */}
                            <div className="border-t pt-6">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    💡 Tips Troubleshooting:
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Periksa folder spam/junk email Anda</li>
                                    <li>• Pastikan email <strong>lmsbisnisdigital@zero13indonesia.com</strong> tidak diblokir</li>
                                    <li>• Tunggu beberapa menit, terkadang email butuh waktu untuk sampai</li>
                                    <li>• Gunakan tombol "Kirim Ulang Email" jika diperlukan</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link
                            href="/login"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Login
                        </Link>
                        
                        <p className="mt-4 text-sm text-gray-500">
                            Butuh bantuan? Hubungi 
                            <a href="mailto:support@zero13indonesia.com" className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                                support@zero13indonesia.com
                            </a>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}