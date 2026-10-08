import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Camera,
    Save,
    Shield,
    BookOpen,
    Award,
    Users,
    Clock,
    DollarSign,
    Eye,
    EyeOff,
    Lock,
    Globe,
    Bell,
    Settings,
    Trash2,
    Edit3,
    Star,
    GraduationCap,
    Target,
    TrendingUp,
    X,
    Linkedin
} from 'lucide-react';

export default function ProfileSettings({ 
    user, 
    stats = {},
    achievements = [],
    preferences = {}
}) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const { data, setData, patch, post, processing, errors, reset } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        address: user.address || '',
        last_education: user.last_education || '',
        employment_status: user.employment_status || '',
        company: user.company || '',
        job_title: user.job_title || '',
        linkedin_url: user.linkedin_url || '',
        date_of_birth: user.date_of_birth || '',
        specialization: user.specialization || '',
        experience_years: user.experience_years || 0,
        avatar: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const userRole = user.roles?.[0]?.name || 'student';

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2048 * 1024) { // 2MB limit
                toast.error('Image size must be less than 2MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }
            
            setSelectedImage(file);
            setData('avatar', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = () => {
        if (!selectedImage) {
            toast.error('Please select an image first');
            return;
        }

        // Create a new form with the file
        const formData = new FormData();
        formData.append('avatar', selectedImage);

        // Use post method with proper setup for file upload
        post(route('profile.avatar.update'), {
            data: formData,
            forceFormData: true,
            headers: {
                'X-HTTP-Method-Override': 'PATCH',
            },
            onSuccess: () => {
                toast.success('Profile photo updated successfully!');
                setSelectedImage(null);
                setImagePreview(null);
                // Refresh the page to show new avatar
                window.location.reload();
            },
            onError: (errors) => {
                console.log('Upload errors:', errors);
                if (errors.avatar) {
                    toast.error(errors.avatar[0]);
                } else {
                    toast.error('Failed to update profile photo');
                }
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setIsEditingProfile(false);
            },
            onError: () => {
                toast.error('Failed to update profile');
            }
        });
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        passwordForm.patch(route('password.update'), {
            onSuccess: () => {
                toast.success('Password updated successfully!');
                setIsEditingPassword(false);
                passwordForm.reset();
            },
            onError: () => {
                toast.error('Failed to update password');
            }
        });
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        
        if (!deletePassword) {
            toast.error('Please enter your password to confirm account deletion');
            return;
        }

        if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            const formData = new FormData();
            formData.append('password', deletePassword);
            formData.append('_method', 'DELETE');

            post(route('profile.destroy'), {
                data: formData,
                onSuccess: () => {
                    toast.success('Account deleted successfully');
                    window.location.href = '/';
                },
                onError: () => {
                    toast.error('Failed to delete account. Please check your password.');
                    setDeletePassword('');
                }
            });
        }
    };

    const getRoleSpecificStats = () => {
        switch (userRole) {
            case 'admin':
                return [
                    { label: 'Total Users', value: stats.total_users || 0, icon: Users, color: 'blue' },
                    { label: 'Active Courses', value: stats.total_courses || 0, icon: BookOpen, color: 'green' },
                    { label: 'Revenue', value: `$${stats.total_revenue || 0}`, icon: DollarSign, color: 'yellow' },
                    { label: 'Platform Growth', value: `${stats.growth_rate || 0}%`, icon: TrendingUp, color: 'purple' }
                ];
            case 'instructor':
                return [
                    { label: 'My Courses', value: stats.my_courses || 0, icon: BookOpen, color: 'blue' },
                    { label: 'Total Students', value: stats.my_students || 0, icon: Users, color: 'green' },
                    { label: 'Earnings', value: `$${stats.my_earnings || 0}`, icon: DollarSign, color: 'yellow' },
                    { label: 'Avg Rating', value: stats.avg_rating || '0.0', icon: Star, color: 'purple' }
                ];
            case 'student':
                return [
                    { label: 'Enrolled Courses', value: stats.enrolled_courses || 0, icon: BookOpen, color: 'blue' },
                    { label: 'Completed', value: stats.completed_courses || 0, icon: Award, color: 'green' },
                    { label: 'Learning Hours', value: `${stats.learning_hours || 0}h`, icon: Clock, color: 'yellow' },
                    { label: 'Certificates', value: stats.certificates || 0, icon: GraduationCap, color: 'purple' }
                ];
            default:
                return [
 
                ];
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile Info', icon: User },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'stats', name: 'Statistics', icon: Target },
        { id: 'settings', name: 'Preferences', icon: Settings },
    ];

    return (
        <AppLayout title="Profile Settings">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-8">
                {/* Header with Profile Summary */}
                <div className="relative">
                    <motion.div 
                        className="bg-blue-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-visible"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ paddingBottom: selectedImage ? '5rem' : '2rem' }}
                    >
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center space-y-8 lg:space-y-0 lg:space-x-6">
                        <div className="relative self-center lg:self-start mb-4 lg:mb-0">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full flex items-center justify-center text-3xl lg:text-4xl font-bold backdrop-blur-sm overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
                                ) : user.avatar ? (
                                    <img src={user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</span>
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 rounded-full p-2 transition-colors cursor-pointer shadow-lg"
                                title="Change profile photo"
                            >
                                <Camera className="w-4 h-4 text-white" />
                            </label>
                            
                            {/* Upload button - positioned below avatar */}
                            {selectedImage && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-max">
                                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                                        <button
                                            onClick={handleImageUpload}
                                            disabled={processing}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-lg flex items-center space-x-2 min-w-[120px] justify-center"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Save Photo</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                                setData('avatar', null);
                                            }}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-lg"
                                            title="Cancel"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                                {user.first_name} {user.last_name}
                            </h1>
                            <p className="text-blue-100 text-lg mb-2">{user.email}</p>
                            <div className="flex items-center space-x-4 text-sm">
                                <span className="bg-white/20 px-3 py-1 rounded-full capitalize backdrop-blur-sm">
                                    {userRole}
                                </span>
                                {user.city && (
                                    <span className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.city}</span>
                                    </span>
                                )}
                                {user.created_at && (
                                    <span className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(user.created_at).getFullYear()}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
                        <div className="absolute bottom-4 right-16 w-20 h-20 rounded-full bg-white/10"></div>
                    </div>
                    </motion.div>
                </div>

                {/* Quick Stats */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {getRoleSpecificStats().map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div 
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                                        <button
                                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hp/WhatsApp
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    placeholder="08xxxxxxxxxx"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Alamat
                                            </label>
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                disabled={!isEditingProfile}
                                                rows={2}
                                                placeholder="Masukkan alamat lengkap Anda"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                        </div>

                                        {userRole === 'student' && (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Pendidikan Terakhir
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.last_education}
                                                            onChange={(e) => setData('last_education', e.target.value)}
                                                            disabled={!isEditingProfile}
                                                            placeholder="Contoh: SMA, D3, S1, S2"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                        />
                                                        {errors.last_education && <p className="text-red-500 text-sm mt-1">{errors.last_education}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Status
                                                        </label>
                                                        <select
                                                            value={data.employment_status}
                                                            onChange={(e) => setData('employment_status', e.target.value)}
                                                            disabled={!isEditingProfile}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                        >
                                                            <option value="">Pilih Status</option>
                                                            <option value="pelajar">Pelajar</option>
                                                            <option value="mahasiswa">Mahasiswa</option>
                                                            <option value="bekerja">Bekerja</option>
                                                        </select>
                                                        {errors.employment_status && <p className="text-red-500 text-sm mt-1">{errors.employment_status}</p>}
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nama Institusi
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.company}
                                                            onChange={(e) => setData('company', e.target.value)}
                                                            disabled={!isEditingProfile}
                                                            placeholder={data.employment_status === 'pelajar' || data.employment_status === 'mahasiswa' ? 'Contoh: Umum, atau nama sekolah/universitas' : 'Nama perusahaan atau institusi'}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                        />
                                                        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Jabatan
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.job_title}
                                                            onChange={(e) => setData('job_title', e.target.value)}
                                                            disabled={!isEditingProfile}
                                                            placeholder={data.employment_status === 'pelajar' || data.employment_status === 'mahasiswa' ? 'Contoh: Umum' : 'Jabatan/Posisi Anda'}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                        />
                                                        {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        LinkedIn URL
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                            <Linkedin className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="url"
                                                            value={data.linkedin_url}
                                                            onChange={(e) => setData('linkedin_url', e.target.value)}
                                                            disabled={!isEditingProfile}
                                                            placeholder="https://linkedin.com/in/username"
                                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                        />
                                                    </div>
                                                    {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>}
                                                </div>

                                                {(data.employment_status === 'pelajar' || data.employment_status === 'mahasiswa') && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="text-blue-600 mt-0.5">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-blue-900 mb-1">Informasi</h4>
                                                                <p className="text-sm text-blue-800">
                                                                    Untuk status Pelajar/Mahasiswa, Anda dapat mengisi field Nama Institusi dan Jabatan dengan <strong>"Umum"</strong> jika tidak ingin mencantumkan informasi spesifik.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {userRole === 'instructor' && (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Specialization
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.specialization}
                                                        onChange={(e) => setData('specialization', e.target.value)}
                                                        disabled={!isEditingProfile}
                                                        placeholder="e.g., Web Development, Data Science"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Experience (Years)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.experience_years}
                                                        onChange={(e) => setData('experience_years', e.target.value)}
                                                        disabled={!isEditingProfile}
                                                        min="0"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                                disabled={!isEditingProfile}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        {isEditingProfile && (
                                            <div className="flex justify-end space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingProfile(false);
                                                        reset();
                                                    }}
                                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                                    
                                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-lg">
                                        <div className="flex">
                                            <Shield className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-medium text-yellow-800">Password Security</h3>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Keep your account secure by using a strong password and updating it regularly.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {passwordForm.errors.current_password && (
                                                <p className="text-red-500 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {passwordForm.errors.password && (
                                                <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={passwordForm.processing}
                                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                <Lock className="w-4 h-4" />
                                                <span>{passwordForm.processing ? 'Updating...' : 'Update Password'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {userRole === 'admin' ? 'Platform Statistics' : 
                                         userRole === 'instructor' ? 'Teaching Statistics' : 
                                         'Learning Statistics'}
                                    </h2>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {getRoleSpecificStats().map((stat, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                                                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {achievements.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                                            <div className="space-y-3">
                                                {achievements.map((achievement, index) => (
                                                    <div key={index} className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                                                        <Award className="w-6 h-6 text-yellow-600" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{achievement.title}</p>
                                                            <p className="text-sm text-gray-600">{achievement.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                                <p className="text-sm text-gray-500">Receive email updates about your activity</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                                                <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                                                <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-red-800 mb-1">Delete Account</h4>
                                                    <p className="text-sm text-red-700 mb-3">
                                                        Once you delete your account, all of your data will be permanently removed.
                                                    </p>
                                                    {!showDeleteModal ? (
                                                        <button 
                                                            onClick={() => setShowDeleteModal(true)}
                                                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Delete Account
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-red-700 mb-1">
                                                                    Enter your password to confirm deletion
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    value={deletePassword}
                                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                                                    placeholder="Enter password"
                                                                />
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button 
                                                                    onClick={handleDeleteAccount}
                                                                    disabled={processing}
                                                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                                >
                                                                    {processing ? 'Deleting...' : 'Confirm Delete'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setShowDeleteModal(false);
                                                                        setDeletePassword('');
                                                                    }}
                                                                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}