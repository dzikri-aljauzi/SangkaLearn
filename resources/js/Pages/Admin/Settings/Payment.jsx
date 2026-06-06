import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import {
    ArrowLeft,
    Save,
    CreditCard,
    DollarSign,
    Lock,
    AlertCircle,
    Check,
    Eye,
    EyeOff,
    Zap,
    Globe,
    Shield
} from 'lucide-react';

export default function PaymentSettings({ settings }) {
    const [showSecrets, setShowSecrets] = useState({});
    const [activeTab, setActiveTab] = useState('stripe');

    const { data, setData, put, processing, errors } = useForm({
        stripe_public_key: settings.stripe_public_key || '',
        stripe_secret_key: settings.stripe_secret_key || '',
        paypal_client_id: settings.paypal_client_id || '',
        paypal_secret: settings.paypal_secret || '',
        midtrans_server_key: settings.midtrans_server_key || '',
        midtrans_client_key: settings.midtrans_client_key || '',
        midtrans_environment: settings.midtrans_environment || 'sandbox',
        default_currency: settings.default_currency || 'IDR',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.settings.payment.update'), {
            onSuccess: () => {
                toast.success('Payment settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update payment settings');
            }
        });
    };

    const toggleSecretVisibility = (field) => {
        setShowSecrets(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const paymentTabs = [
        { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'blue' },
        { id: 'paypal', name: 'PayPal', icon: Globe, color: 'yellow' },
        { id: 'midtrans', name: 'Midtrans', icon: Zap, color: 'green' },
        { id: 'gopay', name: 'GoPay QRIS', icon: Shield, color: 'emerald' },
    ];

    return (
        <AppLayout title="Payment Settings">
            <Head title="Payment Settings" />
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
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment Settings</h1>
                                <p className="text-gray-600 mt-1">Configure payment gateways and methods</p>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateways</h3>
                            <nav className="space-y-2">
                                {paymentTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                                activeTab === tab.id
                                                    ? `bg-${tab.color}-50 text-${tab.color}-700 border-${tab.color}-200 border`
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${
                                                activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-400'
                                            }`} />
                                            <span className="font-medium">{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Currency Settings */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">General Settings</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Default Currency
                                        </label>
                                        <select
                                            value={data.default_currency}
                                            onChange={(e) => setData('default_currency', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="IDR">IDR - Indonesian Rupiah</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="SGD">SGD - Singapore Dollar</option>
                                        </select>
                                        {errors.default_currency && (
                                            <p className="text-red-500 text-sm mt-1">{errors.default_currency}</p>
                                        )}
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
                            {/* Stripe Settings */}
                            {activeTab === 'stripe' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Stripe Configuration</h2>
                                            <p className="text-gray-600">Configure your Stripe payment gateway</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stripe Publishable Key
                                            </label>
                                            <input
                                                type="text"
                                                value={data.stripe_public_key}
                                                onChange={(e) => setData('stripe_public_key', e.target.value)}
                                                placeholder="pk_test_..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {errors.stripe_public_key && (
                                                <p className="text-red-500 text-sm mt-1">{errors.stripe_public_key}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stripe Secret Key
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecrets.stripe_secret ? "text" : "password"}
                                                    value={data.stripe_secret_key}
                                                    onChange={(e) => setData('stripe_secret_key', e.target.value)}
                                                    placeholder="sk_test_..."
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSecretVisibility('stripe_secret')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showSecrets.stripe_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.stripe_secret_key && (
                                                <p className="text-red-500 text-sm mt-1">{errors.stripe_secret_key}</p>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-900">Security Note</h4>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        Your secret keys are encrypted and stored securely. Never share them publicly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PayPal Settings */}
                            {activeTab === 'paypal' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                            <Globe className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">PayPal Configuration</h2>
                                            <p className="text-gray-600">Configure your PayPal payment gateway</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                PayPal Client ID
                                            </label>
                                            <input
                                                type="text"
                                                value={data.paypal_client_id}
                                                onChange={(e) => setData('paypal_client_id', e.target.value)}
                                                placeholder="AXs..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            />
                                            {errors.paypal_client_id && (
                                                <p className="text-red-500 text-sm mt-1">{errors.paypal_client_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                PayPal Secret
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecrets.paypal_secret ? "text" : "password"}
                                                    value={data.paypal_secret}
                                                    onChange={(e) => setData('paypal_secret', e.target.value)}
                                                    placeholder="EGt..."
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSecretVisibility('paypal_secret')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showSecrets.paypal_secret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.paypal_secret && (
                                                <p className="text-red-500 text-sm mt-1">{errors.paypal_secret}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Midtrans Settings */}
                            {activeTab === 'midtrans' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Midtrans Configuration</h2>
                                            <p className="text-gray-600">Configure your Midtrans payment gateway</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Environment
                                            </label>
                                            <select
                                                value={data.midtrans_environment}
                                                onChange={(e) => setData('midtrans_environment', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                <option value="sandbox">Sandbox (Testing)</option>
                                                <option value="production">Production (Live)</option>
                                            </select>
                                            {errors.midtrans_environment && (
                                                <p className="text-red-500 text-sm mt-1">{errors.midtrans_environment}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Midtrans Server Key
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecrets.midtrans_server ? "text" : "password"}
                                                    value={data.midtrans_server_key}
                                                    onChange={(e) => setData('midtrans_server_key', e.target.value)}
                                                    placeholder="SB-Mid-server-..."
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSecretVisibility('midtrans_server')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showSecrets.midtrans_server ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.midtrans_server_key && (
                                                <p className="text-red-500 text-sm mt-1">{errors.midtrans_server_key}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Midtrans Client Key
                                            </label>
                                            <input
                                                type="text"
                                                value={data.midtrans_client_key}
                                                onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                                placeholder="SB-Mid-client-..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                            {errors.midtrans_client_key && (
                                                <p className="text-red-500 text-sm mt-1">{errors.midtrans_client_key}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GoPay QRIS Settings */}
                            {activeTab === 'gopay' && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">GoPay QRIS Configuration</h2>
                                            <p className="text-gray-600">Configure GoPay QRIS payment method using Midtrans</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-emerald-900">GoPay QRIS Integration</h4>
                                                    <p className="text-sm text-emerald-700 mt-1">
                                                        GoPay QRIS menggunakan konfigurasi Midtrans yang sudah ada. 
                                                        Pastikan Midtrans sudah dikonfigurasi dengan benar untuk mengaktifkan GoPay QRIS.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-900">Status</span>
                                                </div>
                                                <p className="text-sm text-gray-600">GoPay QRIS Aktif</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Menggunakan Midtrans {data.midtrans_environment}
                                                </p>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-900">Payment Methods</span>
                                                </div>
                                                <p className="text-sm text-gray-600">GoPay, OVO, DANA</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    LinkAja, ShopeePay
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-blue-900 mb-3">Fitur GoPay QRIS:</h4>
                                            <ul className="text-sm text-blue-700 space-y-2">
                                                <li className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    <span>Scan QR Code untuk pembayaran instant</span>
                                                </li>
                                                <li className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    <span>Support untuk berbagai e-wallet (GoPay, OVO, DANA, dll)</span>
                                                </li>
                                                <li className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    <span>Real-time payment verification</span>
                                                </li>
                                                <li className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    <span>Automatic course enrollment setelah pembayaran sukses</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-yellow-900">Setup Requirements</h4>
                                                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                                        <li>• Midtrans account harus sudah aktif</li>
                                                        <li>• GoPay payment method harus enabled di dashboard Midtrans</li>
                                                        <li>• Server key dan client key harus valid</li>
                                                        <li>• Webhook URL harus dikonfigurasi di Midtrans</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Lock className="w-4 h-4" />
                                    <span>Settings are encrypted and stored securely</span>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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