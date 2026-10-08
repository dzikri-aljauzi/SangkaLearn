import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    PlayCircle,
    Users,
    Award,
    BookOpen,
    Star,
    ArrowRight,
    CheckCircle,
    Clock,
    Globe,
    TrendingUp,
    Zap,
    Target,
    Shield,
    Rocket,
    Building,
    Building2,
    Briefcase,
    GraduationCap,
    Trophy,
    Monitor,
    Smartphone,
    Search,
    Filter,
    Grid,
    List,
    User,
    Calendar,
    Heart,
    Share2,
    Bookmark,
    DollarSign
} from 'lucide-react';

export default function CoursesIndex({
    courses = null,
    categories = [],
    featuredCourses = [],
    stats = {},
    filters = {},
    currentUser = null,
    auth = null,
    parentCourseTypes = [],
    targetCategories = []
}) {
    // Safe data handling
    const safeCourses = courses || { data: [], links: [], meta: {} };
    const courseData = Array.isArray(safeCourses) ? safeCourses : (safeCourses.data || []);
    const pagination = safeCourses.links || [];
    const meta = safeCourses.meta || {};

    // State for active target category tab
    const [activeTargetCategory, setActiveTargetCategory] = useState(
        filters.target_category || (targetCategories && targetCategories.length > 0 ? targetCategories[0]?.slug : null)
    );

    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState({
        category: filters.category || '',
        price: filters.price || '',
        certificate_type: filters.certificate_type || '',
        target_category: filters.target_category || '',
        sort: filters.sort || 'latest'
    });

    // Sync activeTargetCategory when filters.target_category changes from URL
    useEffect(() => {
        if (filters.target_category) {
            setActiveTargetCategory(filters.target_category);
        }
    }, [filters.target_category]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        // Update URL with new filters
        router.get('/courses', {
            ...newFilters,
            search: searchTerm,
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleTargetCategoryClick = (slug) => {
        setActiveTargetCategory(slug);
        const newFilters = { ...localFilters, target_category: slug };
        setLocalFilters(newFilters);

        // Update URL with new target category
        router.get('/courses', {
            ...newFilters,
            search: searchTerm,
        }, {
            preserveState: true,
            preserveScroll: false
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/courses', {
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
            price: '',
            certificate_type: '',
            target_category: '',
            sort: 'latest'
        });
        setActiveTargetCategory(targetCategories && targetCategories.length > 0 ? targetCategories[0]?.slug : null);
        router.get('/courses', {}, { preserveState: true });
    };

    const formatDuration = (hours) => {
        if (hours < 1) return `${Math.round(hours * 60)}m`;
        return `${Math.round(hours)}h`;
    };

    return (
        <>
            <Head title="Pelatihan Premium - SangkaLearn" />
            
            <div className="min-h-screen bg-blue-50 overflow-x-hidden">
                <Navbar auth={auth} />

                {/* Hero Section with Featured Courses */}
                <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative overflow-hidden">
                    {/* Modern Background Decorations */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-72 h-72 sm:w-96 sm:h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 w-60 h-60 sm:w-80 sm:h-80 bg-sogan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold text-sm sm:text-base shadow-lg border border-blue-200/50">
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-sogan-600" />
                                Pelatihan Premium Terlengkap
                                <Star className="w-4 h-4 sm:w-5 sm:h-5 ml-2 text-yellow-500" />
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight px-2">
                                <span className="block sm:inline">Raih Kesuksesan dengan</span>
                                <span className="block text-blue-600">
                                    10+ Pelatihan Premium
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-2 text-justify">
                                Akses ke pelatihan berkualitas tinggi dari para ahli industri. Mulai dari <span className="text-blue-700 font-bold">pemula hingga profesional</span>, temukan pembelajaran yang tepat untuk <span className="text-sogan-600 font-bold">mengubah karir Anda</span>.
                            </p>

                            {/* Hero Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-2xl mx-auto">
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow duration-300">
                                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-700">
                                        {stats.total_courses || '20+'}
                                    </div>
                                    <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Pelatihan Tersedia</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow duration-300">
                                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-700">
                                        {stats.total_students || '1k+'}
                                    </div>
                                    <div className="text-gray-600 font-semibold text-xs sm:text-sm lg:text-base">Siswa Aktif</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                                <Link
                                    href="#courses"
                                    className="group bg-blue-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 flex items-center justify-center relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <Search className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                                        <span className="hidden sm:inline">Jelajahi Semua Pelatihan</span>
                                        <span className="sm:hidden">Jelajahi Pelatihan</span>
                                        <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-petrol-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </Link>
                                <Link
                                    href="#featured"
                                    className="group border-2 border-petrol-600 text-sogan-700 px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-petrol-700 hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg"
                                >
                                    <Trophy className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="hidden sm:inline">Pelatihan Unggulan</span>
                                    <span className="sm:hidden">Unggulan</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Target Category Tabs Section */}
                {targetCategories && targetCategories.length > 0 && (
                    <section className="py-8 sm:py-12 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 rounded-full text-blue-800 font-bold mb-4 text-sm sm:text-base">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Pelatihan Berdasarkan Target Peserta
                                </div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2 sm:mb-4 px-2">
                                    Pilih Kategori Peserta
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                                    Temukan pelatihan yang sesuai dengan kebutuhan Anda
                                </p>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex flex-wrap justify-center gap-2 sm:gap-3 p-2 bg-gray-100 rounded-2xl">
                                    {targetCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleTargetCategoryClick(category.slug)}
                                            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                                                activeTargetCategory === category.slug
                                                    ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                            }`}
                                            style={{
                                                borderLeft: activeTargetCategory === category.slug ? `4px solid ${category.color}` : 'none'
                                            }}
                                        >
                                            <div
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                {category.icon === 'academic-cap' && <GraduationCap className="w-4 h-4" />}
                                                {category.icon === 'building-library' && <Building2 className="w-4 h-4" />}
                                                {category.icon === 'building-office' && <Building2 className="w-4 h-4" />}
                                                {!['academic-cap', 'building-library', 'building-office'].includes(category.icon) && category.name.charAt(0)}
                                            </div>
                                            <span>{category.name}</span>
                                            {category.courses && category.courses.length > 0 && (
                                                <span className="hidden sm:inline-flex bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                                    {category.courses.length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Category Preview */}
                            {targetCategories.map((category) => (
                                activeTargetCategory === category.slug && category.courses && category.courses.length > 0 && (
                                    <div key={category.id} className="animate-fadeIn">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {category.icon === 'academic-cap' && <GraduationCap className="w-5 h-5" />}
                                                    {category.icon === 'building-library' && <Building2 className="w-5 h-5" />}
                                                    {category.icon === 'building-office' && <Building2 className="w-5 h-5" />}
                                                    {!['academic-cap', 'building-library', 'building-office'].includes(category.icon) && category.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pelatihan untuk {category.name}</h3>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-600">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Cards Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                            {category.courses.slice(0, 8).map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative aspect-video">
                                                        <img
                                                            src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.svg'}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.target.src = '/images/course-placeholder.svg';
                                                                e.target.onerror = null;
                                                            }}
                                                        />
                                                        {course.is_private && (
                                                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                                <Building2 className="w-3 h-3 mr-1" />
                                                                Khusus
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                                            {course.title}
                                                        </h4>
                                                        {(course.instructors?.length > 0 || course.instructor) && (
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                by {course.instructors?.length > 0
                                                                    ? course.instructors.map(i => i.name).join(', ')
                                                                    : course.instructor.name
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                                                            <Link
                                                                href={`/courses-details/${course.slug}`}
                                                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                                                            >
                                                                Detail
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>
                )}

                {/* Search and Filters Section */}
                <section id="courses" className="py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4 px-2">
                                Semua Pelatihan
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 text-justify">
                                Gunakan filter pencarian untuk menemukan pelatihan yang sesuai dengan kebutuhan dan level Anda
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100/50 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
                            <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
                                <div className="relative">
                                    <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                                    <input
                                        type="text"
                                        placeholder="Cari pelatihan, mentor, atau topik yang ingin dipelajari..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 sm:pl-16 pr-24 sm:pr-32 py-3 sm:py-4 lg:py-5 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base lg:text-lg bg-gray-50/50"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                                    >
                                        Cari
                                    </button>
                                </div>
                            </form>

                            {/* Filters */}
                            <div className="space-y-6">
                                {/* Main Filters Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Category Filter */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 px-1">
                                            <Filter className="w-4 h-4 inline mr-1.5" />
                                            Kategori
                                        </label>
                                        <select
                                            value={localFilters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm hover:border-blue-300 transition-colors"
                                        >
                                            <option value="">Semua Kategori</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.slug}>
                                                    {category.name} ({category.courses_count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price Filter */}
                                   

                                    {/* Certificate Type Filter */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 px-1">
                                            <Award className="w-4 h-4 inline mr-1.5" />
                                            Jenis Pelatihan & Sertifikat
                                        </label>
                                        <select
                                            value={localFilters.certificate_type}
                                            onChange={(e) => handleFilterChange('certificate_type', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm hover:border-blue-300 transition-colors"
                                        >
                                            <option value="">Semua Jenis Sertifikat dan Pelatihan</option>
                                            {parentCourseTypes.map((parent) => (
                                                <option key={parent.id} value={parent.slug}>
                                                    {parent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Bottom Row - Sort and Actions */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 text-gray-600 hover:text-gray-800 text-sm font-semibold hover:bg-gray-100 rounded-xl transition-colors border border-gray-300 hover:border-gray-400"
                                    >
                                        <Filter className="w-4 h-4 inline mr-2" />
                                        Reset Semua Filter
                                    </button>

                                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                                        

                                        <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-1 shadow-sm">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                title="Grid View"
                                            >
                                                <Grid className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                title="List View"
                                            >
                                                <List className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 px-2">
                                    {courseData.length > 0 ? `${meta.total || courseData.length} Pelatihan Ditemukan` : 'Semua Pelatihan'}
                                </h3>
                                <div className="text-xs sm:text-sm text-gray-500 px-2">
                                    Halaman {meta.current_page || 1} dari {meta.last_page || 1}
                                </div>
                            </div>

                            {courseData && courseData.length > 0 ? (
                                <>
                                    <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8' : 'space-y-6 sm:space-y-8'}>
                                        {courseData.map((course, index) => (
                                            <div
                                                key={course.id}
                                                className={`group bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}`}
                                            >
                                                {/* Course Thumbnail */}
                                                <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-64 h-48 flex-shrink-0' : 'aspect-video'} overflow-hidden`}>
                                                    <img 
                                                        src={course.thumbnail ? `/storage/${course.thumbnail}` : '/images/course-placeholder.jpg'} 
                                                        alt={course.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = '/images/course-placeholder.jpg';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                        <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    </div>
                                                    
                                                    {/* Course badges */}
                                                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col space-y-1 sm:space-y-2">
                                                        {course.is_featured && (
                                                            <span className="bg-petrol-600 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                                                                Unggulan
                                                            </span>
                                                        )}
                                                        {course.difficulty_level && (
                                                            <span className="bg-black/70 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full capitalize">
                                                                {course.difficulty_level === 'beginner' ? 'Pemula' : 
                                                                 course.difficulty_level === 'intermediate' ? 'Menengah' : 
                                                                 course.difficulty_level === 'advanced' ? 'Lanjutan' : course.difficulty_level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    

                                                    {/* Enrollment status */}
                                                    {course.is_enrolled && (
                                                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                                                            <span className="bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                                Terdaftar
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Course Content */}
                                                <div className="p-4 sm:p-6 flex-1">
                                                    <div className="mb-3 sm:mb-4">
                                                        {course.category && (
                                                            <Link 
                                                                href={`/courses?category=${course.category.slug}`}
                                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                            >
                                                                {course.category.name}
                                                            </Link>
                                                        )}
                                                        <Link href={`/courses/${course.slug}`}>
                                                            <h3 className="font-black text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition-colors mt-1 sm:mt-2 mb-2 sm:mb-3 line-clamp-2">
                                                                {course.title}
                                                            </h3>
                                                        </Link>
                                                        {course.subtitle && (
                                                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                                                                {course.subtitle}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Instructor */}
                                                    <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                                                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                                        <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                                                            {course.instructors?.length > 0
                                                                ? course.instructors.map(i => i.name).join(', ')
                                                                : course.instructor?.name || 'Instruktur'
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Course Stats */}
                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span>{course.enrolled_count || 0} siswa</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span>{formatDuration(course.duration_hours)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Course Info */}
                                                    <div className="flex items-center justify-between mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
                                                        <span>{course.lesson_count || 0} pelajaran</span>
                                                        <span className="hidden sm:inline">Diperbarui {new Date(course.created_at).toLocaleDateString('id-ID')}</span>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex items-center justify-end">
                                                        <Link 
                                                            href={`/courses-details/${course.slug}`}
                                                            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                                                        >
                                                            {course.is_enrolled ? 'Lanjutkan' : 'Lihat Pelatihan'}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination && pagination.length > 3 && (
                                        <div className="flex justify-center mt-8 sm:mt-12">
                                            <nav className="flex items-center space-x-1 sm:space-x-2">
                                                {pagination.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold transition-colors text-xs sm:text-sm ${
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
                                <div className="text-center py-12 sm:py-20">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                                        <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Tidak ada pelatihan ditemukan</h3>
                                    <p className="text-gray-600 mb-6 sm:mb-8 px-4">
                                        {searchTerm || Object.values(localFilters).some(v => v) 
                                            ? 'Coba sesuaikan kriteria pencarian atau filter Anda'
                                            : 'Belum ada pelatihan yang tersedia saat ini'
                                        }
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-bold text-sm sm:text-base"
                                    >
                                        Reset Semua Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-blue-600 relative overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div 
                            className="absolute top-0 left-0 w-full h-full"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <div className="space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-bold shadow-lg text-sm sm:text-base">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
                                Bergabung dengan Ribuan Profesional
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight px-2">
                                <span className="block sm:inline">Mulai Perjalanan Pembelajaran</span>
                                <span className="block text-yellow-400">Bisnis Digital Anda Hari Ini!</span>
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-2 text-justify">
                                Dapatkan akses ke <span className="text-yellow-400 font-bold">10+ pelatihan premium</span>, mentor berpengalaman, dan komunitas pembelajar terbesar di Indonesia
                            </p>
                            
                            {/* Enhanced CTA Buttons */}
                            {!auth?.user && (
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
                                    <Link
                                        href="/register"
                                        className="group bg-petrol-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center relative overflow-hidden w-full sm:w-auto"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                            <span className="hidden sm:inline">Mulai Belajar Gratis</span>
                                            <span className="sm:hidden">Daftar Gratis</span>
                                            <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                    <Link
                                        href="#courses"
                                        className="group border-2 border-white text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-black hover:bg-white hover:text-blue-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                                    >
                                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="hidden sm:inline">Lihat Demo Pelatihan</span>
                                        <span className="sm:hidden">Demo Pelatihan</span>
                                    </Link>
                                </div>
                            )}

                            {/* Special Offer */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 max-w-4xl mx-auto">
                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                    <h3 className="text-xl sm:text-2xl font-black text-white text-center sm:text-left">Promo Spesial Terbatas!</h3>
                                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                </div>
                                <p className="text-yellow-400 font-bold text-base sm:text-lg mb-4 text-center">
                                    🎉 Hemat 50% + Bonus Diskon Sertifikasi BNSP untuk 100 pendaftar pertama!
                                </p>
                                
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-petrol-900 text-white py-12 sm:py-16 lg:py-20 relative">
                    <div className="absolute inset-0 bg-petrol-900"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                            <div className="space-y-4 sm:space-y-6 col-span-1 sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center">
                                    <ApplicationLogo variant="dark" 
                                        className="h-16 sm:h-20 lg:h-24 w-auto" 
                                        width="200" 
                                        height="64" 
                                    />
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base text-justify">
                                    Membangun masa depan bisnis digital Indonesia melalui pendidikan berkualitas tinggi dan transformasi pembelajaran yang inovatif dengan teknologi terdepan.
                                </p>
                                <div className="flex space-x-3 sm:space-x-4">
                                    {['f', 't', 'yt', 'in'].map((social, idx) => (
                                        <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                                            <span className="text-white font-bold text-xs sm:text-sm">{social}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {[
                                {
                                    title: "Platform",
                                    links: [
                                        { label: "Semua Pelatihan", href: "/courses" },
                                        { label: "Fitur Platform", href: "/features" }
                                    ]
                                },
                                {
                                    title: "Akun",
                                    links: [
                                        { label: "Masuk", href: "/login" },
                                        { label: "Daftar", href: "/register" },
                                        { label: "Dashboard", href: "/dashboard" }
                                    ]
                                },
                                {
                                    title: "Informasi",
                                    links: [
                                        { label: "Tentang Kami", href: "/about" },
                                        { label: "Syarat & Ketentuan", href: "/terms" },
                                        { label: "Kebijakan Privasi", href: "/privacy" }
                                    ]
                                }
                            ].map((column, index) => (
                                <div key={index} className="space-y-4">
                                    <h4 className="font-black text-base sm:text-lg text-blue-400">{column.title}</h4>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {column.links.map((link, linkIndex) => (
                                            <li key={linkIndex}>
                                                <a 
                                                    href={link.href} 
                                                    className="text-gray-300 hover:text-sogan-200 transition-colors duration-300 font-medium hover:translate-x-1 transform transition-transform inline-block text-sm sm:text-base"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Powered by Section */}
                        <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 sm:pt-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <h4 className="text-gray-400 font-semibold text-base sm:text-lg mb-4 sm:mb-6">Didukung oleh:</h4>
                                <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-8">
                                    <div className="group">
                                        <img
                                            src="/images/logo-lna.jpeg"
                                            alt="LNA Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/probisdi.png"
                                            alt="Probisdi Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/logo-bdi.jpeg"
                                            alt="BDI Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                    <div className="group">
                                        <img
                                            src="/images/blockxlab.png"
                                            alt="Blockxlab Logo"
                                            className="h-16 sm:h-20 lg:h-24 w-auto object-contain rounded-lg shadow-lg border border-gray-700 group-hover:border-petrol-400 transition-all duration-300 transform group-hover:scale-110 bg-white/10 backdrop-blur-sm p-2 sm:p-3"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center text-gray-400 space-y-2">
                                <p className="font-semibold text-sm sm:text-base">
                                    © 2026 SangkaLearn. All Rights Reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}