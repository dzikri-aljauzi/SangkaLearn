import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import {
    PlayCircle,
    CheckCircle,
    Clock,
    FileText,
    Edit,
    Users,
    BookOpen,
    Award,
    ArrowLeft,
    Target
} from 'lucide-react';

export default function CourseStudy({ course, enrollment, userProgress }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const getItemIcon = (type) => {
        switch (type) {
            case 'lesson':
                return <PlayCircle className="w-5 h-5 text-blue-500" />;
            case 'assignment':
                return <Edit className="w-5 h-5 text-green-500" />;
            case 'quiz':
                return <FileText className="w-5 h-5 text-purple-500" />;
            default:
                return <BookOpen className="w-5 h-5 text-gray-500" />;
        }
    };

    const getItemStatus = (type, itemId) => {
        if (type === 'lesson') {
            return userProgress?.lessons?.[itemId] ? 'completed' : 'pending';
        } else if (type === 'assignment') {
            return userProgress?.assignments?.[itemId] ? 'submitted' : 'pending';
        } else if (type === 'quiz') {
            return userProgress?.quizzes?.[itemId] ? 'completed' : 'pending';
        }
        return 'pending';
    };

    const getItemLink = (type, itemId) => {
        switch (type) {
            case 'lesson':
                return route('student.lessons.show', itemId);
            case 'assignment':
                return route('student.assignments.show', itemId);
            case 'quiz':
                return route('student.quizzes.show', itemId);
            default:
                return '#';
        }
    };

    const StatusBadge = ({ status, type }) => {
        const getStatusConfig = () => {
            switch (status) {
                case 'completed':
                    return { icon: CheckCircle, text: 'Completed', bg: 'bg-green-100', textColor: 'text-green-700' };
                case 'submitted':
                    return { icon: CheckCircle, text: 'Submitted', bg: 'bg-blue-100', textColor: 'text-blue-700' };
                case 'in_progress':
                    return { icon: Clock, text: 'In Progress', bg: 'bg-yellow-100', textColor: 'text-yellow-700' };
                default:
                    return { icon: Clock, text: 'Not Started', bg: 'bg-gray-100', textColor: 'text-gray-700' };
            }
        };

        const config = getStatusConfig();
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.textColor}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    return (
        <AppLayout
            title={`Study: ${course.title}`}
            header={
                <div className="flex items-center space-x-4">
                    <Link 
                        href={route('courses.show', course.slug)}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Course
                    </Link>
                    <div className="h-6 border-l border-gray-300"></div>
                    <h2 className="font-semibold text-xl text-gray-800">
                        {course.title}
                    </h2>
                </div>
            }
        >
            <Head title={`Study: ${course.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Course Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {course.title}
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    {course.description}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        {course.sections?.length || 0} Sections
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        Progress: {Math.round(enrollment.progress_percentage || 0)}%
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {Math.round(enrollment.progress_percentage || 0)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Complete</p>
                            </div>
                        </div>
                    </div>

                    {/* Course Content */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                            <p className="text-gray-600 mt-1">Click on any item to start learning</p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {course.sections?.map((section, sectionIndex) => (
                                <div key={section.id} className="p-6">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {sectionIndex + 1}. {section.title}
                                            </h3>
                                            {section.description && (
                                                <p className="text-gray-600 mt-1">{section.description}</p>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {(section.lessons?.length || 0) + (section.assignments?.length || 0) + (section.quizzes?.length || 0)} items
                                        </div>
                                    </button>

                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ 
                                            height: expandedSections[section.id] ? 'auto' : 0,
                                            opacity: expandedSections[section.id] ? 1 : 0 
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 space-y-3">
                                            {/* Lessons */}
                                            {section.lessons?.map((lesson, lessonIndex) => (
                                                <Link
                                                    key={lesson.id}
                                                    href={getItemLink('lesson', lesson.id)}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getItemIcon('lesson')}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                                                                {lesson.title}
                                                            </h4>
                                                            {lesson.description && (
                                                                <p className="text-sm text-gray-600">{lesson.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {lesson.duration_minutes && (
                                                            <span className="text-xs text-gray-500">
                                                                {lesson.duration_minutes} min
                                                            </span>
                                                        )}
                                                        <StatusBadge 
                                                            status={getItemStatus('lesson', lesson.id)} 
                                                            type="lesson" 
                                                        />
                                                    </div>
                                                </Link>
                                            ))}

                                            {/* Assignments */}
                                            {section.assignments?.map((assignment, assignmentIndex) => (
                                                <Link
                                                    key={assignment.id}
                                                    href={getItemLink('assignment', assignment.id)}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getItemIcon('assignment')}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 group-hover:text-green-600">
                                                                {assignment.title}
                                                            </h4>
                                                            {assignment.description && (
                                                                <p className="text-sm text-gray-600">{assignment.description}</p>
                                                            )}
                                                            {assignment.due_date && (
                                                                <p className="text-xs text-red-600">
                                                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {assignment.max_points && (
                                                            <span className="text-xs text-gray-500">
                                                                {assignment.max_points} pts
                                                            </span>
                                                        )}
                                                        <StatusBadge 
                                                            status={getItemStatus('assignment', assignment.id)} 
                                                            type="assignment" 
                                                        />
                                                    </div>
                                                </Link>
                                            ))}

                                            {/* Quizzes */}
                                            {section.quizzes?.map((quiz, quizIndex) => (
                                                <Link
                                                    key={quiz.id}
                                                    href={getItemLink('quiz', quiz.id)}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getItemIcon('quiz')}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600">
                                                                {quiz.title}
                                                            </h4>
                                                            {quiz.description && (
                                                                <p className="text-sm text-gray-600">{quiz.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {quiz.time_limit && (
                                                            <span className="text-xs text-gray-500">
                                                                {quiz.time_limit} min
                                                            </span>
                                                        )}
                                                        {quiz.passing_score && (
                                                            <span className="text-xs text-gray-500">
                                                                Pass: {quiz.passing_score}%
                                                            </span>
                                                        )}
                                                        <StatusBadge 
                                                            status={getItemStatus('quiz', quiz.id)} 
                                                            type="quiz" 
                                                        />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        {(!course.sections || course.sections.length === 0) && (
                            <div className="p-12 text-center">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                                <p className="text-gray-600">This course doesn't have any content yet. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}