import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
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
    EyeOff
} from 'lucide-react';

export default function AdminSettings({ settings = {} }) {
    const [activeTab, setActiveTab] = useState('general');
    const [showApiKey, setShowApiKey] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        site_name: settings.site_name || 'SangkaLearn',
        site_description: settings.site_description || 'SangkaLearn Learning Management System',
        site_url: settings.site_url || 'https://sangkalearn.id',
        admin_email: settings.admin_email || 'admin@sangkalearn.id',
        timezone: settings.timezone || 'Asia/Jakarta',
        language: settings.language || 'id',
        allow_registration: settings.allow_registration || true,
        email_verification: settings.email_verification || true,
        course_approval: settings.course_approval || false,
        max_file_size: settings.max_file_size || 100,
        allowed_file_types: settings.allowed_file_types || 'pdf,doc,docx,ppt,pptx,mp4,mp3',
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        backup_frequency: settings.backup_frequency || 'daily',
        backup_retention: settings.backup_retention || 30,
        api_key: settings.api_key || 'sk-1234567890abcdef...',
        maintenance_mode: settings.maintenance_mode || false,
        debug_mode: settings.debug_mode || false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings', {
            onSuccess: () => {
                toast.success('Pengaturan berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan');
            }
        });
    };

    const tabs = [
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
            id: 'email',
            name: 'Email',
            icon: Mail,
            description: 'Pengaturan email dan notifikasi'
        },
        {
            id: 'storage',
            name: 'Penyimpanan',
            icon: Database,
            description: 'Manajemen file dan backup'
        },
        {
            id: 'api',
            name: 'API',
            icon: Key,
            description: 'Konfigurasi API dan integrasi'
        },
        {
            id: 'system',
            name: 'Sistem',
            icon: Server,
            description: 'Pengaturan sistem lanjutan'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
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

            case 'email':
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                <h4 className="text-sm font-medium text-blue-800">Konfigurasi Email</h4>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                                Konfigurasi SMTP untuk mengirim email notifikasi dan verifikasi.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Host
                                </label>
                                <input
                                    type="text"
                                    value={data.smtp_host}
                                    onChange={(e) => setData('smtp_host', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Port
                                </label>
                                <input
                                    type="number"
                                    value={data.smtp_port}
                                    onChange={(e) => setData('smtp_port', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Username
                                </label>
                                <input
                                    type="text"
                                    value={data.smtp_username}
                                    onChange={(e) => setData('smtp_username', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Password
                                </label>
                                <input
                                    type="password"
                                    value={data.smtp_password}
                                    onChange={(e) => setData('smtp_password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Test Email Configuration
                            </button>
                        </div>
                    </div>
                );

            case 'storage':
                return (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ukuran File Maksimal (MB)
                                </label>
                                <input
                                    type="number"
                                    value={data.max_file_size}
                                    onChange={(e) => setData('max_file_size', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frekuensi Backup
                                </label>
                                <select
                                    value={data.backup_frequency}
                                    onChange={(e) => setData('backup_frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="daily">Harian</option>
                                    <option value="weekly">Mingguan</option>
                                    <option value="monthly">Bulanan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipe File yang Diizinkan
                            </label>
                            <input
                                type="text"
                                value={data.allowed_file_types}
                                onChange={(e) => setData('allowed_file_types', e.target.value)}
                                placeholder="pdf,doc,docx,ppt,pptx,mp4,mp3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Retensi Backup (hari)
                            </label>
                            <input
                                type="number"
                                value={data.backup_retention}
                                onChange={(e) => setData('backup_retention', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h4 className="text-sm font-medium text-green-800">API Configuration</h4>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                                Konfigurasi API untuk integrasi dengan aplikasi eksternal.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={data.api_key}
                                    onChange={(e) => setData('api_key', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showApiKey ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Generate New API Key
                            </button>
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
                return null;
        }
    };

    return (
        <AppLayout title="Admin Settings">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="bg-blue-600 rounded-2xl p-6 text-white"
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
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className="w-5 h-5" />
                                                <div>
                                                    <div className="font-medium">{tab.name}</div>
                                                    <div className="text-xs text-gray-500">{tab.description}</div>
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
                                        {tabs.find(tab => tab.id === activeTab)?.name}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {tabs.find(tab => tab.id === activeTab)?.description}
                                    </p>
                                </div>

                                {renderTabContent()}

                                {/* Save Button */}
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
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}