import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MonitoringLayout from '@/Layouts/MonitoringLayout';
import { 
    HelpCircle, 
    User, 
    CheckCircle, 
    Clock, 
    XCircle,
    AlertTriangle,
    Calendar,
    Timer,
    Award,
    ChevronLeft,
    FileText
} from 'lucide-react';

export default function AttemptDetail() {
    const { attempt } = usePage().props;

    const getStatusBadge = (attempt) => {
        if (attempt.status === 'completed') {
            const passed = attempt.score >= (attempt.quiz.passing_score || 70);
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {passed ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                    {passed ? 'Passed' : 'Failed'}
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-4 h-4 mr-1" />
                In Progress
            </span>
        );
    };

    const getAnswerStatus = (answer) => {
        if (answer.is_correct) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Correct
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Incorrect
            </span>
        );
    };

    const formatTime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getScoreColor = (score, passingScore = 70) => {
        if (score >= 90) return 'text-green-600';
        if (score >= passingScore) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <MonitoringLayout
            title={`Quiz Attempt - ${attempt.user?.name}`}
            showSidebar={true}
        >
            <Head title={`Quiz Attempt - ${attempt.user?.name}`} />

            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.quizzes.monitoring.show', attempt.quiz.id)}
                                        className="mr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Link>
                                    <User className="h-6 w-6 text-purple-600 mr-3" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{attempt.user?.name}</h2>
                                        <p className="text-gray-600 mt-1">
                                            {attempt.quiz?.title} • {attempt.quiz?.course?.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(attempt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attempt Summary */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Attempt Summary</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${getScoreColor(attempt.score, attempt.quiz.passing_score)}`}>
                                        {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">Final Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {formatTime(attempt.time_taken)}
                                    </div>
                                    <div className="text-sm text-gray-500">Time Taken</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {attempt.answers?.filter(a => a.is_correct).length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Correct Answers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {attempt.answers?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Questions</div>
                                </div>
                            </div>

                            {/* Attempt Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Attempt Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-600">Started:</span>
                                            <span className="ml-2 text-gray-900">
                                                {attempt.started_at ? new Date(attempt.started_at).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-600">Completed:</span>
                                            <span className="ml-2 text-gray-900">
                                                {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Student Information</h4>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 text-gray-900">{attempt.user?.email}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">User ID:</span>
                                            <span className="ml-2 text-gray-900">{attempt.user?.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Answers */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Detailed Answers</h3>
                        </div>
                        <div className="p-6">
                            {attempt.answers && attempt.answers.length > 0 ? (
                                <div className="space-y-6">
                                    {attempt.answers.map((answer, index) => (
                                        <div key={answer.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        Question {index + 1}
                                                    </h4>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        {answer.question?.question}
                                                    </p>
                                                </div>
                                                {getAnswerStatus(answer)}
                                            </div>

                                            {/* Question Type and Options */}
                                            <div className="mt-3">
                                                <div className="text-xs text-gray-500 mb-2">
                                                    Type: {answer.question?.type?.replace('_', ' ').toUpperCase()}
                                                </div>

                                                {answer.question?.type === 'multiple_choice' && answer.question?.options && (
                                                    <div className="space-y-2">
                                                        {answer.question.options.map((option) => {
                                                            const isSelected = answer.selected_option === option.id;
                                                            const isCorrect = option.is_correct;
                                                            
                                                            let optionClass = 'p-2 rounded text-sm border ';
                                                            if (isSelected && isCorrect) {
                                                                optionClass += 'bg-green-50 border-green-200 text-green-800';
                                                            } else if (isSelected && !isCorrect) {
                                                                optionClass += 'bg-red-50 border-red-200 text-red-800';
                                                            } else if (!isSelected && isCorrect) {
                                                                optionClass += 'bg-gray-50 border-gray-200 text-green-800';
                                                            } else {
                                                                optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                                                            }

                                                            return (
                                                                <div key={option.id} className={optionClass}>
                                                                    <div className="flex items-center">
                                                                        {isSelected && (
                                                                            <span className="mr-2">
                                                                                {isCorrect ? '✓' : '✗'}
                                                                            </span>
                                                                        )}
                                                                        {!isSelected && isCorrect && (
                                                                            <span className="mr-2 text-green-600">✓</span>
                                                                        )}
                                                                        <span>{option.option_text}</span>
                                                                        {isSelected && (
                                                                            <span className="ml-auto text-xs">
                                                                                (Your answer)
                                                                            </span>
                                                                        )}
                                                                        {!isSelected && isCorrect && (
                                                                            <span className="ml-auto text-xs text-green-600">
                                                                                (Correct answer)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {(answer.question?.type === 'true_false' || answer.question?.type === 'short_answer') && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm">
                                                            <span className="font-medium text-gray-700">Student Answer: </span>
                                                            <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                                                                {answer.answer_text || 'No answer provided'}
                                                            </span>
                                                        </div>
                                                        {answer.question?.correct_answer && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-gray-700">Correct Answer: </span>
                                                                <span className="text-green-600">{answer.question.correct_answer}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Points */}
                                            <div className="mt-3 text-xs text-gray-500">
                                                Points: {answer.is_correct ? (answer.question?.points || 1) : 0} / {answer.question?.points || 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No answers available</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This attempt doesn't have any recorded answers yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MonitoringLayout>
    );
}