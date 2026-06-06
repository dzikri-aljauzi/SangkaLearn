import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import {
    Clock,
    ArrowLeft,
    Play,
    CheckCircle,
    AlertCircle,
    Trophy,
    RefreshCw,
    Eye
} from 'lucide-react';

export default function QuizView({ quiz, attempts, canTakeQuiz, attemptCount, bestAttempt, activeAttempt, enrollment, canRetakeUntilPass = false, retakeMessage = '', hasPassed = false }) {
    const [isStarting, setIsStarting] = useState(false);
    const [showAttempts, setShowAttempts] = useState(false);

    const startQuiz = async () => {
        if (!canTakeQuiz || isStarting) return;

        setIsStarting(true);
        try {
            const response = await fetch(route('quizzes.start', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Navigate to quiz taking interface
                router.visit(route('quizzes.take', quiz.id) + `?attempt=${data.attempt.id}`);
            } else {
                toast.error(data.error || 'Failed to start quiz');
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            toast.error('Failed to start quiz. Please try again.');
        } finally {
            setIsStarting(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'No time limit';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    };

    return (
        <AppLayout title={`Quiz: ${quiz.title}`}>
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('courses.learn', quiz.course.slug)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Course
                        </Link>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                                    <p className="text-lg text-gray-600 mb-4">{quiz.course.title}</p>

                                    {quiz.description && (
                                        <div className="prose prose-lg max-w-none mb-6">
                                            <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
                                        </div>
                                    )}
                                </div>

                                <div className="ml-6 flex-shrink-0">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {quiz.questions_count}
                                            </div>
                                            <div className="text-sm text-blue-600">Questions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Quiz Instructions */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <Clock className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-700">Time Limit</span>
                                        </div>
                                        <p className="text-gray-600">{formatDuration(quiz.time_limit)}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-3">
                                            <RefreshCw className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-700">Attempts Allowed</span>
                                        </div>
                                        <p className="text-gray-600">
                                            {quiz.allow_retake_until_pass ? (
                                                quiz.max_retake_attempts ?
                                                    `${quiz.max_retake_attempts} retakes until pass` :
                                                    'Unlimited retakes until pass'
                                            ) : (
                                                quiz.attempts_allowed > 0 ? `${quiz.attempts_allowed} attempts` : 'Unlimited'
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-3">
                                            <Trophy className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-700">Passing Score</span>
                                        </div>
                                        <p className="text-gray-600">{quiz.passing_score}%</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-3">
                                            <CheckCircle className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-700">Questions</span>
                                        </div>
                                        <p className="text-gray-600">{quiz.questions_count} questions</p>
                                    </div>
                                </div>

                                {quiz.instructions && (
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                                        <div className="prose max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: quiz.instructions }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Retake Information */}
                            {canRetakeUntilPass && !hasPassed && retakeMessage && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <RefreshCw className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-1">Retake Until Pass</h4>
                                            <p className="text-sm text-blue-800">{retakeMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Actions */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {activeAttempt ? (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Quiz In Progress</h3>
                                            <p className="text-gray-600">You have an active attempt for this quiz.</p>
                                        </div>
                                        <button
                                            onClick={() => router.visit(route('quizzes.take', quiz.id) + `?attempt=${activeAttempt.id}`)}
                                            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Continue Quiz
                                        </button>
                                    </div>
                                ) : canTakeQuiz ? (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <Play className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Ready to Start</h3>
                                            <p className="text-gray-600">
                                                {attemptCount > 0 ? `Attempt ${attemptCount + 1}` : 'First attempt'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={startQuiz}
                                            disabled={isStarting}
                                            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                                        >
                                            {isStarting ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-5 h-5 mr-2" />
                                                    Start Quiz
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        {hasPassed ? (
                                            <>
                                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                                <h3 className="text-lg font-semibold text-gray-900">Quiz Completed</h3>
                                                <p className="text-gray-600">
                                                    Congratulations! You have passed this quiz with {bestAttempt?.percentage}%.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {canRetakeUntilPass ? 'Maximum Retakes Reached' : 'Quiz Unavailable'}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {retakeMessage || (
                                                        quiz.attempts_allowed > 0 && attemptCount >= quiz.attempts_allowed
                                                            ? 'You have reached the maximum number of attempts for this quiz.'
                                                            : 'This quiz is currently unavailable.'
                                                    )}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Best Score */}
                            {bestAttempt && (
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Score</h3>
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold mb-2 ${
                                            bestAttempt.is_passed ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {bestAttempt.percentage}%
                                        </div>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            bestAttempt.is_passed
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {bestAttempt.is_passed ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Passed
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    Not Passed
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attempt History */}
                            {attempts.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Attempt History</h3>
                                        <button
                                            onClick={() => setShowAttempts(!showAttempts)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            {showAttempts ? 'Hide' : 'Show'} ({attempts.length})
                                        </button>
                                    </div>

                                    {showAttempts && (
                                        <div className="space-y-3">
                                            {attempts.slice(0, 5).map((attempt, index) => (
                                                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            Attempt {attempt.attempt_number}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {new Date(attempt.started_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {attempt.status === 'completed' ? (
                                                            <>
                                                                <div className={`font-semibold ${
                                                                    attempt.is_passed ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                    {attempt.percentage}%
                                                                </div>
                                                                <button
                                                                    onClick={() => router.visit(route('quizzes.result', [quiz.id, attempt.id]))}
                                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                                >
                                                                    <Eye className="w-3 h-3 inline mr-1" />
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-yellow-600">In Progress</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}