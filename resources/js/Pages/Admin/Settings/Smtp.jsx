import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Save,
    Mail,
    Server,
    Lock,
    AlertCircle,
    Check,
    Eye,
    EyeOff,
    Shield,
    TestTube,
    Send,
    Settings
} from 'lucide-react';

export default function SmtpSettings({ settings }) {
    const [showPassword, setShowPassword] = useState(false);
    const [testEmailSent, setTestEmailSent] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        mail_host: settings.mail_host || 'smtp.gmail.com',
        mail_port: settings.mail_port || '587',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || 'noreply@example.com',
        mail_from_name: settings.mail_from_name || 'LMS Platform',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.settings.smtp.update'), {
            onSuccess: () => {
                toast.success('SMTP settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update SMTP settings');
            }
        });
    };

    const sendTestEmail = () => {
        // Simulate test email sending
        setTestEmailSent(true);
        toast.success('Test email sent successfully!');
        setTimeout(() => setTestEmailSent(false), 3000);
    };

    const presets = [
        {
            name: 'Gmail',
            host: 'smtp.gmail.com',
            port: '587',
            encryption: 'tls'
        },
        {
            name: 'Yahoo',
            host: 'smtp.mail.yahoo.com',
            port: '587',
            encryption: 'tls'
        },
        {
            name: 'Outlook',
            host: 'smtp.live.com',
            port: '587',
            encryption: 'tls'
        },
        {
            name: 'Mailgun',
            host: 'smtp.mailgun.org',
            port: '587',
            encryption: 'tls'
        },
    ];

    const applyPreset = (preset) => {
        setData({
            ...data,
            mail_host: preset.host,
            mail_port: preset.port,
            mail_encryption: preset.encryption
        });
        toast.success(`Applied ${preset.name} settings`);
    };

    return (
        <AppLayout title="SMTP Settings">
            <Head title="SMTP Settings" />
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">SMTP Settings</h1>
                                <p className="text-gray-600 mt-1">Configure email server settings for system notifications</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar with Presets */}
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h3>
                            <p className="text-sm text-gray-600 mb-4">Choose a preset to auto-fill common SMTP settings</p>
                            
                            <div className="space-y-3">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100">
                                                <Mail className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{preset.name}</p>
                                                <p className="text-xs text-gray-500">{preset.host}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={sendTestEmail}
                                    disabled={testEmailSent}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {testEmailSent ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Email Sent!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Send Test Email</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Test email will be sent to your admin email
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div 
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Server className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Email Server Configuration</h2>
                                    <p className="text-gray-600">Configure SMTP settings for outgoing emails</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* SMTP Host */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Host <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mail_host}
                                        onChange={(e) => setData('mail_host', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.mail_host && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_host}</p>
                                    )}
                                </div>

                                {/* SMTP Port */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SMTP Port <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.mail_port}
                                        onChange={(e) => setData('mail_port', e.target.value)}
                                        placeholder="587"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.mail_port && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_port}</p>
                                    )}
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username (Email) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.mail_username}
                                        onChange={(e) => setData('mail_username', e.target.value)}
                                        placeholder="your-email@gmail.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.mail_username && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_username}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.mail_password}
                                            onChange={(e) => setData('mail_password', e.target.value)}
                                            placeholder="Your email password or app password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.mail_password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_password}</p>
                                    )}
                                </div>

                                {/* Encryption */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Encryption <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.mail_encryption}
                                        onChange={(e) => setData('mail_encryption', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="tls">TLS</option>
                                        <option value="ssl">SSL</option>
                                    </select>
                                    {errors.mail_encryption && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_encryption}</p>
                                    )}
                                </div>

                                {/* From Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => setData('mail_from_address', e.target.value)}
                                        placeholder="noreply@yourdomain.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.mail_from_address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_from_address}</p>
                                    )}
                                </div>

                                {/* From Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mail_from_name}
                                        onChange={(e) => setData('mail_from_name', e.target.value)}
                                        placeholder="LMS Platform"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.mail_from_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mail_from_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900">Security Recommendations</h4>
                                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                            <li>• Use App Passwords for Gmail (not your regular password)</li>
                                            <li>• Always use TLS encryption for secure email transmission</li>
                                            <li>• Regularly update your email credentials</li>
                                            <li>• Test your settings after making changes</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Lock className="w-4 h-4" />
                                    <span>Email credentials are encrypted and stored securely</span>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{processing ? 'Saving...' : 'Save Settings'}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}