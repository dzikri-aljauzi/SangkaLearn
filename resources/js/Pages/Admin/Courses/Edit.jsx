import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../Layouts/AppLayout';
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
    X
} from 'lucide-react';

export default function EditCourse({ course, instructors = [], categories = [], courseTypes = [], targetCategories = [], parentCourseTypes = [] }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [previewImage, setPreviewImage] = useState(null);
    const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
    const [virtualBackground, setVirtualBackground] = useState(
        course.virtual_background_path ? `/storage/${course.virtual_background_path}` : null
    );
    const [isUploadingVirtualBackground, setIsUploadingVirtualBackground] = useState(false);

    // Helper to get instructor name by ID (use == for type coercion)
    const getInstructorNameById = (instructorId) => {
        if (!instructorId || !instructors.length) return '';
        const instructor = instructors.find(i => String(i.id) === String(instructorId));
        if (instructor) {
            return `${instructor.first_name} ${instructor.last_name}`.trim();
        }
        return '';
    };

    // Get initial instructor name - prefer saved value, fallback to instructor's name
    const getInitialInstructorName = () => {
        if (course.instructor_name) return course.instructor_name;
        return getInstructorNameById(course.instructor_id);
    };

    // Get initial instructor IDs from course.instructors (many-to-many) or fallback to instructor_id
    const getInitialInstructorIds = () => {
        if (Array.isArray(course.instructors) && course.instructors.length > 0) {
            return course.instructors.map(i => i.id);
        }
        // Fallback to single instructor_id for backward compatibility
        if (course.instructor_id) {
            return [course.instructor_id];
        }
        return [];
    };

    const { data, setData, processing, errors, reset } = useForm({
        title: course.title || '',
        subtitle: course.subtitle || '',
        description: course.description || '',
        learning_objectives: Array.isArray(course.learning_objectives) && course.learning_objectives.length > 0 ? course.learning_objectives : [''],
        requirements: Array.isArray(course.requirements) && course.requirements.length > 0 ? course.requirements : [''],
        target_audience: Array.isArray(course.target_audience) && course.target_audience.length > 0 ? course.target_audience : [''],
        competency_units: Array.isArray(course.competency_units) && course.competency_units.length > 0 ? course.competency_units : [''],
        instructor_ids: getInitialInstructorIds(),
        instructor_name: getInitialInstructorName(),
        category_id: course.category_id || '',
        level: course.level || 'beginner',
        language: course.language || 'id',
        duration_hours: course.duration_hours || '',
        price: course.price || '',
        is_free: course.is_free || false,
        status: course.status || 'draft',
        access_type: course.access_type || 'public',
        access_description: course.access_description || '',
        thumbnail: null,
        // Training Fields
        course_type_id: course.course_type_id || null,
        is_permanent: course.is_permanent !== false,
        access_duration_days: course.access_duration_days || null,
        period_start: course.period_start || '',
        period_end: course.period_end || '',
        registration_deadline: course.registration_deadline || '',
        auto_archive: course.auto_archive || false,
        certificate_title: course.certificate_title || '',
        delivery_method: course.delivery_method || 'hybrid',
        zoom_link: course.zoom_link || '',
        zoom_schedule: course.zoom_schedule || '',
        zoom_notes: course.zoom_notes || '',
        require_zoom_screenshot: course.require_zoom_screenshot || false,
        // Unit Kompetensi Fields for Certificate (dynamic array)
        certificate_unit_kompetensi: Array.isArray(course.certificate_unit_kompetensi) && course.certificate_unit_kompetensi.length > 0
            ? course.certificate_unit_kompetensi
            : [],
        // Target Categories (Mahasiswa, Pemerintah, Perusahaan)
        target_category_ids: Array.isArray(course.target_categories)
            ? course.target_categories.map(tc => tc.id)
            : [],
    });

    // Auto-set instructor_name when component mounts if not already set
    useEffect(() => {
        if (!data.instructor_name && data.instructor_ids.length > 0 && instructors.length > 0) {
            const instructorName = getInstructorNameById(data.instructor_ids[0]);
            if (instructorName) {
                setData('instructor_name', instructorName);
            }
        }
    }, [instructors]);

    // Set initial preview image if course has thumbnail
    useEffect(() => {
        if (course.thumbnail) {
            setPreviewImage(`/storage/${course.thumbnail}`);
        }
    }, [course.thumbnail]);

    // Handle virtual background upload
    const handleVirtualBackgroundUpload = async (file) => {
        setIsUploadingVirtualBackground(true);
        const formData = new FormData();
        formData.append('virtual_background', file);

        // Build URL - use route helper if available, fallback to manual URL
        let uploadUrl;
        try {
            uploadUrl = route('admin.courses.virtual-background.upload', course.id);
        } catch (e) {
            // Fallback if route helper fails
            uploadUrl = `/admin/courses/${course.id}/virtual-background`;
        }
        console.log('Upload URL:', uploadUrl, 'Course ID:', course.id);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setVirtualBackground(result.virtual_background_url);
                toast.success('Virtual background berhasil diupload!');
            } else {
                toast.error(result.error || 'Gagal mengupload virtual background');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Gagal mengupload virtual background');
        } finally {
            setIsUploadingVirtualBackground(false);
        }
    };

    // Handle virtual background delete
    const handleVirtualBackgroundDelete = async () => {
        setIsUploadingVirtualBackground(true);

        // Build URL - use route helper if available, fallback to manual URL
        let deleteUrl;
        try {
            deleteUrl = route('admin.courses.virtual-background.delete', course.id);
        } catch (e) {
            deleteUrl = `/admin/courses/${course.id}/virtual-background`;
        }

        try {
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setVirtualBackground(null);
                toast.success('Virtual background berhasil dihapus!');
            } else {
                toast.error(result.error || 'Gagal menghapus virtual background');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Gagal menghapus virtual background');
        } finally {
            setIsUploadingVirtualBackground(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!data.instructor_ids.length) {
            toast.error('Please select at least one instructor');
            return;
        }

        // Clean up empty array items
        const cleanData = {
            ...data,
            learning_objectives: data.learning_objectives.filter(item => item.trim() !== ''),
            requirements: data.requirements.filter(item => item.trim() !== ''),
            target_audience: data.target_audience.filter(item => item.trim() !== ''),
            competency_units: data.competency_units.filter(item => item.trim() !== ''),
            // Filter certificate_unit_kompetensi - ensure empty array is sent when all items removed
            certificate_unit_kompetensi: Array.isArray(data.certificate_unit_kompetensi)
                ? data.certificate_unit_kompetensi.filter(item => item && item.trim() !== '')
                : [],
            // Convert instructor_ids to integers
            instructor_ids: data.instructor_ids.map(id => parseInt(id)),
        };

        // Set price to 0 if is_free is true
        if (cleanData.is_free) {
            cleanData.price = 0;
        }

        console.log('Updating course data:', cleanData);

        // Use custom POST route for file uploads
        router.post(route('admin.courses.update-post', course.id), cleanData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Course updated successfully!');
            },
            onError: (errors) => {
                toast.error('Please check the form for errors');
                console.error('Validation errors:', errors);

                // Show specific error messages
                Object.keys(errors).forEach(key => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            }
        });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
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

    const tabs = [
        { id: 'basic', name: 'Basic Information', icon: BookOpen },
        { id: 'content', name: 'Course Content', icon: Target },
        { id: 'pricing', name: 'Pricing & Settings', icon: DollarSign },
        { id: 'training', name: 'Training Config', icon: CheckCircle },
        { id: 'media', name: 'Media & Preview', icon: Upload },
    ];

    return (
        <AppLayout title={`Edit Course - ${course.title}`}>
            <Head title={`Edit Course - ${course.title}`} />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.courses.index')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Course</h1>
                            <p className="text-gray-600 mt-1">Update course information and settings</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                        </Link>
                        
                        <button
                            type="button"
                            onClick={() => reset()}
                            disabled={processing}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Reset Changes
                        </button>
                        
                        <button
                            type="submit"
                            form="course-form"
                            disabled={processing}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Update Course'}</span>
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
                                                    <select
                                                        value={data.category_id}
                                                        onChange={(e) => setData('category_id', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
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
                                                <label className="flex items-center space-x-3 mb-4">
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
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Price (IDR) *
                                                        </label>
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
                                                    <option value="archived">Archived - Hide from public</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Access Type *
                                                </label>
                                                <select
                                                    value={data.access_type}
                                                    onChange={(e) => setData('access_type', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="public">Public - Anyone can access</option>
                                                    <option value="private">Private - Restricted access</option>
                                                </select>
                                            </div>

                                            {data.access_type === 'private' && (
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Access Description
                                                    </label>
                                                    <textarea
                                                        value={data.access_description}
                                                        onChange={(e) => setData('access_description', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Describe who can access this private course..."
                                                    />
                                                    {errors.access_description && <p className="text-red-500 text-sm mt-1">{errors.access_description}</p>}
                                                </div>
                                            )}

                                            {/* Target Categories Section */}
                                            <div className="md:col-span-2 border-t pt-6 mt-4">
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
                                            virtualBackground={virtualBackground}
                                            onVirtualBackgroundUpload={handleVirtualBackgroundUpload}
                                            onVirtualBackgroundDelete={handleVirtualBackgroundDelete}
                                            isUploadingVirtualBackground={isUploadingVirtualBackground}
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
                                            <p className="text-sm text-gray-500 mb-4">Upload an engaging thumbnail for your course (recommended: 1280x720px)</p>
                                            
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
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
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
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}