import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import { 
    Settings as SettingsIcon,
    Globe, 
    Shield, 
    Bell, 
    Database,
    Mail,
    Palette,
    Key,
    Server,
    Users,
    FileText,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Info,
    Eye,
    EyeOff,
    CreditCard,
    Share2
} from 'lucide-react';

export default function SettingsIndex({ settings = {} }) {
    const [activeSection, setActiveSection] = useState('general');

    const { data, setData, put, processing, errors } = useForm({
        site_name: settings.site_name || 'LeadNEX LMS',
        site_description: settings.site_description || 'Bisnis Digital Indonesia Learning Management System',
        site_url: settings.site_url || 'https://lms.bdi.com',
        admin_email: settings.admin_email || 'admin@bdi.com',
        timezone: settings.timezone || 'Asia/Jakarta',
        language: settings.language || 'id',
        allow_registration: settings.allow_registration !== undefined ? settings.allow_registration : true,
        email_verification: settings.email_verification !== undefined ? settings.email_verification : true,
        course_approval: settings.course_approval !== undefined ? settings.course_approval : false,
        maintenance_mode: settings.maintenance_mode !== undefined ? settings.maintenance_mode : false,
        debug_mode: settings.debug_mode !== undefined ? settings.debug_mode : false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/settings', {
            onSuccess: () => {
                toast.success('Pengaturan berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan');
            }
        });
    };

    const sections = [
        {
            id: 'general',
            name: 'Umum',
            icon: Globe,
            description: 'Pengaturan dasar sistem'
        },
        {
            id: 'security',
            name: 'Keamanan',
            icon: Shield,
            description: 'Konfigurasi keamanan'
        },
        {
            id: 'payment',
            name: 'Pembayaran',
            icon: CreditCard,
            description: 'Pengaturan metode pembayaran',
            link: '/admin/settings/payment'
        },
        {
            id: 'smtp',
            name: 'Email SMTP',
            icon: Mail,
            description: 'Konfigurasi server email',
            link: '/admin/settings/smtp'
        },
        {
            id: 'social',
            name: 'Media Sosial',
            icon: Share2,
            description: 'Integrasi media sosial',
            link: '/admin/settings/social'
        },
        {
            id: 'system',
            name: 'Sistem',
            icon: Server,
            description: 'Pengaturan sistem lanjutan'
        }
    ];

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Situs
                                </label>
                                <input
                                    type="text"
                                    value={data.site_name}
                                    onChange={(e) => setData('site_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.site_name && <p className="text-red-500 text-sm mt-1">{errors.site_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Situs
                                </label>
                                <input
                                    type="url"
                                    value={data.site_url}
                                    onChange={(e) => setData('site_url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.site_url && <p className="text-red-500 text-sm mt-1">{errors.site_url}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi Situs
                            </label>
                            <textarea
                                value={data.site_description}
                                onChange={(e) => setData('site_description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.site_description && <p className="text-red-500 text-sm mt-1">{errors.site_description}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zona Waktu
                                </label>
                                <select
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bahasa
                                </label>
                                <select
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="id">Bahasa Indonesia</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Administrator
                            </label>
                            <input
                                type="email"
                                value={data.admin_email}
                                onChange={(e) => setData('admin_email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.admin_email && <p className="text-red-500 text-sm mt-1">{errors.admin_email}</p>}
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                <h4 className="text-sm font-medium text-yellow-800">Peringatan Keamanan</h4>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                                Ubah pengaturan keamanan dengan hati-hati. Perubahan yang salah dapat mempengaruhi akses sistem.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Izinkan Pendaftaran Baru</h4>
                                    <p className="text-sm text-gray-500">Pengguna dapat mendaftar akun baru</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.allow_registration}
                                        onChange={(e) => setData('allow_registration', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Verifikasi Email</h4>
                                    <p className="text-sm text-gray-500">Wajibkan verifikasi email saat pendaftaran</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.email_verification}
                                        onChange={(e) => setData('email_verification', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Persetujuan Pelatihan</h4>
                                    <p className="text-sm text-gray-500">Pelatihan baru memerlukan persetujuan admin</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.course_approval}
                                        onChange={(e) => setData('course_approval', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 'system':
                return (
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h4 className="text-sm font-medium text-red-800">Pengaturan Sistem</h4>
                            </div>
                            <p className="text-sm text-red-700 mt-1">
                                Pengaturan ini mempengaruhi kinerja sistem. Ubah dengan hati-hati.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Mode Maintenance</h4>
                                    <p className="text-sm text-gray-500">Sistem tidak dapat diakses pengguna</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.maintenance_mode}
                                        onChange={(e) => setData('maintenance_mode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Mode Debug</h4>
                                    <p className="text-sm text-gray-500">Tampilkan informasi debug (Development only)</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.debug_mode}
                                        onChange={(e) => setData('debug_mode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <button
                                type="button"
                                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Clear Cache
                            </button>
                            <button
                                type="button"
                                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Optimize Database
                            </button>
                        </div>
                    </div>
                );

            default:
                return <div>Pilih bagian untuk melihat pengaturan</div>;
        }
    };

    return (
        <AppLayout title="Pengaturan Sistem">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-2xl p-6 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center space-x-3">
                        <SettingsIcon className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
                            <p className="text-blue-100">Kelola konfigurasi dan preferensi sistem</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <nav className="space-y-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    
                                    // If section has a link, render as Link component
                                    if (section.link) {
                                        return (
                                            <Link
                                                key={section.id}
                                                href={section.link}
                                                className="w-full text-left p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 block"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Icon className="w-5 h-5" />
                                                    <div>
                                                        <div className="font-medium">{section.name}</div>
                                                        <div className="text-xs text-gray-500">{section.description}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    }
                                    
                                    // Regular section button
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className="w-5 h-5" />
                                                <div>
                                                    <div className="font-medium">{section.name}</div>
                                                    <div className="text-xs text-gray-500">{section.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {sections.find(section => section.id === activeSection)?.name}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {sections.find(section => section.id === activeSection)?.description}
                                    </p>
                                </div>

                                {renderSectionContent()}

                                {/* Save Button */}
                                {['general', 'security', 'system'].includes(activeSection) && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Perubahan akan diterapkan segera setelah disimpan
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                            >
                                                {processing ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                <span>{processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}