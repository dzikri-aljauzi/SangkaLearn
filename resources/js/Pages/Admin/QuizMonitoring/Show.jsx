import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import {
    HelpCircle,
    Users,
    CheckCircle,
    Clock,
    Download,
    Eye,
    AlertTriangle,
    TrendingUp,
    Book,
    Target,
    User,
    Calendar,
    Timer,
    Award,
    BarChart3,
    ChevronLeft,
    FileText,
    Edit,
    Trash2
} from 'lucide-react';

export default function Show() {
    const { quiz, stats, questionStats } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const handleDelete = (attemptId) => {
        if (confirm('Are you sure you want to delete this quiz attempt? This action cannot be undone.')) {
            router.delete(route('admin.quizzes.monitoring.delete-attempt', [quiz.id, attemptId]), {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh will happen automatically
                }
            });
        }
    };

    const getStatusBadge = (attempt) => {
        if (attempt.status === 'completed') {
            const percentage = parseFloat(attempt.percentage || attempt.score_percentage || 0);
            const passingScore = parseFloat(quiz.passing_score || 70);
            const passed = percentage >= passingScore;

            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {passed ? 'Passed' : 'Failed'}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
            </span>
        );
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const getScoreColor = (score, passingScore = 70) => {
        if (score >= 90) return 'text-green-600';
        if (score >= passingScore) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getQuestionDifficultyColor = (successRate) => {
        if (successRate >= 80) return 'bg-green-100 text-green-800';
        if (successRate >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <MonitoringLayout
            title={`Quiz Monitoring - ${quiz.title}`}
            showSidebar={true}
        >
            <Head title={`Quiz Monitoring - ${quiz.title}`} />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.quizzes.monitoring.index')}
                                        className="mr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Link>
                                    <HelpCircle className="h-6 w-6 text-purple-600 mr-3" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
                                        <p className="text-gray-600 mt-1">
                                            {quiz.course?.title} • {quiz.questions?.length || 0} Questions
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Pass Rate</div>
                                    <div className="text-2xl font-bold text-purple-600">{stats.pass_rate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Attempts</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.total_attempts}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.completed_attempts}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <TrendingUp className="h-8 w-8 text-blue-600" />
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
                                        <Timer className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Avg. Time</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {formatTime(stats.average_time_taken)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'overview'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('attempts')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'attempts'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Student Attempts
                                </button>
                                <button
                                    onClick={() => setActiveTab('questions')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'questions'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Question Analysis
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quiz Details */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <Book className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Course:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{quiz.course?.title}</span>
                                                    </div>
                                                </div>
                                                {quiz.time_limit && (
                                                    <div className="flex items-center">
                                                        <Timer className="h-5 w-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-600">Time Limit:</span>
                                                            <span className="ml-2 text-sm text-gray-900">{quiz.time_limit} minutes</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Target className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Passing Score:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{quiz.passing_score || 70}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Highest Score:</span>
                                                    <span className="text-sm font-medium text-green-600">
                                                        {stats.highest_score ? `${stats.highest_score}%` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Lowest Score:</span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        {stats.lowest_score ? `${stats.lowest_score}%` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Pass Rate:</span>
                                                    <span className="text-sm font-medium text-purple-600">{stats.pass_rate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-4">
                                        {stats.completed_attempts > 0 && (
                                            <a
                                                href={route('admin.quizzes.export-results', quiz.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Results
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Student Attempts Tab */}
                            {activeTab === 'attempts' && (
                                <div>
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Score
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Time Taken
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Completed At
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {quiz.attempts && quiz.attempts.length > 0 ? (
                                                    quiz.attempts.map((attempt) => (
                                                        <tr key={attempt.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {attempt.user?.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {attempt.user?.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className={`text-sm font-medium ${getScoreColor(attempt.percentage || attempt.score_percentage, quiz.passing_score)}`}>
                                                                    {(attempt.percentage !== null || attempt.score_percentage !== null) ? `${attempt.percentage || attempt.score_percentage}%` : 'N/A'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getStatusBadge(attempt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatTime(attempt.time_taken)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {attempt.completed_at ?
                                                                    new Date(attempt.completed_at).toLocaleString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }) : 'N/A'
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex items-center space-x-3">
                                                                    <Link
                                                                        href={route('admin.quizzes.monitoring.edit-attempt', [quiz.id, attempt.id])}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(attempt.id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center">
                                                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No attempts yet</h3>
                                                            <p className="mt-1 text-sm text-gray-500">Students haven't started this quiz yet.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Question Analysis Tab */}
                            {activeTab === 'questions' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Question Performance Analysis</h3>
                                    <div className="space-y-4">
                                        {questionStats && questionStats.length > 0 ? (
                                            questionStats.map((question, index) => (
                                                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                Question {index + 1}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {question.question}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuestionDifficultyColor(question.success_rate)}`}>
                                                            {question.success_rate}% Success Rate
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Type: </span>
                                                            <span className="font-medium capitalize">{question.type.replace('_', ' ')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Correct: </span>
                                                            <span className="font-medium text-green-600">{question.correct_answers}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Total: </span>
                                                            <span className="font-medium">{question.total_answers}</span>
                                                        </div>
                                                    </div>
                                                    {question.most_common_wrong_answer && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="text-gray-500">Most common wrong answer: </span>
                                                            <span className="font-medium text-red-600">{question.most_common_wrong_answer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                                                <p className="mt-1 text-sm text-gray-500">No completed attempts to analyze yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MonitoringLayout>
    );
}