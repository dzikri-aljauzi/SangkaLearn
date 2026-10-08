import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Search,
    Filter,
    SlidersHorizontal,
    ShoppingBag,
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import TransactionDetailModal from '@/Components/TransactionDetailModal';

export default function PurchaseHistory({ purchases, filters }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || '');

    // Handle filter change
    const handleFilterChange = (status) => {
        router.get(route('student.purchase-history.index'), {
            status: status,
            search: filters.search,
            sort: filters.sort
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('student.purchase-history.index'), {
            status: filters.status,
            search: searchInput,
            sort: filters.sort
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle sort change
    const handleSortChange = (e) => {
        router.get(route('student.purchase-history.index'), {
            status: filters.status,
            search: filters.search,
            sort: e.target.value
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle view detail
    const handleViewDetail = async (purchaseId) => {
        try {
            const response = await fetch(route('student.purchase-history.show', purchaseId));
            const detail = await response.json();
            setSelectedTransaction(detail);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Failed to fetch transaction detail:', error);
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };

    // Get status badge color
    const getStatusBadgeClass = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-800 border-green-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[color] || colors.gray;
    };

    return (
        <AppLayout>
            <Head title="Riwayat Pembelian" />

            <div className="min-h-screen bg-blue-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Riwayat Pembelian</h1>
                                <p className="text-sm sm:text-base text-gray-600">Semua transaksi pembelian pelatihan Anda</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                        {/* Status Filters */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                            <button
                                onClick={() => handleFilterChange('all')}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    filters.status === 'all'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => handleFilterChange('success')}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    filters.status === 'success'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Berhasil
                            </button>
                            <button
                                onClick={() => handleFilterChange('pending')}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    filters.status === 'pending'
                                        ? 'bg-yellow-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Menunggu
                            </button>
                            <button
                                onClick={() => handleFilterChange('failed')}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    filters.status === 'failed'
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Gagal
                            </button>
                        </div>

                        {/* Search and Sort */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Cari pelatihan..."
                                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </form>

                            {/* Sort */}
                            <div className="relative">
                                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                <select
                                    value={filters.sort}
                                    onChange={handleSortChange}
                                    className="w-full sm:w-48 pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="oldest">Terlama</option>
                                    <option value="price_high">Harga Tertinggi</option>
                                    <option value="price_low">Harga Terendah</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Purchase List */}
                    {purchases.data.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada transaksi</h3>
                            <p className="text-gray-600 mb-6">Anda belum melakukan pembelian pelatihan</p>
                            <a
                                href={route('student.browse-courses')}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Jelajahi Pelatihan
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                {purchases.data.map((purchase) => (
                                    <div
                                        key={purchase.id}
                                        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                        onClick={() => handleViewDetail(purchase.id)}
                                    >
                                        <div className="p-4 sm:p-6">
                                            {/* Header - Stack on mobile */}
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-xs sm:text-sm font-mono text-gray-500">
                                                            #{purchase.order_number}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(purchase.status_color)}`}>
                                                            {getStatusIcon(purchase.status)}
                                                            <span className="hidden sm:inline">{purchase.status_label}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {purchase.formatted_date}
                                                    </div>
                                                </div>
                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                                                        {purchase.formatted_price}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 sm:mt-1">
                                                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {purchase.payment_method}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Courses */}
                                            <div className="space-y-2 sm:space-y-3">
                                                {purchase.courses.map((course, index) => (
                                                    <div key={index} className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-1">
                                                                {course.title}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                                    {course.category}
                                                                </span>
                                                                <span className="text-xs sm:text-sm font-semibold text-gray-700 sm:hidden">
                                                                    {course.formatted_price}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 hidden sm:block">
                                                            <div className="font-semibold text-gray-900">
                                                                {course.formatted_price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            {purchase.courses_count > 1 && (
                                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
                                                    Total {purchase.courses_count} pelatihan
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {purchases.last_page > 1 && (
                                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                            Menampilkan {purchases.from} - {purchases.to} dari {purchases.total}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {purchases.prev_page_url && (
                                                <a
                                                    href={purchases.prev_page_url}
                                                    className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1 sm:gap-2 text-sm"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Sebelumnya</span>
                                                </a>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <span className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                                    {purchases.current_page}
                                                </span>
                                                <span className="text-gray-500 text-sm">/ {purchases.last_page}</span>
                                            </div>
                                            {purchases.next_page_url && (
                                                <a
                                                    href={purchases.next_page_url}
                                                    className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1 sm:gap-2 text-sm"
                                                >
                                                    <span className="hidden sm:inline">Selanjutnya</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <TransactionDetailModal
                    transaction={selectedTransaction}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
