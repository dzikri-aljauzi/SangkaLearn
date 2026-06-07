import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Navbar from '../../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { CartSuccessAlert } from '@/Components/Alert';
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
    ArrowLeft,
    Download,
    Briefcase,
    GraduationCap,
    Building2,
    Lock
} from 'lucide-react';

export default function Detail({ course, relatedCourses = [], auth }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showCartAlert, setShowCartAlert] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Defensive check
    if (!course || !course.title || !course.slug) {
        return (
            <>
                <Head title="Course Not Found" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
                    <Navbar auth={auth} />
                    <div className="pt-32 pb-20 flex items-center justify-center">
                        <div className="text-center">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pelatihan Tidak Ditemukan</h1>
                            <p className="text-gray-600 mb-6">Maaf, pelatihan yang Anda cari tidak dapat ditemukan.</p>
                            <Link href="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                Kembali ke Daftar Pelatihan
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    // Helper function to get dashboard URL based on user role
    const getDashboardUrl = () => {
        const userRole = auth?.user?.roles?.[0]?.name;
        switch (userRole) {
            case 'admin':
                return '/admin/dashboard';
            case 'instructor':
                return '/instructor/dashboard';
            case 'sub_admin':
                return '/subadmin/dashboard';
            default:
                return '/student/dashboard';
        }
    };

    const handleEnrollment = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        // Redirect to dashboard for logged in users
        router.visit(getDashboardUrl());
    };

    const handleAddToCart = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        // Redirect to dashboard for logged in users
        router.visit(getDashboardUrl());
    };

    const handleBuyNow = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        // Redirect to dashboard for logged in users
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
        <>
            <Head title={course.title} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
                {/* Navbar tanpa sidebar */}
                <Navbar auth={auth} />

                {/* Compact Hero Section */}
                <section className="pt-20 sm:pt-24 lg:pt-28 pb-8 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        {/* Back Button */}
                        <Link
                            href="/courses"
                            className="inline-flex items-center text-blue-200 hover:text-white mb-4 font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Kembali ke Daftar Pelatihan
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {course.category && (
                                <div className="text-blue-200 mb-2">
                                    <Link href={`/courses?category=${course.category.slug}`} className="hover:text-white">
                                        {course.category.name}
                                    </Link>
                                </div>
                            )}

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">{course.title}</h1>

                            {course.subtitle && (
                                <p className="text-base sm:text-lg text-blue-100 mb-4">{course.subtitle}</p>
                            )}

                            {/* Course Stats - Inline */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm">
                                <div className="flex items-center space-x-1.5">
                                    <Users className="w-4 h-4" />
                                    <span>{course.enrolled_count || 0} siswa</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.duration_hours || 0}h</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{course.lesson_count || 0} pelajaran</span>
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

                            {/* Instructors - Inline */}
                            {(course.instructors?.length > 0 || course.instructor) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-blue-200 text-sm">Instruktur:</span>
                                    {(course.instructors?.length > 0 ? course.instructors : [course.instructor]).map((instructor, idx) => (
                                        <div key={instructor.id || idx} className="relative group flex items-center space-x-1.5 bg-blue-700/50 rounded-full px-2.5 py-1 cursor-pointer">
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {instructor.avatar ? (
                                                    <img
                                                        src={`/storage/${instructor.avatar}`}
                                                        alt={instructor.name || 'Instructor'}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-3 h-3" />
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
                </section>

                {/* Content Section - Tabs + Price Card Side by Side */}
                <section className="py-8 sm:py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                            {/* Main Content - Tabs */}
                            <div className="lg:col-span-2">
                                {/* Tabs */}
                                <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl shadow-sm">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all text-sm sm:text-base ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                            }`}
                                        >
                                            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline">{tab.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="text-2xl font-bold mb-6">Tentang Pelatihan</h2>
                                            <div className="prose max-w-none">
                                                <p className="text-gray-700 leading-relaxed mb-6">
                                                    {course.description ? (
                                                        showFullDescription || course.description.length <= 300
                                                            ? course.description
                                                            : course.description.substring(0, 300) + '...'
                                                    ) : 'Deskripsi tidak tersedia'}
                                                </p>
                                                {course.description && course.description.length > 300 && (
                                                    <button
                                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        {showFullDescription ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Selengkapnya'}
                                                    </button>
                                                )}
                                            </div>

                                            {Array.isArray(course.learning_outcomes) && course.learning_outcomes.length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                                                        <Target className="w-6 h-6 text-blue-600" />
                                                        <span>Apa yang akan Anda pelajari</span>
                                                    </h3>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {course.learning_outcomes.map((outcome, index) => (
                                                            <div key={index} className="flex items-start space-x-3">
                                                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-700">{outcome}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-xl font-semibold mb-4">Persyaratan</h3>
                                                    <ul className="space-y-2">
                                                        {course.requirements.map((requirement, index) => (
                                                            <li key={index} className="flex items-start space-x-3">
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                                <span className="text-gray-700">{requirement}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {Array.isArray(course.target_audience) && course.target_audience.length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                                                        <Users className="w-6 h-6 text-blue-600" />
                                                        <span>Target Peserta</span>
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {course.target_audience.map((audience, index) => (
                                                            <li key={index} className="flex items-start space-x-3">
                                                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-700">{audience}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'curriculum' && (
                                        <motion.div
                                            key="curriculum"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="text-2xl font-bold mb-6">Kurikulum Pelatihan</h2>

                                            {Array.isArray(course.sections) && course.sections.length > 0 ? (
                                                <div className="space-y-6">
                                                    {course.sections.map((section, sectionIndex) => (
                                                        <div key={section.id || sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                                                            <div className="bg-gray-50 p-4">
                                                                <h3 className="font-semibold text-lg">
                                                                    {sectionIndex + 1}. {section.title || 'Untitled Section'}
                                                                </h3>
                                                                {section.description && (
                                                                    <p className="text-gray-600 mt-2">{section.description}</p>
                                                                )}
                                                            </div>

                                                            <div className="p-4 space-y-3">
                                                                {Array.isArray(section.lessons) && section.lessons.map((lesson, lessonIndex) => (
                                                                    <div key={lesson.id || lessonIndex} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                        <div className="flex items-center space-x-3 flex-1">
                                                                            <PlayCircle className="w-4 h-4 text-blue-500" />
                                                                            <span className="text-gray-700">{lesson.title || 'Untitled Lesson'}</span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-500">
                                                                            {formatDuration(lesson.duration_minutes || 0)}
                                                                        </span>
                                                                    </div>
                                                                ))}

                                                                {Array.isArray(section.assignments) && section.assignments.map((assignment, assignmentIndex) => (
                                                                    <div key={assignment.id || assignmentIndex} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                        <div className="flex items-center space-x-3 flex-1">
                                                                            <Edit className="w-4 h-4 text-green-500" />
                                                                            <span className="text-gray-700">{assignment.title || 'Untitled Assignment'}</span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-500">Tugas</span>
                                                                    </div>
                                                                ))}

                                                                {Array.isArray(section.quizzes) && section.quizzes.map((quiz, quizIndex) => (
                                                                    <div key={quiz.id || quizIndex} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                                                        <div className="flex items-center space-x-3 flex-1">
                                                                            <FileText className="w-4 h-4 text-purple-500" />
                                                                            <span className="text-gray-700">{quiz.title || 'Untitled Quiz'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                            {quiz.questions_count > 0 && (
                                                                                <span>{quiz.questions_count} soal</span>
                                                                            )}
                                                                            {quiz.passing_score > 0 && (
                                                                                <span className="text-orange-500">Min. {quiz.passing_score}%</span>
                                                                            )}
                                                                            <span>Kuis</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600">Kurikulum belum tersedia</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'instructor' && (
                                        <motion.div
                                            key="instructor"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="text-2xl font-bold mb-6">
                                                Instruktur {(course.instructors?.length || 1) > 1 && `(${course.instructors.length})`}
                                            </h2>

                                            {(course.instructors?.length > 0 || course.instructor) ? (
                                                <div className="space-y-6">
                                                    {(course.instructors?.length > 0 ? course.instructors : [course.instructor]).map((instructor, idx) => (
                                                        <div key={instructor.id || idx} className={`flex flex-col sm:flex-row items-start gap-6 ${idx > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                                                            <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                                {instructor.avatar ? (
                                                                    <img
                                                                        src={`/storage/${instructor.avatar}`}
                                                                        alt={instructor.name || 'Instructor'}
                                                                        className="w-full h-full rounded-2xl object-cover"
                                                                    />
                                                                ) : (
                                                                    <User className="w-14 h-14 text-blue-400" />
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-xl font-bold text-gray-900">
                                                                        {instructor.name || 'Anonymous Instructor'}
                                                                    </h3>
                                                                    {idx === 0 && (course.instructors?.length || 0) > 1 && (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                                            Utama
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {(instructor.job_title || instructor.company) && (
                                                                    <p className="text-blue-600 font-medium text-sm mb-3">
                                                                        {[instructor.job_title, instructor.company].filter(Boolean).join(' di ')}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap gap-4 mb-4">
                                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                                                        <span>{instructor.courses_count || 0} Pelatihan</span>
                                                                    </div>
                                                                    {instructor.experience_years && (
                                                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                            <Briefcase className="w-4 h-4 text-purple-500" />
                                                                            <span>{instructor.experience_years} Tahun Pengalaman</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {Array.isArray(instructor.specializations) && instructor.specializations.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Spesialisasi</h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {instructor.specializations.map((spec) => (
                                                                                <span
                                                                                    key={spec.id}
                                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                                                                >
                                                                                    <GraduationCap className="w-3 h-3 mr-1" />
                                                                                    {spec.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {instructor.expertise && (!Array.isArray(instructor.specializations) || instructor.specializations.length === 0) && (
                                                                    <div className="mb-4">
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Keahlian</h4>
                                                                        <p className="text-gray-600 text-sm">{instructor.expertise}</p>
                                                                    </div>
                                                                )}

                                                                {instructor.bio && (
                                                                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Tentang Instruktur</h4>
                                                                        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                                                            {instructor.bio}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600">Informasi instruktur tidak tersedia</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Related Courses - Below Tab Content on Mobile/Tablet */}
                                {relatedCourses.length > 0 && (
                                    <div className="lg:hidden mt-8">
                                        <div className="bg-white rounded-2xl shadow-sm p-6">
                                            <h3 className="text-xl font-semibold mb-6">Pelatihan Terkait</h3>
                                            <div className="space-y-4">
                                                {relatedCourses.slice(0, 3).map((relatedCourse) => (
                                                    <Link
                                                        key={relatedCourse.id}
                                                        href={`/courses/${relatedCourse.slug}`}
                                                        className="block group"
                                                    >
                                                        <div className="flex space-x-3">
                                                            <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={relatedCourse.thumbnail ? `/storage/${relatedCourse.thumbnail}` : '/images/course-placeholder.jpg'}
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
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar - Sticky Price Card */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video rounded-xl overflow-hidden mb-5 relative group">
                                        <img
                                            src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.jpg'}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Price - Only visible to logged in general students */}
                                    {canSeePrice && course.price > 0 && (
                                        <div className="mb-4 text-center">
                                            <span className="text-3xl font-bold text-gray-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(course.price)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {course.is_enrolled ? (
                                        <Link
                                            href={`/courses/${course.slug}/learn`}
                                            className="w-full bg-green-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Lanjutkan Belajar</span>
                                        </Link>
                                    ) : !auth?.user ? (
                                        // Not logged in - show login button
                                        <Link
                                            href="/login"
                                            className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <User className="w-5 h-5" />
                                            <span>Masuk untuk Mendaftar</span>
                                        </Link>
                                    ) : auth?.user?.user_type === 'special' ? (
                                        // Special student - show restricted access message
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <Lock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-orange-800 text-sm">Akses Terbatas</h4>
                                                    <p className="text-orange-700 text-xs mt-1">
                                                        Anda hanya dapat mengakses pelatihan yang telah ditetapkan oleh admin.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // General student - show purchase options
                                        <div className="space-y-3">
                                            {course.price === 0 ? (
                                                <button
                                                    onClick={handleEnrollment}
                                                    className="w-full bg-green-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Daftar Gratis</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        disabled={isAddingToCart}
                                                        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all flex items-center justify-center space-x-2 ${
                                                            isAddingToCart
                                                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        {isAddingToCart ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Menambahkan...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-5 h-5" />
                                                                <span>Tambah ke Keranjang</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleBuyNow}
                                                        className="w-full bg-yellow-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                                                    >
                                                        <DollarSign className="w-5 h-5" />
                                                        <span>Beli Sekarang</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Course Features */}
                                    <div className="mt-5 space-y-2.5 text-sm border-t border-gray-100 pt-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Level</span>
                                            <span className="font-semibold capitalize">{course.difficulty_level || 'Semua Level'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bahasa</span>
                                            <span className="font-semibold">Bahasa Indonesia</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Sertifikat</span>
                                            <span className="font-semibold text-green-600">✓ Ya</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Akses</span>
                                            <span className="font-semibold">Selamanya</span>
                                        </div>
                                    </div>

                                    {/* Related Courses - Desktop Only */}
                                    {relatedCourses.length > 0 && (
                                        <div className="hidden lg:block mt-6 pt-6 border-t border-gray-100">
                                            <h3 className="text-base font-semibold mb-4">Pelatihan Terkait</h3>
                                            <div className="space-y-3">
                                                {relatedCourses.slice(0, 3).map((relatedCourse) => (
                                                    <Link
                                                        key={relatedCourse.id}
                                                        href={`/courses/${relatedCourse.slug}`}
                                                        className="block group"
                                                    >
                                                        <div className="flex space-x-3">
                                                            <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={relatedCourse.thumbnail ? `/storage/${relatedCourse.thumbnail}` : '/images/course-placeholder.jpg'}
                                                                    alt={relatedCourse.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                    {relatedCourse.title}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-4">
                                <ApplicationLogo className="h-12 w-auto" />
                                <p className="text-gray-400 text-sm">
                                    Platform pembelajaran online terbaik untuk meningkatkan skill Anda.
                                </p>
                            </div>

                            {[
                                {
                                    title: "Platform",
                                    links: [
                                        { label: "Semua Pelatihan", href: "/courses" },
                                        { label: "Kategori", href: "/categories" }
                                    ]
                                },
                                {
                                    title: "Perusahaan",
                                    links: [
                                        { label: "Tentang Kami", href: "/about" },
                                        { label: "Kontak", href: "/contact" }
                                    ]
                                },
                                {
                                    title: "Bantuan",
                                    links: [
                                        { label: "FAQ", href: "/faq" },
                                        { label: "Syarat & Ketentuan", href: "/terms" }
                                    ]
                                }
                            ].map((column, index) => (
                                <div key={index}>
                                    <h4 className="font-bold text-lg mb-4">{column.title}</h4>
                                    <ul className="space-y-2">
                                        {column.links.map((link, linkIndex) => (
                                            <li key={linkIndex}>
                                                <a
                                                    href={link.href}
                                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                © 2026 LeadNEX. All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Cart Success Alert */}
            <CartSuccessAlert
                show={showCartAlert}
                onClose={() => setShowCartAlert(false)}
                courseName={course.title}
            />
        </>
    );
}
