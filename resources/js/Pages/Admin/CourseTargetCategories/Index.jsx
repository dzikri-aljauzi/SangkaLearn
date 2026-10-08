import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Edit, Trash2, GraduationCap, Building2, Briefcase, Users, GripVertical } from 'lucide-react';

const iconComponents = {
    'academic-cap': GraduationCap,
    'building-library': Building2,
    'building-office': Briefcase,
    'users': Users,
};

export default function CourseTargetCategoriesIndex({ auth, categories }) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#2A7C82',
        icon: 'academic-cap',
        is_active: true,
        order: 0
    });

    const iconOptions = [
        { value: 'academic-cap', label: 'Mahasiswa' },
        { value: 'building-library', label: 'Pemerintah' },
        { value: 'building-office', label: 'Perusahaan' },
        { value: 'users', label: 'Umum' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            router.put(route('admin.course-target-categories.update', editingCategory.id), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingCategory(null);
                    resetForm();
                }
            });
        } else {
            router.post(route('admin.course-target-categories.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    resetForm();
                }
            });
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#2A7C82',
            icon: category.icon || 'academic-cap',
            is_active: category.is_active,
            order: category.order
        });
        setShowModal(true);
    };

    const handleDelete = (categoryId) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori target ini?')) {
            router.delete(route('admin.course-target-categories.destroy', categoryId));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#2A7C82',
            icon: 'academic-cap',
            is_active: true,
            order: 0
        });
    };

    const getIconComponent = (iconName) => {
        const IconComponent = iconComponents[iconName] || GraduationCap;
        return IconComponent;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kategori Target Pelatihan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Kategori Target Pelatihan</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Kelola kategori target peserta (Mahasiswa, Pemerintah, Perusahaan, dll.)
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Tambah Kategori
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Tentang Kategori Target</h4>
                        <p className="text-sm text-blue-700">
                            Kategori target digunakan untuk mengelompokkan pelatihan berdasarkan jenis peserta.
                            Setiap pelatihan dapat memiliki satu atau lebih kategori target.
                            Kategori ini akan tampil di halaman depan dan dapat digunakan sebagai filter di Browse Courses.
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const IconComponent = getIconComponent(category.icon);
                            return (
                                <div
                                    key={category.id}
                                    className={`bg-white rounded-lg shadow-lg border-2 hover:shadow-xl transition-all ${
                                        !category.is_active ? 'opacity-60' : ''
                                    }`}
                                    style={{ borderColor: category.color }}
                                >
                                    <div className="p-6">
                                        {/* Header with color badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="w-14 h-14 rounded-lg flex items-center justify-center text-white"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                <IconComponent className="w-7 h-7" />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    category.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {category.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {category.description || 'Tidak ada deskripsi'}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm mb-4">
                                            <span className="text-gray-500">
                                                {category.courses_count || 0} Pelatihan
                                            </span>
                                            <span className="text-gray-500 flex items-center">
                                                <GripVertical className="w-4 h-4 mr-1" />
                                                Urutan: {category.order}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                disabled={category.courses_count > 0}
                                                title={category.courses_count > 0 ? 'Tidak dapat dihapus karena masih digunakan' : ''}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">Belum ada kategori target. Tambahkan yang pertama!</p>
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Tambah Kategori Pertama
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingCategory ? 'Edit Kategori Target' : 'Tambah Kategori Target Baru'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Kategori *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Contoh: Mahasiswa, Pemerintah, Perusahaan"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Deskripsi singkat tentang kategori target ini"
                                    />
                                </div>

                                {/* Color & Icon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Warna *
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="#2A7C82"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Icon
                                        </label>
                                        <select
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {iconOptions.map((icon) => (
                                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Urutan (Order)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Urutan tampil di halaman depan (semakin kecil semakin di atas)</p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                                        Aktif (tampil di pilihan kategori)
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingCategory(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {editingCategory ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
