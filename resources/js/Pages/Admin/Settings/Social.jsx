import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Save,
    Share2,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Link as LinkIcon,
    User,
    Settings,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

export default function SocialSettings({ settings }) {
    const [showSecrets, setShowSecrets] = useState({});
    const [activeTab, setActiveTab] = useState('providers');

    const { data, setData, put, processing, errors } = useForm({
        facebook_app_id: settings.facebook_app_id || '',
        facebook_app_secret: settings.facebook_app_secret || '',
        google_client_id: settings.google_client_id || '',
        google_client_secret: settings.google_client_secret || '',
        twitter_api_key: settings.twitter_api_key || '',
        twitter_api_secret: settings.twitter_api_secret || '',
        linkedin_client_id: settings.linkedin_client_id || '',
        linkedin_client_secret: settings.linkedin_client_secret || '',
        social_login_enabled: settings.social_login_enabled || false,
        social_sharing_enabled: settings.social_sharing_enabled || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.settings.social.update'), {
            onSuccess: () => {
                toast.success('Social media settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update social media settings');
            }
        });
    };

    const toggleSecretVisibility = (field) => {
        setShowSecrets(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const socialProviders = [
        {
            id: 'facebook',
            name: 'Facebook',
            color: 'blue',
            bgColor: 'bg-blue-600',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-600',
            description: 'Allow users to login with Facebook',
            docs: 'https://developers.facebook.com/docs/',
            fields: [
                { key: 'facebook_app_id', label: 'App ID', type: 'text', placeholder: '1234567890123456' },
                { key: 'facebook_app_secret', label: 'App Secret', type: 'password', placeholder: 'abcdef1234567890abcdef1234567890' },
            ]
        },
        {
            id: 'google',
            name: 'Google',
            color: 'red',
            bgColor: 'bg-red-600',
            lightBg: 'bg-red-50',
            textColor: 'text-red-600',
            description: 'Allow users to login with Google',
            docs: 'https://console.developers.google.com/',
            fields: [
                { key: 'google_client_id', label: 'Client ID', type: 'text', placeholder: '1234567890-abcdefghijklmnop.apps.googleusercontent.com' },
                { key: 'google_client_secret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-abcdefghijklmnopqrstuvwxyz' },
            ]
        },
        {
            id: 'twitter',
            name: 'Twitter',
            color: 'sky',
            bgColor: 'bg-sky-600',
            lightBg: 'bg-sky-50',
            textColor: 'text-sky-600',
            description: 'Allow users to login with Twitter',
            docs: 'https://developer.twitter.com/',
            fields: [
                { key: 'twitter_api_key', label: 'API Key', type: 'text', placeholder: 'abcdefghijklmnopqrstuvw' },
                { key: 'twitter_api_secret', label: 'API Secret', type: 'password', placeholder: 'abcdefghijklmnopqrstuvwxyz1234567890abcdefghijk' },
            ]
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            color: 'blue',
            bgColor: 'bg-blue-800',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-800',
            description: 'Allow users to login with LinkedIn',
            docs: 'https://www.linkedin.com/developers/',
            fields: [
                { key: 'linkedin_client_id', label: 'Client ID', type: 'text', placeholder: '1234567890abcdef' },
                { key: 'linkedin_client_secret', label: 'Client Secret', type: 'password', placeholder: 'abcdefghijklmnop' },
            ]
        },
    ];

    const tabs = [
        { id: 'providers', name: 'Social Providers', icon: User },
        { id: 'features', name: 'Social Features', icon: Share2 },
    ];

    return (
        <AppLayout title="Social Media Settings">
            <Head title="Social Media Settings" />
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
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Social Media Settings</h1>
                                <p className="text-gray-600 mt-1">Configure social login and sharing features</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-pink-50 text-pink-700 border-pink-200 border'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${
                                                activeTab === tab.id ? 'text-pink-600' : 'text-gray-400'
                                            }`} />
                                            <span className="font-medium">{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Quick Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Social Login</span>
                                        <button
                                            type="button"
                                            onClick={() => setData('social_login_enabled', !data.social_login_enabled)}
                                            className="relative"
                                        >
                                            {data.social_login_enabled ? (
                                                <ToggleRight className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Social Sharing</span>
                                        <button
                                            type="button"
                                            onClick={() => setData('social_sharing_enabled', !data.social_sharing_enabled)}
                                            className="relative"
                                        >
                                            {data.social_sharing_enabled ? (
                                                <ToggleRight className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
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
                            {/* Social Providers Tab */}
                            {activeTab === 'providers' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                            <User className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Social Login Providers</h2>
                                            <p className="text-gray-600">Configure third-party authentication providers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {socialProviders.map((provider) => (
                                            <motion.div 
                                                key={provider.id}
                                                className="border border-gray-200 rounded-xl p-6"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-10 h-10 ${provider.lightBg} rounded-lg flex items-center justify-center`}>
                                                            <div className={`w-6 h-6 ${provider.bgColor} rounded`}></div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                                                            <p className="text-sm text-gray-600">{provider.description}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={provider.docs}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        <span>Documentation</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {provider.fields.map((field) => (
                                                        <div key={field.key}>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                {field.label}
                                                            </label>
                                                            {field.type === 'password' ? (
                                                                <div className="relative">
                                                                    <input
                                                                        type={showSecrets[field.key] ? "text" : "password"}
                                                                        value={data[field.key]}
                                                                        onChange={(e) => setData(field.key, e.target.value)}
                                                                        placeholder={field.placeholder}
                                                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleSecretVisibility(field.key)}
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        {showSecrets[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={data[field.key]}
                                                                    onChange={(e) => setData(field.key, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                                />
                                                            )}
                                                            {errors[field.key] && (
                                                                <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social Features Tab */}
                            {activeTab === 'features' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                            <Share2 className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Social Features</h2>
                                            <p className="text-gray-600">Configure social login and sharing capabilities</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Social Login */}
                                        <div className="border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Social Login</h3>
                                                    <p className="text-sm text-gray-600">Allow users to sign in using social media accounts</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('social_login_enabled', !data.social_login_enabled)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        data.social_login_enabled ? 'bg-green-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            data.social_login_enabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                            {data.social_login_enabled && (
                                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm text-green-700">
                                                        Users will see social login buttons on the login and registration pages.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Social Sharing */}
                                        <div className="border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Social Sharing</h3>
                                                    <p className="text-sm text-gray-600">Enable sharing of courses and achievements on social media</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('social_sharing_enabled', !data.social_sharing_enabled)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        data.social_sharing_enabled ? 'bg-green-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            data.social_sharing_enabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                            {data.social_sharing_enabled && (
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-700">
                                                        Students can share their course completions and certificates on social media.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-900">Important Security Notes</h4>
                                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                            <li>• Configure OAuth redirect URLs in your social media app settings</li>
                                            <li>• Use environment variables for sensitive keys in production</li>
                                            <li>• Regularly rotate your API keys and secrets</li>
                                            <li>• Test social login in a staging environment first</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Lock className="w-4 h-4" />
                                    <span>Social credentials are encrypted and stored securely</span>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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