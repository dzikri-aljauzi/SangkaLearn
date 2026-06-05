<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Notifications\AssignmentGraded;

class AssignmentMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $query = Assignment::with(['course', 'section', 'submissions' => function($q) {
            $q->with(['user', 'assignment']);
        }]);

        // Filter by course
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        // Search by title
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $assignments = $query->latest()->paginate(10)->withQueryString();

        // Get statistics for each assignment
        $assignments->getCollection()->transform(function ($assignment) {
            $assignment->stats = [
                'total_submissions' => $assignment->submissions->count(),
                'graded_submissions' => $assignment->submissions->whereNotNull('grade')->count(),
                'ungraded_submissions' => $assignment->submissions->whereNull('grade')->count(),
                'average_score' => $assignment->submissions->whereNotNull('grade')->avg('grade'),
            ];
            return $assignment;
        });

        $courses = Course::select('id', 'title')->get();

        return Inertia::render('Admin/AssignmentMonitoring/Index', [
            'assignments' => $assignments,
            'courses' => $courses,
            'filters' => [
                'search' => $request->search,
                'course_id' => $request->course_id,
            ]
        ]);
    }

    public function show($id)
    {
        $assignment = Assignment::with([
            'course',
            'section',
            'submissions' => function($q) {
                $q->with(['user', 'assignment'])
                  ->latest('submitted_at');
            }
        ])->findOrFail($id);

        // Transform submissions to include additional data
        $processedSubmissions = $assignment->submissions->map(function($submission) use ($assignment) {
            // Get first attachment if exists (for backward compatibility with file_path)
            $firstAttachment = null;
            if ($submission->attachments && is_array($submission->attachments) && count($submission->attachments) > 0) {
                $firstAttachment = $submission->attachments[0];
            }

            return [
                'id' => $submission->id,
                'user' => [
                    'id' => $submission->user->id,
                    'name' => $submission->user->first_name . ' ' . $submission->user->last_name,
                    'email' => $submission->user->email,
                ],
                'content' => $submission->content,
                'attachments' => $submission->attachments ?? [],
                'file_path' => $firstAttachment['path'] ?? null,
                'original_filename' => $firstAttachment['name'] ?? null,
                'submitted_at' => $submission->submitted_at,
                'grade' => $submission->grade,
                'feedback' => $submission->feedback,
                'graded_at' => $submission->graded_at,
                'is_late' => $submission->submitted_at && $assignment->due_date
                    ? $submission->submitted_at->gt($assignment->due_date)
                    : false,
                'status' => $submission->grade !== null ? 'graded' : 'pending',
            ];
        });

        // Get submission statistics
        $stats = [
            'total_submissions' => $assignment->submissions->count(),
            'graded_submissions' => $assignment->submissions->whereNotNull('grade')->count(),
            'ungraded_submissions' => $assignment->submissions->whereNull('grade')->count(),
            'on_time_submissions' => $assignment->due_date
                ? $assignment->submissions->filter(fn($s) => $s->submitted_at && $s->submitted_at->lte($assignment->due_date))->count()
                : $assignment->submissions->count(),
            'late_submissions' => $assignment->due_date
                ? $assignment->submissions->filter(fn($s) => $s->submitted_at && $s->submitted_at->gt($assignment->due_date))->count()
                : 0,
            'average_score' => round($assignment->submissions->whereNotNull('grade')->avg('grade') ?? 0, 2),
            'highest_score' => $assignment->submissions->whereNotNull('grade')->max('grade') ?? 0,
            'lowest_score' => $assignment->submissions->whereNotNull('grade')->min('grade') ?? 0,
        ];

        return Inertia::render('Admin/AssignmentMonitoring/Show', [
            'assignment' => $assignment,
            'submissions' => $processedSubmissions,
            'stats' => $stats
        ]);
    }

    public function gradeSubmission(Request $request, $assignmentId, $submissionId)
    {
        $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $submission = AssignmentSubmission::where('assignment_id', $assignmentId)
            ->where('id', $submissionId)
            ->firstOrFail();

        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
            'graded_at' => now(),
            'graded_by' => auth()->id(),
        ]);

        // Send notification to student
        $assignment = Assignment::find($assignmentId);
        $student = User::find($submission->user_id);
        if ($assignment && $student) {
            $student->notify(new AssignmentGraded($assignment, $submission));
        }

        return back()->with('success', 'Assignment graded successfully!');
    }

    public function downloadSubmission(Request $request, $assignmentId, $submissionId)
    {
        try {
            $submission = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->where('id', $submissionId)
                ->firstOrFail();

            // Check if submission has attachments
            if (!$submission->attachments || !is_array($submission->attachments) || count($submission->attachments) === 0) {
                \Log::error('No attachments found', ['submission_id' => $submissionId]);
                return response()->json(['error' => 'No file attached to this submission.'], 404);
            }

            // Get file index from query parameter (default to 0 for backward compatibility)
            $fileIndex = $request->query('file', 0);

            // Validate file index
            if (!isset($submission->attachments[$fileIndex])) {
                \Log::error('Invalid file index', [
                    'file_index' => $fileIndex,
                    'available_files' => count($submission->attachments)
                ]);
                return response()->json(['error' => 'File not found.'], 404);
            }

            $attachment = $submission->attachments[$fileIndex];
            $filePath = $attachment['path'] ?? null;
            $fileName = $attachment['name'] ?? 'download.pdf';

            if (!$filePath) {
                \Log::error('File path is null');
                return response()->json(['error' => 'File path not found.'], 404);
            }

            // Files are stored using 'public' disk, so use Storage facade
            $fullPath = \Storage::disk('public')->path($filePath);

            \Log::info('File download details', [
                'file_path' => $filePath,
                'file_name' => $fileName,
                'full_path' => $fullPath,
                'exists' => file_exists($fullPath)
            ]);

            if (!file_exists($fullPath)) {
                \Log::error('File does not exist', ['path' => $fullPath]);
                return response()->json(['error' => 'File not found on server: ' . $filePath], 404);
            }

            \Log::info('File download successful', ['file' => $fileName]);

            return response()->download($fullPath, $fileName);

        } catch (\Exception $e) {
            \Log::error('Download error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error downloading file: ' . $e->getMessage()], 500);
        }
    }

    public function exportGrades($id)
    {
        $assignment = Assignment::with([
            'course',
            'submissions' => function($q) {
                $q->with(['user', 'assignment'])
                  ->orderBy('submitted_at');
            }
        ])->findOrFail($id);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $assignment->title . '_grades.csv"',
        ];

        $callback = function() use ($assignment) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Student Name',
                'Email',
                'Submitted At',
                'Grade',
                'Status',
                'Late Submission',
                'Feedback'
            ]);

            foreach ($assignment->submissions as $submission) {
                $isLate = $submission->submitted_at > $assignment->due_date;
                
                fputcsv($file, [
                    $submission->user->name,
                    $submission->user->email,
                    $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i:s') : 'Not submitted',
                    $submission->grade ?? 'Not graded',
                    $submission->grade !== null ? 'Graded' : 'Pending',
                    $isLate ? 'Yes' : 'No',
                    $submission->feedback ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}