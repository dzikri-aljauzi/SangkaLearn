import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    Trophy,
    Clock,
    RotateCcw,
    Eye,
    AlertCircle
} from 'lucide-react';

export default function QuizResult({ quiz, attempt, questions }) {
    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBackground = (percentage) => {
        if (percentage >= 80) return 'bg-green-100';
        if (percentage >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <AppLayout title={`Quiz Result: ${quiz.title}`}>
            <Head title={`Quiz Result: ${quiz.title}`} />

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
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                                <p className="text-lg text-gray-600 mb-6">{quiz.course.title}</p>

                                {/* Score Display */}
                                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(attempt.percentage)} mb-6`}>
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold ${getScoreColor(attempt.percentage)}`}>
                                            {attempt.percentage}%
                                        </div>
                                        <div className="text-sm text-gray-600">Score</div>
                                    </div>
                                </div>

                                {/* Result Status */}
                                <div className="mb-6">
                                    {attempt.is_passed ? (
                                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Passed
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
                                            <XCircle className="w-5 h-5 mr-2" />
                                            Not Passed
                                        </div>
                                    )}
                                </div>

                                {/* Attempt Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <Trophy className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{attempt.score}</div>
                                        <div className="text-sm text-gray-600">Points Earned</div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <Clock className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatTime(attempt.time_taken)}
                                        </div>
                                        <div className="text-sm text-gray-600">Time Taken</div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <RotateCcw className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">#{attempt.attempt_number}</div>
                                        <div className="text-sm text-gray-600">Attempt</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{questions && Array.isArray(questions) ? questions.length : 'N/A'}</div>
                                <div className="text-sm text-blue-600">Total Questions</div>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {questions && Array.isArray(questions) ? questions.filter(q => q.is_correct).length : 'N/A'}
                                </div>
                                <div className="text-sm text-green-600">Correct</div>
                            </div>

                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {questions && Array.isArray(questions) ? questions.filter(q => !q.is_correct).length : 'N/A'}
                                </div>
                                <div className="text-sm text-red-600">Incorrect</div>
                            </div>

                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">{quiz.passing_score}%</div>
                                <div className="text-sm text-gray-600">Required</div>
                            </div>
                        </div>

                        {!attempt.is_passed && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-yellow-800">Not Passed</h3>
                                        <p className="text-yellow-700 mt-1">
                                            You need at least {quiz.passing_score}% to pass this quiz.
                                            Review the questions below and consider retaking the quiz.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Question Review */}
                    {quiz.show_correct_answers && questions && Array.isArray(questions) && questions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h2>

                            <div className="space-y-6">
                                {questions.map((question, index) => (
                                    <motion.div
                                        key={question.id}
                                        className={`border rounded-lg p-6 ${
                                            question.is_correct
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                question.is_correct
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {question.is_correct ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-medium text-gray-900">
                                                        Question {index + 1}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                                        question.is_correct
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {question.is_correct ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                </div>

                                                <div className="text-gray-700 mb-4">{question.question}</div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="font-medium text-gray-900">Your Answer: </span>
                                                        <span className={question.is_correct ? 'text-green-700' : 'text-red-700'}>
                                                            {Array.isArray(question.user_answer)
                                                                ? question.user_answer.join(', ')
                                                                : question.user_answer || 'No answer provided'
                                                            }
                                                        </span>
                                                    </div>

                                                    {!question.is_correct && (
                                                        <div>
                                                            <span className="font-medium text-gray-900">Correct Answer: </span>
                                                            <span className="text-green-700">
                                                                {Array.isArray(question.correct_answers)
                                                                    ? question.correct_answers.join(', ')
                                                                    : question.correct_answers
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                    {question.explanation && (
                                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <span className="font-medium text-blue-900">Explanation: </span>
                                                            <span className="text-blue-800">{question.explanation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-center space-x-4">
                            <Link
                                href={route('courses.learn', quiz.course.slug)}
                                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Course
                            </Link>

                            <Link
                                href={route('quizzes.show', quiz.id)}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Quiz Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}