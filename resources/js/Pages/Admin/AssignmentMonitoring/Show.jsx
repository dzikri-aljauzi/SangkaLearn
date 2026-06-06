import React, { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import {
    FileText,
    Users,
    CheckCircle,
    Clock,
    Download,
    ArrowLeft,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Book,
    Star,
    MessageSquare,
    User,
    Edit,
    Save,
    X
} from 'lucide-react';

export default function Show() {
    const { assignment, submissions, stats } = usePage().props;
    const [gradingSubmission, setGradingSubmission] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        grade: '',
        feedback: '',
    });

    const openGradingModal = (submission) => {
        setGradingSubmission(submission);
        setData({
            grade: submission.grade || '',
            feedback: submission.feedback || '',
        });
    };

    const closeGradingModal = () => {
        setGradingSubmission(null);
        reset();
    };

    const handleGradeSubmission = (e) => {
        e.preventDefault();
        post(route('admin.assignments.submissions.grade', {
            assignment: assignment.id,
            submission: gradingSubmission.id
        }), {
            onSuccess: () => {
                closeGradingModal();
            },
            onError: (errors) => {
                console.error('Grading error:', errors);
            }
        });
    };

    const getGradeColor = (grade, maxScore = 100) => {
        if (grade === null) return 'text-gray-500';
        const percentage = (grade / maxScore) * 100;
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusBadge = (submission) => {
        if (submission.grade !== null) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Graded
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pending
            </span>
        );
    };

    const isLateSubmission = (submission) => {
        if (!submission.submitted_at || !assignment.due_date) return false;
        return new Date(submission.submitted_at) > new Date(assignment.due_date);
    };

    return (
        <MonitoringLayout
            title={`Assignment: ${assignment.title}`}
            showSidebar={true}
        >
            <Head title={`Assignment: ${assignment.title}`} />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.assignments.monitoring.index')}
                                        className="text-gray-400 hover:text-gray-600 mr-3"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
                                        <p className="text-gray-600 mt-1 flex items-center">
                                            <Book className="h-4 w-4 mr-1" />
                                            {assignment.course?.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {stats.total_submissions > 0 && (
                                        <a
                                            href={route('admin.assignments.export-grades', assignment.id)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Grades
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Statistics Cards */}
                        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.total_submissions}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Graded</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.graded_submissions}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <TrendingUp className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stats.average_score ? `${stats.average_score}%` : 'N/A'}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Late Submissions</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.late_submissions}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h3>
                                
                                {assignment.due_date && (
                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <div>
                                            <span className="font-medium">Due Date:</span><br />
                                            {new Date(assignment.due_date).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {assignment.max_score && (
                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <Star className="h-4 w-4 mr-2" />
                                        <span>
                                            <span className="font-medium">Max Score:</span> {assignment.max_score} points
                                        </span>
                                    </div>
                                )}

                                {assignment.description && (
                                    <div className="mt-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                            {assignment.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submissions List */}
                        <div className="lg:col-span-3">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Student Submissions</h3>
                                </div>
                                
                                {submissions && submissions.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {submissions.map((submission) => (
                                            <div key={submission.id} className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {submission.user?.name || 'Unknown User'}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {submission.user?.email}
                                                            </p>
                                                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                                                <span>
                                                                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                                                </span>
                                                                {isLateSubmission(submission) && (
                                                                    <span className="text-red-600 font-medium">
                                                                        Late Submission
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusBadge(submission)}
                                                        {submission.grade !== null && (
                                                            <span className={`text-lg font-bold ${getGradeColor(submission.grade, assignment.max_score)}`}>
                                                                {submission.grade}/{assignment.max_score || 100}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Submission Content */}
                                                {submission.content && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Text Submission:</h5>
                                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                            {submission.content}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* File Submissions */}
                                                {submission.attachments && submission.attachments.length > 0 && (
                                                    <div className="mt-4">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Attached Files:</h5>
                                                        <div className="space-y-2">
                                                            {submission.attachments.map((attachment, index) => {
                                                                const downloadUrl = route('admin.assignments.submissions.download', {
                                                                    assignment: assignment.id,
                                                                    submission: submission.id,
                                                                    file: index
                                                                });

                                                                return (
                                                                    <a
                                                                        key={index}
                                                                        href={downloadUrl}
                                                                        download={attachment.name}
                                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            // Create a temporary anchor element to trigger download
                                                                            const link = document.createElement('a');
                                                                            link.href = downloadUrl;
                                                                            link.download = attachment.name || 'download';
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                        {attachment.name || 'Download File'}
                                                                        {attachment.size && (
                                                                            <span className="ml-2 text-gray-500">
                                                                                ({(attachment.size / 1024).toFixed(2)} KB)
                                                                            </span>
                                                                        )}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Feedback */}
                                                {submission.feedback && (
                                                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                                        <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                                                            <MessageSquare className="h-4 w-4 mr-1" />
                                                            Feedback:
                                                        </h5>
                                                        <p className="text-sm text-blue-600 whitespace-pre-wrap">
                                                            {submission.feedback}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Grading Actions */}
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={() => openGradingModal(submission)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        {submission.grade !== null ? 'Update Grade' : 'Grade Submission'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Students haven't submitted their assignments yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grading Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Grade Submission
                            </h3>
                            <button
                                onClick={closeGradingModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Student:</span> {gradingSubmission.user?.name}
                            </p>
                        </div>

                        <form onSubmit={handleGradeSubmission}>
                            <div className="mb-4">
                                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                                    Grade (out of {assignment.max_score || 100})
                                </label>
                                <input
                                    type="number"
                                    id="grade"
                                    min="0"
                                    max={assignment.max_score || 100}
                                    step="0.01"
                                    value={data.grade}
                                    onChange={(e) => setData('grade', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.grade && (
                                    <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    id="feedback"
                                    rows={4}
                                    value={data.feedback}
                                    onChange={(e) => setData('feedback', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Provide feedback to the student..."
                                />
                                {errors.feedback && (
                                    <p className="mt-1 text-sm text-red-600">{errors.feedback}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeGradingModal}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Grade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MonitoringLayout>
    );
}