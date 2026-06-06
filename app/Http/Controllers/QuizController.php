<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use App\Notifications\QuizCompleted;
use App\Notifications\Admin\NewQuizAttempt;
use Illuminate\Support\Facades\Notification;
use App\Services\ProgressTrackingService;

class QuizController extends Controller
{
    /**
     * Show a quiz for student access
     */
    public function show(Quiz $quiz)
    {
        $user = Auth::user();
        
        // Load quiz with course and section
        $quiz->load([
            'course',
            'section',
            'questions' => function($query) {
                $query->orderBy('sort_order');
            }
        ]);
        
        // Check if user is enrolled in the course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $quiz->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            abort(403, 'You need to be enrolled in this course to access this quiz.');
        }

        // Check if quiz is published
        if (!$quiz->is_published) {
            abort(404, 'Quiz not found or not available.');
        }

        // Check sequential access
        $progressService = new ProgressTrackingService();
        if (!$progressService->isContentAccessible($user->id, $quiz->course_id, 'quiz', $quiz->id)) {
            return redirect()->route('courses.learn', $quiz->course->slug)
                ->with('error', 'Anda harus menyelesaikan materi sebelumnya terlebih dahulu sebelum mengakses kuis ini.');
        }

        // Check availability dates
        if ($quiz->available_from && now() < $quiz->available_from) {
            abort(403, 'Quiz is not yet available.');
        }

        if ($quiz->available_until && now() > $quiz->available_until) {
            abort(403, 'Quiz is no longer available.');
        }

        // Get user's previous attempts
        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get best attempt (highest score)
        $bestAttempt = $attempts->where('status', 'completed')->sortByDesc('percentage')->first();

        // Check if user can take the quiz
        $canTakeQuiz = true;
        $attemptCount = $attempts->count();
        $maxAttempts = $quiz->attempts_allowed;
        $canRetakeUntilPass = false;
        $retakeMessage = null;

        // Check if student has passed
        $hasPassed = $bestAttempt && $bestAttempt->is_passed;

        // Logic for retake until pass feature
        if ($quiz->allow_retake_until_pass && !$hasPassed) {
            // Student can retake until they pass
            if ($quiz->max_retake_attempts !== null) {
                // Has max retake limit
                if ($attemptCount >= $quiz->max_retake_attempts) {
                    $canTakeQuiz = false;
                    $canRetakeUntilPass = false;
                    $retakeMessage = "You have reached the maximum retake limit ({$quiz->max_retake_attempts} attempts) for this quiz.";
                } else {
                    $canTakeQuiz = true;
                    $canRetakeUntilPass = true;
                    $retakeMessage = "You can retake this quiz until you pass (max {$quiz->max_retake_attempts} attempts).";
                }
            } else {
                // Unlimited retakes until pass
                $canTakeQuiz = true;
                $canRetakeUntilPass = true;
                $retakeMessage = "You can retake this quiz until you pass (unlimited attempts).";
            }
        } else {
            // Standard attempts logic
            if ($maxAttempts > 0 && $attemptCount >= $maxAttempts) {
                $canTakeQuiz = false;
                if (!$hasPassed) {
                    $retakeMessage = "You have reached the maximum number of attempts ({$maxAttempts}) for this quiz.";
                }
            }
        }
        
        // Check if there's an active attempt
        $activeAttempt = $attempts->where('status', 'in_progress')->first();
        
