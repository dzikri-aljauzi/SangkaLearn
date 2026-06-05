import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import {
    Clock,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    Send,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function QuizTake({ quiz, attempt, questions }) {
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [endTime, setEndTime] = useState(null);
    const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

    // Calculate end time once
    useEffect(() => {
        if (quiz.time_limit && attempt.started_at) {
            const startTime = new Date(attempt.started_at);
            const calculatedEndTime = new Date(startTime.getTime() + quiz.time_limit * 60000);
            setEndTime(calculatedEndTime);
        }
    }, [quiz.time_limit, attempt.started_at]);

    // Timestamp-based timer that works even when tab is inactive
    useEffect(() => {
        if (!endTime) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            const remaining = Math.floor((endTime - now) / 1000);

            if (remaining <= 0) {
                setTimeRemaining(0);
                // Force auto-submit when time is up
                if (!hasAutoSubmitted && !isSubmitting) {
                    setHasAutoSubmitted(true);
                    handleAutoSubmit();
                }
                return 0;
            }

            return remaining;
        };

        // Initial calculation
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        // Update every second
        const timer = setInterval(() => {
            const newRemaining = calculateTimeRemaining();
            setTimeRemaining(newRemaining);
        }, 1000);

        // Recalculate when tab becomes visible again
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const newRemaining = calculateTimeRemaining();
                setTimeRemaining(newRemaining);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [endTime, hasAutoSubmitted, isSubmitting]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    // Auto-submit when time runs out (bypass warning)
    const handleAutoSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        toast.error('Time is up! Auto-submitting your quiz...');

        try {
            const response = await fetch(route('quizzes.submit', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    attempt_id: attempt.id,
                    answers,
                    time_expired: true // Flag to indicate auto-submit due to time
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                router.visit(route('quizzes.result', [quiz.id, attempt.id]));
            } else {
                toast.error(data.error || 'Failed to submit quiz');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Failed to submit quiz. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0 && !showWarning) {
            setShowWarning(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(route('quizzes.submit', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    attempt_id: attempt.id,
                    answers
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Quiz submitted successfully!');
                router.visit(route('quizzes.result', [quiz.id, attempt.id]));
            } else {
                toast.error(data.error || 'Failed to submit quiz');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    const renderQuestion = (question) => {
        const answer = answers[question.id] || '';

        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <label key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option}
                                    checked={answer === option}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    className="mt-1"
                                />
                                <span className="flex-1">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'true_false':
                return (
                    <div className="space-y-3">
                        {['True', 'False'].map((option) => (
                            <label key={option} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option}
                                    checked={answer === option}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'fill_blank':
            case 'text':
                return (
                    <textarea
                        value={answer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        placeholder="Type your answer here..."
                    />
                );

            case 'essay':
                return (
                    <textarea
                        value={answer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="8"
                        placeholder="Write your essay response here..."
                    />
                );

            default:
                return <p className="text-gray-500">Question type not supported</p>;
        }
    };

    const question = questions[currentQuestion];

    return (
        <AppLayout title={`Taking Quiz: ${quiz.title}`}>
            <Head title={`Taking Quiz: ${quiz.title}`} />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('quizzes.show', quiz.id)}
                                    className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium"
                                    onClick={(e) => {
                                        if (!confirm('Are you sure you want to leave? Your progress will be saved but the timer will continue running.')) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Quiz
                                </Link>
                                <div className="text-lg font-semibold text-gray-900">{quiz.title}</div>
                            </div>

                            <div className="flex items-center space-x-6">
                                {timeRemaining !== null && (
                                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                        timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        <Clock className="w-4 h-4" />
                                        <span className="font-mono">{formatTime(timeRemaining)}</span>
                                    </div>
                                )}

                                <div className="text-sm text-gray-600">
                                    Question {currentQuestion + 1} of {questions.length}
                                </div>

                                <div className="text-sm text-gray-600">
                                    Answered: {getAnsweredCount()}/{questions.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Question Progress */}
                        <div className="px-6 py-4 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-500">
                                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                        Q{currentQuestion + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-lg font-medium text-gray-900 mb-4">
                                            {question.question}
                                        </div>
                                        {question.image && (
                                            <div className="mb-4">
                                                <img
                                                    src={`/storage/${question.image}`}
                                                    alt="Question image"
                                                    className="max-w-full h-auto rounded-lg shadow-sm"
                                                />
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-600 mb-6">
                                            Points: {question.points}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="mb-8">
                                {renderQuestion(question)}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowWarning(true)}
                                    disabled={isSubmitting}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Quiz
                                </button>

                                {currentQuestion < questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                ) : (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Last Question
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Navigation */}
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-medium text-gray-900 mb-4">Question Navigation</h3>
                        <div className="grid grid-cols-10 gap-2">
                            {questions.map((q, index) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`w-8 h-8 text-sm rounded-full font-medium transition-colors ${
                                        index === currentQuestion
                                            ? 'bg-blue-600 text-white'
                                            : answers[q.id]
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Warning Modal */}
                {showWarning && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            className="bg-white rounded-lg p-6 max-w-md w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Submission</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                {Object.keys(answers).length < questions.length ? (
                                    <>You have {questions.length - Object.keys(answers).length} unanswered questions. </>
                                ) : (
                                    'You have answered all questions. '
                                )}
                                Are you sure you want to submit your quiz? You cannot change your answers after submission.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Continue Quiz
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}