import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import { X, Users, Code, FileText, Check, AlertCircle } from 'lucide-react';

export default function GroupModal({ isOpen, onClose, onGroupCreated }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(route('admin.sub-admins.groups.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Group created successfully!');
                onGroupCreated(result.group);
                reset();
                onClose();
            } else {
                toast.error(result.message || 'Failed to create group');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Failed to create group. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateCode = () => {
        if (data.name) {
            const code = data.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .substring(0, 10);
            setData('code', code);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Add New Group</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Name *
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Users className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    if (!data.code) {
                                        generateCode();
                                    }
                                }}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="e.g., PT. ABC Company"
                                required
                            />
                            {errors.name && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Group Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Code *
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Code className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="e.g., ABC_COMP"
                                required
                                maxLength="50"
                            />
                            {errors.code && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Unique identifier for the group (auto-generated from name)
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                placeholder="Brief description about the group/organization"
                                maxLength="1000"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">Optional description about the group</p>
                            <p className="text-xs text-gray-500">{data.description.length}/1000</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Active Group</span>
                            </div>
                        </label>
                        <p className="mt-1 text-xs text-gray-500 ml-8">
                            Active groups can be assigned to sub admins and students
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !data.name || !data.code}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${
                                (isSubmitting || !data.name || !data.code) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>{isSubmitting ? 'Creating...' : 'Create Group'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}