        return Inertia::render('Student/QuizView', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'instructions' => $quiz->instructions,
                'time_limit' => $quiz->time_limit,
                'attempts_allowed' => $quiz->attempts_allowed,
                'passing_score' => $quiz->passing_score,
                'randomize_questions' => $quiz->randomize_questions,
                'show_correct_answers' => $quiz->show_correct_answers,
                'show_results_immediately' => $quiz->show_results_immediately,
                'allow_retake_until_pass' => $quiz->allow_retake_until_pass,
                'max_retake_attempts' => $quiz->max_retake_attempts,
                'available_from' => $quiz->available_from,
                'available_until' => $quiz->available_until,
                'questions_count' => $quiz->questions->count(),
                'course' => [
                    'id' => $quiz->course->id,
                    'title' => $quiz->course->title,
                    'slug' => $quiz->course->slug
                ],
                'section' => [
                    'id' => $quiz->section->id,
                    'title' => $quiz->section->title
                ]
            ],
            'attempts' => $attempts->map(function($attempt) {
                return [
                    'id' => $attempt->id,
                    'attempt_number' => $attempt->attempt_number,
                    'score' => $attempt->score,
                    'percentage' => $attempt->percentage,
                    'is_passed' => $attempt->is_passed,
                    'status' => $attempt->status,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                    'time_taken' => $attempt->time_taken
                ];
            }),
            'canTakeQuiz' => $canTakeQuiz,
            'attemptCount' => $attemptCount,
            'canRetakeUntilPass' => $canRetakeUntilPass,
            'retakeMessage' => $retakeMessage,
            'hasPassed' => $hasPassed,
            'bestAttempt' => $bestAttempt ? [
                'score' => $bestAttempt->score,
                'percentage' => $bestAttempt->percentage,
                'is_passed' => $bestAttempt->is_passed
            ] : null,
            'activeAttempt' => $activeAttempt ? [
                'id' => $activeAttempt->id,
                'started_at' => $activeAttempt->started_at
            ] : null,
            'enrollment' => [
                'id' => $enrollment->id,
                'progress_percentage' => $enrollment->progress_percentage
            ]
        ]);
    }
    
    /**
     * Start a new quiz attempt
     */
    public function start(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        
        // Check if user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $quiz->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            // Check if user has special access
            if ($user->user_type === 'special' && $user->accessible_courses && is_array($user->accessible_courses)) {
                if (in_array($quiz->course_id, $user->accessible_courses)) {
                    // Auto-enroll the student
                    try {
                        $enrollment = Enrollment::create([
                            'user_id' => $user->id,
                            'course_id' => $quiz->course_id,
                            'status' => 'active',
                            'enrolled_at' => now(),
                            'enrollment_type' => 'group_assigned'
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to auto-enroll special student: ' . $e->getMessage());
                        return response()->json(['error' => 'Failed to enroll in course'], 500);
                    }
                }
            }

            if (!$enrollment) {
                return response()->json(['error' => 'You are not enrolled in this course. Please enroll first.'], 403);
            }
        }
        
        // Check if quiz is available
        if (!$quiz->is_published) {
            return response()->json(['error' => 'Quiz not available'], 404);
        }

        if ($quiz->available_from && now() < $quiz->available_from) {
            return response()->json(['error' => 'Quiz is not yet available'], 403);
        }

        if ($quiz->available_until && now() > $quiz->available_until) {
            return response()->json(['error' => 'Quiz is no longer available'], 403);
        }

        // Check sequential access - quiz must be unlocked
        $progressService = new ProgressTrackingService();
        if (!$progressService->isContentAccessible($user->id, $quiz->course_id, 'quiz', $quiz->id)) {
            return response()->json(['error' => 'Anda harus menyelesaikan materi sebelumnya terlebih dahulu sebelum mengerjakan kuis ini.'], 403);
        }

        // Check attempts limit with retake until pass logic
        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->get();

        $attemptCount = $attempts->count();
        $bestAttempt = $attempts->where('status', 'completed')->sortByDesc('percentage')->first();
        $hasPassed = $bestAttempt && $bestAttempt->is_passed;

        // Apply retake until pass logic
        if ($quiz->allow_retake_until_pass && !$hasPassed) {
            // Student can retake until they pass
            if ($quiz->max_retake_attempts !== null) {
                if ($attemptCount >= $quiz->max_retake_attempts) {
                    return response()->json([
                        'error' => "You have reached the maximum retake limit ({$quiz->max_retake_attempts} attempts) for this quiz."
                    ], 400);
                }
            }
            // Otherwise allow unlimited retakes until pass
        } else {
            // Standard attempts logic
            if ($quiz->attempts_allowed > 0 && $attemptCount >= $quiz->attempts_allowed) {
                return response()->json(['error' => 'Maximum attempts reached'], 400);
            }
        }
        
        // Check for active attempt
        $activeAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->where('status', 'in_progress')
            ->first();
            
        if ($activeAttempt) {
            return response()->json(['error' => 'You already have an active attempt'], 400);
        }
        
        // Create new attempt
        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'attempt_number' => $attemptCount + 1,
            'status' => 'in_progress',
            'started_at' => now()
        ]);
        
        // Get quiz questions
        if ($quiz->randomize_questions) {
            $questions = QuizQuestion::where('quiz_id', $quiz->id)
                ->inRandomOrder()
                ->get();
        } else {
            $questions = QuizQuestion::where('quiz_id', $quiz->id)
                ->orderBy('sort_order')
                ->get();
        }

        // Check if quiz has questions
        if ($questions->isEmpty()) {
            return response()->json(['error' => 'This quiz has no questions. Please contact the instructor.'], 400);
        }
        
        return response()->json([
            'success' => true,
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'started_at' => $attempt->started_at,
                'time_limit' => $quiz->time_limit
            ],
            'questions' => $questions->map(function($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question,
                    'type' => $question->type,
                    'options' => $question->options,
                    'points' => $question->points,
                    'image' => $question->image
                ];
            })
        ]);
    }

    /**
     * Show quiz taking interface
     */
    public function take(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        $attemptId = $request->get('attempt');

        // Get the attempt
        $attempt = QuizAttempt::where('id', $attemptId)
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$attempt) {
            return redirect()->route('quizzes.show', $quiz->id)
                ->with('error', 'Invalid or expired quiz attempt.');
        }

        // Check if time limit has expired
        if ($quiz->time_limit) {
            $timeElapsed = now()->diffInMinutes($attempt->started_at);
            if ($timeElapsed > $quiz->time_limit) {
                // Auto-submit if time is up
                $timeTaken = max(0, now()->diffInSeconds($attempt->started_at)); // Ensure non-negative

                $attempt->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'time_taken' => $timeTaken,
                    'answers' => $attempt->answers ?? []
                ]);

                return redirect()->route('quizzes.result', [$quiz->id, $attempt->id])
                    ->with('error', 'Time limit exceeded. Quiz has been automatically submitted.');
            }
        }

        // Load quiz with course and questions
        $quiz->load(['course', 'section']);

        // Get quiz questions in order
        if ($quiz->randomize_questions) {
            $questions = QuizQuestion::where('quiz_id', $quiz->id)
                ->inRandomOrder()
                ->get();
        } else {
            $questions = QuizQuestion::where('quiz_id', $quiz->id)
                ->orderBy('sort_order')
                ->get();
        }

        return Inertia::render('Student/QuizTake', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'time_limit' => $quiz->time_limit,
                'course' => [
                    'id' => $quiz->course->id,
                    'title' => $quiz->course->title,
                    'slug' => $quiz->course->slug
                ]
            ],
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'started_at' => $attempt->started_at
            ],
            'questions' => $questions->map(function($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question,
                    'type' => $question->type,
                    'options' => $question->options,
                    'points' => $question->points,
                    'image' => $question->image
                ];
            })
        ]);
    }

    /**
     * Submit quiz answers
     */
    public function submit(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        
        // Validate request
        $request->validate([
            'attempt_id' => 'required|exists:quiz_attempts,id',
            'answers' => 'required|array',
            'time_expired' => 'nullable|boolean'
        ]);

        // Get the attempt
        $attempt = QuizAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$attempt) {
            return response()->json(['error' => 'Invalid or expired attempt'], 404);
        }

        // Check time limit with more precise validation
        if ($quiz->time_limit) {
            $startTime = new \DateTime($attempt->started_at);
            $currentTime = new \DateTime();
            $timeElapsedSeconds = $currentTime->getTimestamp() - $startTime->getTimestamp();
            $timeLimitSeconds = $quiz->time_limit * 60;

            // Allow 10 seconds grace period for network latency
            $gracePeriod = 10;

            // If time expired flag is set (auto-submit), allow it even if slightly over
            // Otherwise, enforce strict time limit with grace period
            if (!$request->time_expired && $timeElapsedSeconds > ($timeLimitSeconds + $gracePeriod)) {
                \Log::warning('Quiz submission rejected: Time limit exceeded', [
                    'quiz_id' => $quiz->id,
                    'attempt_id' => $attempt->id,
                    'time_elapsed' => $timeElapsedSeconds,
                    'time_limit' => $timeLimitSeconds,
                    'user_id' => $user->id
                ]);
                return response()->json([
                    'error' => 'Time limit exceeded. Your quiz has been automatically submitted.',
                    'time_elapsed' => $timeElapsedSeconds,
                    'time_limit' => $timeLimitSeconds
                ], 400);
            }

            // Log auto-submit for monitoring
            if ($request->time_expired) {
                \Log::info('Quiz auto-submitted due to time expiration', [
                    'quiz_id' => $quiz->id,
                    'attempt_id' => $attempt->id,
                    'user_id' => $user->id,
                    'time_elapsed' => $timeElapsedSeconds
                ]);
            }
        }
        
        // Get quiz questions with correct answers
        $questions = QuizQuestion::where('quiz_id', $quiz->id)->get()->keyBy('id');
        
        // Calculate score
        $totalScore = 0;
        $totalPoints = $questions->sum('points');
        $correctAnswers = 0;
        
        foreach ($request->answers as $questionId => $userAnswer) {
            $question = $questions->get($questionId);
            if (!$question) continue;
            
            $isCorrect = $question->checkAnswer($userAnswer);
            
            if ($isCorrect) {
                $totalScore += $question->points;
                $correctAnswers++;
            }
        }
        
        // Calculate percentage
        $percentage = $totalPoints > 0 ? ($totalScore / $totalPoints) * 100 : 0;
        $isPassed = $percentage >= $quiz->passing_score;
        
        // Update attempt
        $timeTaken = max(0, now()->diffInSeconds($attempt->started_at)); // Ensure non-negative

        $attempt->update([
            'score' => $totalScore,
            'percentage' => round($percentage, 2),
            'is_passed' => $isPassed,
            'status' => 'completed',
            'completed_at' => now(),
            'time_taken' => $timeTaken,
            'answers' => $request->answers
        ]);

        // Update enrollment progress using ProgressTrackingService
        // Use calculateCourseProgress for consistent progress calculation across the system
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $quiz->course_id)
            ->first();

        if ($enrollment) {
            try {
                $progressService = new ProgressTrackingService();
                $newProgress = $progressService->calculateCourseProgress($user->id, $quiz->course_id);

                // Update enrollment progress (will auto-add to certificate queue if reaches 100%)
                $progressService->updateEnrollmentProgress($user->id, $quiz->course_id, [
                    'progress_percentage' => $newProgress
                ]);
            } catch (\Exception $e) {
                Log::error('Error updating enrollment progress after quiz completion: ' . $e->getMessage());
            }
        }

        // Send notification to student
        $user->notify(new QuizCompleted($quiz, $attempt));

        // Send notification to all admins
        $admins = User::whereHas('roles', function($q) {
            $q->where('name', 'admin');
        })->get();
        Notification::send($admins, new NewQuizAttempt($quiz, $attempt, $user));

        return response()->json([
            'success' => true,
            'attempt' => [
                'id' => $attempt->id,
                'score' => $totalScore,
                'percentage' => round($percentage, 2),
                'is_passed' => $isPassed,
                'correct_answers' => $correctAnswers,
                'total_questions' => $questions->count()
            ]
        ]);
    }
    
    /**
     * Show quiz result
     */
    public function result(Quiz $quiz, QuizAttempt $attempt)
    {
        try {
            $user = Auth::user();

            // Check if attempt belongs to user
            if ($attempt->user_id !== $user->id || $attempt->quiz_id !== $quiz->id) {
                // Instead of showing 403, redirect to user's latest attempt for this quiz
                $userLatestAttempt = QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('status', 'completed')
                    ->orderBy('id', 'desc')
                    ->first();

                if ($userLatestAttempt) {
                    return redirect()->route('quizzes.result', [$quiz->id, $userLatestAttempt->id])
                        ->with('info', 'Redirected to your latest quiz attempt.');
                } else {
                    // User has no completed attempts for this quiz
                    return redirect()->route('quizzes.show', $quiz->id)
                        ->with('error', 'You have no completed attempts for this quiz.');
                }
            }

            // Check if attempt is completed
            if ($attempt->status !== 'completed') {
                return redirect()->route('quizzes.show', $quiz->id)
                    ->with('error', 'This quiz attempt is not completed yet.');
            }

            // Load quiz and questions
            $quiz->load(['course', 'section']);
            $questions = QuizQuestion::where('quiz_id', $quiz->id)->get()->keyBy('id');

            // Build questions array for frontend
            $questionsData = null;
            if ($quiz->show_correct_answers && $questions->isNotEmpty()) {
                $questionsData = $questions->map(function($question) use ($attempt) {
                    $userAnswer = $attempt->answers[$question->id] ?? null;
                    return [
                        'id' => $question->id,
                        'question' => $question->question,
                        'type' => $question->type,
                        'options' => $question->options,
                        'correct_answers' => $question->correct_answers,
                        'user_answer' => $userAnswer,
                        'is_correct' => $question->checkAnswer($userAnswer),
                        'explanation' => $question->explanation
                    ];
                })->values()->toArray();
            }

            return Inertia::render('Student/QuizResult', [
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'passing_score' => $quiz->passing_score,
                    'show_correct_answers' => $quiz->show_correct_answers,
                    'course' => [
                        'id' => $quiz->course->id,
                        'title' => $quiz->course->title,
                        'slug' => $quiz->course->slug
                    ]
                ],
                'attempt' => [
                    'id' => $attempt->id,
                    'attempt_number' => $attempt->attempt_number,
                    'score' => $attempt->score,
                    'percentage' => $attempt->percentage,
                    'is_passed' => $attempt->is_passed,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                    'time_taken' => $attempt->time_taken
                ],
                'questions' => $questionsData
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing quiz result: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Fallback: redirect to quiz view if there's any error
            return redirect()->route('quizzes.show', $quiz->id)
                ->with('error', 'Unable to load quiz results. Please try again.');
        }
    }

    /**
     * DEPRECATED: This method is no longer used.
     * Use $question->checkAnswer($userAnswer) instead, which includes smart matching.
     *
     * The QuizQuestion model has a more sophisticated checkAnswer() method that:
     * - Handles multiple choice with proper array comparison
     * - True/false with case-insensitive matching
     * - Text/fill_blank with smart matching (exact, contains, word-by-word)
     *
     * This method is kept for reference but should not be called.
     */
    private function checkAnswer_DEPRECATED($question, $userAnswer)
    {
        if ($userAnswer === null || $userAnswer === '') return false;

        $correctAnswers = $question->correct_answers;
        if (!$correctAnswers || !is_array($correctAnswers)) return false;

        switch ($question->type) {
            case 'multiple_choice':
                // Handle both string and numeric comparisons
                return in_array($userAnswer, $correctAnswers) ||
                       in_array((string)$userAnswer, array_map('strval', $correctAnswers)) ||
                       in_array((int)$userAnswer, array_map('intval', $correctAnswers));

            case 'true_false':
                return in_array(strtolower(trim($userAnswer)), array_map('strtolower', $correctAnswers));

            case 'fill_blank':
            case 'text':
                // Handle both fill_blank and text type questions
                return in_array(strtolower(trim($userAnswer)), array_map('strtolower', $correctAnswers));

            case 'essay':
                // Essays need manual grading
                return false;

            case 'matching':
                // Simple matching check - would need more complex logic for real implementation
                return json_encode($userAnswer) === json_encode($correctAnswers);

            default:
                return false;
        }
    }
}
