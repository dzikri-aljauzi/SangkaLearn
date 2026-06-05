import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight,
    BookOpen,
    Clock,
    User,
    Star,
    CreditCard
} from 'lucide-react';

export default function CartIndex({ cartItems, total, itemCount }) {
    const [selectedItems, setSelectedItems] = useState(new Set(cartItems?.map(item => item.id) || []));

    const handleSelectItem = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(item => item.id)));
        }
    };

    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const selectedTotal = selectedCartItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.course.final_price || 0);
        return sum + itemPrice;
    }, 0);
    const handleRemoveItem = (itemId) => {
        router.delete(`/cart/remove/${itemId}`, {
            preserveState: true,
            onSuccess: () => {
                // Cart will be updated automatically
            }
        });
    };

    const handleClearCart = () => {
        if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
            router.delete('/cart/clear', {
                preserveState: true,
            });
        }
    };

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            alert('Silakan pilih pelatihan yang ingin di-checkout.');
            return;
        }
        
        const selectedItemIds = Array.from(selectedItems);
        router.visit('/checkout', {
            method: 'post',
            data: { selected_items: selectedItemIds }
        });
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <AppLayout>
                <Head title="Keranjang Belanja" />
                
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400" />
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                Keranjang Belanja Kosong
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Belum ada pelatihan yang ditambahkan ke keranjang Anda.
                            </p>
                            <Link
                                href="/student/browse-courses"
                                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <BookOpen className="w-5 h-5 mr-2" />
                                Jelajahi Pelatihan
                            </Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Keranjang Belanja" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
                        <p className="mt-2 text-gray-600">{itemCount} pelatihan dalam keranjang</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-600">Pilih Semua</span>
                                        </label>
                                        <h2 className="text-lg font-semibold text-gray-900">Pelatihan Anda</h2>
                                    </div>
                                    <button
                                        onClick={handleClearCart}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Kosongkan Keranjang
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className={`p-6 hover:bg-gray-50 transition-colors ${selectedItems.has(item.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                                            <div className="flex items-center space-x-4">
                                                {/* Checkbox */}
                                                <div className="flex-shrink-0">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.has(item.id)}
                                                            onChange={() => handleSelectItem(item.id)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                    </label>
                                                </div>
                                                {/* Course Thumbnail */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.course.thumbnail ? `/storage/${item.course.thumbnail}` : '/images/course-placeholder.svg'}
                                                        alt={item.course.title}
                                                        className="w-24 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            if (!e.target.src.includes('course-placeholder.svg')) {
                                                                e.target.src = '/images/course-placeholder.svg';
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* Course Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {item.course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                                        <User className="w-4 h-4 mr-1" />
                                                        {item.course.instructor_name}
                                                    </p>
                                                    <div className="flex items-center mt-2 space-x-4">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <BookOpen className="w-3 h-3 mr-1" />
                                                            Pelatihan Online
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Akses Seumur Hidup
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price and Actions */}
                                                <div className="flex flex-col items-end space-y-2">
                                                    <div className="text-right">
                                                        {item.course.discount_price ? (
                                                            <>
                                                                <span className="text-lg font-bold text-green-600">
                                                                    Rp {parseInt(item.course.discount_price).toLocaleString()}
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through ml-2">
                                                                    Rp {parseInt(item.course.price).toLocaleString()}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-blue-600">
                                                                {item.course.price == 0 ? 'GRATIS' : `Rp ${parseInt(item.course.price).toLocaleString()}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                                                        title="Hapus dari keranjang"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total pelatihan</span>
                                        <span className="text-gray-900">{itemCount} pelatihan</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pelatihan dipilih</span>
                                        <span className="text-blue-600">{selectedItems.size} pelatihan</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({selectedItems.size} pelatihan)</span>
                                        <span className="text-gray-900">Rp {selectedTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Diskon</span>
                                        <span className="text-green-600">- Rp 0</span>
                                    </div>
                                    <hr className="my-4" />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-600">Rp {selectedTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={selectedItems.size === 0}
                                    className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                                        selectedItems.size === 0 
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Checkout
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>

                                {/* Continue Shopping */}
                                <Link
                                    href="/student/browse-courses"
                                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Lanjutkan Belanja
                                </Link>

                                {/* Benefits */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Keuntungan Berbelanja di Sini:</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            Akses seumur hidup
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            Sertifikat penyelesaian
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            Support 24/7
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            Garansi 30 hari
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}