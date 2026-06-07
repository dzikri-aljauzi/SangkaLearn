import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import { CartSuccessAlert } from '@/Components/Alert';
import PreviewBanner from '@/Components/PreviewBanner';
import {
    PlayCircle,
    Users,
    BookOpen,
    Clock,
    Award,
    CheckCircle,
    User,
    Calendar,
    DollarSign,
    Heart,
    Share2,
    ShoppingCart,
    Eye,
    Monitor,
    FileText,
    Target,
    Zap,
    Edit,
    Briefcase,
    GraduationCap,
    Building2,
    Lock,
    AlertCircle,
    Info
} from 'lucide-react';

export default function CourseShow({ course, relatedCourses = [], auth, isPreviewMode = false, adminReturnUrl = null, previewEnrolledUrl = null }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showCartAlert, setShowCartAlert] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Defensive check
    if (!course || !course.title || !course.slug) {
        return (
            <AppLayout title="Course Not Found" hideHeader={isPreviewMode} showSidebar={!isPreviewMode}>
                <Head title="Course Not Found" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pelatihan Tidak Ditemukan</h1>
                        <p className="text-gray-600 mb-6">Maaf, pelatihan yang Anda cari tidak dapat ditemukan.</p>
                        <Link href="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Kembali ke Daftar Pelatihan
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const formatPrice = (price) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getDashboardUrl = () => {
        const userRole = auth?.user?.roles?.[0]?.name;
        switch (userRole) {
            case 'admin': return '/admin/dashboard';
            case 'instructor': return '/instructor/dashboard';
            case 'sub_admin': return '/subadmin/dashboard';
            default: return '/student/dashboard';
        }
    };

    const handleEnrollment = () => {
        if (!auth?.user) { router.visit('/login'); return; }
        router.visit(getDashboardUrl());
    };

    const handleAddToCart = () => {
        if (!auth?.user) { router.visit('/login'); return; }
        router.visit(getDashboardUrl());
    };

    const handleBuyNow = () => {
        if (!auth?.user) { router.visit('/login'); return; }
        router.visit(getDashboardUrl());
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: Eye },
        { id: 'curriculum', name: 'Kurikulum', icon: BookOpen },
        { id: 'instructor', name: 'Instruktur', icon: User }
    ];

    // Check if user can see price (only general students who are logged in)
    const canSeePrice = auth?.user && auth?.user?.user_type === 'general';

    return (
        <AppLayout title={course.title} hideHeader={isPreviewMode} showSidebar={!isPreviewMode}>
            <Head title={course.title} />

            {/* Preview Mode Banner */}
            {isPreviewMode && adminReturnUrl && (
                <PreviewBanner returnUrl={adminReturnUrl} previewEnrolledUrl={previewEnrolledUrl} />
            )}

            <div className={`min-h-screen bg-gray-50 ${isPreviewMode ? 'pt-14' : ''}`}>
                {/* Compact Hero Section */}
                <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white">
                    <div className="container mx-auto px-4 py-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {course.category && (
                                <div className="text-blue-200 mb-2 text-sm">
                                    <Link href={`/categories/${course.category.slug}`} className="hover:text-white">
                                        {course.category.name}
                                    </Link>
                                </div>
                            )}

                            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>

                            {course.subtitle && (
                                <p className="text-lg text-blue-100 mb-4">{course.subtitle}</p>
                            )}

                            {/* Course Stats */}
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                                <div className="flex items-center space-x-1.5">
                                    <Users className="w-4 h-4" />
                                    <span>{course.enrolled_count} siswa</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.duration_hours}h total</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{course.lesson_count} pelajaran</span>
                                </div>
                                {course.assignment_count > 0 && (
                                    <div className="flex items-center space-x-1.5">
                                        <Edit className="w-4 h-4" />
                                        <span>{course.assignment_count} tugas</span>
                                    </div>
                                )}
                                {course.quiz_count > 0 && (
                                    <div className="flex items-center space-x-1.5">
                                        <FileText className="w-4 h-4" />
                                        <span>{course.quiz_count} kuis</span>
                                    </div>
                                )}
                            </div>

                            {/* Instructors */}
                            {(course.instructors?.length > 0 || course.instructor) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-blue-200 text-sm">Instruktur:</span>
                                    {(course.instructors?.length > 0 ? course.instructors : [course.instructor]).map((instructor, idx) => (
                                        <div key={instructor.id || idx} className="relative group flex items-center space-x-2 bg-blue-700/50 rounded-full pr-3 py-0.5 cursor-pointer">
                                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {instructor.avatar ? (
                                                    <img src={`/storage/${instructor.avatar}`} alt={instructor.name || 'Instructor'} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-[180px]">{instructor.name || 'Anonymous Instructor'}</span>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max max-w-[200px] break-words whitespace-normal text-center z-50">
                                                {instructor.name || 'Anonymous Instructor'}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Main Content - Tabs & Price Card Side by Side */}
                <div className="container mx-auto px-4 py-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left: Tabs + Content */}
                        <div className="lg:col-span-2">
                            {/* Tabs Navigation */}
                            <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-xl sticky top-0 z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg transition-all text-sm ${
                                            activeTab === tab.id
                                                ? 'bg-white shadow-md text-blue-600 font-semibold'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                {activeTab === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                        <h2 className="text-xl font-bold mb-4">Tentang Pelatihan</h2>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 leading-relaxed mb-4">
                                                {course.description ? (
                                                    showFullDescription || course.description.length <= 300
                                                        ? course.description
                                                        : course.description.substring(0, 300) + '...'
                                                ) : 'Deskripsi tidak tersedia'}
                                            </p>
                                            {course.description && course.description.length > 300 && (
                                                <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                    {showFullDescription ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Selengkapnya'}
                                                </button>
                                            )}
                                        </div>

                                        {Array.isArray(course.learning_outcomes) && course.learning_outcomes.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                                    <Target className="w-5 h-5 text-blue-600" />
                                                    <span>Apa yang akan Anda pelajari</span>
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-2">
                                                    {course.learning_outcomes.map((outcome, index) => (
                                                        <div key={index} className="flex items-start space-x-2">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700 text-sm">{outcome}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold mb-3">Persyaratan</h3>
                                                <ul className="space-y-1.5">
                                                    {course.requirements.map((requirement, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-700 text-sm">{requirement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {Array.isArray(course.target_audience) && course.target_audience.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                    <span>Target Peserta</span>
                                                </h3>
                                                <ul className="space-y-1.5">
                                                    {course.target_audience.map((audience, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700 text-sm">{audience}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <motion.div key="curriculum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                        <h2 className="text-xl font-bold mb-4">Kurikulum Pelatihan</h2>

                                        {Array.isArray(course.sections) && course.sections.length > 0 ? (
                                            <div className="space-y-4">
                                                {course.sections.map((section, sectionIndex) => (
                                                    <div key={section.id || sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="bg-gray-50 p-3">
                                                            <h3 className="font-semibold">
                                                                {sectionIndex + 1}. {section.title || 'Untitled Section'}
                                                            </h3>
                                                            {section.description && (
                                                                <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="p-3 space-y-2">
                                                            {Array.isArray(section.lessons) && section.lessons.map((lesson, lessonIndex) => (
                                                                <div key={lesson.id || lessonIndex} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <PlayCircle className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-gray-600 text-sm">{lesson.title || 'Untitled Lesson'}</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">{formatDuration(lesson.duration_minutes || 0)}</span>
                                                                </div>
                                                            ))}

                                                            {Array.isArray(section.assignments) && section.assignments.map((assignment, idx) => (
                                                                <div key={assignment.id || idx} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-gray-600 text-sm">{assignment.title || 'Untitled Assignment'}</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Tugas</span>
                                                                </div>
                                                            ))}

                                                            {Array.isArray(section.quizzes) && section.quizzes.map((quiz, idx) => (
                                                                <div key={quiz.id || idx} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-gray-600 text-sm">{quiz.title || 'Untitled Quiz'}</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Kuis</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600 text-sm">Kurikulum belum tersedia</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'instructor' && (course.instructors?.length > 0 || course.instructor) && (
                                    <motion.div key="instructor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                        <h2 className="text-xl font-bold mb-4">
                                            Instruktur {(course.instructors?.length || 1) > 1 && `(${course.instructors.length})`}
                                        </h2>

                                        <div className="space-y-6">
                                            {(course.instructors?.length > 0 ? course.instructors : [course.instructor]).map((instructor, idx) => (
                                                <div key={instructor.id || idx} className={`flex flex-col sm:flex-row items-start gap-4 ${idx > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                                                    {/* Avatar */}
                                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        {instructor.avatar ? (
                                                            <img src={`/storage/${instructor.avatar}`} alt={instructor.name || 'Instructor'} className="w-full h-full rounded-xl object-cover" />
                                                        ) : (
                                                            <User className="w-10 h-10 text-blue-400" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900">{instructor.name || 'Anonymous Instructor'}</h3>
                                                            {idx === 0 && (course.instructors?.length || 0) > 1 && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Utama</span>
                                                            )}
                                                        </div>

                                                        {(instructor.job_title || instructor.company) && (
                                                            <p className="text-blue-600 font-medium text-sm mb-2">
                                                                {[instructor.job_title, instructor.company].filter(Boolean).join(' di ')}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                                <span>{instructor.courses_count || 0} Pelatihan</span>
                                                            </div>
                                                            {instructor.experience_years && (
                                                                <div className="flex items-center gap-1">
                                                                    <Briefcase className="w-4 h-4 text-purple-500" />
                                                                    <span>{instructor.experience_years} Tahun Pengalaman</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {Array.isArray(instructor.specializations) && instructor.specializations.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {instructor.specializations.map((spec) => (
                                                                    <span key={spec.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                                        {spec.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {instructor.bio && (
                                                            <p className="text-gray-600 text-sm leading-relaxed">{instructor.bio}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'instructor' && !course.instructor && (!course.instructors || course.instructors.length === 0) && (
                                    <motion.div key="no-instructor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                        <h2 className="text-xl font-bold mb-4">Instruktur</h2>
                                        <div className="text-center py-8">
                                            <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 text-sm">Informasi instruktur tidak tersedia</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Right: Price Card (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative group">
                                        <img
                                            src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.svg'}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Price - Only visible to logged in general students */}
                                    {canSeePrice && (course.discount_price || course.price) > 0 && (
                                        <div className="text-center mb-4">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {formatPrice(course.discount_price || course.price)}
                                            </div>
                                            {course.discount_price && (
                                                <div className="text-sm text-gray-500 line-through">
                                                    {formatPrice(course.price)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Enrollment Button */}
                                    {course.is_enrolled || course.has_access ? (
                                        <Link
                                            href={route('student.courses.study', course.slug)}
                                            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Lanjutkan Belajar</span>
                                        </Link>
                                    ) : !auth?.user ? (
                                        // Not logged in - show login button
                                        <Link
                                            href="/login"
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <User className="w-5 h-5" />
                                            <span>Masuk untuk Mendaftar</span>
                                        </Link>
                                    ) : auth?.user?.user_type === 'special' ? (
                                        // Special student - show restricted access message
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                                            <div className="flex items-start space-x-2">
                                                <Lock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-orange-800 text-sm">Akses Terbatas</h4>
                                                    <p className="text-orange-700 text-xs mt-1">
                                                        Anda hanya dapat mengakses pelatihan yang telah ditetapkan oleh admin.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : course.can_purchase ? (
                                        // General student - show purchase options
                                        <div className="space-y-2">
                                            {course.price === 0 ? (
                                                <button onClick={handleEnrollment} className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Daftar Gratis</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        disabled={isAddingToCart}
                                                        className="w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                        <span>Tambah ke Keranjang</span>
                                                    </button>
                                                    <button onClick={handleBuyNow} className="w-full bg-yellow-500 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>Beli Sekarang</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {course.is_private ? (
                                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                                                    <div className="flex items-start space-x-2">
                                                        <Lock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-semibold text-orange-800 text-sm">Pelatihan Khusus</h4>
                                                            <p className="text-orange-700 text-xs mt-1">
                                                                Pelatihan ini hanya tersedia untuk peserta tertentu. Hubungi admin untuk informasi lebih lanjut.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                    <div className="flex items-start space-x-2">
                                                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-semibold text-blue-800 text-sm">Akses Terbatas</h4>
                                                            <p className="text-blue-700 text-xs mt-1">
                                                                Sebagai peserta khusus, Anda hanya dapat mengakses pelatihan yang telah ditetapkan oleh admin.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Course Features */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Level</span>
                                            <span className="font-medium capitalize">{course.difficulty_level}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bahasa</span>
                                            <span className="font-medium">Bahasa Indonesia</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Sertifikat</span>
                                            <span className="font-medium flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" /> Ya
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Akses</span>
                                            <span className="font-medium">Selamanya</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Related Courses */}
                                {relatedCourses.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
                                        <h3 className="text-lg font-semibold mb-4">Pelatihan Terkait</h3>
                                        <div className="space-y-3">
                                            {relatedCourses.slice(0, 3).map((relatedCourse) => (
                                                <Link key={relatedCourse.id} href={`/courses/${relatedCourse.slug}`} className="block group">
                                                    <div className="flex space-x-3">
                                                        <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={relatedCourse.thumbnail ? `/storage/${relatedCourse.thumbnail}` : '/images/course-placeholder.svg'}
                                                                alt={relatedCourse.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                {relatedCourse.title}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart Success Alert */}
            <CartSuccessAlert show={showCartAlert} onClose={() => setShowCartAlert(false)} courseName={course.title} />
        </AppLayout>
    );
}
