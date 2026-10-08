import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Edit, Trash2, Power, GripVertical } from 'lucide-react';

export default function CourseTypesIndex({ auth, courseTypes }) {
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#2A7C82',
        icon: 'Award',
        is_active: true,
        order: 0
    });

    const iconOptions = [
        'Award', 'Building', 'Zap', 'TrendingUp', 'Shield', 'Rocket',
        'Users', 'BookOpen', 'Target', 'Star', 'Trophy', 'Globe'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingType) {
            router.put(route('admin.course-types.update', editingType.id), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingType(null);
                    resetForm();
                }
            });
        } else {
            router.post(route('admin.course-types.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    resetForm();
                }
            });
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description || '',
            color: type.color,
            icon: type.icon || 'Award',
            is_active: type.is_active,
            order: type.order
        });
        setShowModal(true);
    };

    const handleDelete = (typeId) => {
        if (confirm('Apakah Anda yakin ingin menghapus tipe pelatihan ini?')) {
            router.delete(route('admin.course-types.destroy', typeId));
        }
    };

    const toggleActive = (typeId) => {
        router.post(route('admin.course-types.toggle-active', typeId));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#2A7C82',
            icon: 'Award',
            is_active: true,
            order: 0
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manage Course Types" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Tipe Pelatihan</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Kelola tipe pelatihan yang tersedia di platform
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingType(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Tambah Tipe Baru
                        </button>
                    </div>

                    {/* Course Types Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseTypes.map((type) => (
                            <div
                                key={type.id}
                                className="bg-white rounded-lg shadow-lg border-2 hover:shadow-xl transition-all"
                                style={{ borderColor: type.color }}
                            >
                                <div className="p-6">
                                    {/* Header with color badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: type.color }}
                                        >
                                            {type.icon ? type.icon.substring(0, 2) : 'CT'}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleActive(type.id)}
                                                className={`p-2 rounded-lg transition ${
                                                    type.is_active
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                                title={type.is_active ? 'Aktif' : 'Nonaktif'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {type.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {type.description || 'Tidak ada deskripsi'}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm mb-4">
                                        <span className="text-gray-500">
                                            {type.courses_count || 0} Pelatihan
                                        </span>
                                        <span className="text-gray-500">
                                            Order: {type.order}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            disabled={type.courses_count > 0}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {courseTypes.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Belum ada tipe pelatihan. Tambahkan yang pertama!</p>
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
                                {editingType ? 'Edit Tipe Pelatihan' : 'Tambah Tipe Pelatihan Baru'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Tipe Pelatihan *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    />
                                </div>

                                {/* Color & Icon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Warna *
                                        </label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                            required
                                        />
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
                                                <option key={icon} value={icon}>{icon}</option>
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
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
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
                                        Aktif
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingType(null);
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
                                        {editingType ? 'Update' : 'Simpan'}
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
