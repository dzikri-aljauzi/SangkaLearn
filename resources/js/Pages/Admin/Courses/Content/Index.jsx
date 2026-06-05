import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AppLayout from '../../../../Layouts/AppLayout';
import QuestionEditor from '../../../../Components/QuestionEditor';
import MeetingFormModal from '../../../../Components/MeetingFormModal';
import MeetingItemCard from '../../../../Components/MeetingItemCard';
import ContentBuilder from '../../../../Components/ContentBuilder';
import ChunkedUploader from '../../../../Components/ChunkedUploader';
import {
    ArrowLeft,
    Plus,
    BookOpen,
    Video,
    VideoIcon,
    Image,
    FileText,
    CheckSquare,
    HelpCircle,
    Edit,
    Trash2,
    Eye,
    Clock,
    Users,
    Star,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Save,
    X,
    Upload,
    Link as LinkIcon,
    Calendar,
    AlertCircle,
    Play,
    FileSpreadsheet,
    Download
} from 'lucide-react';

export default function CourseContentIndex({ course, courseLevelMeetings = [] }) {
    const [expandedSections, setExpandedSections] = useState({});
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(null);
    const [showAddAssignment, setShowAddAssignment] = useState(null);
    const [showAddQuiz, setShowAddQuiz] = useState(null);
    const [showAddMeeting, setShowAddMeeting] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);

    // Quiz import state
    const [quizImportMode, setQuizImportMode] = useState('manual'); // 'manual' or 'import'
    const [importFile, setImportFile] = useState(null);
    const [importingQuiz, setImportingQuiz] = useState(false);

    // Video upload method state ('drive' for Google Drive URL, 'upload' for direct upload)
    const [videoUploadMethod, setVideoUploadMethod] = useState('drive');
    const [editVideoUploadMethod, setEditVideoUploadMethod] = useState('drive');

    // Chunked upload state for new lesson
    const [videoUploadState, setVideoUploadState] = useState({
        state: 'idle',
        hasFile: false,
        isCompleted: false,
        isUploading: false,
        progress: 0
    });

    // Chunked upload state for edit lesson
    const [editVideoUploadState, setEditVideoUploadState] = useState({
        state: 'idle',
        hasFile: false,
        isCompleted: false,
        isUploading: false,
        progress: 0
    });

    // Detect video upload method when editing lesson opens
    useEffect(() => {
        if (editingLesson) {
            if (editingLesson.video_file && editingLesson.video_provider === 'file') {
                setEditVideoUploadMethod('upload');
            } else if (editingLesson.video_url) {
                setEditVideoUploadMethod('drive');
            } else {
                setEditVideoUploadMethod('drive'); // Default
            }
        }
    }, [editingLesson?.id]);

    // Form for adding sections
    const { data: sectionData, setData: setSectionData, post: postSection, processing: processingSection, errors: sectionErrors, reset: resetSection } = useForm({
        title: '',
        description: ''
    });

    // Form for adding lessons
    const { data: lessonData, setData: setLessonData, post: postLesson, processing: processingLesson, errors: lessonErrors, reset: resetLesson } = useForm({
        title: '',
        description: '',
        type: 'reading',
        content: '',
        duration_minutes: '',
        content_images: [],
        image_positions: [],
        content_blocks: [],
        document_file: null,
        video_url: '',
        video_provider: 'drive',
        video_duration: '',
        video_file: null,
        // Chunked upload fields
        video_file_path: '',
        video_size: 0,
        video_mime_type: '',
        video_original_name: '',
        attachment: null,
        is_preview: false
    });

    // Form for adding assignments
    const { data: assignmentData, setData: setAssignmentData, post: postAssignment, processing: processingAssignment, errors: assignmentErrors, reset: resetAssignment } = useForm({
        title: '',
        description: '',
        instructions: '',
        max_points: 100,
        due_date: '',
        allow_late_submission: false,
        late_penalty_percent: 0,
        submission_types: ['file']
    });

    // Form for adding quizzes
    const { data: quizData, setData: setQuizData, post: postQuiz, processing: processingQuiz, errors: quizErrors, reset: resetQuiz } = useForm({
        title: '',
        description: '',
        instructions: '',
        time_limit: 30,
        attempts_allowed: 1,
        passing_score: 70,
        randomize_questions: false,
        show_correct_answers: true,
        show_results_immediately: true,
        allow_retake_until_pass: false,
        max_retake_attempts: null,
        available_from: '',
        available_until: '',
        questions: [
            {
                question: '',
                type: 'multiple_choice',
                points: 1,
                options: ['', '', '', ''],
                correct_answers: [],
                explanation: ''
            }
        ]
    });

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleAddSection = (e) => {
        e.preventDefault();
        postSection(route('admin.courses.sections.store', course.slug), {
            onSuccess: () => {
                toast.success('Section added successfully!');
                resetSection();
                setShowAddSection(false);
            },
            onError: () => {
                toast.error('Failed to add section');
            }
        });
    };

    const handleAddLesson = (sectionId) => {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('title', lessonData.title);
        formData.append('description', lessonData.description || '');
        formData.append('type', lessonData.type);
        formData.append('content', lessonData.content || '');
        formData.append('duration_minutes', lessonData.duration_minutes || '');

        // Handle content_blocks for reading type (new system)
        if (lessonData.type === 'reading' && lessonData.content_blocks && lessonData.content_blocks.length > 0) {
            lessonData.content_blocks.forEach((block, index) => {
                formData.append(`content_blocks[${index}][id]`, block.id);
                formData.append(`content_blocks[${index}][type]`, block.type);
                formData.append(`content_blocks[${index}][order]`, block.order || index);

                if (block.type === 'text') {
                    formData.append(`content_blocks[${index}][content]`, block.content || '');
                } else if (block.type === 'image') {
                    if (block.file instanceof File) {
                        // New image upload
                        formData.append(`content_blocks[${index}][file]`, block.file);
                    } else if (block.path) {
                        // Existing image
                        formData.append(`content_blocks[${index}][path]`, block.path);
                        formData.append(`content_blocks[${index}][url]`, block.url || '');
                    }
                    formData.append(`content_blocks[${index}][caption]`, block.caption || '');
                }
            });
        }

        // Handle content images for reading type (backward compatibility)
        if (lessonData.type === 'reading' && lessonData.content_images && lessonData.content_images.length > 0) {
            lessonData.content_images.forEach((file, index) => {
                formData.append(`content_images[${index}]`, file);
            });
            lessonData.image_positions.forEach((position, index) => {
                formData.append(`image_positions[${index}]`, position);
            });
        }

        // Handle document file for document type
        if (lessonData.type === 'document' && lessonData.document_file) {
            formData.append('document_file', lessonData.document_file);
        }

        // Handle video - Google Drive or Direct Upload
        if (lessonData.type === 'video') {
            if (videoUploadMethod === 'upload' && lessonData.video_file_path) {
                // Chunked upload - video already uploaded to server
                formData.append('video_file_path', lessonData.video_file_path);
                formData.append('video_size', lessonData.video_size || 0);
                formData.append('video_mime_type', lessonData.video_mime_type || '');
                formData.append('video_provider', 'file');
                formData.append('video_duration', lessonData.video_duration || '');
            } else if (videoUploadMethod === 'drive' && lessonData.video_url) {
                // Google Drive URL
                formData.append('video_url', lessonData.video_url);
                formData.append('video_provider', 'drive');
                formData.append('video_duration', lessonData.video_duration || '');
            }
        }

        formData.append('is_preview', lessonData.is_preview ? '1' : '0');

        // Legacy attachment support
        if (lessonData.attachment) {
            formData.append('attachment', lessonData.attachment);
        }
        
        // Use router.post with FormData
        router.post(route('admin.courses.lessons.store', [course.slug, sectionId]), formData, {
            onSuccess: () => {
                toast.success('Lesson added successfully!');
                resetLesson();
                setShowAddLesson(null);
                // Reset video upload state
                setVideoUploadMethod('drive');
                setVideoUploadState({ state: 'idle', hasFile: false, isCompleted: false, isUploading: false, progress: 0 });
            },
            onError: (errors) => {
                toast.error('Failed to add lesson');
                console.error('Lesson creation errors:', errors);
            }
        });
    };

    const handleAddAssignment = (sectionId) => {
        postAssignment(route('admin.courses.assignments.store', [course.slug, sectionId]), {
            onSuccess: () => {
                toast.success('Assignment added successfully!');
                resetAssignment();
                setShowAddAssignment(null);
            },
            onError: () => {
                toast.error('Failed to add assignment');
            }
        });
    };

    const handleAddQuiz = (sectionId) => {
        // Clean up quiz data before sending
        const cleanData = {
            ...quizData,
            questions: quizData.questions.map(q => ({
                ...q,
                options: q.type === 'multiple_choice' ? q.options.filter(opt => opt.trim() !== '') : null,
                correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers].filter(Boolean)
            }))
        };

        postQuiz(route('admin.courses.quizzes.store', [course.slug, sectionId]), cleanData, {
            onSuccess: () => {
                toast.success('Quiz added successfully!');
                resetQuiz();
                setShowAddQuiz(null);
            },
            onError: () => {
                toast.error('Failed to add quiz');
            }
        });
    };

    const handleImportQuiz = (sectionId) => {
        if (!importFile) {
            toast.error('Please select a file to import');
            return;
        }

        if (!quizData.title.trim()) {
            toast.error('Please enter a quiz title');
            return;
        }

        setImportingQuiz(true);

        const formData = new FormData();
        formData.append('import_file', importFile);
        formData.append('quiz_title', quizData.title);
        formData.append('quiz_description', quizData.description || '');
        formData.append('quiz_instructions', quizData.instructions || '');
        formData.append('time_limit', quizData.time_limit || '');
        formData.append('attempts_allowed', quizData.attempts_allowed);
        formData.append('passing_score', quizData.passing_score);
        formData.append('randomize_questions', quizData.randomize_questions ? '1' : '0');
        formData.append('show_correct_answers', quizData.show_correct_answers ? '1' : '0');
        formData.append('show_results_immediately', quizData.show_results_immediately ? '1' : '0');

        router.post(route('admin.courses.quizzes.import', [course.slug, sectionId]), formData, {
            onSuccess: () => {
                toast.success('Quiz imported successfully!');
                resetQuiz();
                setShowAddQuiz(null);
                setImportFile(null);
                setQuizImportMode('manual');
                setImportingQuiz(false);
            },
            onError: (errors) => {
                console.error('Import errors:', errors);
                if (errors.import_file) {
                    if (Array.isArray(errors.import_file)) {
                        errors.import_file.forEach(error => toast.error(error));
                    } else {
                        toast.error(errors.import_file);
                    }
                } else {
                    toast.error('Failed to import quiz');
                }
                setImportingQuiz(false);
            }
        });
    };

    const downloadTemplate = () => {
        window.location.href = route('admin.quiz.import.template');
    };

    // Quiz Question Management Functions
    const addQuizQuestion = () => {
        setQuizData('questions', [...quizData.questions, {
            question: '',
            type: 'multiple_choice',
            points: 1,
            options: ['', '', '', ''],
            correct_answers: [],
            explanation: ''
        }]);
    };

    const removeQuizQuestion = (index) => {
        if (quizData.questions.length > 1) {
            const newQuestions = quizData.questions.filter((_, i) => i !== index);
            setQuizData('questions', newQuestions);
        }
    };

    const updateQuizQuestion = (index, field, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[index][field] = value;
        
        // Reset options and answers when type changes
        if (field === 'type') {
            if (value === 'multiple_choice') {
                newQuestions[index].options = ['', '', '', ''];
                newQuestions[index].correct_answers = [];
            } else if (value === 'true_false') {
                newQuestions[index].options = null;
                newQuestions[index].correct_answers = [];
            } else {
                newQuestions[index].options = null;
                newQuestions[index].correct_answers = [''];
            }
        }
        
        setQuizData('questions', newQuestions);
    };

    // Edit Quiz Question Management Functions
    const addEditQuizQuestion = () => {
        setEditingQuiz({
            ...editingQuiz,
            questions: [...(editingQuiz.questions || []), {
                question: '',
                type: 'multiple_choice',
                points: 1,
                options: ['', '', '', ''],
                correct_answers: [],
                explanation: ''
            }]
        });
    };

    const removeEditQuizQuestion = (index) => {
        if (editingQuiz.questions && editingQuiz.questions.length > 1) {
            const newQuestions = editingQuiz.questions.filter((_, i) => i !== index);
            setEditingQuiz({...editingQuiz, questions: newQuestions});
        }
    };

    const updateEditQuizQuestion = (index, field, value) => {
        const newQuestions = [...(editingQuiz.questions || [])];
        newQuestions[index][field] = value;
        
        // Reset options and answers when type changes
        if (field === 'type') {
            if (value === 'multiple_choice') {
                newQuestions[index].options = ['', '', '', ''];
                newQuestions[index].correct_answers = [];
            } else if (value === 'true_false') {
                newQuestions[index].options = null;
                newQuestions[index].correct_answers = [];
            } else {
                newQuestions[index].options = null;
                newQuestions[index].correct_answers = [''];
            }
        }
        
        setEditingQuiz({...editingQuiz, questions: newQuestions});
    };

    const handleDeleteSection = (section) => {
        if (confirm('Are you sure you want to delete this section? This will also delete all lessons, assignments, and quizzes in this section.')) {
            router.delete(route('admin.courses.sections.destroy', [course.slug, section.id]), {
                onSuccess: () => {
                    toast.success('Section deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete section');
                }
            });
        }
    };

    const handleDeleteLesson = (lesson) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            router.delete(route('admin.courses.lessons.destroy', [course.slug, lesson.section_id, lesson.id]), {
                onSuccess: () => {
                    toast.success('Lesson deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete lesson');
                }
            });
        }
    };

    const handleDeleteAssignment = (assignment) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(route('admin.courses.assignments.destroy', [course.slug, assignment.section_id, assignment.id]), {
                onSuccess: () => {
                    toast.success('Assignment deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete assignment');
                }
            });
        }
    };

    const handleDeleteQuiz = (quiz) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            router.delete(route('admin.courses.quizzes.destroy', [course.slug, quiz.section_id, quiz.id]), {
                onSuccess: () => {
                    toast.success('Quiz deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete quiz');
                }
            });
        }
    };

    const handleMoveSectionOrder = (section, direction) => {
        router.post(route('admin.courses.sections.move', [course.slug, section.id]), {
            direction: direction
        }, {
            onSuccess: () => {
                toast.success('Section order updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update section order');
            }
        });
    };

    const handleMoveLessonOrder = (lesson, direction) => {
        router.post(route('admin.courses.lessons.move', [course.slug, lesson.section_id, lesson.id]), {
            direction: direction
        }, {
            onSuccess: () => {
                toast.success('Lesson order updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update lesson order');
            }
        });
    };

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'image': return <Image className="w-4 h-4" />;
            case 'document': return <FileText className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    const getContentTypeColor = (type) => {
        switch (type) {
            case 'video': return 'text-red-600 bg-red-50';
            case 'image': return 'text-green-600 bg-green-50';
            case 'document': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <AppLayout title={`Content Management - ${course.title}`}>
            <div className="p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-6">
                {/* Header */}
                <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Content</h1>
                            <p className="text-gray-600 mt-1">{course.title}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <a
                            href={route('admin.courses.preview', course.slug)}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview Student View</span>
                        </a>
                        <button
                            onClick={() => setShowAddSection(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Section</span>
                        </button>
                    </div>
                </motion.div>

                {/* Course Info */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{course.sections?.length || 0}</p>
                                <p className="text-sm text-gray-600">Sections</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Play className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0}
                                </p>
                                <p className="text-sm text-gray-600">Lessons</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {course.sections?.reduce((total, section) => total + (section.assignments?.length || 0), 0) || 0}
                                </p>
                                <p className="text-sm text-gray-600">Assignments</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {course.sections?.reduce((total, section) => total + (section.quizzes?.length || 0), 0) || 0}
                                </p>
                                <p className="text-sm text-gray-600">Quizzes</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <VideoIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(course.sections?.reduce((total, section) => total + (section.meetings?.length || 0), 0) || 0) + (courseLevelMeetings?.length || 0)}
                                </p>
                                <p className="text-sm text-gray-600">Meetings</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Course-Level Meetings Summary */}
                {courseLevelMeetings && courseLevelMeetings.length > 0 && (
                    <motion.div
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <VideoIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Course Meetings</h3>
                                    <p className="text-sm text-gray-600">{courseLevelMeetings.length} meeting(s) tanpa section</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.visit(route('admin.meetings.index', course.slug))}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                Kelola Semua →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {courseLevelMeetings.map((meeting) => (
                                <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <VideoIcon className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">{meeting.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(meeting.scheduled_at).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        new Date(meeting.scheduled_at) > new Date()
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {new Date(meeting.scheduled_at) > new Date() ? 'Upcoming' : 'Selesai'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions for Meetings */}
                <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-2">Zoom Meeting Management</h3>
                            <p className="text-indigo-100 text-sm">
                                Kelola meeting Zoom, kirim alert email ke peserta, dan track kehadiran
                            </p>
                        </div>
                        <button
                            onClick={() => router.visit(route('admin.meetings.index', course.slug))}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-lg"
                        >
                            <VideoIcon className="w-5 h-5" />
                            Kelola Meetings
                        </button>
                    </div>
                </motion.div>

                {/* Course Sections */}
                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {course.sections && course.sections.length > 0 ? course.sections.map((section, index) => (
                        <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Section Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {expandedSections[section.id] ? 
                                                <ChevronDown className="w-5 h-5 text-gray-600" /> :
                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                            }
                                        </button>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                                            {section.description && (
                                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">
                                            {(section.lessons?.length || 0) + (section.assignments?.length || 0) + (section.quizzes?.length || 0) + (section.meetings?.length || 0)} items
                                        </span>
                                        {/* Reordering buttons */}
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => handleMoveSectionOrder(section, 'up')}
                                                className="p-1 hover:bg-gray-100 transition-colors"
                                                title="Move section up"
                                            >
                                                <ChevronUp className="w-3 h-3 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveSectionOrder(section, 'down')}
                                                className="p-1 hover:bg-gray-100 transition-colors border-l border-gray-200"
                                                title="Move section down"
                                            >
                                                <ChevronDown className="w-3 h-3 text-gray-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setEditingSection(section)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSection(section)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section Content */}
                            <AnimatePresence>
                                {expandedSections[section.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0">
                                            {/* Add Content Buttons */}
                                            <div className="flex items-center space-x-3 mb-6 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => setShowAddLesson(section.id)}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Lesson</span>
                                                </button>
                                                <button
                                                    onClick={() => setShowAddAssignment(section.id)}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Assignment</span>
                                                </button>
                                                <button
                                                    onClick={() => setShowAddQuiz(section.id)}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Quiz</span>
                                                </button>
                                                <button
                                                    onClick={() => setShowAddMeeting(section.id)}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Meeting</span>
                                                </button>
                                            </div>

                                            {/* Lessons */}
                                            {section.lessons && section.lessons.length > 0 && (
                                                <div className="space-y-3 mb-6">
                                                    <h4 className="font-medium text-gray-900">Lessons</h4>
                                                    {section.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`p-2 rounded-lg ${getContentTypeColor(lesson.type)}`}>
                                                                    {getContentTypeIcon(lesson.type)}
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        {lesson.type} • {lesson.video_duration ? `${lesson.video_duration} min` : 'No duration'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {/* Reordering buttons */}
                                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                                    <button
                                                                        onClick={() => handleMoveLessonOrder(lesson, 'up')}
                                                                        className="p-1 hover:bg-gray-100 transition-colors"
                                                                        title="Move lesson up"
                                                                    >
                                                                        <ChevronUp className="w-3 h-3 text-gray-600" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleMoveLessonOrder(lesson, 'down')}
                                                                        className="p-1 hover:bg-gray-100 transition-colors border-l border-gray-200"
                                                                        title="Move lesson down"
                                                                    >
                                                                        <ChevronDown className="w-3 h-3 text-gray-600" />
                                                                    </button>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setPreviewContent({type: 'lesson', data: lesson})}
                                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                                    title="Preview Lesson"
                                                                >
                                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingLesson(lesson)}
                                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteLesson(lesson)}
                                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assignments */}
                                            {section.assignments && section.assignments.length > 0 && (
                                                <div className="space-y-3 mb-6">
                                                    <h4 className="font-medium text-gray-900">Assignments</h4>
                                                    {section.assignments.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                                    <CheckSquare className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        {assignment.max_points} points • Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button 
                                                                    onClick={() => setPreviewContent({type: 'assignment', data: assignment})}
                                                                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                                                    title="Preview Assignment"
                                                                >
                                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingAssignment(assignment)}
                                                                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteAssignment(assignment)}
                                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quizzes */}
                                            {section.quizzes && section.quizzes.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900">Quizzes</h4>
                                                    {section.quizzes.map((quiz) => (
                                                        <div key={quiz.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="p-2 bg-yellow-100 rounded-lg">
                                                                    <HelpCircle className="w-4 h-4 text-yellow-600" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : 'No time limit'} • {quiz.max_attempts} attempts
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button 
                                                                    onClick={() => setPreviewContent({type: 'quiz', data: quiz})}
                                                                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                                                    title="Preview Quiz"
                                                                >
                                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        // Ensure quiz has proper question structure for editing
                                                                        const quizWithQuestions = {
                                                                            ...quiz,
                                                                            questions: quiz.questions && quiz.questions.length > 0 
                                                                                ? quiz.questions.map(q => ({
                                                                                    question: q.question || '',
                                                                                    type: q.type || 'multiple_choice',
                                                                                    points: q.points || 1,
                                                                                    options: q.type === 'multiple_choice' ? (q.options && q.options.length > 0 ? q.options : ['', '', '', '']) : (q.options || null),
                                                                                    correct_answers: q.correct_answers || [],
                                                                                    explanation: q.explanation || ''
                                                                                }))
                                                                                : [{
                                                                                    question: '',
                                                                                    type: 'multiple_choice',
                                                                                    points: 1,
                                                                                    options: ['', '', '', ''],
                                                                                    correct_answers: [],
                                                                                    explanation: ''
                                                                                }]
                                                                        };
                                                                        setEditingQuiz(quizWithQuestions);
                                                                    }}
                                                                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteQuiz(quiz)}
                                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Meetings */}
                                            {section.meetings && section.meetings.length > 0 && (
                                                <div className="space-y-3 mb-6">
                                                    <h4 className="font-medium text-gray-900">Zoom Meetings</h4>
                                                    {section.meetings.map((meeting) => (
                                                        <MeetingItemCard
                                                            key={meeting.id}
                                                            meeting={meeting}
                                                            course={course}
                                                            onEdit={() => setEditingMeeting(meeting)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {(!section.lessons || section.lessons.length === 0) &&
                                             (!section.assignments || section.assignments.length === 0) &&
                                             (!section.quizzes || section.quizzes.length === 0) &&
                                             (!section.meetings || section.meetings.length === 0) && (
                                                <div className="text-center py-8">
                                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-500">No content added to this section yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections created yet</h3>
                            <p className="text-gray-500 mb-6">Start building your course by adding sections and lessons.</p>
                            <button
                                onClick={() => setShowAddSection(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add First Section</span>
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Add Section Modal */}
                <AnimatePresence>
                    {showAddSection && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-xl max-w-md w-full"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <form onSubmit={handleAddSection}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Add New Section</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddSection(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Section Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sectionData.title}
                                                    onChange={(e) => setSectionData('title', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter section title..."
                                                    required
                                                />
                                                {sectionErrors.title && <p className="text-red-500 text-sm mt-1">{sectionErrors.title}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={sectionData.description}
                                                    onChange={(e) => setSectionData('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Brief description of this section..."
                                                />
                                                {sectionErrors.description && <p className="text-red-500 text-sm mt-1">{sectionErrors.description}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddSection(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processingSection}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{processingSection ? 'Adding...' : 'Add Section'}</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Lesson Modal */}
                <AnimatePresence>
                    {showAddLesson && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <form onSubmit={(e) => { e.preventDefault(); handleAddLesson(showAddLesson); }}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Add New Lesson</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddLesson(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Lesson Title *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={lessonData.title}
                                                        onChange={(e) => setLessonData('title', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter lesson title..."
                                                        required
                                                    />
                                                    {lessonErrors.title && <p className="text-red-500 text-sm mt-1">{lessonErrors.title}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Content Type *
                                                    </label>
                                                    <select
                                                        value={lessonData.type}
                                                        onChange={(e) => setLessonData('type', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="reading">Reading/Text + Images</option>
                                                        <option value="video">Video</option>
                                                        <option value="document">Document</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={lessonData.description}
                                                    onChange={(e) => setLessonData('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Brief description of this lesson..."
                                                />
                                            </div>

                                            {lessonData.type === 'reading' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Reading Content
                                                        </label>
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            Use Content Builder to create rich content with text and images
                                                        </p>
                                                        <ContentBuilder
                                                            value={lessonData.content_blocks || []}
                                                            onChange={(blocks) => setLessonData('content_blocks', blocks)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Estimated Reading Time (minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={lessonData.duration_minutes}
                                                            onChange={(e) => setLessonData('duration_minutes', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="15"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {lessonData.type === 'video' && (
                                                <div className="space-y-4">
                                                    {/* Video Upload Method Selection */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Metode Upload Video
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setVideoUploadMethod('upload')}
                                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                                    videoUploadMethod === 'upload'
                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }`}
                                                            >
                                                                <Upload className="w-5 h-5" />
                                                                <div className="text-left">
                                                                    <div className="font-semibold">Upload Langsung</div>
                                                                    <div className="text-xs opacity-75">File besar, streaming lancar</div>
                                                                </div>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVideoUploadMethod('drive')}
                                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                                    videoUploadMethod === 'drive'
                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }`}
                                                            >
                                                                <LinkIcon className="w-5 h-5" />
                                                                <div className="text-left">
                                                                    <div className="font-semibold">Google Drive</div>
                                                                    <div className="text-xs opacity-75">Link dari Google Drive</div>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Direct Upload Method */}
                                                    {videoUploadMethod === 'upload' && (
                                                        <div className="space-y-4">
                                                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-start gap-2">
                                                                <Video className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <strong>Upload Langsung ke Server</strong>
                                                                    <p className="text-xs mt-1">Mendukung file hingga 10GB. Video akan di-streaming langsung dari server tanpa perlu download.</p>
                                                                </div>
                                                            </div>

                                                            <ChunkedUploader
                                                                accept="video/*"
                                                                maxSize={10 * 1024 * 1024 * 1024} // 10GB
                                                                chunkSize={5 * 1024 * 1024} // 5MB chunks
                                                                storagePath="lessons/videos"
                                                                onUploadComplete={(data) => {
                                                                    setLessonData('video_file_path', data.file_path);
                                                                    setLessonData('video_size', data.file_size);
                                                                    setLessonData('video_mime_type', data.mime_type);
                                                                    setLessonData('video_original_name', data.original_name);
                                                                    toast.success('Video berhasil diupload!');
                                                                }}
                                                                onUploadError={(error) => {
                                                                    toast.error(`Upload gagal: ${error}`);
                                                                }}
                                                                onStateChange={setVideoUploadState}
                                                                onRemove={() => {
                                                                    setLessonData('video_file_path', '');
                                                                    setLessonData('video_size', 0);
                                                                    setLessonData('video_mime_type', '');
                                                                    setLessonData('video_original_name', '');
                                                                }}
                                                            />

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Durasi Video (opsional, e.g., 10:30)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={lessonData.video_duration}
                                                                    onChange={(e) => setLessonData('video_duration', e.target.value)}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="10:30"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Google Drive Method */}
                                                    {videoUploadMethod === 'drive' && (
                                                        <div className="space-y-4">
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Video URL
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={lessonData.video_url}
                                                                        onChange={(e) => setLessonData('video_url', e.target.value)}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Duration (e.g., 5:30)
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={lessonData.video_duration}
                                                                        onChange={(e) => setLessonData('video_duration', e.target.value)}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        placeholder="10:30"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                                                <strong>Catatan:</strong> Untuk file besar (&gt;100MB), Google Drive mungkin tidak bisa streaming langsung dan harus didownload terlebih dahulu. Gunakan "Upload Langsung" untuk pengalaman streaming yang lebih baik.
                                                            </div>

                                                            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                                                <strong>Tip:</strong> Pastikan video di-share sebagai 'Anyone with the link can view'
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {lessonData.type === 'document' && (
                                                <div className="space-y-4">
                                                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <strong>📄 PDF Security:</strong> Uploaded PDF will be displayed with secure viewer. Download and print will be disabled.
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Document Upload
                                                        </label>
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                <label htmlFor="document_file" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                                                                    Click to upload
                                                                </label>
                                                                <span> or drag and drop</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF up to 50MB
                                                            </p>
                                                            <input
                                                                id="document_file"
                                                                type="file"
                                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
                                                                onChange={(e) => setLessonData('document_file', e.target.files[0])}
                                                                className="hidden"
                                                            />
                                                            {lessonData.document_file && (
                                                                <div className="mt-3 text-sm text-gray-600">
                                                                    <strong>Selected:</strong> {lessonData.document_file.name}
                                                                    <div className="text-xs text-gray-500">
                                                                        Size: {(lessonData.document_file.size / (1024 * 1024)).toFixed(2)} MB
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <label className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={lessonData.is_preview}
                                                        onChange={(e) => setLessonData('is_preview', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">Allow as free preview</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddLesson(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processingLesson}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{processingLesson ? 'Adding...' : 'Add Lesson'}</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Assignment Modal */}
                <AnimatePresence>
                    {showAddAssignment && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <form onSubmit={(e) => { e.preventDefault(); handleAddAssignment(showAddAssignment); }}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Add New Assignment</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddAssignment(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assignment Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={assignmentData.title}
                                                    onChange={(e) => setAssignmentData('title', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter assignment title..."
                                                    required
                                                />
                                                {assignmentErrors.title && <p className="text-red-500 text-sm mt-1">{assignmentErrors.title}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description *
                                                </label>
                                                <textarea
                                                    value={assignmentData.description}
                                                    onChange={(e) => setAssignmentData('description', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Describe what students need to accomplish..."
                                                    required
                                                />
                                                {assignmentErrors.description && <p className="text-red-500 text-sm mt-1">{assignmentErrors.description}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    value={assignmentData.instructions}
                                                    onChange={(e) => setAssignmentData('instructions', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Detailed instructions for completing the assignment..."
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Max Points *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={assignmentData.max_points}
                                                        onChange={(e) => setAssignmentData('max_points', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Due Date
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={assignmentData.due_date}
                                                        onChange={(e) => setAssignmentData('due_date', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Max File Size (MB)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={assignmentData.max_file_size}
                                                        onChange={(e) => setAssignmentData('max_file_size', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={assignmentData.allow_late_submission}
                                                            onChange={(e) => setAssignmentData('allow_late_submission', e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">Allow late submissions</span>
                                                    </label>
                                                </div>

                                                {assignmentData.allow_late_submission && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Late Penalty (%)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={assignmentData.late_penalty_percent}
                                                            onChange={(e) => setAssignmentData('late_penalty_percent', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddAssignment(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processingAssignment}
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{processingAssignment ? 'Adding...' : 'Add Assignment'}</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Add Quiz Modal - Advanced Version */}
                    {showAddQuiz && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setShowAddQuiz(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (quizImportMode === 'import') {
                                        handleImportQuiz(showAddQuiz);
                                    } else {
                                        handleAddQuiz(showAddQuiz);
                                    }
                                }}>
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Create Advanced Quiz</h3>
                                                <p className="text-sm text-gray-600 mt-1">Create quiz with multiple question types and auto-grading</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddQuiz(null);
                                                    setQuizImportMode('manual');
                                                    setImportFile(null);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex space-x-2 border-b border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setQuizImportMode('manual')}
                                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                                                    quizImportMode === 'manual'
                                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Edit className="w-4 h-4" />
                                                    <span>Manual Entry</span>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setQuizImportMode('import')}
                                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                                                    quizImportMode === 'import'
                                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                    <span>Import from Excel</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {/* Import Mode Content */}
                                        {quizImportMode === 'import' ? (
                                            <>
                                                {/* Basic Quiz Info for Import */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Quiz Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={quizData.title}
                                                            onChange={(e) => setQuizData('title', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Enter quiz title"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Passing Score (%)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={quizData.passing_score}
                                                            onChange={(e) => setQuizData('passing_score', parseInt(e.target.value))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={quizData.description}
                                                            onChange={(e) => setQuizData('description', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                            rows="2"
                                                            placeholder="Brief description of the quiz"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Instructions
                                                        </label>
                                                        <textarea
                                                            value={quizData.instructions}
                                                            onChange={(e) => setQuizData('instructions', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                            rows="2"
                                                            placeholder="Instructions for taking the quiz"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Time Limit (minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={quizData.time_limit}
                                                            onChange={(e) => setQuizData('time_limit', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Leave empty for no limit"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Attempts Allowed
                                                        </label>
                                                        <select
                                                            value={quizData.attempts_allowed}
                                                            onChange={(e) => setQuizData('attempts_allowed', parseInt(e.target.value))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            {[1, 2, 3, 4, 5, 10].map(num => (
                                                                <option key={num} value={num}>{num} attempt{num > 1 ? 's' : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Import Section */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Import Quiz Questions</h4>

                                                    {/* Download Template */}
                                                    <div className="mb-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <Download className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h5>
                                                                <p className="text-sm text-blue-800 mb-4">
                                                                    Download our Excel template with pre-formatted columns and example questions.
                                                                    The template includes detailed instructions on how to format your quiz questions.
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={downloadTemplate}
                                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    <span>Download Excel Template</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Upload File */}
                                                    <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <Upload className="w-8 h-8 text-gray-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900 mb-2">Step 2: Upload Filled Template</h5>
                                                                <p className="text-sm text-gray-600 mb-4">
                                                                    Upload the Excel file (.xlsx, .xls) or CSV file (.csv) with your quiz questions.
                                                                    The file must follow the template format.
                                                                </p>
                                                                <div className="space-y-3">
                                                                    <input
                                                                        type="file"
                                                                        accept=".xlsx,.xls,.csv"
                                                                        onChange={(e) => {
                                                                            if (e.target.files && e.target.files[0]) {
                                                                                setImportFile(e.target.files[0]);
                                                                            }
                                                                        }}
                                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                                    />
                                                                    {importFile && (
                                                                        <div className="flex items-center space-x-2 text-sm text-green-600">
                                                                            <FileSpreadsheet className="w-4 h-4" />
                                                                            <span>Selected: {importFile.name}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info Box */}
                                                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                        <div className="flex items-start space-x-3">
                                                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                            <div>
                                                                <h5 className="font-medium text-yellow-900 mb-1">Important Notes</h5>
                                                                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                                                                    <li>Supported file types: .xlsx, .xls, .csv</li>
                                                                    <li>Maximum file size: 10MB</li>
                                                                    <li>Question types: multiple_choice, true_false, text, fill_blank</li>
                                                                    <li>For multiple correct answers, use comma-separated letters (e.g., A,C)</li>
                                                                    <li>Delete the example rows before importing your questions</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Settings for Import */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h4>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={quizData.randomize_questions}
                                                                onChange={(e) => setQuizData('randomize_questions', e.target.checked)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">Randomize Questions</div>
                                                                <div className="text-sm text-gray-500">Show questions in random order</div>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={quizData.show_correct_answers}
                                                                onChange={(e) => setQuizData('show_correct_answers', e.target.checked)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">Show Correct Answers</div>
                                                                <div className="text-sm text-gray-500">Display correct answers after submission</div>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={quizData.show_results_immediately}
                                                                onChange={(e) => setQuizData('show_results_immediately', e.target.checked)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">Immediate Results</div>
                                                                <div className="text-sm text-gray-500">Show results right after submission</div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Manual Entry Mode - Original Form */}
                                                {/* Basic Quiz Info */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quiz Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={quizData.title}
                                                    onChange={(e) => setQuizData('title', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter quiz title"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Passing Score (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={quizData.passing_score}
                                                    onChange={(e) => setQuizData('passing_score', parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={quizData.description}
                                                    onChange={(e) => setQuizData('description', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Brief description of the quiz"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    value={quizData.instructions}
                                                    onChange={(e) => setQuizData('instructions', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Instructions for taking the quiz"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Time Limit (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quizData.time_limit}
                                                    onChange={(e) => setQuizData('time_limit', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Leave empty for no limit"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Attempts Allowed
                                                </label>
                                                <select
                                                    value={quizData.attempts_allowed}
                                                    onChange={(e) => setQuizData('attempts_allowed', parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {[1, 2, 3, 4, 5, 10].map(num => (
                                                        <option key={num} value={num}>{num} attempt{num > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Questions Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-lg font-semibold text-gray-900">Quiz Questions</h4>
                                                <button
                                                    type="button"
                                                    onClick={addQuizQuestion}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Question</span>
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {quizData.questions.map((question, index) => (
                                                    <QuestionEditor
                                                        key={index}
                                                        question={question}
                                                        index={index}
                                                        onChange={updateQuizQuestion}
                                                        onRemove={removeQuizQuestion}
                                                        canRemove={quizData.questions.length > 1}
                                                        errors={quizErrors[`questions.${index}`] || {}}
                                                    />
                                                ))}
                                            </div>

                                            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-medium text-blue-900">Smart Auto-Grading</h5>
                                                        <p className="text-sm text-blue-800 mt-1">
                                                            This quiz system includes automatic grading with smart text matching. 
                                                            Multiple choice and true/false questions are graded instantly. 
                                                            Text answers use intelligent matching for partial credit.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Settings */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={quizData.randomize_questions}
                                                        onChange={(e) => setQuizData('randomize_questions', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Randomize Questions</div>
                                                        <div className="text-sm text-gray-500">Show questions in random order</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={quizData.show_correct_answers}
                                                        onChange={(e) => setQuizData('show_correct_answers', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Show Correct Answers</div>
                                                        <div className="text-sm text-gray-500">Display correct answers after submission</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={quizData.show_results_immediately}
                                                        onChange={(e) => setQuizData('show_results_immediately', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Immediate Results</div>
                                                        <div className="text-sm text-gray-500">Show results right after submission</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={quizData.allow_retake_until_pass}
                                                        onChange={(e) => {
                                                            setQuizData('allow_retake_until_pass', e.target.checked);
                                                            if (!e.target.checked) {
                                                                setQuizData('max_retake_attempts', null);
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Allow Retake Until Pass</div>
                                                        <div className="text-sm text-gray-500">Students can retake until passing score</div>
                                                    </div>
                                                </label>

                                                {quizData.allow_retake_until_pass && (
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Max Retake Attempts (Optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={quizData.max_retake_attempts || ''}
                                                            onChange={(e) => setQuizData('max_retake_attempts', e.target.value ? parseInt(e.target.value) : null)}
                                                            min="1"
                                                            placeholder="Unlimited if empty"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">Leave empty for unlimited retakes until passing</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddQuiz(null);
                                                setQuizImportMode('manual');
                                                setImportFile(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={quizImportMode === 'import' ? importingQuiz : processingQuiz}
                                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {quizImportMode === 'import' ? (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    <span>{importingQuiz ? 'Importing Quiz...' : 'Import Quiz'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>{processingQuiz ? 'Creating Quiz...' : 'Create Quiz'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Edit Section Modal */}
                    {editingSection && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setEditingSection(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    router.put(route('admin.courses.sections.update', [course.slug, editingSection.id]), {
                                        title: editingSection.title,
                                        description: editingSection.description
                                    }, {
                                        onSuccess: () => {
                                            toast.success('Section updated successfully!');
                                            setEditingSection(null);
                                        },
                                        onError: () => {
                                            toast.error('Failed to update section');
                                        }
                                    });
                                }}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Edit Section</h3>
                                            <button
                                                type="button"
                                                onClick={() => setEditingSection(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Section Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingSection.title}
                                                    onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter section title..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={editingSection.description || ''}
                                                    onChange={(e) => setEditingSection({...editingSection, description: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="3"
                                                    placeholder="Brief description of this section..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setEditingSection(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Update Section</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Edit Lesson Modal */}
                    {editingLesson && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setEditingLesson(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();

                                    const formData = new FormData();
                                    formData.append('title', editingLesson.title);
                                    formData.append('description', editingLesson.description || '');
                                    formData.append('type', editingLesson.type);
                                    formData.append('content', editingLesson.content || '');
                                    formData.append('duration_minutes', editingLesson.duration_minutes || '');

                                    // Handle document removal
                                    if (editingLesson.remove_document) {
                                        formData.append('remove_document', '1');
                                    }

                                    // Handle content images removal
                                    if (editingLesson.remove_content_images) {
                                        editingLesson.remove_content_images.forEach((index) => {
                                            formData.append(`remove_content_images[${index}]`, index);
                                        });
                                    }

                                    // Handle video - Google Drive or Direct Upload
                                    if (editingLesson.type === 'video') {
                                        if (editVideoUploadMethod === 'upload' && editingLesson.video_file_path) {
                                            // Chunked upload - video already uploaded to server
                                            formData.append('video_file_path', editingLesson.video_file_path);
                                            formData.append('video_size', editingLesson.video_size || 0);
                                            formData.append('video_mime_type', editingLesson.video_mime_type || '');
                                            formData.append('video_provider', 'file');
                                            formData.append('video_duration', editingLesson.video_duration || '');
                                            // Clear video_url when using direct upload
                                            formData.append('video_url', '');
                                        } else if (editVideoUploadMethod === 'drive' && editingLesson.video_url) {
                                            // Google Drive URL
                                            formData.append('video_url', editingLesson.video_url || '');
                                            formData.append('video_provider', 'drive');
                                            formData.append('video_duration', editingLesson.video_duration || '');
                                        } else if (editingLesson.video_file && editingLesson.video_provider === 'file') {
                                            // Keep existing direct upload file
                                            formData.append('video_provider', 'file');
                                            formData.append('video_duration', editingLesson.video_duration || '');
                                        }
                                    }

                                    formData.append('is_preview', editingLesson.is_preview ? '1' : '0');
                                    formData.append('is_published', editingLesson.is_published ? '1' : '0');
                                    
                                    formData.append('_method', 'PUT');
                                    
                                    router.post(route('admin.courses.lessons.update', [course.slug, editingLesson.section_id, editingLesson.id]), formData, {
                                        onSuccess: () => {
                                            toast.success('Lesson updated successfully!');
                                            setEditingLesson(null);
                                            // Reset video upload state
                                            setEditVideoUploadMethod('drive');
                                            setEditVideoUploadState({ state: 'idle', hasFile: false, isCompleted: false, isUploading: false, progress: 0 });
                                        },
                                        onError: () => {
                                            toast.error('Failed to update lesson');
                                        }
                                    });
                                }}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Edit Lesson</h3>
                                            <button
                                                type="button"
                                                onClick={() => setEditingLesson(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Lesson Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingLesson.title}
                                                    onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={editingLesson.description || ''}
                                                    onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Content Type *
                                                </label>
                                                <select
                                                    value={editingLesson.type}
                                                    onChange={(e) => setEditingLesson({...editingLesson, type: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="reading">Reading/Text + Images</option>
                                                    <option value="video">Video</option>
                                                    <option value="document">Document</option>
                                                </select>
                                            </div>

                                            {editingLesson.type === 'reading' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Reading Content *
                                                        </label>
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            Use Content Builder to create rich content with text and images
                                                        </p>
                                                        <ContentBuilder
                                                            value={editingLesson.content_blocks || []}
                                                            onChange={(blocks) => setEditingLesson({...editingLesson, content_blocks: blocks})}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Estimated Reading Time (minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editingLesson.duration_minutes || ''}
                                                            onChange={(e) => setEditingLesson({...editingLesson, duration_minutes: e.target.value})}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="15"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {editingLesson.type === 'document' && (
                                                <div className="space-y-4">
                                                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <strong>📄 PDF Security:</strong> Uploaded PDF will be displayed with secure viewer. Download and print will be disabled.
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Document
                                                        </label>
                                                        {editingLesson.document_file && (
                                                            <div className="mb-3 p-3 bg-gray-50 rounded">
                                                                <div className="text-sm font-medium">Current Document: {editingLesson.document_filename}</div>
                                                                <div className="text-xs text-gray-500">Size: {editingLesson.document_size ? (editingLesson.document_size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}</div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (confirm('Remove current document?')) {
                                                                            setEditingLesson({...editingLesson, remove_document: true, document_file: null});
                                                                        }
                                                                    }}
                                                                    className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                                >
                                                                    Remove Document
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {editingLesson.type === 'video' && (
                                                <div className="space-y-4">
                                                    {/* Show current video info if exists */}
                                                    {(editingLesson.video_file || editingLesson.video_url) && (
                                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                                            <div className="text-sm font-medium text-gray-700 mb-2">Video Saat Ini:</div>
                                                            {editingLesson.video_file && editingLesson.video_provider === 'file' ? (
                                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                                    <Video className="w-4 h-4" />
                                                                    <span>Video tersimpan di server (streaming langsung)</span>
                                                                </div>
                                                            ) : editingLesson.video_url ? (
                                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                                    <LinkIcon className="w-4 h-4" />
                                                                    <span className="truncate">{editingLesson.video_url}</span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}

                                                    {/* Video Upload Method Selection */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Metode Video
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditVideoUploadMethod('upload')}
                                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                                    editVideoUploadMethod === 'upload'
                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }`}
                                                            >
                                                                <Upload className="w-5 h-5" />
                                                                <div className="text-left">
                                                                    <div className="font-semibold">Upload Langsung</div>
                                                                    <div className="text-xs opacity-75">Streaming lancar</div>
                                                                </div>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditVideoUploadMethod('drive')}
                                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                                    editVideoUploadMethod === 'drive'
                                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }`}
                                                            >
                                                                <LinkIcon className="w-5 h-5" />
                                                                <div className="text-left">
                                                                    <div className="font-semibold">Google Drive</div>
                                                                    <div className="text-xs opacity-75">Link dari Drive</div>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Direct Upload Method */}
                                                    {editVideoUploadMethod === 'upload' && (
                                                        <div className="space-y-4">
                                                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-start gap-2">
                                                                <Video className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <strong>Upload Langsung ke Server</strong>
                                                                    <p className="text-xs mt-1">Mendukung file hingga 10GB. Video akan di-streaming langsung dari server.</p>
                                                                </div>
                                                            </div>

                                                            <ChunkedUploader
                                                                accept="video/*"
                                                                maxSize={10 * 1024 * 1024 * 1024}
                                                                chunkSize={5 * 1024 * 1024}
                                                                storagePath="lessons/videos"
                                                                existingFile={editingLesson.video_file && editingLesson.video_provider === 'file' ? {
                                                                    name: editingLesson.video_original_name || 'Video tersimpan',
                                                                    path: editingLesson.video_file,
                                                                    size: editingLesson.video_size
                                                                } : null}
                                                                onUploadComplete={(data) => {
                                                                    setEditingLesson(prev => ({
                                                                        ...prev,
                                                                        video_file_path: data.file_path,
                                                                        video_size: data.file_size,
                                                                        video_mime_type: data.mime_type,
                                                                        video_original_name: data.original_name,
                                                                        video_url: '' // Clear drive URL when uploading
                                                                    }));
                                                                    toast.success('Video berhasil diupload!');
                                                                }}
                                                                onUploadError={(error) => {
                                                                    toast.error(`Upload gagal: ${error}`);
                                                                }}
                                                                onStateChange={setEditVideoUploadState}
                                                                onRemove={() => {
                                                                    setEditingLesson(prev => ({
                                                                        ...prev,
                                                                        video_file_path: '',
                                                                        video_file: '',
                                                                        video_size: 0,
                                                                        video_mime_type: '',
                                                                        video_original_name: ''
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Google Drive Method */}
                                                    {editVideoUploadMethod === 'drive' && (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Video URL
                                                                </label>
                                                                <input
                                                                    type="url"
                                                                    value={editingLesson.video_url || ''}
                                                                    onChange={(e) => setEditingLesson({...editingLesson, video_url: e.target.value})}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                                                                />
                                                            </div>

                                                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                                                <strong>Catatan:</strong> Untuk file besar (&gt;100MB), Google Drive mungkin tidak bisa streaming langsung. Gunakan "Upload Langsung" untuk pengalaman yang lebih baik.
                                                            </div>

                                                            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                                                <strong>Tip:</strong> Pastikan video di-share sebagai 'Anyone with the link can view'
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Durasi Video (opsional, e.g., 10:30)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editingLesson.video_duration || ''}
                                                            onChange={(e) => setEditingLesson({...editingLesson, video_duration: e.target.value})}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="10:30"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="edit_is_preview"
                                                    checked={editingLesson.is_preview || false}
                                                    onChange={(e) => setEditingLesson({...editingLesson, is_preview: e.target.checked})}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor="edit_is_preview" className="ml-2 text-sm text-gray-700">
                                                    Allow preview for non-enrolled students
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setEditingLesson(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Update Lesson</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Edit Assignment Modal */}
                    {editingAssignment && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setEditingAssignment(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    router.put(route('admin.courses.assignments.update', [course.slug, editingAssignment.section_id, editingAssignment.id]), {
                                        title: editingAssignment.title,
                                        description: editingAssignment.description,
                                        instructions: editingAssignment.instructions,
                                        max_points: editingAssignment.max_points,
                                        due_date: editingAssignment.due_date,
                                        allow_late_submission: editingAssignment.allow_late_submission,
                                        late_penalty_percent: editingAssignment.late_penalty_percent,
                                        submission_types: ['file']
                                    }, {
                                        onSuccess: () => {
                                            toast.success('Assignment updated successfully!');
                                            setEditingAssignment(null);
                                        },
                                        onError: () => {
                                            toast.error('Failed to update assignment');
                                        }
                                    });
                                }}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Edit Assignment</h3>
                                            <button
                                                type="button"
                                                onClick={() => setEditingAssignment(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assignment Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingAssignment.title}
                                                    onChange={(e) => setEditingAssignment({...editingAssignment, title: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description *
                                                </label>
                                                <textarea
                                                    value={editingAssignment.description || ''}
                                                    onChange={(e) => setEditingAssignment({...editingAssignment, description: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="3"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    value={editingAssignment.instructions || ''}
                                                    onChange={(e) => setEditingAssignment({...editingAssignment, instructions: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="4"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Max Points *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editingAssignment.max_points}
                                                        onChange={(e) => setEditingAssignment({...editingAssignment, max_points: e.target.value})}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Due Date
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={editingAssignment.due_date ? editingAssignment.due_date.substring(0, 16) : ''}
                                                        onChange={(e) => setEditingAssignment({...editingAssignment, due_date: e.target.value})}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="edit_allow_late_submission"
                                                    checked={editingAssignment.allow_late_submission || false}
                                                    onChange={(e) => setEditingAssignment({...editingAssignment, allow_late_submission: e.target.checked})}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor="edit_allow_late_submission" className="ml-2 text-sm text-gray-700">
                                                    Allow late submissions
                                                </label>
                                            </div>

                                            {editingAssignment.allow_late_submission && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Late Penalty (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editingAssignment.late_penalty_percent || 0}
                                                        onChange={(e) => setEditingAssignment({...editingAssignment, late_penalty_percent: e.target.value})}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setEditingAssignment(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Update Assignment</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Edit Quiz Modal - Advanced Version */}
                    {editingQuiz && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setEditingQuiz(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    
                                    // Clean up quiz data before sending
                                    const cleanData = {
                                        title: editingQuiz.title,
                                        description: editingQuiz.description,
                                        instructions: editingQuiz.instructions,
                                        time_limit: editingQuiz.time_limit,
                                        attempts_allowed: editingQuiz.attempts_allowed,
                                        passing_score: editingQuiz.passing_score,
                                        randomize_questions: editingQuiz.randomize_questions || false,
                                        show_correct_answers: editingQuiz.show_correct_answers !== false, // Default true if undefined
                                        show_results_immediately: editingQuiz.show_results_immediately !== false, // Default true if undefined
                                        allow_retake_until_pass: editingQuiz.allow_retake_until_pass || false,
                                        max_retake_attempts: editingQuiz.max_retake_attempts || null,
                                        available_from: editingQuiz.available_from || null,
                                        available_until: editingQuiz.available_until || null,
                                        is_published: editingQuiz.is_published !== false, // Default true if undefined
                                        sort_order: editingQuiz.sort_order || 0,
                                        questions: (editingQuiz.questions || []).map(q => ({
                                            ...q,
                                            options: q.type === 'multiple_choice' ? q.options?.filter(opt => opt.trim() !== '') : null,
                                            correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers].filter(Boolean)
                                        }))
                                    };

                                    router.put(route('admin.courses.quizzes.update', [course.slug, editingQuiz.section_id, editingQuiz.id]), cleanData, {
                                        onSuccess: () => {
                                            toast.success('Quiz updated successfully!');
                                            setEditingQuiz(null);
                                        },
                                        onError: () => {
                                            toast.error('Failed to update quiz');
                                        }
                                    });
                                }}>
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Edit Advanced Quiz</h3>
                                                <p className="text-sm text-gray-600 mt-1">Update quiz with multiple question types and auto-grading</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingQuiz(null)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {/* Basic Quiz Info */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quiz Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingQuiz.title}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter quiz title"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Passing Score (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editingQuiz.passing_score || 70}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, passing_score: parseInt(e.target.value)})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={editingQuiz.description || ''}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, description: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Brief description of the quiz"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    value={editingQuiz.instructions || ''}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, instructions: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    rows="2"
                                                    placeholder="Instructions for taking the quiz"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Time Limit (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editingQuiz.time_limit || ''}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, time_limit: e.target.value})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Leave empty for no limit"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Attempts Allowed
                                                </label>
                                                <select
                                                    value={editingQuiz.attempts_allowed || 1}
                                                    onChange={(e) => setEditingQuiz({...editingQuiz, attempts_allowed: parseInt(e.target.value)})}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {[1, 2, 3, 4, 5, 10].map(num => (
                                                        <option key={num} value={num}>{num} attempt{num > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Questions Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-lg font-semibold text-gray-900">Quiz Questions</h4>
                                                <button
                                                    type="button"
                                                    onClick={addEditQuizQuestion}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Question</span>
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {(editingQuiz.questions || []).map((question, index) => (
                                                    <QuestionEditor
                                                        key={index}
                                                        question={question}
                                                        index={index}
                                                        onChange={updateEditQuizQuestion}
                                                        onRemove={removeEditQuizQuestion}
                                                        canRemove={(editingQuiz.questions || []).length > 1}
                                                        errors={{}}
                                                    />
                                                ))}
                                            </div>

                                            {(!editingQuiz.questions || editingQuiz.questions.length === 0) && (
                                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 mb-4">No questions added yet.</p>
                                                    <button
                                                        type="button"
                                                        onClick={addEditQuizQuestion}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add First Question</span>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-medium text-blue-900">Smart Auto-Grading</h5>
                                                        <p className="text-sm text-blue-800 mt-1">
                                                            This quiz system includes automatic grading with smart text matching. 
                                                            Multiple choice and true/false questions are graded instantly. 
                                                            Text answers use intelligent matching for partial credit.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Settings */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingQuiz.randomize_questions || false}
                                                        onChange={(e) => setEditingQuiz({...editingQuiz, randomize_questions: e.target.checked})}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Randomize Questions</div>
                                                        <div className="text-sm text-gray-500">Show questions in random order</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingQuiz.show_correct_answers !== false}
                                                        onChange={(e) => setEditingQuiz({...editingQuiz, show_correct_answers: e.target.checked})}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Show Correct Answers</div>
                                                        <div className="text-sm text-gray-500">Display correct answers after submission</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingQuiz.show_results_immediately !== false}
                                                        onChange={(e) => setEditingQuiz({...editingQuiz, show_results_immediately: e.target.checked})}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Immediate Results</div>
                                                        <div className="text-sm text-gray-500">Show results right after submission</div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingQuiz.allow_retake_until_pass || false}
                                                        onChange={(e) => {
                                                            setEditingQuiz({
                                                                ...editingQuiz,
                                                                allow_retake_until_pass: e.target.checked,
                                                                max_retake_attempts: e.target.checked ? editingQuiz.max_retake_attempts : null
                                                            });
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Allow Retake Until Pass</div>
                                                        <div className="text-sm text-gray-500">Students can retake until passing score</div>
                                                    </div>
                                                </label>

                                                {editingQuiz.allow_retake_until_pass && (
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Max Retake Attempts (Optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editingQuiz.max_retake_attempts || ''}
                                                            onChange={(e) => setEditingQuiz({...editingQuiz, max_retake_attempts: e.target.value ? parseInt(e.target.value) : null})}
                                                            min="1"
                                                            placeholder="Unlimited if empty"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">Leave empty for unlimited retakes until passing</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setEditingQuiz(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Update Quiz</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Preview Modal */}
                    {previewContent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setPreviewContent(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Preview {previewContent.type === 'lesson' ? 'Lesson' : previewContent.type === 'assignment' ? 'Assignment' : 'Quiz'}
                                        </h3>
                                        <button
                                            onClick={() => setPreviewContent(null)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Title */}
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                                                {previewContent.data.title}
                                            </h4>
                                            {previewContent.data.description && (
                                                <p className="text-gray-600 mb-4">{previewContent.data.description}</p>
                                            )}
                                        </div>

                                        {/* Lesson Content */}
                                        {previewContent.type === 'lesson' && (
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                {previewContent.data.type === 'text' && previewContent.data.content && (
                                                    <div className="prose max-w-none">
                                                        <div className="whitespace-pre-wrap">{previewContent.data.content}</div>
                                                    </div>
                                                )}
                                                
                                                {previewContent.data.type === 'video' && previewContent.data.video_url && (
                                                    <div>
                                                        <div className="aspect-w-16 aspect-h-9 mb-4">
                                                            <iframe
                                                                src={previewContent.data.video_url}
                                                                className="w-full h-64 rounded-lg"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                        {previewContent.data.video_duration && (
                                                            <p className="text-sm text-gray-600">
                                                                Duration: {previewContent.data.video_duration} minutes
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {(previewContent.data.type === 'image' || previewContent.data.type === 'document') && (
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            {previewContent.data.type === 'image' ? 
                                                                <Image className="w-8 h-8 text-blue-600" /> :
                                                                <FileText className="w-8 h-8 text-blue-600" />
                                                            }
                                                        </div>
                                                        <p className="text-gray-600">
                                                            {previewContent.data.type === 'image' ? 'Image content' : 'Document content'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Assignment Content */}
                                        {previewContent.type === 'assignment' && (
                                            <div className="bg-purple-50 rounded-lg p-6">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Max Points:</span>
                                                        <p className="text-lg font-semibold text-purple-600">{previewContent.data.max_points}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Due Date:</span>
                                                        <p className="text-lg font-semibold text-purple-600">
                                                            {previewContent.data.due_date ? 
                                                                new Date(previewContent.data.due_date).toLocaleDateString() : 
                                                                'No due date'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {previewContent.data.instructions && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">Instructions:</h5>
                                                        <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                                                            {previewContent.data.instructions}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Quiz Content */}
                                        {previewContent.type === 'quiz' && (
                                            <div className="bg-yellow-50 rounded-lg p-6">
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Time Limit:</span>
                                                        <p className="text-lg font-semibold text-yellow-600">
                                                            {previewContent.data.time_limit || 'No limit'} minutes
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Attempts:</span>
                                                        <p className="text-lg font-semibold text-yellow-600">
                                                            {previewContent.data.attempts_allowed || 1}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Passing Score:</span>
                                                        <p className="text-lg font-semibold text-yellow-600">
                                                            {previewContent.data.passing_score || 70}%
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {previewContent.data.instructions && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">Instructions:</h5>
                                                        <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                                                            {previewContent.data.instructions}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                    <button
                                        onClick={() => setPreviewContent(null)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Meeting Form Modal */}
                <MeetingFormModal
                    show={showAddMeeting !== null || editingMeeting !== null}
                    onClose={() => {
                        setShowAddMeeting(null);
                        setEditingMeeting(null);
                    }}
                    course={course}
                    section={course.sections?.find(s => s.id === showAddMeeting) || course.sections?.find(s => s.id === editingMeeting?.section_id)}
                    meeting={editingMeeting}
                />
            </div>
        </AppLayout>
    );
}