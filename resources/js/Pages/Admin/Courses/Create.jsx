import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
import Modal from '../../../Components/Modal';
import CourseTrainingFields from '../../../Components/CourseTrainingFields';
import {
    ArrowLeft,
    Save,
    Upload,
    BookOpen,
    Users,
    Clock,
    DollarSign,
    Globe,
    Target,
    CheckCircle,
    Info,
    AlertCircle,
    Eye,
    Plus,
    Minus,
    X,
    Lock,
    Shield
} from 'lucide-react';

export default function CreateCourse({ instructors = [], categories = [], courseTypes = [], parentCourseTypes = [], targetCategories = [] }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [previewImage, setPreviewImage] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // Course Type Modal State
    const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
    const [courseTypeMode, setCourseTypeMode] = useState(''); // 'parent' or 'child'
    const [newCourseTypeParentId, setNewCourseTypeParentId] = useState('');
    const [newCourseTypeName, setNewCourseTypeName] = useState('');
    const [newCourseTypeDescription, setNewCourseTypeDescription] = useState('');
    const [newCourseTypeColor, setNewCourseTypeColor] = useState('#2A7C82');
    const [newCourseTypeIcon, setNewCourseTypeIcon] = useState('Award');
    const [isCreatingCourseType, setIsCreatingCourseType] = useState(false);

    const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);

    // Virtual Background State for Create form
    const [virtualBackgroundFile, setVirtualBackgroundFile] = useState(null);
    const [virtualBackgroundPreview, setVirtualBackgroundPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        subtitle: '',
        description: '',
        learning_objectives: [''],
        requirements: [''],
        target_audience: [''],
        competency_units: [''],
        instructor_ids: [],
        instructor_name: '',
        category_id: '',
        level: 'beginner',
        language: 'id',
        duration_hours: '',
        price: '',
        is_free: false,
        status: 'draft',
        access_type: 'public',
        access_description: '',
        thumbnail: null,
        virtual_background: null,
        // Training Fields
        course_type_id: null,
        is_permanent: true,
        access_duration_days: null,
        period_start: '',
        period_end: '',
        registration_deadline: '',
        auto_archive: false,
        certificate_title: '',
        delivery_method: 'hybrid',
        zoom_link: '',
        zoom_schedule: '',
        zoom_notes: '',
        require_zoom_screenshot: false,
        // Unit Kompetensi Fields for Certificate (dynamic array)
        certificate_unit_kompetensi: [],
        // Target Categories (Mahasiswa, Pemerintah, Perusahaan)
        target_category_ids: [],
    });

    // Show errors from server using useEffect
    React.useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.error('Validation errors from server:', errors);
            Object.keys(errors).forEach(key => {
                toast.error(`${key}: ${errors[key]}`);
            });
        }
    }, [errors]);

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Form submit started...');
        console.log('Current data:', data);

        // Validate required fields before submitting
        if (!data.title || !data.description || !data.category_id || !data.instructor_ids.length || !data.duration_hours) {
            console.error('Validation failed: Missing required fields');
            toast.error('Please fill in all required fields (Title, Description, Category, Instructor, Duration)');
            return;
        }

        // Clean up empty array items
        const cleanData = {
            ...data,
            learning_objectives: data.learning_objectives.filter(item => item.trim() !== ''),
            requirements: data.requirements.filter(item => item.trim() !== ''),
            target_audience: data.target_audience.filter(item => item.trim() !== ''),
            competency_units: data.competency_units.filter(item => item.trim() !== ''),
            // Convert empty strings to null for optional fields, ensure numbers for IDs
            category_id: data.category_id ? parseInt(data.category_id) : null,
            instructor_ids: data.instructor_ids.map(id => parseInt(id)),
            duration_hours: data.duration_hours ? parseFloat(data.duration_hours) : null,
            price: data.price ? parseFloat(data.price) : 0,
        };

        // Set price to 0 if is_free is true
        if (cleanData.is_free) {
            cleanData.price = 0;
        }

        console.log('Clean data to submit:', cleanData);
        console.log('Route:', route('admin.courses.store'));

        // Use router.post instead of form post for custom data
        router.post(route('admin.courses.store'), cleanData, {
            forceFormData: true, // Required for file uploads
            onBefore: () => {
                console.log('onBefore: Request starting...');
            },
            onStart: () => {
                console.log('onStart: Request started...');
            },
            onProgress: (progress) => {
                console.log('onProgress:', progress);
            },
            onSuccess: (page) => {
                console.log('onSuccess: Response received', page);
                // Only show success toast if we're on the courses index page with a success flash
                if (page.props.flash?.success) {
                    toast.success(page.props.flash.success);
                } else if (page.props.flash?.error) {
                    toast.error(page.props.flash.error);
                } else if (page.url && page.url.includes('/admin/courses') && !page.url.includes('/create')) {
                    // We're on the index page, assume success
                    toast.success('Pelatihan berhasil dibuat!');
                }
            },
            onError: (errors) => {
                console.error('onError: Validation errors:', errors);
                toast.error('Terjadi kesalahan, silakan periksa form');

                // Show specific error messages
                Object.keys(errors).forEach(key => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            },
            onFinish: () => {
                console.log('onFinish: Request completed');
            }
        });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                toast.error('File size is too large. Maximum size allowed is 10MB.');
                e.target.value = ''; // Clear the input
                return;
            }

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPG, PNG, or WebP).');
                e.target.value = ''; // Clear the input
                return;
            }

            setData('thumbnail', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle virtual background file selection for Create form
    // In Create mode, we store the file and will submit it with the form
    const handleVirtualBackgroundUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format file harus JPG, JPEG, PNG, atau WEBP');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }

        // Store file in form data
        setData('virtual_background', file);
        setVirtualBackgroundFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setVirtualBackgroundPreview(e.target.result);
        reader.readAsDataURL(file);

        toast.success('Virtual background dipilih. Akan diupload saat menyimpan pelatihan.');
    };

    // Delete virtual background (for Create form, just clear the selection)
    const handleVirtualBackgroundDelete = async () => {
        setData('virtual_background', null);
        setVirtualBackgroundFile(null);
        setVirtualBackgroundPreview(null);
        toast.success('Virtual background dihapus');
    };

    const addArrayItem = (field) => {
        setData(field, [...data[field], '']);
    };

    const removeArrayItem = (field, index) => {
        setData(field, data[field].filter((_, i) => i !== index));
    };

    const updateArrayItem = (field, index, value) => {
        const newArray = [...data[field]];
        newArray[index] = value;
        setData(field, newArray);
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!newCategoryName.trim()) {
            toast.error('Category name is required');
            return;
        }

        setIsCreatingCategory(true);

        router.post(route('admin.categories.store'), {
            name: newCategoryName,
            description: newCategoryDescription,
            is_active: true
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Category created successfully!');
                setShowCategoryModal(false);
                setNewCategoryName('');
                setNewCategoryDescription('');

                // Set the newly created category as selected if available
                const newCategory = page.props.flash?.category;
                if (newCategory) {
                    setData('category_id', newCategory.id);
                }
            },
            onError: (errors) => {
                console.error('Error creating category:', errors);
                if (errors.name) {
                    toast.error(errors.name);
                } else {
                    toast.error('Failed to create category');
                }
            },
            onFinish: () => {
                setIsCreatingCategory(false);
            }
        });
    };

    const handleCreateCourseType = async (e) => {
        e.preventDefault();

        // Validasi: mode harus dipilih dulu
        if (!courseTypeMode) {
            toast.error('Silakan pilih tipe: Parent atau Child');
            return;
        }

        // Validasi: nama harus diisi
        if (!newCourseTypeName.trim()) {
            toast.error('Nama jenis pelatihan harus diisi');
            return;
        }

        // Validasi: jika child, parent_id harus dipilih
        if (courseTypeMode === 'child' && !newCourseTypeParentId) {
            toast.error('Silakan pilih kategori parent');
            return;
        }

        setIsCreatingCourseType(true);

        const payload = {
            name: newCourseTypeName,
            description: newCourseTypeDescription,
            color: newCourseTypeColor,
            icon: newCourseTypeIcon,
            is_active: true,
            parent_id: courseTypeMode === 'child' ? newCourseTypeParentId : null
        };

        router.post(route('admin.course-types.store'), payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Jenis pelatihan berhasil ditambahkan!');

                // Reset modal
                setShowCourseTypeModal(false);
                setCourseTypeMode('');
                setNewCourseTypeParentId('');
                setNewCourseTypeName('');
                setNewCourseTypeDescription('');
                setNewCourseTypeColor('#2A7C82');
                setNewCourseTypeIcon('Award');

                // Jika yang dibuat adalah child, auto-select di dropdown
                if (courseTypeMode === 'child' && page.props.flash?.newCourseTypeId) {
                    setData('course_type_id', page.props.flash.newCourseTypeId);
                }

                // Reload page untuk refresh courseTypes data
                router.reload({ only: ['courseTypes'] });
            },
            onError: (errors) => {
                console.error('Error creating course type:', errors);
                if (errors.name) {
                    toast.error(errors.name);
                } else if (errors.parent_id) {
                    toast.error(errors.parent_id);
                } else {
                    toast.error('Gagal menambahkan jenis pelatihan');
                }
            },
            onFinish: () => {
                setIsCreatingCourseType(false);
            }
        });
    };

    const tabs = [
        { id: 'basic', name: 'Basic Information', icon: BookOpen },
        { id: 'content', name: 'Course Content', icon: Target },
        { id: 'pricing', name: 'Pricing & Settings', icon: DollarSign },
        { id: 'training', name: 'Training Config', icon: CheckCircle },
        { id: 'media', name: 'Media & Preview', icon: Upload },
    ];

    return (
        <AppLayout title="Tambah Pelatihan">
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tambah Pelatihan Baru</h1>
                            <p className="text-gray-600 mt-1">Create a new course for your platform</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => reset()}
                            disabled={processing}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            form="course-form"
                            disabled={processing}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save Course'}</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-6">
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

                            {/* Course Preview */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-medium text-gray-900 mb-3">Course Preview</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Title:</span>
                                        <span className="font-medium text-gray-900 truncate ml-2">
                                            {data.title || 'Untitled Course'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Level:</span>
                                        <span className="font-medium text-gray-900 capitalize">{data.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium text-gray-900">
                                            {data.duration_hours ? `${data.duration_hours}h` : '0h'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-medium text-gray-900">
                                            {data.is_free ? 'Free' : `Rp ${data.price || 0}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Access:</span>
                                        <span className={`font-medium text-xs px-2 py-1 rounded-full ${
                                            data.access_type === 'public' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {data.access_type === 'public' ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Form */}
                    <motion.div 
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information Tab */}
                                {activeTab === 'basic' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Course Title *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.title}
                                                        onChange={(e) => setData('title', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter course title..."
                                                        required
                                                    />
                                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Subtitle
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.subtitle}
                                                        onChange={(e) => setData('subtitle', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Brief subtitle for your course..."
                                                    />
                                                    {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category *
                                                    </label>
                                                    <div className="flex space-x-2">
                                                        <select
                                                            value={data.category_id}
                                                            onChange={(e) => setData('category_id', e.target.value)}
                                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            required
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCategoryModal(true)}
                                                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                                            title="Add New Category"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Add</span>
                                                        </button>
                                                    </div>
                                                    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Instruktur * <span className="text-gray-500 font-normal">(bisa pilih lebih dari satu)</span>
                                                    </label>

                                                    {/* Selected Instructors Tags */}
                                                    {data.instructor_ids.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {data.instructor_ids.map((instructorId, index) => {
                                                                const instructor = instructors.find(i => String(i.id) === String(instructorId));
                                                                return instructor ? (
                                                                    <span
                                                                        key={instructor.id}
                                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm max-w-full ${
                                                                            index === 0
                                                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                                                                        }`}
                                                                    >
                                                                        {index === 0 && <span className="text-xs font-semibold mr-1 flex-shrink-0">(Utama)</span>}
                                                                        <span className="truncate" title={`${instructor.first_name} ${instructor.last_name}`}>
                                                                            {instructor.first_name} {instructor.last_name}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newIds = data.instructor_ids.filter(id => String(id) !== String(instructor.id));
                                                                                setData('instructor_ids', newIds);
                                                                            }}
                                                                            className="ml-1 flex-shrink-0 hover:text-red-600 transition-colors"
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </span>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Instructor Dropdown */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowInstructorDropdown(!showInstructorDropdown)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
                                                        >
                                                            <span className={data.instructor_ids.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                                                                {data.instructor_ids.length > 0
                                                                    ? `${data.instructor_ids.length} instruktur dipilih`
                                                                    : 'Pilih Instruktur...'}
                                                            </span>
                                                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showInstructorDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                        {showInstructorDropdown && (
                                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {instructors.length === 0 ? (
                                                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                                        Tidak ada instruktur tersedia
                                                                    </div>
                                                                ) : (
                                                                    instructors.map((instructor) => {
                                                                        const isSelected = data.instructor_ids.includes(String(instructor.id)) || data.instructor_ids.includes(instructor.id);
                                                                        return (
                                                                            <label
                                                                                key={instructor.id}
                                                                                className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                                                                                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                                                }`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            setData('instructor_ids', [...data.instructor_ids, instructor.id]);
                                                                                        } else {
                                                                                            setData('instructor_ids', data.instructor_ids.filter(id => String(id) !== String(instructor.id)));
                                                                                        }
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <div className="text-sm font-medium text-gray-900">
                                                                                        {instructor.first_name} {instructor.last_name}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500">{instructor.email}</div>
                                                                                </div>
                                                                            </label>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Instruktur pertama akan menjadi instruktur utama yang ditampilkan di sertifikat.
                                                    </p>
                                                    {errors.instructor_ids && <p className="text-red-500 text-sm mt-1">{errors.instructor_ids}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Level *
                                                    </label>
                                                    <select
                                                        value={data.level}
                                                        onChange={(e) => setData('level', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="beginner">Beginner</option>
                                                        <option value="intermediate">Intermediate</option>
                                                        <option value="advanced">Advanced</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Language *
                                                    </label>
                                                    <select
                                                        value={data.language}
                                                        onChange={(e) => setData('language', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="id">Indonesian</option>
                                                        <option value="en">English</option>
                                                        <option value="both">Both</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Duration (Hours) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={data.duration_hours}
                                                        onChange={(e) => setData('duration_hours', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="0"
                                                        required
                                                    />
                                                    {errors.duration_hours && <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Description *
                                                    </label>
                                                    <textarea
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        rows={6}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Detailed description of your course..."
                                                        required
                                                    />
                                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Course Content Tab */}
                                {activeTab === 'content' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h3>
                                        
                                        {/* Learning Objectives */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Learning Objectives
                                            </label>
                                            <p className="text-sm text-gray-500 mb-3">What will students learn from this course?</p>
                                            
                                            <div className="space-y-3">
                                                {data.learning_objectives.map((objective, index) => (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <input
                                                            type="text"
                                                            value={objective}
                                                            onChange={(e) => updateArrayItem('learning_objectives', index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder={`Learning objective ${index + 1}...`}
                                                        />
                                                        {data.learning_objectives.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('learning_objectives', index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addArrayItem('learning_objectives')}
                                                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Learning Objective</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Requirements */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Prerequisites
                                            </label>
                                            <p className="text-sm text-gray-500 mb-3">What should students know before taking this course?</p>
                                            
                                            <div className="space-y-3">
                                                {data.requirements.map((requirement, index) => (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <input
                                                            type="text"
                                                            value={requirement}
                                                            onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder={`Requirement ${index + 1}...`}
                                                        />
                                                        {data.requirements.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('requirements', index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addArrayItem('requirements')}
                                                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Requirement</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Target Audience */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Audience
                                            </label>
                                            <p className="text-sm text-gray-500 mb-3">Who is this course for?</p>
                                            
                                            <div className="space-y-3">
                                                {data.target_audience.map((audience, index) => (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <input
                                                            type="text"
                                                            value={audience}
                                                            onChange={(e) => updateArrayItem('target_audience', index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder={`Target audience ${index + 1}...`}
                                                        />
                                                        {data.target_audience.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('target_audience', index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addArrayItem('target_audience')}
                                                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Target Audience</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Pricing & Settings Tab */}
                                {activeTab === 'pricing' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Settings</h3>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Price (IDR) *
                                                </label>
                                                <label className="flex items-center space-x-3 mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.is_free}
                                                        onChange={(e) => setData('is_free', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">This is a free course</span>
                                                </label>

                                                {!data.is_free && (
                                                    <div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.price}
                                                            onChange={(e) => setData('price', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="0"
                                                            required={!data.is_free}
                                                        />
                                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status *
                                                </label>
                                                <select
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="draft">Draft - Save for later</option>
                                                    <option value="published">Published - Make it live</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Access Control Section */}
                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                                <span>Course Access Control</span>
                                            </h4>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Who can access this course?
                                                    </label>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="access_type"
                                                                value="public"
                                                                checked={data.access_type === 'public'}
                                                                onChange={(e) => setData('access_type', e.target.value)}
                                                                className="mt-1 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Globe className="w-4 h-4 text-green-600" />
                                                                    <span className="font-medium text-gray-900">Public Course</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Anyone can find and enroll in this course. This is the default setting for most courses.
                                                                </p>
                                                            </div>
                                                        </label>
                                                        
                                                        <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="access_type"
                                                                value="private"
                                                                checked={data.access_type === 'private'}
                                                                onChange={(e) => setData('access_type', e.target.value)}
                                                                className="mt-1 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Lock className="w-4 h-4 text-orange-600" />
                                                                    <span className="font-medium text-gray-900">Private Course</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Only specific users granted access by admins can enroll. Ideal for exclusive content or corporate training.
                                                                </p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {data.access_type === 'private' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Access Description (Optional)
                                                        </label>
                                                        <textarea
                                                            value={data.access_description}
                                                            onChange={(e) => setData('access_description', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Describe who should have access to this course and why it's private..."
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            This description will help you manage access and explain the restriction to potential students.
                                                        </p>
                                                        {errors.access_description && <p className="text-red-500 text-sm mt-1">{errors.access_description}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Target Categories Section */}
                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                                <Users className="w-5 h-5 text-purple-600" />
                                                <span>Kategori Target Peserta</span>
                                            </h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Pelatihan ini ditujukan untuk: (pilih satu atau lebih)
                                                    </label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {targetCategories.map((category) => (
                                                            <label
                                                                key={category.id}
                                                                className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                                    data.target_category_ids.includes(category.id)
                                                                        ? 'border-purple-500 bg-purple-50'
                                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.target_category_ids.includes(category.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setData('target_category_ids', [...data.target_category_ids, category.id]);
                                                                        } else {
                                                                            setData('target_category_ids', data.target_category_ids.filter(id => id !== category.id));
                                                                        }
                                                                    }}
                                                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                />
                                                                <div className="flex items-center space-x-2">
                                                                    <div
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                                                                        style={{ backgroundColor: category.color }}
                                                                    >
                                                                        {category.name.charAt(0)}
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">{category.name}</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Kategori ini akan digunakan untuk menampilkan pelatihan di halaman depan dan filter di browse courses.
                                                    </p>
                                                    {errors.target_category_ids && <p className="text-red-500 text-sm mt-1">{errors.target_category_ids}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-medium mb-1">Course Pricing Tips</p>
                                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                                        <li>Research competitor pricing for similar courses</li>
                                                        <li>Consider offering early bird discounts</li>
                                                        <li>Free courses can help build your reputation</li>
                                                        <li>Premium courses typically range from 100k - 2M IDR</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Training Configuration Tab */}
                                {activeTab === 'training' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Training Configuration</h3>

                                        <CourseTrainingFields
                                            formData={data}
                                            setFormData={(newData) => {
                                                // Extract only the changed fields to update
                                                const changes = {};
                                                Object.keys(newData).forEach(key => {
                                                    if (data[key] !== newData[key]) {
                                                        changes[key] = newData[key];
                                                    }
                                                });
                                                // Update each changed field
                                                Object.entries(changes).forEach(([key, value]) => {
                                                    setData(key, value);
                                                });
                                            }}
                                            courseTypes={courseTypes}
                                            onAddCourseType={() => setShowCourseTypeModal(true)}
                                            virtualBackground={virtualBackgroundPreview}
                                            onVirtualBackgroundUpload={handleVirtualBackgroundUpload}
                                            onVirtualBackgroundDelete={handleVirtualBackgroundDelete}
                                            isUploadingVirtualBackground={false}
                                        />
                                    </motion.div>
                                )}

                                {/* Media & Preview Tab */}
                                {activeTab === 'media' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Media & Preview</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Course Thumbnail
                                            </label>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Upload an engaging thumbnail for your course<br />
                                                <strong>Requirements:</strong> Max 10MB, 1280x720px recommended, JPG/PNG/WebP format
                                            </p>
                                            
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                                {previewImage ? (
                                                    <div className="relative">
                                                        <img
                                                            src={previewImage}
                                                            alt="Course thumbnail preview"
                                                            className="max-w-full h-48 object-cover rounded-lg mx-auto"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPreviewImage(null);
                                                                setData('thumbnail', null);
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <label htmlFor="thumbnail" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                                                                Click to upload
                                                            </label>
                                                            <span> or drag and drop</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB</p>
                                                    </div>
                                                )}
                                                
                                                <input
                                                    id="thumbnail"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="hidden"
                                                />
                                            </div>
                                            {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                <div className="text-sm text-yellow-800">
                                                    <p className="font-medium mb-1">Media Guidelines</p>
                                                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                                        <li>Use high-quality, relevant images that represent your course content</li>
                                                        <li>Avoid text-heavy thumbnails - keep it simple and visually appealing</li>
                                                        <li>Ensure your thumbnail looks good on both desktop and mobile devices</li>
                                                        <li>Consider using your brand colors to maintain consistency</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Add Category Modal */}
                <Modal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} maxWidth="md">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Add New Category</h3>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter category name..."
                                    required
                                    disabled={isCreatingCategory}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief description of the category..."
                                    disabled={isCreatingCategory}
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    disabled={isCreatingCategory}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCategory}
                                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{isCreatingCategory ? 'Creating...' : 'Create Category'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Add Course Type Modal */}
                <Modal show={showCourseTypeModal} onClose={() => {
                    setShowCourseTypeModal(false);
                    setCourseTypeMode('');
                    setNewCourseTypeParentId('');
                    setNewCourseTypeName('');
                    setNewCourseTypeDescription('');
                    setNewCourseTypeColor('#2A7C82');
                    setNewCourseTypeIcon('Award');
                }} maxWidth="lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Tambah Jenis Pelatihan & Sertifikat</h3>
                            <button
                                onClick={() => {
                                    setShowCourseTypeModal(false);
                                    setCourseTypeMode('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isCreatingCourseType}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCourseType} className="space-y-5">
                            {/* Step 1: Pilih Tipe (Parent atau Child) */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    <Shield className="w-4 h-4 inline mr-2" />
                                    Langkah 1: Pilih Tipe *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCourseTypeMode('parent');
                                            setNewCourseTypeParentId('');
                                        }}
                                        disabled={isCreatingCourseType}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            courseTypeMode === 'parent'
                                                ? 'border-blue-500 bg-blue-100 shadow-md'
                                                : 'border-gray-300 bg-white hover:border-blue-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📚</div>
                                            <div className="font-bold text-gray-900">Parent Category</div>
                                            <div className="text-xs text-gray-600 mt-1">Kategori Induk Baru</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCourseTypeMode('child')}
                                        disabled={isCreatingCourseType}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            courseTypeMode === 'child'
                                                ? 'border-green-500 bg-green-100 shadow-md'
                                                : 'border-gray-300 bg-white hover:border-green-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📖</div>
                                            <div className="font-bold text-gray-900">Child Category</div>
                                            <div className="text-xs text-gray-600 mt-1">Sub Pelatihan/Sertifikat</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Jika Child, Pilih Parent */}
                            {courseTypeMode === 'child' && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        Langkah 2: Pilih Parent Category *
                                    </label>
                                    <select
                                        value={newCourseTypeParentId}
                                        onChange={(e) => setNewCourseTypeParentId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        disabled={isCreatingCourseType}
                                    >
                                        <option value="">-- Pilih Parent Category --</option>
                                        {parentCourseTypes.map((parent) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Step 3: Input Data */}
                            {courseTypeMode && (
                                <div className="space-y-4 border-t-2 pt-4">
                                    <h4 className="font-bold text-gray-900">
                                        {courseTypeMode === 'parent' ? 'Langkah 2' : 'Langkah 3'}: Detail Jenis Pelatihan
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Jenis Pelatihan *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCourseTypeName}
                                            onChange={(e) => setNewCourseTypeName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={courseTypeMode === 'parent'
                                                ? "Contoh: Pelatihan Umum Untuk Semua Industri"
                                                : "Contoh: Pelatihan Umum - Climate Risk Management"}
                                            required
                                            disabled={isCreatingCourseType}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deskripsi (Opsional)
                                        </label>
                                        <textarea
                                            value={newCourseTypeDescription}
                                            onChange={(e) => setNewCourseTypeDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Deskripsi singkat tentang jenis pelatihan ini..."
                                            disabled={isCreatingCourseType}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Warna Badge
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={newCourseTypeColor}
                                                    onChange={(e) => setNewCourseTypeColor(e.target.value)}
                                                    className="h-10 w-20 rounded cursor-pointer border border-gray-300"
                                                    disabled={isCreatingCourseType}
                                                />
                                                <input
                                                    type="text"
                                                    value={newCourseTypeColor}
                                                    onChange={(e) => setNewCourseTypeColor(e.target.value)}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="#2A7C82"
                                                    disabled={isCreatingCourseType}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Icon (Lucide Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={newCourseTypeIcon}
                                                onChange={(e) => setNewCourseTypeIcon(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Award, Trophy, Monitor..."
                                                disabled={isCreatingCourseType}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCourseTypeModal(false);
                                        setCourseTypeMode('');
                                        setNewCourseTypeParentId('');
                                        setNewCourseTypeName('');
                                        setNewCourseTypeDescription('');
                                    }}
                                    disabled={isCreatingCourseType}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCourseType || !courseTypeMode}
                                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{isCreatingCourseType ? 'Menambahkan...' : 'Tambahkan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
}