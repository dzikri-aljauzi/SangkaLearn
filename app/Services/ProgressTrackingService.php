<?php

namespace App\Services;

use App\Models\User;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\CertificateQueue;
use App\Models\MeetingAttendance;
use App\Notifications\Admin\CourseCompletedAlert;
use App\Notifications\CertificateAvailable;
use App\Services\CertificateGeneratorService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ProgressTrackingService
{
    /**
     * Update enrollment progress for a student
     */
    public function updateEnrollmentProgress($userId, $courseId, $progressData = [])
    {
        try {
            $enrollment = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->first();

            if (!$enrollment) {
                Log::warning("Enrollment not found for user {$userId} and course {$courseId}");
                return false;
            }

            // Calculate progress based on different factors
            $newProgress = $this->calculateProgress($enrollment, $progressData);
            
            // Update enrollment
            $enrollment->update([
                'progress_percentage' => $newProgress,
                'last_accessed_at' => now(),
                'total_time_spent' => ($enrollment->total_time_spent ?? 0) + ($progressData['time_spent'] ?? 0)
            ]);

            // Mark as completed if progress reaches 100%
            if ($newProgress >= 100 && $enrollment->status !== 'completed') {
                $enrollment->update([
                    'status' => 'completed',
                    'completed_at' => now()
                ]);

                // Send notification to admins about course completion
                try {
                    $student = User::find($userId);
                    $course = Course::find($courseId);
                    if ($student && $course) {
                        $admins = User::whereHas('roles', function($q) {
                            $q->where('name', 'admin');
                        })->get();

                        Notification::send($admins, new CourseCompletedAlert($student, $course, $enrollment));
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to send course completion notification: ' . $e->getMessage());
                }

                // Add to certificate queue for admin review (includes meeting attendance check)
                $this->addToCertificateQueue($enrollment);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error updating enrollment progress: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Calculate progress based on various factors
     */
    private function calculateProgress($enrollment, $progressData)
    {
        $currentProgress = $enrollment->progress_percentage ?? 0;
        
        // If manual progress is provided, use it
        if (isset($progressData['progress_percentage'])) {
            return min(100, max(0, $progressData['progress_percentage']));
        }

        // If lessons completed data is provided
        if (isset($progressData['lessons_completed']) && isset($progressData['total_lessons'])) {
            $totalLessons = $progressData['total_lessons'];
            $completedLessons = $progressData['lessons_completed'];
            
            if ($totalLessons > 0) {
                return round(($completedLessons / $totalLessons) * 100, 2);
            }
        }

        // If time-based progress
        if (isset($progressData['time_spent']) && isset($progressData['estimated_duration'])) {
            $timeProgress = ($progressData['time_spent'] / $progressData['estimated_duration']) * 100;
            return min(100, max($currentProgress, round($timeProgress, 2)));
        }

        // Default increment for viewing/accessing content
        if (isset($progressData['increment'])) {
            return min(100, $currentProgress + $progressData['increment']);
        }

        return $currentProgress;
    }

    /**
     * Update progress when student accesses a lesson
     */
    public function trackLessonAccess($userId, $courseId, $lessonId)
    {
        try {
            // Get course and lesson count
            $course = Course::with('sections.lessons')->find($courseId);
            if (!$course) return false;

            $totalLessons = $course->sections->sum(function($section) {
                return $section->lessons->count();
            });

            // Check if lesson is already marked as viewed/completed
            $existingAccess = DB::table('lesson_access')
                ->where('user_id', $userId)
                ->where('lesson_id', $lessonId)
                ->first();

            if (!$existingAccess) {
                // Mark lesson as accessed
                DB::table('lesson_access')->insertOrIgnore([
                    'user_id' => $userId,
                    'lesson_id' => $lessonId,
                    'first_accessed_at' => now(),
                    'last_accessed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Count total accessed lessons for this course
                $accessedLessons = DB::table('lesson_access')
                    ->join('lessons', 'lesson_access.lesson_id', '=', 'lessons.id')
                    ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
                    ->where('course_sections.course_id', $courseId)
                    ->where('lesson_access.user_id', $userId)
                    ->count();

                // Update enrollment progress
                $this->updateEnrollmentProgress($userId, $courseId, [
                    'lessons_completed' => $accessedLessons,
                    'total_lessons' => $totalLessons
                ]);
            } else {
                // Update last accessed time
                DB::table('lesson_access')
                    ->where('user_id', $userId)
                    ->where('lesson_id', $lessonId)
                    ->update(['last_accessed_at' => now()]);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error tracking lesson access: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Manually set progress for demo purposes
     */
    public function setDemoProgress($userId, $courseId, $progressPercentage)
    {
        return $this->updateEnrollmentProgress($userId, $courseId, [
            'progress_percentage' => $progressPercentage
        ]);
    }

    /**
     * Add student to certificate queue and auto-generate certificate
     * When progress reaches 100%, automatically generate and approve primary certificate
     */
    public function addToCertificateQueue($enrollment)
    {
        $course = $enrollment->course;

        if (!$course->has_certificate) {
            return;
        }

        // Check if primary certificate already exists
        $existingQueue = CertificateQueue::where('user_id', $enrollment->user_id)
            ->where('course_id', $enrollment->course_id)
            ->where('is_primary', true)
            ->first();

        if ($existingQueue) {
            // Update existing queue entry with latest meeting stats
            $this->updateCertificateQueueMeetingStats($existingQueue);
            return;
        }

        // Calculate meeting attendance stats
        $totalMeetings = $course->meetings()->count();
        $attendedCount = 0;

        if ($totalMeetings > 0) {
            $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
                ->where('user_id', $enrollment->user_id)
                ->where('attended', true)
                ->count();
        }

        // Create primary certificate queue entry with approved status
        $certificateQueue = CertificateQueue::create([
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'certificate_type' => 'auto_generated',
            'is_primary' => true,
            'status' => 'approved', // Auto-approve when 100% completed
            'auto_approved' => true,
            'completed_at' => $enrollment->completed_at ?? now(),
            'approved_at' => now(),
            'all_meetings_attended' => $totalMeetings > 0 && $attendedCount === $totalMeetings,
            'meetings_attended_count' => $attendedCount,
            'total_meetings_count' => $totalMeetings,
        ]);

        // Auto-generate PDF certificate
        try {
            $certificateGenerator = new CertificateGeneratorService();
            $certificatePath = $certificateGenerator->generate($certificateQueue);

            if ($certificatePath) {
                // Update queue with generated certificate path
                $certificateQueue->update([
                    'certificate_file' => $certificatePath,
                    'auto_generated_certificate_path' => $certificatePath,
                ]);

                // Update enrollment with certificate info
                $enrollment->update([
                    'certificate_issued_at' => now(),
                    'certificate_file' => $certificatePath,
                ]);

                // Send notification to student
                $student = User::find($enrollment->user_id);
                if ($student) {
                    $student->notify(new CertificateAvailable($course, $enrollment, $certificatePath));
                }

                Log::info("Auto-generated and approved certificate for user {$enrollment->user_id} in course {$course->id}");
            } else {
                // If generation failed, revert to pending status
                $certificateQueue->update([
                    'status' => 'pending',
                    'auto_approved' => false,
                    'approved_at' => null,
                ]);
                Log::error("Failed to auto-generate certificate for user {$enrollment->user_id} in course {$course->id}");
            }
        } catch (\Exception $e) {
            Log::error("Error auto-generating certificate: " . $e->getMessage());
            // Revert to pending on error
            $certificateQueue->update([
                'status' => 'pending',
                'auto_approved' => false,
                'approved_at' => null,
            ]);
        }
    }

    /**
     * Update meeting statistics in certificate queue entry
     */
    private function updateCertificateQueueMeetingStats($queueEntry)
    {
        $course = $queueEntry->course;
        $userId = $queueEntry->user_id;

        $totalMeetings = $course->meetings()->count();
        $attendedCount = 0;

        if ($totalMeetings > 0) {
            $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
                ->where('user_id', $userId)
                ->where('attended', true)
                ->count();
        }

        $queueEntry->update([
            'all_meetings_attended' => $totalMeetings > 0 && $attendedCount === $totalMeetings,
            'meetings_attended_count' => $attendedCount,
            'total_meetings_count' => $totalMeetings,
        ]);
    }

    /**
     * Create demo progress for testing
     */
    public function createDemoProgress()
    {
        try {
            // Get some special students
            $specialStudents = User::where('user_type', 'special')
                ->with('enrollments')
                ->limit(5)
                ->get();

            foreach ($specialStudents as $student) {
                foreach ($student->enrollments as $enrollment) {
                    // Set random progress between 10-90%
                    $progress = rand(10, 90);
                    $this->setDemoProgress($student->id, $enrollment->course_id, $progress);
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error creating demo progress: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get detailed progress information for a user in a course
     * Used for certificate modal and progress tracking
     */
    public function getUserProgress($userId, $courseId)
    {
        try {
            $course = Course::with(['sections.lessons', 'sections.quizzes', 'sections.assignments'])->find($courseId);
            $enrollment = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->first();

            if (!$course || !$enrollment) {
                return null;
            }

            // Calculate lessons progress
            $totalLessons = 0;
            $completedLessons = 0;

            foreach ($course->sections as $section) {
                $totalLessons += $section->lessons->count();
            }

            if ($totalLessons > 0) {
                // Combine lesson_completions and lesson_access for backward compatibility
                $fromCompletions = DB::table('lesson_completions')
                    ->join('lessons', 'lesson_completions.lesson_id', '=', 'lessons.id')
                    ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
                    ->where('course_sections.course_id', $courseId)
                    ->where('lesson_completions.user_id', $userId)
                    ->whereNotNull('lesson_completions.completed_at')
                    ->pluck('lesson_completions.lesson_id')
                    ->toArray();

                $fromAccess = DB::table('lesson_access')
                    ->join('lessons', 'lesson_access.lesson_id', '=', 'lessons.id')
                    ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
                    ->where('course_sections.course_id', $courseId)
                    ->where('lesson_access.user_id', $userId)
                    ->pluck('lesson_access.lesson_id')
                    ->toArray();

                $completedLessons = count(array_unique(array_merge($fromCompletions, $fromAccess)));
            }

            // Calculate quizzes progress
            $totalQuizzes = 0;
            $completedQuizzes = 0;

            foreach ($course->sections as $section) {
                $totalQuizzes += $section->quizzes->count();
            }

            if ($totalQuizzes > 0) {
                $completedQuizzes = DB::table('quiz_attempts')
                    ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                    ->join('course_sections', 'quizzes.section_id', '=', 'course_sections.id')
                    ->where('course_sections.course_id', $courseId)
                    ->where('quiz_attempts.user_id', $userId)
                    ->where('quiz_attempts.status', 'completed')
                    ->where('quiz_attempts.is_passed', true)
                    ->distinct('quiz_attempts.quiz_id')
                    ->count('quiz_attempts.quiz_id');
            }

            // Calculate assignments progress
            $totalAssignments = 0;
            $completedAssignments = 0;

            foreach ($course->sections as $section) {
                $totalAssignments += $section->assignments->count();
            }

            if ($totalAssignments > 0) {
                $completedAssignments = DB::table('assignment_submissions')
                    ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
                    ->join('course_sections', 'assignments.section_id', '=', 'course_sections.id')
                    ->where('course_sections.course_id', $courseId)
                    ->where('assignment_submissions.user_id', $userId)
                    ->whereIn('assignment_submissions.status', ['submitted', 'graded'])
                    ->distinct('assignment_submissions.assignment_id')
                    ->count('assignment_submissions.assignment_id');
            }

            // Calculate overall completion
            $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;
            $completedItems = $completedLessons + $completedQuizzes + $completedAssignments;

            // Include zoom screenshot in calculation if course requires it
            $zoomScreenshotRequired = $course->require_zoom_screenshot ?? false;
            $zoomScreenshotUploaded = !empty($enrollment->zoom_screenshot_path);

            if ($zoomScreenshotRequired) {
                $totalItems += 1;
                if ($zoomScreenshotUploaded) {
                    $completedItems += 1;
                }
            }

            $overallCompletion = $totalItems > 0
                ? round(($completedItems / $totalItems) * 100, 2)
                : 0;

            return [
                'enrollment' => $enrollment,
                'overall_completion' => $overallCompletion,
                'lessons' => [
                    'total' => $totalLessons,
                    'completed' => $completedLessons,
                    'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0,
                ],
                'quizzes' => [
                    'total' => $totalQuizzes,
                    'completed' => $completedQuizzes,
                    'percentage' => $totalQuizzes > 0 ? round(($completedQuizzes / $totalQuizzes) * 100, 2) : 0,
                ],
                'assignments' => [
                    'total' => $totalAssignments,
                    'completed' => $completedAssignments,
                    'percentage' => $totalAssignments > 0 ? round(($completedAssignments / $totalAssignments) * 100, 2) : 0,
                ],
                'zoom_screenshot' => [
                    'required' => $zoomScreenshotRequired,
                    'uploaded' => $zoomScreenshotUploaded,
                    'percentage' => $zoomScreenshotRequired ? ($zoomScreenshotUploaded ? 100 : 0) : 100,
                ],
                'is_complete' => $overallCompletion >= 100,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting user progress: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate course progress based on lessons, quizzes, and assignments completion
     * Uses sections-based counting for consistency with Learn page
     * Returns progress percentage (0-100)
     */
    public function calculateCourseProgress($userId, $courseId)
    {
        try {
            // Load course with sections (consistent with Learn page)
            $course = Course::with([
                'sections' => function($query) {
                    $query->orderBy('sort_order')->with([
                        'lessons' => function($q) { $q->orderBy('sort_order'); },
                        'quizzes' => function($q) { $q->orderBy('sort_order'); },
                        'assignments' => function($q) { $q->orderBy('sort_order'); },
                    ]);
                }
            ])->find($courseId);

            if (!$course) {
                Log::warning("Course {$courseId} not found for progress calculation");
                return 0;
            }

            // Get enrollment for zoom screenshot check
            $enrollment = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->first();

            // Collect all IDs and count totals from sections
            $allLessonIds = collect();
            $allQuizIds = collect();
            $allAssignmentIds = collect();
            $totalLessons = 0;
            $totalQuizzes = 0;
            $totalAssignments = 0;

            foreach ($course->sections as $section) {
                $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
                $allQuizIds = $allQuizIds->merge($section->quizzes->pluck('id'));
                $allAssignmentIds = $allAssignmentIds->merge($section->assignments->pluck('id'));
                $totalLessons += $section->lessons->count();
                $totalQuizzes += $section->quizzes->count();
                $totalAssignments += $section->assignments->count();
            }

            $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;

            // Add zoom screenshot to total if required
            if ($course->require_zoom_screenshot) {
                $totalItems += 1;
            }

            if ($totalItems === 0) {
                return 0; // No content to complete
            }

            // Count completed lessons (combine lesson_completions and lesson_access for backward compatibility)
            $fromCompletions = DB::table('lesson_completions')
                ->where('user_id', $userId)
                ->whereIn('lesson_id', $allLessonIds)
                ->whereNotNull('completed_at')
                ->pluck('lesson_id')
                ->toArray();

            $fromAccess = DB::table('lesson_access')
                ->where('user_id', $userId)
                ->whereIn('lesson_id', $allLessonIds)
                ->pluck('lesson_id')
                ->toArray();

            $completedLessons = count(array_unique(array_merge($fromCompletions, $fromAccess)));

            // Count completed quizzes (must be PASSED)
            $completedQuizzes = \App\Models\QuizAttempt::where('user_id', $userId)
                ->whereIn('quiz_id', $allQuizIds)
                ->where('status', 'completed')
                ->where('is_passed', true)
                ->distinct('quiz_id')
                ->count('quiz_id');

            // Count completed assignments
            $completedAssignments = \App\Models\AssignmentSubmission::where('user_id', $userId)
                ->whereIn('assignment_id', $allAssignmentIds)
                ->whereIn('status', ['submitted', 'graded'])
                ->distinct('assignment_id')
                ->count('assignment_id');

            $completedItems = $completedLessons + $completedQuizzes + $completedAssignments;

            // Add zoom screenshot to completed if uploaded
            if ($course->require_zoom_screenshot && $enrollment && $enrollment->zoom_screenshot_path) {
                $completedItems += 1;
            }

            return round(($completedItems / $totalItems) * 100, 2);

        } catch (\Exception $e) {
            Log::error('Error calculating course progress: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Check if a specific content item is accessible (not locked) based on sequential order.
     * Returns true if accessible, false if locked.
     *
     * @param int $userId
     * @param int $courseId
     * @param string $contentType 'lesson', 'quiz', or 'assignment'
     * @param int $contentId
     * @return bool
     */
    public function isContentAccessible($userId, $courseId, $contentType, $contentId)
    {
        try {
            $course = Course::with([
                'sections' => function($query) {
                    $query->orderBy('sort_order')->with([
                        'lessons' => function($q) { $q->where('is_published', true)->orderBy('sort_order'); },
                        'quizzes' => function($q) { $q->where('is_published', true)->orderBy('sort_order'); },
                        'assignments' => function($q) { $q->where('is_published', true)->orderBy('sort_order'); },
                    ]);
                }
            ])->find($courseId);

            if (!$course) return false;

            // Get all completion data
            $allLessonIds = collect();
            foreach ($course->sections as $section) {
                $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
            }

            // Combine lesson_completions and lesson_access for comprehensive completion tracking
            // This ensures backward compatibility with older data
            $fromCompletions = DB::table('lesson_completions')
                ->where('user_id', $userId)
                ->whereIn('lesson_id', $allLessonIds)
                ->whereNotNull('completed_at')
                ->pluck('lesson_id')
                ->toArray();

            $fromAccess = DB::table('lesson_access')
                ->where('user_id', $userId)
                ->whereIn('lesson_id', $allLessonIds)
                ->pluck('lesson_id')
                ->toArray();

            $completedLessonIds = array_values(array_unique(array_merge($fromCompletions, $fromAccess)));

            $passedQuizIds = \App\Models\QuizAttempt::where('user_id', $userId)
                ->whereHas('quiz', function($q) use ($courseId) {
                    $q->where('course_id', $courseId);
                })
                ->where('status', 'completed')
                ->where('is_passed', true)
                ->pluck('quiz_id')
                ->unique()
                ->toArray();

            $submittedAssignmentIds = \App\Models\AssignmentSubmission::where('user_id', $userId)
                ->whereHas('assignment', function($q) use ($courseId) {
                    $q->where('course_id', $courseId);
                })
                ->whereIn('status', ['submitted', 'graded'])
                ->pluck('assignment_id')
                ->unique()
                ->toArray();

            // Build content order
            $previousCompleted = true;
            foreach ($course->sections as $section) {
                $sectionItems = [];

                foreach ($section->lessons as $lesson) {
                    $sectionItems[] = ['type' => 'lesson', 'id' => $lesson->id, 'sort_order' => $lesson->sort_order, 'type_priority' => 1];
                }
                foreach ($section->quizzes as $quiz) {
                    $sectionItems[] = ['type' => 'quiz', 'id' => $quiz->id, 'sort_order' => $quiz->sort_order, 'type_priority' => 2];
                }
                foreach ($section->assignments as $assignment) {
                    $sectionItems[] = ['type' => 'assignment', 'id' => $assignment->id, 'sort_order' => $assignment->sort_order, 'type_priority' => 3];
                }

                usort($sectionItems, function($a, $b) {
                    if ($a['type_priority'] !== $b['type_priority']) {
                        return $a['type_priority'] - $b['type_priority'];
                    }
                    return $a['sort_order'] - $b['sort_order'];
                });

                foreach ($sectionItems as $item) {
                    // Check if this is the target content
                    if ($item['type'] === $contentType && $item['id'] === $contentId) {
                        return $previousCompleted; // accessible if previous was completed
                    }

                    // Check completion status
                    switch ($item['type']) {
                        case 'lesson':
                            $previousCompleted = in_array($item['id'], $completedLessonIds);
                            break;
                        case 'quiz':
                            $previousCompleted = in_array($item['id'], $passedQuizIds);
                            break;
                        case 'assignment':
                            $previousCompleted = in_array($item['id'], $submittedAssignmentIds);
                            break;
                    }
                }
            }

            return true; // If content not found in course, allow access
        } catch (\Exception $e) {
            Log::error('Error checking content accessibility: ' . $e->getMessage());
            return true; // On error, allow access to avoid blocking students
        }
    }
}