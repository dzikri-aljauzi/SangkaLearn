import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import {
    PlayCircle,
    Users,
    BookOpen,
    Star,
    Clock,
    Search,
    Filter,
    Grid,
    List,
    User,
    CheckCircle,
    Lock,
    Unlock,
    Heart,
    Share2,
    Bookmark,
    DollarSign,
    TrendingUp,
    Award,
    Target,
    Zap,
    GraduationCap,
    Building2,
    Briefcase,
    AlertCircle,
    Calendar
} from 'lucide-react';

export default function StudentBrowseCourses({
    courses,
    categories = [],
    featuredCourses = [],
    stats = {},
    filters = {},
    enrolledCourseIds = [],
    parentCourseTypes = [],
    targetCategories = [],
    auth
}) {
    // User type for purchase restrictions
    const userType = auth?.user?.user_type || 'general';
    const isSpecialStudent = userType === 'special';
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        category: filters.category ?? '',
        access: filters.access ?? '',
        price: filters.price ?? '',
        certificate_type: filters.certificate_type ?? '',
        target_category: filters.target_category ?? '',
        sort: filters.sort ?? 'recommended'
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        router.get('/student/browse-courses', {
            ...newFilters,
            search: searchTerm,
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/student/browse-courses', {
            ...localFilters,
            search: searchTerm,
        }, { 
            preserveState: true,
            preserveScroll: false 
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setLocalFilters({
            category: '',
            access: '',
            price: '',
            certificate_type: '',
            target_category: '',
            sort: 'recommended'
        });
        router.get('/student/browse-courses', {}, { preserveState: true });
    };

    const formatPrice = (price) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDuration = (hours) => {
        if (hours < 1) return `${Math.round(hours * 60)}m`;
        return `${Math.round(hours)}h`;
    };

    const isEnrolled = (courseId) => {
        return enrolledCourseIds.includes(courseId);
    };

    return (
        <AppLayout title="Browse Courses">
            <Head title="Browse Courses" />
            
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="bg-blue-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative z-10">
                        <motion.h1
                            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Jelajahi Pelatihan 📚
                        </motion.h1>
                        <motion.p
                            className="text-blue-100 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Temukan pelatihan yang tepat untuk mengembangkan skill Anda
                        </motion.p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold">{stats.available_courses || courses?.total || 0}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Pelatihan Tersedia</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold">{enrolledCourseIds.length}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Sudah Diikuti</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold">{categories.length}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Kategori</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold">{featuredCourses.length}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Featured</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
                        <div className="absolute bottom-4 right-16 w-20 h-20 rounded-full bg-white/10"></div>
                        <div className="absolute top-16 right-32 w-16 h-16 rounded-full bg-white/15"></div>
                    </div>
                </motion.div>

                {/* Featured Courses */}
                {featuredCourses.length > 0 && (
                    <motion.div 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                <Award className="w-6 h-6 text-yellow-500" />
                                <span>Pelatihan Unggulan</span>
                            </h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredCourses.slice(0, 3).map((course, index) => (
                                <div
                                    key={course.id}
                                    className="group bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                                        <img 
                                            src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.svg'} 
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/images/course-placeholder.svg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                FEATURED
                                            </span>
                                        </div>
                                        {isEnrolled(course.id) && (
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                                    Enrolled
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 truncate">
                                        by {course.instructors?.length > 0
                                            ? course.instructors.map(i => i.name || `${i.first_name || ''} ${i.last_name || ''}`.trim()).join(', ')
                                            : `${course.instructor?.first_name || ''} ${course.instructor?.last_name || ''}`.trim() || 'Instructor'
                                        }
                                    </p>
                                    <div className="flex items-center justify-end">
                                        <Link
                                            href={isEnrolled(course.id) ? `/learn/${course.slug}` : `/courses/${course.slug}`}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            {isEnrolled(course.id) ? 'Lanjutkan' : 'Lihat Detail'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Search and Filters */}
                <motion.div 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
                        <div className="relative flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari pelatihan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                Cari
                            </button>
                        </div>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        {/* Category Filter */}
                        <select
                            value={localFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Kategori</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Access Filter */}
                        <select
                            value={localFilters.access}
                            onChange={(e) => handleFilterChange('access', e.target.value)}
                            className="px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Akses</option>
                            <option value="public">Public</option>
                            <option value="enrolled">Dimiliki</option>
                        </select>

                        {/* Price Range Filter */}
                        <select
                            value={localFilters.price}
                            onChange={(e) => handleFilterChange('price', e.target.value)}
                            className="px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Harga</option>
                            <option value="500k_1jt">500rb-1Jt</option>
                            <option value="above_1jt">&gt; 1 Juta</option>
                        </select>

                        {/* Certificate Type Filter */}
                        <select
                            value={localFilters.certificate_type}
                            onChange={(e) => handleFilterChange('certificate_type', e.target.value)}
                            className="px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Jenis</option>
                            {parentCourseTypes.map((type) => (
                                <option key={type.id} value={type.slug}>
                                    {type.name}
                                </option>
                            ))}
                        </select>

                        {/* Target Category Filter */}
                        <select
                            value={localFilters.target_category}
                            onChange={(e) => handleFilterChange('target_category', e.target.value)}
                            className="px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">Target</option>
                            {targetCategories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Reset Button */}
                        <button
                            onClick={clearFilters}
                            className="px-3 py-2.5 sm:py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors border border-gray-300 text-sm whitespace-nowrap"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center w-full sm:w-auto">
                            <label className="text-sm font-medium text-gray-700 mr-2 sm:mr-3 whitespace-nowrap">Urutkan:</label>
                            <select
                                value={localFilters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:min-w-[180px]"
                            >
                                <option value="recommended">Direkomendasikan</option>
                                <option value="latest">Terbaru</option>
                                <option value="popular">Terpopuler</option>
                                <option value="rating">Rating Tertinggi</option>
                                <option value="price_low">Harga Terendah</option>
                                <option value="price_high">Harga Tertinggi</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 border border-gray-300 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Course List */}
                <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {courses?.data ? `${courses.total} Pelatihan Ditemukan` : 'Semua Pelatihan'}
                        </h3>
                        <div className="text-sm text-gray-500">
                            Halaman {courses?.current_page || 1} dari {courses?.last_page || 1}
                        </div>
                    </div>


                    {courses?.data && courses.data.length > 0 ? (
                        <>
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
                                {courses.data.map((course, index) => (
                                    <motion.div
                                        key={course.id}
                                        className={`group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.7 + (index * 0.05) }}
                                    >
                                        {/* Course Thumbnail */}
                                        <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-48 h-40 sm:h-32 flex-shrink-0' : 'aspect-video'} overflow-hidden`}>
                                            <img 
                                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.svg'} 
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = '/images/course-placeholder.svg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            
                                            {/* Access Badge */}
                                            <div className="absolute top-2 left-2">
                                                {course.is_public ? (
                                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                        <Unlock className="w-3 h-3 mr-1" />
                                                        Public
                                                    </span>
                                                ) : (
                                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                        <Lock className="w-3 h-3 mr-1" />
                                                        Private
                                                    </span>
                                                )}
                                            </div>

                                            {/* Enrollment Status */}
                                            {isEnrolled(course.id) && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                                        Enrolled
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Course Content */}
                                        <div className="p-4 sm:p-6 flex-1">
                                            <div className="mb-2 sm:mb-3">
                                                {course.category && (
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        {course.category.name}
                                                    </span>
                                                )}
                                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors mt-1 mb-1 sm:mb-2 line-clamp-2">
                                                    {course.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                                                    {course.description}
                                                </p>
                                            </div>

                                            {/* Instructor */}
                                            <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm text-gray-600 truncate">
                                                    {course.instructors?.length > 0
                                                        ? course.instructors.map(i => i.name || `${i.first_name || ''} ${i.last_name || ''}`.trim()).join(', ')
                                                        : `${course.instructor?.first_name || ''} ${course.instructor?.last_name || ''}`.trim() || 'Instructor'
                                                    }
                                                </span>
                                            </div>

                                            {/* Course Stats */}
                                            <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>{course.enrollments_count || 0}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>{formatDuration(course.duration_hours)}</span>
                                                </div>
                                                {/* Access Duration */}
                                                {course.access_duration_days && course.access_duration_days > 0 ? (
                                                    <div className="flex items-center space-x-1 text-green-600">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span>Akses {course.access_duration_days} hari</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-1 text-blue-600">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span>Akses Selamanya</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                {/* Price Display - only visible to general students */}
                                                <div className="text-sm sm:text-lg font-bold flex-shrink-0">
                                                    {course.is_enrolled || course.has_access ? (
                                                        <span className="text-green-600">Dimiliki</span>
                                                    ) : isSpecialStudent ? (
                                                        <span className="text-gray-500 text-xs sm:text-sm flex items-center">
                                                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                            <span className="hidden sm:inline">Hubungi Admin</span>
                                                            <span className="sm:hidden">Admin</span>
                                                        </span>
                                                    ) : course.is_private ? (
                                                        <span className="text-orange-600 text-xs sm:text-sm flex items-center">
                                                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                            <span className="hidden sm:inline">Khusus Peserta</span>
                                                            <span className="sm:hidden">Private</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-blue-600">{formatPrice(course.price)}</span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={course.is_enrolled || course.has_access ? `/learn/${course.slug}` : `/courses/${course.slug}`}
                                                    className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${
                                                        course.is_enrolled || course.has_access
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {course.is_enrolled || course.has_access ? (
                                                        <>
                                                            <span className="hidden sm:inline">Lanjutkan</span>
                                                            <span className="sm:hidden">Lanjut</span>
                                                        </>
                                                    ) : 'Detail'}
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {courses.links && courses.links.length > 3 && (
                                <div className="flex justify-center mt-8">
                                    <nav className="flex items-center space-x-2">
                                        {courses.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                                    link.active 
                                                        ? 'bg-blue-600 text-white' 
                                                        : link.url 
                                                            ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300' 
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tidak ada pelatihan ditemukan</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || Object.values(localFilters).some(v => v) 
                                    ? 'Coba sesuaikan kriteria pencarian atau filter Anda'
                                    : 'Belum ada pelatihan yang tersedia untuk Anda saat ini'
                                }
                            </p>
                            <button
                                onClick={clearFilters}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Reset Semua Filter
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}