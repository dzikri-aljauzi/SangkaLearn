import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import {
    PlayCircle,
    CheckCircle,
    Clock,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Download
} from 'lucide-react';

export default function LessonView({ lesson, isCompleted, nextLesson, previousLesson, enrollment }) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

    const markAsComplete = () => {
        if (isCompleted) return;
        
        router.post(route('student.lessons.complete', lesson.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCompleteConfirm(false);
            },
            onError: () => {
                alert('Error marking lesson as complete. Please try again.');
            }
        });
    };

    return (
        <AppLayout
            title={lesson.title}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('student.courses.study', lesson.course.slug)}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Course
                        </Link>
                        <div className="h-6 border-l border-gray-300"></div>
                        <h2 className="font-semibold text-xl text-gray-800">
                            {lesson.title}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        {isCompleted ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Completed
                            </span>
                        ) : (
                            <button
                                onClick={() => setShowCompleteConfirm(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 transition ease-in-out duration-150"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={lesson.title} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Video Section */}
                    {lesson.video_url && (
                        <div className="bg-black rounded-lg mb-6 overflow-hidden">
                            <div className="relative aspect-video">
                                {lesson.video_provider === 'youtube' ? (
                                    <iframe
                                        src={lesson.video_url}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allowFullScreen
                                        title={lesson.title}
                                    />
                                ) : lesson.video_provider === 'vimeo' ? (
                                    <iframe
                                        src={lesson.video_url}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allowFullScreen
                                        title={lesson.title}
                                    />
                                ) : (
                                    <video
                                        controls
                                        className="w-full h-full"
                                        poster={lesson.video_thumbnail}
                                    >
                                        <source src={lesson.video_url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lesson Content */}
                    <div className="bg-white rounded-lg shadow-sm border mb-6">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {lesson.title}
                                    </h1>
                                    <p className="text-gray-600">
                                        Course: {lesson.course.title}
                                    </p>
                                    {lesson.section && (
                                        <p className="text-sm text-gray-500">
                                            Section: {lesson.section.title}
                                        </p>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {lesson.video_duration && (
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {lesson.video_duration} min
                                        </div>
                                    )}
                                </div>
                            </div>

                            {lesson.description && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        {lesson.description}
                                    </p>
                                </div>
                            )}

                            {lesson.content && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Content</h2>
                                    <div 
                                        className="prose max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                                    />
                                </div>
                            )}

                            {/* Attachments */}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h2>
                                    <div className="space-y-2">
                                        {lesson.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                download={attachment.name}
                                                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <Download className="w-5 h-5 text-gray-500 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{attachment.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {attachment.size && `${(attachment.size / 1024 / 1024).toFixed(2)} MB`}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <div>
                            {previousLesson && (
                                <Link
                                    href={route('student.lessons.show', previousLesson.id)}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 transition ease-in-out duration-150"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Previous: {previousLesson.title}
                                </Link>
                            )}
                        </div>
                        <div>
                            {nextLesson && (
                                <Link
                                    href={route('student.lessons.show', nextLesson.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition ease-in-out duration-150"
                                >
                                    Next: {nextLesson.title}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Confirmation Modal */}
            {showCompleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Mark as Complete</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Mark this lesson as completed? This will update your course progress.
                            </p>
                            <div className="mt-6 flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowCompleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={markAsComplete}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    Mark Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}