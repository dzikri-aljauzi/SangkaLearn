import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import AppLayout from '../../Layouts/AppLayout';
import PreviewBanner from '@/Components/PreviewBanner';
import LessonContentRenderer from '@/Components/LessonContentRenderer';
import GoogleDriveVideoPlayer from '@/Components/GoogleDriveVideoPlayer';
import PDFViewer from '@/Components/PDFViewer';
import ContentProtection from '@/Components/ContentProtection';
import Modal from '@/Components/Modal';
import {
    PlayCircle, BookOpen, CheckCircle, ChevronLeft, ChevronRight,
    Clock, Menu, X, Download, FileText, HelpCircle, Star,
    ArrowLeft, Edit, Calendar, Video, AlertCircle, Play,
    ExternalLink, Lock, Unlock, Award, Camera, Upload, Trash2, Image
} from 'lucide-react';

export default function Learn({
    course, enrollment, currentLesson, currentQuiz, currentAssignment,
    currentMeeting, previousLesson, nextLesson, lessonCompletions = [],
    quizCompletions = [], assignmentSubmissions = [], courseProgress = {},
    contentLockStatus = {},
    isPreviewMode = false, adminReturnUrl = null, previewPublicUrl = null,
    courseLevelMeetings = []
}) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const videoRef = useRef(null);

    // Completion modal state
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Zoom screenshot states
    const [zoomScreenshot, setZoomScreenshot] = useState(enrollment?.zoom_screenshot_url || null);
    const [zoomScreenshotUploading, setZoomScreenshotUploading] = useState(false);
    const [zoomScreenshotPreview, setZoomScreenshotPreview] = useState(null);
    const zoomScreenshotInputRef = useRef(null);
    const [showZoomScreenshot, setShowZoomScreenshot] = useState(false);

    // Check if zoom screenshot is locked (all other content must be completed first)
    const isZoomScreenshotLocked = () => {
        if (isPreviewMode) return false;
        if (!course.require_zoom_screenshot) return true; // Not required, so "locked"

        // Calculate totals from sections (source of truth)
        const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;
        const totalQuizzes = course.sections?.reduce((sum, s) => sum + (s.quizzes?.length || 0), 0) || 0;
        const totalAssignments = course.sections?.reduce((sum, s) => sum + (s.assignments?.length || 0), 0) || 0;

        // Use the actual completion arrays (more reliable than courseProgress counts)
        const completedLessons = lessonCompletions?.length || 0;
        const completedQuizzes = quizCompletions?.length || 0;
        const completedAssignments = assignmentSubmissions?.length || 0;

        const totalItems = totalLessons + totalQuizzes + totalAssignments;
        const completedItems = completedLessons + completedQuizzes + completedAssignments;

        // Locked if not all content is completed
        return completedItems < totalItems;
    };

    const navigateToZoomScreenshot = () => {
        if (isZoomScreenshotLocked()) {
            toast.error('Selesaikan semua materi terlebih dahulu untuk mengakses upload foto zoom.');
            return;
        }
        setShowZoomScreenshot(true);
        // Clear other current items
        const base = isPreviewMode ? route('admin.courses.preview-enrolled', course.slug) : route('courses.learn', course.slug);
        router.visit(`${base}?zoom_screenshot=1`, { preserveState: true });
    };

    useEffect(() => {
        if (currentLesson && lessonCompletions.includes(currentLesson.id)) {
            setLessonCompleted(true);
        } else {
            setLessonCompleted(false);
        }
    }, [currentLesson, lessonCompletions]);

    useEffect(() => {
        setVideoError(null);
        setIsVideoLoading(true);
    }, [currentLesson?.id]);

    // Close mobile sidebar when navigating
    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [currentLesson?.id, currentQuiz?.id, currentAssignment?.id, currentMeeting?.id]);

    // Check URL for zoom_screenshot parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('zoom_screenshot') === '1') {
            setShowZoomScreenshot(true);
        } else {
            setShowZoomScreenshot(false);
        }
    }, [currentLesson?.id, currentQuiz?.id, currentAssignment?.id, currentMeeting?.id]);

    // Check for course completion (100%) and show modal once
    useEffect(() => {
        if (isPreviewMode) return;

        // Check if course is 100% completed
        const isCompleted = courseProgress?.percentage === 100;

        if (isCompleted) {
            // Check if modal was already shown for this course
            const modalShownKey = `completion_modal_shown_${course.id}_${auth.user.id}`;
            const wasShown = localStorage.getItem(modalShownKey);

            if (!wasShown) {
                // Show modal and mark as shown
                setShowCompletionModal(true);
                localStorage.setItem(modalShownKey, 'true');
            }
        }
    }, [courseProgress?.percentage, course.id, auth?.user?.id, isPreviewMode]);

    const markLessonComplete = async () => {
        if (!currentLesson || lessonCompleted || isPreviewMode) return;
        try {
            const response = await fetch(route('lessons.complete', currentLesson.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            if (response.ok) {
                setLessonCompleted(true);
                toast.success('Lesson selesai!');

                // Auto navigate to next lesson if available and not locked
                if (nextLesson && !isLocked('lesson', nextLesson.id)) {
                    setTimeout(() => {
                        navigateToLesson(nextLesson);
                    }, 500); // Small delay to show success message
                } else {
                    // Reload if no next lesson or next lesson is locked
                    router.reload();
                }
            }
        } catch (error) {
            toast.error('Gagal menandai selesai');
        }
    };

    // Zoom screenshot upload handler
    const handleZoomScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast.error('Format file harus JPG, JPEG, atau PNG');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                return;
            }
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setZoomScreenshotPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const uploadZoomScreenshot = async () => {
        if (isPreviewMode) {
            toast.error('Upload tidak tersedia dalam mode preview');
            return;
        }

        const file = zoomScreenshotInputRef.current?.files[0];
        if (!file) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }

        setZoomScreenshotUploading(true);
        const formData = new FormData();
        formData.append('zoom_screenshot', file);

        try {
            const response = await fetch(route('courses.zoom-screenshot.upload', course.slug), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setZoomScreenshot(data.zoom_screenshot_url);
                setZoomScreenshotPreview(null);
                toast.success('Foto zoom berhasil diupload!');
                router.reload({ only: ['courseProgress', 'enrollment'] });
            } else {
                toast.error(data.error || 'Gagal mengupload foto');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Gagal mengupload foto zoom');
        } finally {
            setZoomScreenshotUploading(false);
        }
    };

    const deleteZoomScreenshot = async () => {
        if (isPreviewMode) {
            toast.error('Hapus tidak tersedia dalam mode preview');
            return;
        }

        if (!confirm('Apakah Anda yakin ingin menghapus foto zoom ini?')) return;

        try {
            const response = await fetch(route('courses.zoom-screenshot.delete', course.slug), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            const data = await response.json();

            if (response.ok) {
                setZoomScreenshot(null);
                setZoomScreenshotPreview(null);
                if (zoomScreenshotInputRef.current) {
                    zoomScreenshotInputRef.current.value = '';
                }
                toast.success('Foto zoom berhasil dihapus');
                router.reload({ only: ['courseProgress', 'enrollment'] });
            } else {
                toast.error(data.error || 'Gagal menghapus foto');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Gagal menghapus foto zoom');
        }
    };

    // Check if a content item is locked
    const isLocked = (type, id) => {
        if (isPreviewMode) return false;
        const key = `${type}_${id}`;
        return contentLockStatus[key] === true;
    };

    const navigateToLesson = (lesson) => {
        if (!lesson) return;
        if (isLocked('lesson', lesson.id)) {
            toast.error('Selesaikan materi sebelumnya terlebih dahulu untuk membuka materi ini.');
            return;
        }
        const base = isPreviewMode ? route('admin.courses.preview-enrolled', course.slug) : route('courses.learn', course.slug);
        router.visit(`${base}?lesson=${lesson.id}`);
    };

    const navigateToQuiz = (quiz) => {
        if (!quiz) return;
        if (isLocked('quiz', quiz.id)) {
            toast.error('Selesaikan materi sebelumnya terlebih dahulu untuk membuka kuis ini.');
            return;
        }
        const base = isPreviewMode ? route('admin.courses.preview-enrolled', course.slug) : route('courses.learn', course.slug);
        router.visit(`${base}?quiz=${quiz.id}`);
    };

    const navigateToAssignment = (assignment) => {
        if (!assignment) return;
        if (isLocked('assignment', assignment.id)) {
            toast.error('Selesaikan materi sebelumnya terlebih dahulu untuk membuka tugas ini.');
            return;
        }
        const base = isPreviewMode ? route('admin.courses.preview-enrolled', course.slug) : route('courses.learn', course.slug);
        router.visit(`${base}?assignment=${assignment.id}`);
    };

    const navigateToMeeting = (meeting) => {
        if (!meeting) return;
        const base = isPreviewMode ? route('admin.courses.preview-enrolled', course.slug) : route('courses.learn', course.slug);
        router.visit(`${base}?meeting=${meeting.id}`);
    };

    // Video helper functions
    const getVideoSrc = () => {
        if (!currentLesson) return null;
        if (currentLesson.video_file) {
            const path = currentLesson.video_file.replace(/^\/+/, '');
            return `/storage/${path}`;
        }
        if (currentLesson.video_url) {
            return currentLesson.video_url;
        }
        return null;
    };

    const isYouTube = () => {
        const url = currentLesson?.video_url || '';
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbed = () => {
        const url = currentLesson?.video_url || '';
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
    };

    const isVideoFormatSupported = () => {
        const mime = currentLesson?.video_mime_type || '';
        const file = currentLesson?.video_file || '';
        const supportedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
        const supportedExts = ['.mp4', '.webm', '.ogg', '.ogv'];
        if (supportedMimes.includes(mime.toLowerCase())) return true;
        return supportedExts.some(ext => file.toLowerCase().endsWith(ext));
    };

    // Get content type icon
    const getContentIcon = (type, isDone) => {
        if (isDone) return <CheckCircle className="w-5 h-5" />;
        switch (type) {
            case 'video': return <PlayCircle className="w-5 h-5" />;
            case 'document': return <FileText className="w-5 h-5" />;
            default: return <BookOpen className="w-5 h-5" />;
        }
    };

    // Sidebar content component (reusable for desktop and mobile)
    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-white">
            {/* Sidebar Header */}
            <div className="flex-shrink-0 bg-blue-600 text-white p-5">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href={isPreviewMode ? adminReturnUrl : route('student.my-learning')}
                        className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                    <button
                        onClick={() => { setSidebarOpen(false); setMobileSidebarOpen(false); }}
                        className="lg:block p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <h1 className="font-bold text-lg leading-snug line-clamp-2 mb-4">
                    {course.title}
                </h1>

                {/* Progress Card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-100">Progress Kursus</span>
                        <span className="text-lg font-bold">{courseProgress.percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${courseProgress.percentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-blue-100 mt-2">
                        {courseProgress.completed_items} dari {courseProgress.total_items} materi selesai
                    </p>
                </div>

                {/* Preview Certificate Button */}
                {!isPreviewMode && (
                    <a
                        href={route('student.course.preview-certificate', course.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                    >
                        <Award className="w-4 h-4" />
                        <span>Lihat Preview Sertifikat</span>
                    </a>
                )}
            </div>

            {/* Course Content List */}
            <div className="flex-1 overflow-y-auto">
                {course.sections.map((section, sectionIdx) => (
                    <div key={section.id} className="border-b border-gray-100">
                        {/* Section Header */}
                        <div className="sticky top-0 z-10 px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Bagian {sectionIdx + 1}
                            </p>
                            <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-1">
                                {section.title}
                            </h3>
                        </div>

                        {/* Section Items */}
                        <div className="py-1">
                            {/* Lessons */}
                            {section.lessons.map((lesson, lessonIdx) => {
                                const isActive = currentLesson?.id === lesson.id;
                                const isDone = lessonCompletions.includes(lesson.id);
                                const locked = isLocked('lesson', lesson.id);

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => navigateToLesson(lesson)}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-3 ${
                                            locked
                                                ? 'border-l-4 border-transparent opacity-50 cursor-not-allowed'
                                                : isActive
                                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                                    : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            locked
                                                ? 'bg-gray-200 text-gray-400'
                                                : isDone
                                                    ? 'bg-green-100 text-green-600'
                                                    : isActive
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {locked ? <Lock className="w-4 h-4" /> : getContentIcon(lesson.type, isDone)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                                                locked ? 'text-gray-400' : isActive ? 'text-blue-700' : 'text-gray-800'
                                            }`}>
                                                {lesson.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {locked ? (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                                        Terkunci
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        lesson.type === 'video'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : lesson.type === 'document'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {lesson.type === 'video' ? 'Video' : lesson.type === 'document' ? 'Dokumen' : 'Bacaan'}
                                                    </span>
                                                )}
                                                {!locked && lesson.duration && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {lesson.duration} min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Quizzes */}
                            {section.quizzes?.map((quiz) => {
                                const isActive = currentQuiz?.id === quiz.id;
                                const isDone = quizCompletions.includes(quiz.id);
                                const locked = isLocked('quiz', quiz.id);

                                return (
                                    <button
                                        key={`quiz-${quiz.id}`}
                                        onClick={() => navigateToQuiz(quiz)}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-3 ${
                                            locked
                                                ? 'border-l-4 border-transparent opacity-50 cursor-not-allowed'
                                                : isActive
                                                    ? 'bg-orange-50 border-l-4 border-orange-500'
                                                    : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            locked
                                                ? 'bg-gray-200 text-gray-400'
                                                : isDone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {locked ? <Lock className="w-4 h-4" /> : isDone ? <CheckCircle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                                                locked ? 'text-gray-400' : 'text-gray-800'
                                            }`}>
                                                {quiz.title}
                                            </p>
                                            {locked ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 mt-1 inline-block">
                                                    Terkunci
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                                        Kuis
                                                    </span>
                                                    {isDone && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                            Lulus
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Assignments */}
                            {section.assignments?.map((assignment) => {
                                const isActive = currentAssignment?.id === assignment.id;
                                const isDone = assignmentSubmissions.includes(assignment.id);
                                const locked = isLocked('assignment', assignment.id);

                                return (
                                    <button
                                        key={`assignment-${assignment.id}`}
                                        onClick={() => navigateToAssignment(assignment)}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-3 ${
                                            locked
                                                ? 'border-l-4 border-transparent opacity-50 cursor-not-allowed'
                                                : isActive
                                                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                    : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            locked
                                                ? 'bg-gray-200 text-gray-400'
                                                : isDone ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {locked ? <Lock className="w-4 h-4" /> : isDone ? <CheckCircle className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                                                locked ? 'text-gray-400' : 'text-gray-800'
                                            }`}>
                                                {assignment.title}
                                            </p>
                                            {locked ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 mt-1 inline-block">
                                                    Terkunci
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-1 inline-block">
                                                    Tugas
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Section Meetings */}
                            {section.meetings?.map((meeting) => {
                                const isActive = currentMeeting?.id === meeting.id;

                                return (
                                    <button
                                        key={`meeting-${meeting.id}`}
                                        onClick={() => navigateToMeeting(meeting)}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-3 ${
                                            isActive
                                                ? 'bg-purple-50 border-l-4 border-purple-500'
                                                : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-snug line-clamp-2 text-gray-800">
                                                {meeting.title}
                                            </p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mt-1 inline-block">
                                                Meeting
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Course Level Meetings */}
                {courseLevelMeetings?.length > 0 && (
                    <div className="border-b border-gray-100">
                        <div className="sticky top-0 z-10 px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-indigo-600" />
                                <h3 className="font-semibold text-indigo-800 text-sm">Zoom Meetings</h3>
                            </div>
                        </div>
                        <div className="py-1">
                            {courseLevelMeetings.map((meeting) => {
                                const isActive = currentMeeting?.id === meeting.id;

                                return (
                                    <button
                                        key={`course-meeting-${meeting.id}`}
                                        onClick={() => navigateToMeeting(meeting)}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all ${
                                            isActive
                                                ? 'bg-indigo-50 border-l-4 border-indigo-500'
                                                : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-snug line-clamp-2 text-gray-800">
                                                {meeting.title}
                                            </p>
                                            <p className="text-xs text-indigo-600 mt-1">
                                                {new Date(meeting.scheduled_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Upload Foto Zoom - Show if course requires it */}
                {course.require_zoom_screenshot && (
                    <div className="border-b border-gray-100">
                        <div className="sticky top-0 z-10 px-4 py-3 bg-orange-50 border-b border-orange-100">
                            <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-orange-600" />
                                <h3 className="font-semibold text-orange-800 text-sm">Bukti Kehadiran</h3>
                            </div>
                        </div>
                        <div className="py-1">
                            {(() => {
                                const locked = isZoomScreenshotLocked();
                                const isDone = !!(zoomScreenshot || enrollment?.zoom_screenshot_url);
                                const isActive = showZoomScreenshot;

                                return (
                                    <button
                                        onClick={() => navigateToZoomScreenshot()}
                                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-3 ${
                                            locked
                                                ? 'border-l-4 border-transparent opacity-50 cursor-not-allowed'
                                                : isActive
                                                    ? 'bg-orange-50 border-l-4 border-orange-500'
                                                    : 'border-l-4 border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            locked
                                                ? 'bg-gray-200 text-gray-400'
                                                : isDone
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {locked ? <Lock className="w-4 h-4" /> : isDone ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-snug line-clamp-2 ${
                                                locked ? 'text-gray-400' : isActive ? 'text-orange-700' : 'text-gray-800'
                                            }`}>
                                                Upload Foto Screenshot Zoom
                                            </p>
                                            {locked ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 mt-1 inline-block">
                                                    Terkunci
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                                        Wajib
                                                    </span>
                                                    {isDone && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                            Selesai
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Video Player Component
    const VideoPlayer = () => {
        if (!currentLesson || currentLesson.type !== 'video') return null;

        // Google Drive
        if (currentLesson.video_provider === 'drive' && currentLesson.video_url) {
            return <GoogleDriveVideoPlayer driveUrl={currentLesson.video_url} title={currentLesson.title} />;
        }

        // YouTube
        if (isYouTube()) {
            return (
                <div className="relative w-full h-full bg-black">
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={getYouTubeEmbed()}
                        title={currentLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        const videoSrc = getVideoSrc();

        // No video available
        if (!videoSrc) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center px-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Video Belum Tersedia</h3>
                        <p className="text-gray-400 max-w-sm">Video untuk materi ini belum diupload oleh instruktur.</p>
                    </div>
                </div>
            );
        }

        // Unsupported format
        if (!isVideoFormatSupported()) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center px-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Download className="w-10 h-10 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Format Video Tidak Didukung Browser</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                            Format video ini ({currentLesson.video_mime_type || 'MKV/AVI'}) tidak dapat diputar langsung di browser.
                            Silakan download dan putar dengan video player di perangkat Anda.
                        </p>
                        <a
                            href={videoSrc}
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
                        >
                            <Download className="w-5 h-5" />
                            Download Video
                        </a>
                    </div>
                </div>
            );
        }

        // HTML5 Video Player
        return (
            <div className="relative w-full h-full bg-black">
                {isVideoLoading && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Memuat video...</p>
                        </div>
                    </div>
                )}
                {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center px-6">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Video</h3>
                            <p className="text-gray-400 mb-6">{videoError}</p>
                            <button
                                onClick={() => {
                                    setVideoError(null);
                                    setIsVideoLoading(true);
                                    videoRef.current?.load();
                                }}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                )}
                <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    playsInline
                    onContextMenu={(e) => e.preventDefault()}
                    onLoadedData={() => setIsVideoLoading(false)}
                    onError={() => { setIsVideoLoading(false); setVideoError('Video gagal dimuat. Periksa koneksi internet Anda.'); }}
                >
                    <source src={videoSrc} type={currentLesson.video_mime_type || 'video/mp4'} />
                    Browser Anda tidak mendukung pemutaran video.
                </video>
            </div>
        );
    };

    return (
        <AppLayout title={`Learning: ${course.title}`}>
            <Head title={currentLesson?.title || currentQuiz?.title || currentAssignment?.title || course.title} />

            {isPreviewMode && adminReturnUrl && (
                <PreviewBanner returnUrl={adminReturnUrl} previewPublicUrl={previewPublicUrl} />
            )}

            {/* Course Completed Banner */}
            {!isPreviewMode && courseProgress?.percentage === 100 && (
                <div className="bg-green-500 text-white py-3 px-4 shadow-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">Selamat! Anda telah menyelesaikan pelatihan ini</p>
                                <p className="text-sm text-green-50">Sertifikat Anda telah tersedia dan siap diunduh</p>
                            </div>
                        </div>
                        <Link
                            href={route('student.certificates')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
                        >
                            <Award className="w-5 h-5" />
                            Lihat Sertifikat
                        </Link>
                    </div>
                </div>
            )}

            <div className={`flex min-h-screen bg-gray-100 ${isPreviewMode ? 'pt-12' : ''}`}>
                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:hidden ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <SidebarContent />
                </div>

                {/* Desktop Sidebar */}
                <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
                    sidebarOpen ? 'w-80' : 'w-0'
                }`}>
                    <div className="sticky top-0 h-screen overflow-hidden">
                        <div className="w-80 h-full">
                            <SidebarContent />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Navigation Bar */}
                    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Menu Button */}
                                <button
                                    onClick={() => {
                                        if (window.innerWidth >= 1024) {
                                            setSidebarOpen(!sidebarOpen);
                                        } else {
                                            setMobileSidebarOpen(true);
                                        }
                                    }}
                                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>

                                {/* Title */}
                                <div className="min-w-0">
                                    <h1 className="font-bold text-gray-900 truncate text-lg">
                                        {currentLesson?.title || currentQuiz?.title || currentAssignment?.title || currentMeeting?.title || 'Pilih Materi'}
                                    </h1>
                                    {currentLesson && (
                                        <p className="text-sm text-gray-500">
                                            {currentLesson.type === 'video' ? 'Materi Video' : currentLesson.type === 'document' ? 'Dokumen' : 'Materi Bacaan'}
                                        </p>
                                    )}
                                    {currentQuiz && <p className="text-sm text-orange-600">Kuis</p>}
                                    {currentAssignment && <p className="text-sm text-emerald-600">Tugas</p>}
                                    {currentMeeting && <p className="text-sm text-purple-600">Zoom Meeting</p>}
                                </div>
                            </div>

                            {/* Action Button */}
                            {!isPreviewMode && currentLesson && !isLocked('lesson', currentLesson.id) && (
                                <div className="flex-shrink-0">
                                    {lessonCompleted ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-medium hidden sm:inline">Selesai</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={markLessonComplete}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="hidden sm:inline">Tandai Selesai</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {!isPreviewMode && currentLesson && isLocked('lesson', currentLesson.id) && (
                                <div className="flex-shrink-0">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl">
                                        <Lock className="w-4 h-4" />
                                        <span className="font-medium hidden sm:inline">Terkunci</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <ContentProtection
                        userName={auth?.user?.name || 'Student'}
                        userEmail={auth?.user?.email || ''}
                    >
                        {/* Video Player Area - Only show when lesson is video AND no quiz/assignment/meeting is active */}
                        {currentLesson?.type === 'video' && !currentQuiz && !currentAssignment && !currentMeeting && !showZoomScreenshot && (
                            <div className="bg-black">
                                <div className="max-w-6xl mx-auto">
                                    <div className="aspect-video">
                                        <VideoPlayer />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Meeting Header */}
                        {currentMeeting && !currentQuiz && !currentAssignment && !showZoomScreenshot && (
                            <div className="bg-purple-600 text-white">
                                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Video className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{currentMeeting.title}</h2>
                                    <p className="text-purple-200 text-lg mb-8">
                                        {new Date(currentMeeting.scheduled_at).toLocaleString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {currentMeeting.zoom_link && (
                                        <button
                                            onClick={() => window.open(currentMeeting.zoom_link, '_blank')}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Join Zoom Meeting
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quiz Header */}
                        {currentQuiz && !showZoomScreenshot && (
                            <div className="bg-orange-500 text-white">
                                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <HelpCircle className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{currentQuiz.title}</h2>
                                    {currentQuiz.time_limit && (
                                        <p className="text-orange-100 flex items-center justify-center gap-2 text-lg">
                                            <Clock className="w-5 h-5" />
                                            Waktu: {currentQuiz.time_limit} menit
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assignment Header */}
                        {currentAssignment && !showZoomScreenshot && (
                            <div className="bg-emerald-500 text-white">
                                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Edit className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{currentAssignment.title}</h2>
                                    {currentAssignment.due_date && (
                                        <p className="text-emerald-100 flex items-center justify-center gap-2 text-lg">
                                            <Calendar className="w-5 h-5" />
                                            Deadline: {new Date(currentAssignment.due_date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reading/Document Header - Only show when lesson is not video AND no quiz/assignment/meeting is active */}
                        {currentLesson && currentLesson.type !== 'video' && !currentQuiz && !currentAssignment && !currentMeeting && !showZoomScreenshot && (
                            <div className={`${
                                currentLesson.type === 'document'
                                    ? 'bg-blue-600'
                                    : 'bg-gray-600'
                            } text-white`}>
                                <div className="max-w-4xl mx-auto px-6 py-10 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        {currentLesson.type === 'document' ? (
                                            <FileText className="w-8 h-8" />
                                        ) : (
                                            <BookOpen className="w-8 h-8" />
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold">
                                        {currentLesson.type === 'document' ? 'Dokumen Pembelajaran' : 'Materi Bacaan'}
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Content Body */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                            {/* Meeting Details - Only show when meeting is active AND no quiz/assignment */}
                            {currentMeeting && !currentQuiz && !currentAssignment && !showZoomScreenshot && (
                                <div className="space-y-6">
                                    {/* Meeting Info Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <Video className="w-5 h-5 text-purple-500" />
                                                Informasi Meeting
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {currentMeeting.description && (
                                                <p className="text-gray-700 leading-relaxed">{currentMeeting.description}</p>
                                            )}

                                            {/* Meeting Access Info */}
                                            {(currentMeeting.meeting_id || currentMeeting.passcode || currentMeeting.zoom_link) && (
                                                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                                    <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                                        <Lock className="w-4 h-4" />
                                                        Informasi Akses Zoom
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {currentMeeting.meeting_id && (
                                                            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                                                                <span className="text-gray-600">Meeting ID</span>
                                                                <span className="font-mono font-bold text-purple-700">{currentMeeting.meeting_id}</span>
                                                            </div>
                                                        )}
                                                        {currentMeeting.passcode && (
                                                            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                                                                <span className="text-gray-600">Passcode</span>
                                                                <span className="font-mono font-bold text-purple-700">{currentMeeting.passcode}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meeting Time */}
                                            {currentMeeting.scheduled_at && (
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                                    <Calendar className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Jadwal Meeting</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {new Date(currentMeeting.scheduled_at).toLocaleString('id-ID', {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Join Meeting Button */}
                                    {currentMeeting.zoom_link && !isPreviewMode && (
                                        <button
                                            onClick={() => window.open(currentMeeting.zoom_link, '_blank')}
                                            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Join Zoom Meeting
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Quiz Content */}
                            {currentQuiz && !showZoomScreenshot && (
                                <div className="space-y-6">
                                    {/* Quiz Title Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-orange-500 px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                    <HelpCircle className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-orange-100 text-sm font-medium">Kuis</p>
                                                    <h2 className="text-xl font-bold text-white">{currentQuiz.title}</h2>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quiz Stats */}
                                        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                                            <div className="p-4 text-center">
                                                <div className="w-10 h-10 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <HelpCircle className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{currentQuiz.questions_count || '-'}</p>
                                                <p className="text-xs text-gray-500">Jumlah Soal</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{currentQuiz.time_limit || '-'}</p>
                                                <p className="text-xs text-gray-500">Menit</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{currentQuiz.passing_score || '-'}%</p>
                                                <p className="text-xs text-gray-500">Nilai Lulus</p>
                                            </div>
                                        </div>

                                        {/* Quiz Description */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-semibold text-gray-900">Deskripsi Kuis</h3>
                                            </div>
                                            {currentQuiz.description ? (
                                                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-xl p-4" dangerouslySetInnerHTML={{ __html: currentQuiz.description }} />
                                            ) : (
                                                <p className="text-gray-500 italic bg-gray-50 rounded-xl p-4">Tidak ada deskripsi untuk kuis ini.</p>
                                            )}
                                        </div>

                                        {/* Quiz Instructions */}
                                        <div className="px-6 pb-6">
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-amber-900 mb-1">Petunjuk Pengerjaan</h4>
                                                        <ul className="text-sm text-amber-800 space-y-1">
                                                            <li>• Pastikan koneksi internet Anda stabil</li>
                                                            <li>• Jawab semua pertanyaan sebelum waktu habis</li>
                                                            <li>• Klik "Submit" untuk menyelesaikan kuis</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quiz Action Button */}
                                    {!isPreviewMode && (
                                        isLocked('quiz', currentQuiz.id) ? (
                                            <div className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-500 flex items-center justify-center gap-2">
                                                <Lock className="w-5 h-5" />
                                                Selesaikan materi sebelumnya untuk membuka kuis ini
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => router.visit(route('quizzes.show', currentQuiz.id))}
                                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${
                                                    quizCompletions.includes(currentQuiz.id)
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                }`}
                                            >
                                                {quizCompletions.includes(currentQuiz.id) ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5" />
                                                        Lihat Hasil Kuis
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-5 h-5" />
                                                        Mulai Kuis Sekarang
                                                    </>
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Assignment Content */}
                            {currentAssignment && !showZoomScreenshot && (
                                <div className="space-y-6">
                                    {/* Assignment Title Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-emerald-500 px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                    <Edit className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-emerald-100 text-sm font-medium">Tugas</p>
                                                    <h2 className="text-xl font-bold text-white">{currentAssignment.title}</h2>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assignment Stats */}
                                        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                                            <div className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Batas Waktu</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {currentAssignment.due_date
                                                                ? new Date(currentAssignment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'Tidak ada batas waktu'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Star className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Nilai Maksimal</p>
                                                        <p className="font-semibold text-gray-900">{currentAssignment.max_score || 100} poin</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assignment Description */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-semibold text-gray-900">Deskripsi Tugas</h3>
                                            </div>
                                            {currentAssignment.description ? (
                                                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-xl p-4" dangerouslySetInnerHTML={{ __html: currentAssignment.description }} />
                                            ) : (
                                                <p className="text-gray-500 italic bg-gray-50 rounded-xl p-4">Tidak ada deskripsi untuk tugas ini.</p>
                                            )}
                                        </div>

                                        {/* Assignment Instructions */}
                                        {currentAssignment.instructions && (
                                            <div className="px-6 pb-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                                    <h3 className="font-semibold text-gray-900">Instruksi Pengerjaan</h3>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                    <div className="prose prose-sm max-w-none text-blue-800" dangerouslySetInnerHTML={{ __html: currentAssignment.instructions }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Assignment Tips */}
                                        <div className="px-6 pb-6">
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-emerald-900 mb-1">Tips Pengumpulan</h4>
                                                        <ul className="text-sm text-emerald-800 space-y-1">
                                                            <li>• Baca instruksi dengan teliti sebelum mengerjakan</li>
                                                            <li>• Pastikan file yang diupload sesuai format yang diminta</li>
                                                            <li>• Kumpulkan sebelum batas waktu berakhir</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment Action Button */}
                                    {!isPreviewMode && (
                                        isLocked('assignment', currentAssignment.id) ? (
                                            <div className="w-full py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-500 flex items-center justify-center gap-2">
                                                <Lock className="w-5 h-5" />
                                                Selesaikan materi sebelumnya untuk membuka tugas ini
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => router.visit(
                                                    assignmentSubmissions.includes(currentAssignment.id)
                                                        ? route('assignments.submission', currentAssignment.id)
                                                        : route('assignments.show', currentAssignment.id)
                                                )}
                                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg ${
                                                    assignmentSubmissions.includes(currentAssignment.id)
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                }`}
                                            >
                                                {assignmentSubmissions.includes(currentAssignment.id) ? 'Lihat Pengumpulan Saya' : 'Kerjakan Tugas Sekarang'}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Lesson Content - Only show when no quiz/assignment/meeting is active */}
                            {currentLesson && !currentQuiz && !currentAssignment && !currentMeeting && !showZoomScreenshot && (
                                <div className="space-y-6">
                                    {/* Lesson Title Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className={`px-6 py-5 ${
                                            currentLesson.type === 'video'
                                                ? 'bg-purple-500'
                                                : currentLesson.type === 'document'
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-600'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                    {currentLesson.type === 'video' ? (
                                                        <PlayCircle className="w-6 h-6 text-white" />
                                                    ) : currentLesson.type === 'document' ? (
                                                        <FileText className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">
                                                        {currentLesson.type === 'video' ? 'Video Pembelajaran' : currentLesson.type === 'document' ? 'Dokumen' : 'Materi Bacaan'}
                                                    </p>
                                                    <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lesson Info Stats */}
                                        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                                            <div className="p-4 text-center">
                                                <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                                    currentLesson.type === 'video' ? 'bg-purple-100' : currentLesson.type === 'document' ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                    {currentLesson.type === 'video' ? (
                                                        <PlayCircle className="w-5 h-5 text-purple-600" />
                                                    ) : currentLesson.type === 'document' ? (
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <BookOpen className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {currentLesson.type === 'video' ? 'Video' : currentLesson.type === 'document' ? 'Dokumen' : 'Bacaan'}
                                                </p>
                                                <p className="text-xs text-gray-500">Tipe Materi</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{currentLesson.duration || '-'} menit</p>
                                                <p className="text-xs text-gray-500">Durasi</p>
                                            </div>
                                            <div className="p-4 text-center">
                                                <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                                    lessonCompleted ? 'bg-green-100' : 'bg-gray-100'
                                                }`}>
                                                    <CheckCircle className={`w-5 h-5 ${lessonCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{lessonCompleted ? 'Selesai' : 'Belum'}</p>
                                                <p className="text-xs text-gray-500">Status</p>
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-semibold text-gray-900">Deskripsi Materi</h3>
                                            </div>
                                            {currentLesson.description ? (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <p className="text-gray-700 leading-relaxed">{currentLesson.description}</p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic bg-gray-50 rounded-xl p-4">Tidak ada deskripsi untuk materi ini.</p>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        {(currentLesson.content || currentLesson.content_images?.length > 0 || currentLesson.content_blocks?.length > 0) && (
                                            <div className="p-6">
                                                <LessonContentRenderer lesson={currentLesson} />
                                            </div>
                                        )}

                                        {/* Tips Section */}
                                        <div className="px-6 pb-6">
                                            <div className={`rounded-xl p-4 border ${
                                                currentLesson.type === 'video'
                                                    ? 'bg-purple-50 border-purple-200'
                                                    : currentLesson.type === 'document'
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'bg-gray-50 border-gray-200'
                                            }`}>
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                                        currentLesson.type === 'video' ? 'text-purple-600' : currentLesson.type === 'document' ? 'text-blue-600' : 'text-gray-600'
                                                    }`} />
                                                    <div>
                                                        <h4 className={`font-semibold mb-1 ${
                                                            currentLesson.type === 'video' ? 'text-purple-900' : currentLesson.type === 'document' ? 'text-blue-900' : 'text-gray-900'
                                                        }`}>
                                                            {currentLesson.type === 'video' ? 'Tips Menonton Video' : currentLesson.type === 'document' ? 'Tips Membaca Dokumen' : 'Tips Belajar'}
                                                        </h4>
                                                        <ul className={`text-sm space-y-1 ${
                                                            currentLesson.type === 'video' ? 'text-purple-800' : currentLesson.type === 'document' ? 'text-blue-800' : 'text-gray-700'
                                                        }`}>
                                                            {currentLesson.type === 'video' ? (
                                                                <>
                                                                    <li>• Tonton video dengan konsentrasi penuh</li>
                                                                    <li>• Pause dan catat poin-poin penting</li>
                                                                    <li>• Ulangi bagian yang kurang dipahami</li>
                                                                </>
                                                            ) : currentLesson.type === 'document' ? (
                                                                <>
                                                                    <li>• Download dokumen untuk referensi offline</li>
                                                                    <li>• Baca dengan teliti setiap bagian</li>
                                                                    <li>• Tandai halaman penting untuk dipelajari ulang</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>• Baca materi dengan perlahan dan teliti</li>
                                                                    <li>• Catat poin-poin penting</li>
                                                                    <li>• Hubungkan dengan materi sebelumnya</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PDF Viewer for Document Type */}
                                    {currentLesson.type === 'document' && currentLesson.document_file && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                        <h3 className="font-semibold text-gray-900">
                                                            {currentLesson.document_filename || 'Dokumen Pembelajaran'}
                                                        </h3>
                                                    </div>
                                                    {currentLesson.document_size && (
                                                        <p className="text-sm text-blue-600">
                                                            {(currentLesson.document_size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* PDF Viewer Component */}
                                            <div className="bg-gray-50">
                                                <PDFViewer
                                                    pdfUrl={`/storage/${currentLesson.document_file}`}
                                                    title={currentLesson.title}
                                                    className="min-h-[600px]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Empty State */}
                            {!currentLesson && !currentQuiz && !currentAssignment && !currentMeeting && !showZoomScreenshot && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Pilih Materi Pembelajaran</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Pilih materi dari sidebar di sebelah kiri untuk memulai pembelajaran Anda.
                                    </p>
                                </div>
                            )}

                            {/* Zoom Screenshot Upload Content - Shows when selected from sidebar */}
                            {showZoomScreenshot && course.require_zoom_screenshot && (
                                <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
                                    <div className="bg-orange-500 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-orange-100 text-sm font-medium">Bukti Kehadiran</p>
                                                <h2 className="text-xl font-bold text-white">Upload Foto Screenshot Zoom</h2>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Zoom Link Info */}
                                        {course.zoom_link && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-blue-900 mb-1">Link Zoom Meeting</h4>
                                                        <a
                                                            href={course.zoom_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 underline break-all"
                                                        >
                                                            {course.zoom_link}
                                                        </a>
                                                        {course.zoom_notes && (
                                                            <p className="text-sm text-blue-700 mt-2">
                                                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                                                {course.zoom_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {!isPreviewMode && (
                                                        <button
                                                            onClick={() => window.open(course.zoom_link, '_blank')}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors flex-shrink-0"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Join
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Virtual Background Download Section */}
                                        {course.virtual_background_path && (
                                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Image className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-purple-900 mb-1">Virtual Background Zoom</h4>
                                                        <p className="text-sm text-purple-700 mb-3">
                                                            Download dan gunakan virtual background ini saat mengikuti Zoom meeting.
                                                        </p>
                                                        <div className="flex items-start gap-4">
                                                            <img
                                                                src={`/storage/${course.virtual_background_path}`}
                                                                alt="Virtual Background"
                                                                className="w-32 h-20 object-cover rounded-lg border border-purple-200 shadow-sm"
                                                            />
                                                            <a
                                                                href={`/storage/${course.virtual_background_path}`}
                                                                download
                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Instructions */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-orange-900 mb-1">Petunjuk Upload</h4>
                                                    <ul className="text-sm text-orange-800 space-y-1">
                                                        <li>• Screenshot harus menunjukkan Anda sedang mengikuti Zoom meeting</li>
                                                        <li>• Pastikan nama Anda terlihat di screenshot</li>
                                                        <li>• Format file: JPG, JPEG, atau PNG (maks. 5MB)</li>
                                                        <li>• Upload foto akan dihitung sebagai penyelesaian pelatihan</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Status */}
                                        <div className={`rounded-xl p-4 mb-6 ${
                                            zoomScreenshot || enrollment?.zoom_screenshot_url
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {zoomScreenshot || enrollment?.zoom_screenshot_url ? (
                                                    <>
                                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-green-900">Foto Sudah Diupload</p>
                                                            <p className="text-sm text-green-700">
                                                                {enrollment?.zoom_screenshot_uploaded_at
                                                                    ? `Diupload pada ${new Date(enrollment.zoom_screenshot_uploaded_at).toLocaleString('id-ID')}`
                                                                    : 'Screenshot zoom Anda berhasil tersimpan'}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <Image className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-700">Belum Ada Foto</p>
                                                            <p className="text-sm text-gray-500">Upload foto screenshot zoom Anda untuk menyelesaikan pelatihan</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Current Screenshot Preview */}
                                        {(zoomScreenshot || enrollment?.zoom_screenshot_url) && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Anda Saat Ini:</label>
                                                <div className="relative inline-block">
                                                    <img
                                                        src={zoomScreenshot || enrollment?.zoom_screenshot_url}
                                                        alt="Zoom Screenshot"
                                                        className="max-w-full h-auto max-h-64 rounded-xl border border-gray-200 shadow-sm"
                                                    />
                                                    {!isPreviewMode && (
                                                        <button
                                                            onClick={deleteZoomScreenshot}
                                                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                                                            title="Hapus foto"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Form */}
                                        {!isPreviewMode && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        {zoomScreenshot || enrollment?.zoom_screenshot_url ? 'Ganti Foto:' : 'Pilih Foto:'}
                                                    </label>
                                                    <input
                                                        ref={zoomScreenshotInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png"
                                                        onChange={handleZoomScreenshotChange}
                                                        className="block w-full text-sm text-gray-500
                                                            file:mr-4 file:py-2.5 file:px-4
                                                            file:rounded-lg file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-orange-50 file:text-orange-700
                                                            hover:file:bg-orange-100
                                                            cursor-pointer border border-gray-300 rounded-xl"
                                                    />
                                                </div>

                                                {/* New Image Preview */}
                                                {zoomScreenshotPreview && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Foto Baru:</label>
                                                        <img
                                                            src={zoomScreenshotPreview}
                                                            alt="Preview"
                                                            className="max-w-full h-auto max-h-48 rounded-xl border border-orange-200 shadow-sm"
                                                        />
                                                    </div>
                                                )}

                                                {/* Upload Button */}
                                                {zoomScreenshotPreview && (
                                                    <button
                                                        onClick={uploadZoomScreenshot}
                                                        disabled={zoomScreenshotUploading}
                                                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                                                            zoomScreenshotUploading
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] shadow-lg'
                                                        }`}
                                                    >
                                                        {zoomScreenshotUploading ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Mengupload...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-5 h-5" />
                                                                Upload Foto Zoom
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {isPreviewMode && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                                <p className="text-yellow-800 font-medium">
                                                    Upload foto tidak tersedia dalam mode preview
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Navigation */}
                        {(currentLesson || currentQuiz || currentAssignment || showZoomScreenshot) && (
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
                                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                                    {previousLesson ? (
                                        <button
                                            onClick={() => navigateToLesson(previousLesson)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            <span className="font-medium hidden sm:inline">Sebelumnya</span>
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {nextLesson ? (
                                        isLocked('lesson', nextLesson.id) ? (
                                            <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-500 rounded-xl font-semibold">
                                                <Lock className="w-4 h-4" />
                                                <span>Terkunci</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => navigateToLesson(nextLesson)}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                                            >
                                                <span>Selanjutnya</span>
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        )
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            </div>
                        )}
                    </ContentProtection>
                </div>
            </div>

            {/* Course Completion Modal */}
            <Modal show={showCompletionModal} onClose={() => setShowCompletionModal(false)} maxWidth="md">
                <div className="p-6 text-center">
                    {/* Celebration Icon */}
                    <div className="mx-auto w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Award className="w-12 h-12 text-white" />
                    </div>

                    {/* Congratulations Message */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Selamat! 🎉
                    </h2>
                    <p className="text-lg text-gray-700 mb-4">
                        Anda telah menyelesaikan pelatihan
                    </p>
                    <p className="text-xl font-semibold text-green-600 mb-6">
                        {course.title}
                    </p>

                    {/* Certificate Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700 mb-2">
                            Sertifikat Anda telah tersedia dan siap diunduh!
                        </p>
                        <p className="text-xs text-gray-500">
                            Klik tombol di bawah untuk melihat dan mengunduh sertifikat Anda
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowCompletionModal(false)}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Nanti Saja
                        </button>
                        <Link
                            href={route('student.certificates')}
                            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                            <Award className="w-5 h-5" />
                            Lihat Sertifikat
                        </Link>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
