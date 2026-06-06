import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Upload,
    Clock,
    AlertTriangle,
    CheckCircle,
    Eye,
    Send,
    Paperclip,
    X
} from 'lucide-react';

export default function AssignmentView({ assignment, submission, canSubmit, isLate, enrollment }) {
    const [content, setContent] = useState(submission?.content || '');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error('Please provide content for your submission');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);

        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        try {
            const response = await fetch(route('assignments.submit', assignment.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Assignment submitted successfully!');
                router.reload();
            } else {
                toast.error(data.error || 'Failed to submit assignment');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            toast.error('Failed to submit assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'graded': return 'bg-green-100 text-green-800';
            case 'returned': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title={`Assignment: ${assignment.title}`}>
            <Head title={`Assignment: ${assignment.title}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('courses.learn', assignment.course.slug)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Course
                        </Link>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                                    <p className="text-lg text-gray-600 mb-4">{assignment.course.title}</p>

                                    {assignment.description && (
                                        <div className="prose prose-lg max-w-none mb-6">
                                            <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
                                        </div>
                                    )}
                                </div>

                                <div className="ml-6 flex-shrink-0">
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {assignment.max_points || 100}
                                            </div>
                                            <div className="text-sm text-green-600">Points</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Info */}
                            <div className="border-t pt-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Due Date</div>
                                            <div className={`text-sm ${
                                                isLate ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                                {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                                                {isLate && ' (Late)'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Submission Type</div>
                                            <div className="text-sm text-gray-600">
                                                {assignment.submission_types || 'Text & File Upload'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {assignment.instructions && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                            <div className="prose max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {submission ? (
                                /* Existing Submission */
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Your Submission</h2>
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                            {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'Submitted'}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Submitted Content */}
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Submission Content</h3>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="whitespace-pre-wrap text-gray-700">{submission.content}</div>
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        {submission.attachments && submission.attachments.length > 0 && (
                                            <div>
                                                <h3 className="font-medium text-gray-900 mb-2">Attachments</h3>
                                                <div className="space-y-2">
                                                    {submission.attachments.map((attachment, index) => (
                                                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                            <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">{attachment.name}</div>
                                                                <div className="text-sm text-gray-600">
                                                                    {formatFileSize(attachment.size)}
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={`/storage/${attachment.path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Submission Details */}
                                        <div className="border-t pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-900">Submitted At:</span>
                                                    <div className="text-gray-600">{formatDate(submission.submitted_at)}</div>
                                                </div>
                                                {submission.graded_at && (
                                                    <div>
                                                        <span className="font-medium text-gray-900">Graded At:</span>
                                                        <div className="text-gray-600">{formatDate(submission.graded_at)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Grade & Feedback */}
                                        {submission.status === 'graded' && (
                                            <div className="border-t pt-4">
                                                {submission.grade !== null && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900">Grade:</span>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-green-600">
                                                                    {submission.grade_points}/{assignment.max_points || 100}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ({submission.grade_percentage}%)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {submission.feedback && (
                                                    <div>
                                                        <span className="font-medium text-gray-900">Feedback:</span>
                                                        <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                                            <div className="text-blue-900 whitespace-pre-wrap">
                                                                {submission.feedback}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Resubmit Option */}
                                    {canSubmit && (
                                        <div className="mt-6 pt-6 border-t">
                                            <button
                                                onClick={() => router.reload()}
                                                className="text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Update Submission
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* New Submission Form */
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Submit Assignment</h2>
                                        {isLate && (
                                            <div className="flex items-center text-red-600">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Late Submission
                                            </div>
                                        )}
                                    </div>

                                    {!canSubmit ? (
                                        <div className="text-center py-8">
                                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Submission Closed</h3>
                                            <p className="text-gray-600">
                                                The deadline for this assignment has passed and late submissions are not allowed.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Content */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assignment Content *
                                                </label>
                                                <textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    rows="10"
                                                    placeholder="Write your assignment content here..."
                                                    required
                                                />
                                            </div>

                                            {/* File Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Attachments (Optional)
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="file-upload"
                                                        accept="*"
                                                    />
                                                    <label htmlFor="file-upload" className="cursor-pointer">
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <div className="text-sm text-gray-600">
                                                            Click to upload files or drag and drop
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            All file types are allowed
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Selected Files */}
                                                {files.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {files.map((file, index) => (
                                                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                                <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">{file.name}</div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {formatFileSize(file.size)}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex items-center justify-between pt-6">
                                                <div className="text-sm text-gray-500">
                                                    {isLate && assignment.late_penalty_percent && (
                                                        <div className="flex items-center text-red-600">
                                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                                            Late penalty: {assignment.late_penalty_percent}%
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting || !content.trim()}
                                                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            Submit Assignment
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Assignment Details */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="font-medium text-gray-700">Max Points</div>
                                        <div className="text-lg font-bold text-green-600">{assignment.max_points || 100}</div>
                                    </div>

                                    {assignment.due_date && (
                                        <div>
                                            <div className="font-medium text-gray-700">Due Date</div>
                                            <div className={`text-sm ${isLate ? 'text-red-600' : 'text-gray-600'}`}>
                                                {formatDate(assignment.due_date)}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="font-medium text-gray-700">File Upload</div>
                                        <div className="text-sm text-gray-600">
                                            All file types allowed
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Status */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>

                                {submission ? (
                                    <div className="text-center">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <div className="font-medium text-gray-900 mb-1">Submitted</div>
                                        <div className="text-sm text-gray-600">
                                            {formatDate(submission.submitted_at)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <div className="font-medium text-gray-900 mb-1">Not Submitted</div>
                                        <div className="text-sm text-gray-600">
                                            {canSubmit ? 'You can still submit' : 'Submission deadline passed'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}