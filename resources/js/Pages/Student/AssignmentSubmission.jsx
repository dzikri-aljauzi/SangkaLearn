import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ArrowLeft,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    Star,
    Eye,
    Download,
    Paperclip
} from 'lucide-react';

export default function AssignmentSubmission({ assignment, submission }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'graded': return 'bg-green-100 text-green-800';
            case 'returned': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getGradeColor = (grade, maxPoints) => {
        const percentage = (grade / maxPoints) * 100;
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout title={`Submission: ${assignment.title}`}>
            <Head title={`Submission: ${assignment.title}`} />

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
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                                    <p className="text-lg text-gray-600 mb-4">{assignment.course.title}</p>

                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                            {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'Submitted'}
                                        </span>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Submitted {formatDate(submission.submitted_at)}
                                        </div>
                                    </div>
                                </div>

                                {submission.grade !== null && submission.status === 'graded' && (
                                    <div className="ml-6 flex-shrink-0">
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className={`text-3xl font-bold ${getGradeColor(submission.grade_percentage || submission.grade, 100)}`}>
                                                {submission.grade_points || submission.grade}/{assignment.max_points}
                                            </div>
                                            <div className="text-sm text-gray-600">Grade ({submission.grade_percentage || submission.grade}%)</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Assignment Description */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment</h2>
                                {assignment.description && (
                                    <div className="prose max-w-none mb-4">
                                        <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
                                    </div>
                                )}
                            </div>

                            {/* Submission Content */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>

                                <div className="space-y-6">
                                    {/* Content */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Content</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="whitespace-pre-wrap text-gray-700">
                                                {submission.content}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attachments */}
                                    {submission.attachments && submission.attachments.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-3">Attachments</h3>
                                            <div className="space-y-3">
                                                {submission.attachments.map((attachment, index) => (
                                                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border">
                                                        <div className="flex-shrink-0 mr-4">
                                                            <Paperclip className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{attachment.name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {formatFileSize(attachment.size)} • {attachment.type}
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <a
                                                                href={`/storage/${attachment.path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Grade Card - Main Display */}
                            {submission.grade !== null && (
                                <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200 mb-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Grade</h2>
                                        <div className="mb-4">
                                            <div className={`text-6xl font-bold ${getGradeColor(submission.grade_percentage || submission.grade, 100)}`}>
                                                {submission.grade_points !== null && submission.grade_points !== undefined
                                                    ? submission.grade_points
                                                    : Math.round((submission.grade / 100) * assignment.max_points * 100) / 100
                                                }
                                            </div>
                                            <div className="text-2xl text-gray-600 mt-2">out of {assignment.max_points} points</div>
                                            <div className="text-xl text-gray-500 mt-1">
                                                ({submission.grade_percentage || submission.grade}%)
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                            <div
                                                className={`h-4 rounded-full transition-all duration-500 ${
                                                    (submission.grade_percentage || submission.grade) >= 90
                                                        ? 'bg-green-500'
                                                        : (submission.grade_percentage || submission.grade) >= 80
                                                        ? 'bg-blue-500'
                                                        : (submission.grade_percentage || submission.grade) >= 70
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                                style={{
                                                    width: `${submission.grade_percentage || submission.grade}%`
                                                }}
                                            />
                                        </div>

                                        <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border-2 border-green-500">
                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                            <span className="text-green-700 font-medium">Graded</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {submission.feedback && (
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor Feedback</h2>
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="whitespace-pre-wrap text-blue-900">
                                            {submission.feedback}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Submission Details */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Status</div>
                                            <div className="text-sm text-gray-600">
                                                {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'Submitted'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Submitted At</div>
                                            <div className="text-sm text-gray-600">
                                                {formatDate(submission.submitted_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {submission.graded_at && (
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 text-yellow-500 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">Graded At</div>
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(submission.graded_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Info */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Info</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="font-medium text-gray-700">Max Points</div>
                                        <div className="text-lg font-bold text-green-600">{assignment.max_points}</div>
                                    </div>

                                    {assignment.due_date && (
                                        <div>
                                            <div className="font-medium text-gray-700">Due Date</div>
                                            <div className="text-sm text-gray-600">
                                                {formatDate(assignment.due_date)}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="font-medium text-gray-700">Section</div>
                                        <div className="text-sm text-gray-600">{assignment.section.title}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions - Only show if not graded */}
                            {submission.grade === null && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

                                    <div className="space-y-3">
                                        <Link
                                            href={route('assignments.show', assignment.id)}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Assignment
                                        </Link>

                                        <Link
                                            href={route('courses.learn', assignment.course.slug)}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Course
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}