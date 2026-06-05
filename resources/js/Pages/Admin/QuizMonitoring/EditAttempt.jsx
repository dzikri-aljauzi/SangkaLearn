import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import { ChevronLeft, Save, X } from 'lucide-react';

export default function EditAttempt({ attempt, quiz }) {
    const { data, setData, put, processing, errors } = useForm({
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.quizzes.monitoring.update-attempt', [quiz.id, attempt.id]));
    };

    return (
        <MonitoringLayout
            title={`Edit Quiz Attempt - ${attempt.user.name}`}
            showSidebar={true}
        >
            <Head title={`Edit Quiz Attempt - ${attempt.user.name}`} />

            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.quizzes.monitoring.show', quiz.id)}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Quiz Monitoring
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Quiz Attempt</h1>
                        <p className="text-gray-600 mt-1">
                            Student: {attempt.user.name} • Quiz: {quiz.title}
                        </p>
                    </div>

                    {/* Edit Form */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Student Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Student Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Name:</span>
                                            <span className="ml-2 font-medium">{attempt.user.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium">{attempt.user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Input */}
                                <div>
                                    <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                                        Score (Points Earned)
                                    </label>
                                    <input
                                        type="number"
                                        id="score"
                                        step="0.01"
                                        min="0"
                                        value={data.score}
                                        onChange={(e) => setData('score', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {errors.score && (
                                        <p className="mt-1 text-sm text-red-600">{errors.score}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Total points available: {quiz.total_points || 100}
                                    </p>
                                </div>

                                {/* Percentage Input */}
                                <div>
                                    <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-2">
                                        Percentage
                                    </label>
                                    <input
                                        type="number"
                                        id="percentage"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.percentage}
                                        onChange={(e) => setData('percentage', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {errors.percentage && (
                                        <p className="mt-1 text-sm text-red-600">{errors.percentage}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Passing score: {quiz.passing_score || 70}%
                                    </p>
                                </div>

                                {/* Current Status Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Current Status</h4>
                                    <div className="text-sm text-blue-700">
                                        {data.percentage >= (quiz.passing_score || 70) ? (
                                            <span className="inline-flex items-center">
                                                ✓ Student will PASS with {data.percentage}%
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center">
                                                ✗ Student will FAIL with {data.percentage}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                                    <Link
                                        href={route('admin.quizzes.monitoring.show', quiz.id)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MonitoringLayout>
    );
}
