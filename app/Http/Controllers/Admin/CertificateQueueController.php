<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateQueue;
use App\Models\Course;
use App\Models\Meeting;
use App\Models\MeetingAttendance;
use App\Models\User;
use App\Services\ProgressTrackingService;
use App\Services\CertificateGeneratorService;
use App\Notifications\CertificateAvailable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CertificateQueueController extends Controller
{
    protected $progressService;

    public function __construct(ProgressTrackingService $progressService)
    {
        $this->progressService = $progressService;
    }

    /**
     * Display all certificate queue entries
     */
    public function index(Request $request)
    {
        $query = CertificateQueue::with([
            'user',
            'course',
            'enrollment',
            'reviewer'
        ]);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        // Search by student name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%");
            });
        }

        $certificates = $query->orderBy('completed_at', 'desc')
            ->paginate(20);

        $courses = Course::select('id', 'title')->get();

        // Add statistics
        $stats = [
            'total' => CertificateQueue::count(),
            'pending' => CertificateQueue::where('status', 'pending')->count(),
            'approved' => CertificateQueue::where('status', 'approved')->count(),
            'rejected' => CertificateQueue::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/CertificateQueue/Index', [
            'certificates' => $certificates,
            'courses' => $courses,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'course_id' => $request->course_id,
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show certificate queue entry details with progress and meeting screenshots
     */
    public function show(CertificateQueue $certificate)
    {
        $certificate->load([
            'user',
            'course.sections.lessons',
            'course.sections.quizzes',
            'course.sections.assignments',
            'course.meetings.screenshots.uploader',
            'course.meetings.attendances' => function ($query) use ($certificate) {
                $query->where('user_id', $certificate->user_id);
            },
            'enrollment',
            'reviewer',
        ]);

        // Recalculate attendance stats if not set
        if ($certificate->total_meetings_count === null) {
            $this->recalculateAttendanceData($certificate);
            $certificate->refresh();
        }

        // Get detailed progress information using ProgressTrackingService
        $progressData = $this->progressService->getUserProgress(
            $certificate->user_id,
            $certificate->course_id
        );

        // Get meeting attendance details with screenshots
        $meetingAttendances = [];
        if ($certificate->course && $certificate->course->meetings) {
            foreach ($certificate->course->meetings as $meeting) {
                $attendance = $meeting->attendances->first();

                $meetingAttendances[] = [
                    'meeting' => [
                        'id' => $meeting->id,
                        'title' => $meeting->title,
                        'scheduled_at' => $meeting->scheduled_at,
                        'zoom_link' => $meeting->zoom_link,
                        'duration_minutes' => $meeting->duration_minutes,
                    ],
                    'attended' => $attendance ? $attendance->attended : false,
                    'marked_at' => $attendance ? $attendance->marked_at : null,
                    'notes' => $attendance ? $attendance->notes : null,
                    'screenshots' => $meeting->screenshots->map(function ($screenshot) {
                        return [
                            'id' => $screenshot->id,
                            'url' => $screenshot->screenshot_url,
                            'notes' => $screenshot->notes,
                            'uploaded_by' => $screenshot->uploader ? $screenshot->uploader->name : 'Admin',
                            'created_at' => $screenshot->created_at->format('Y-m-d H:i'),
                        ];
                    })->toArray(),
                ];
            }
        }

        return Inertia::render('Admin/CertificateQueue/Show', [
            'certificate' => [
                'id' => $certificate->id,
                'status' => $certificate->status,
                'completed_at' => $certificate->completed_at,
                'approved_at' => $certificate->approved_at,
                'rejected_at' => $certificate->rejected_at,
                'rejection_reason' => $certificate->rejection_reason,
                'certificate_mode' => $certificate->certificate_mode,
                'certificate_file' => $certificate->certificate_file,
                'auto_generated_certificate_path' => $certificate->auto_generated_certificate_path,
                'uploaded_certificate_path' => $certificate->uploaded_certificate_path,
                'all_meetings_attended' => $certificate->all_meetings_attended,
                'meetings_attended_count' => $certificate->meetings_attended_count,
                'total_meetings_count' => $certificate->total_meetings_count,
                'user' => [
                    'id' => $certificate->user->id,
                    'name' => $certificate->user->name,
                    'email' => $certificate->user->email,
                    'phone' => $certificate->user->phone ?? '-',
                ],
                'course' => [
                    'id' => $certificate->course->id,
                    'title' => $certificate->course->title,
                    'slug' => $certificate->course->slug,
                    'description' => $certificate->course->description,
                    'instructor_name' => $certificate->course->instructor_name,
                ],
            ],
            'progress' => $progressData,
            'meetingAttendances' => $meetingAttendances,
        ]);
    }

    /**
     * Internal method to recalculate attendance data
     */
    private function recalculateAttendanceData(CertificateQueue $certificate)
    {
        $course = $certificate->course;
        $userId = $certificate->user_id;

        $totalMeetings = $course ? $course->meetings()->count() : 0;

        $attendedCount = 0;
        if ($course) {
            $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
                ->where('user_id', $userId)
                ->where('attended', true)
                ->count();
        }

        $certificate->update([
            'total_meetings_count' => $totalMeetings,
            'meetings_attended_count' => $attendedCount,
            'all_meetings_attended' => $totalMeetings === 0 || ($totalMeetings > 0 && $attendedCount === $totalMeetings),
        ]);
    }

    /**
     * Upload certificate manually (Phase 4)
     */
    public function uploadCertificate(Request $request, CertificateQueue $certificate)
    {
        $request->validate([
            'certificate_file' => 'required|file|mimes:pdf|max:10240', // Max 10MB PDF only
        ]);

        try {
            // Delete old uploaded certificate if exists
            if ($certificate->uploaded_certificate_path) {
                Storage::disk('public')->delete($certificate->uploaded_certificate_path);
            }

            // Upload new certificate
            $file = $request->file('certificate_file');
            $filename = 'certificate_' . $certificate->user_id . '_' . $certificate->course_id . '_' . time() . '.pdf';
            $path = $file->storeAs('certificates', $filename, 'public');

            // Update certificate queue
            $certificate->update([
                'certificate_mode' => 'manual',
                'uploaded_certificate_path' => $path,
                'certificate_file' => $path, // Set as main certificate file
            ]);

            Log::info("Certificate manually uploaded for user {$certificate->user_id} in course {$certificate->course_id}");

            return back()->with('success', 'Certificate uploaded successfully! Click "Approve & Send" to issue it to the student.');
        } catch (\Exception $e) {
            Log::error('Error uploading certificate: ' . $e->getMessage());
            return back()->with('error', 'Failed to upload certificate: ' . $e->getMessage());
        }
    }

    /**
     * Generate certificate automatically using PDF generator
     */
    public function generateCertificate(CertificateQueue $certificate)
    {
        try {
            // Initialize certificate generator service
            $certificateGenerator = new CertificateGeneratorService();

            // Delete old auto-generated certificate if exists
            if ($certificate->auto_generated_certificate_path) {
                Storage::disk('public')->delete($certificate->auto_generated_certificate_path);
            }

            // Generate PDF certificate
            $pdfPath = $certificateGenerator->generate($certificate);

            if (!$pdfPath) {
                return back()->with('error', 'Failed to generate certificate PDF. Please check logs.');
            }

            // Update certificate queue with generated PDF
            $certificate->update([
                'certificate_mode' => 'auto',
                'auto_generated_certificate_path' => $pdfPath,
                'certificate_file' => $pdfPath, // Set as main certificate file
            ]);

            Log::info("Certificate auto-generated for user {$certificate->user_id} in course {$certificate->course_id}");

            return back()->with('success', 'Certificate generated successfully! You can now preview and approve it.');
        } catch (\Exception $e) {
            Log::error('Error generating certificate: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return back()->with('error', 'Failed to generate certificate: ' . $e->getMessage());
        }
    }

    /**
     * Approve certificate and send notification to student
     */
    public function approve(CertificateQueue $certificate)
    {
        try {
            // Check if certificate file exists
            if (!$certificate->certificate_file) {
                return back()->with('error', 'Please upload or generate a certificate first!');
            }

            // Check if file actually exists in storage
            if (!Storage::disk('public')->exists($certificate->certificate_file)) {
                return back()->with('error', 'Certificate file not found in storage!');
            }

            // IMPORTANT: Validate meeting attendance before approval
            // Recalculate attendance to ensure data is up-to-date
            $this->recalculateAttendanceData($certificate);
            $certificate->refresh();

            // Check if there are meetings and if all attended
            if ($certificate->total_meetings_count > 0 && !$certificate->all_meetings_attended) {
                $attendedCount = $certificate->meetings_attended_count;
                $totalCount = $certificate->total_meetings_count;

                return back()->with('error',
                    "Cannot approve certificate! Student only attended {$attendedCount} out of {$totalCount} required meetings. " .
                    "All meetings must be attended before certificate can be issued. Please check meeting attendance in 'Kelola Meetings'."
                );
            }

            // Update status and approval info
            $certificate->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);

            // Update enrollment with certificate info
            if ($certificate->enrollment) {
                $certificate->enrollment->update([
                    'certificate_issued_at' => now(),
                    'certificate_file' => $certificate->certificate_file,
                ]);
            }

            // Send notification to student
            $certificate->user->notify(new CertificateAvailable($certificate->course, $certificate));

            Log::info("Certificate approved and sent to user {$certificate->user_id} for course {$certificate->course_id}");

            return back()->with('success', 'Certificate approved and student has been notified! 🎉');
        } catch (\Exception $e) {
            Log::error('Error approving certificate: ' . $e->getMessage());
            return back()->with('error', 'Failed to approve certificate: ' . $e->getMessage());
        }
    }

    /**
     * Reject certificate with reason
     */
    public function reject(Request $request, CertificateQueue $certificate)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        // Reject the certificate
        $certificate->reject(auth()->user(), $request->rejection_reason);

        return redirect()
            ->route('admin.certificate-queue.index')
            ->with('success', 'Certificate request rejected.');
    }

    /**
     * Recalculate meeting attendance for a certificate entry
     */
    public function recalculateAttendance(CertificateQueue $certificate)
    {
        $course = $certificate->course;
        $userId = $certificate->user_id;

        // Get all meetings for this course
        $totalMeetings = $course->meetings()->count();

        // Get attended meetings count
        $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
            $query->where('course_id', $course->id);
        })
            ->where('user_id', $userId)
            ->where('attended', true)
            ->count();

        // Update certificate queue entry
        $certificate->update([
            'total_meetings_count' => $totalMeetings,
            'meetings_attended_count' => $attendedCount,
            'all_meetings_attended' => $totalMeetings > 0 && $attendedCount === $totalMeetings,
        ]);

        return redirect()->back()->with('success', 'Meeting attendance recalculated!');
    }

    /**
     * Download certificate PDF
     */
    public function download(CertificateQueue $certificate)
    {
        try {
            $filePath = $certificate->certificate_file;

            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                return back()->with('error', 'Certificate file not found!');
            }

            $downloadName = 'certificate_' . $certificate->user->name . '_' . $certificate->course->title . '.pdf';
            $downloadName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $downloadName); // Sanitize filename

            $fullPath = Storage::disk('public')->path($filePath);

            return response()->file($fullPath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $downloadName . '"',
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloading certificate: ' . $e->getMessage());
            return back()->with('error', 'Failed to download certificate: ' . $e->getMessage());
        }
    }

    /**
     * Delete certificate queue entry
     */
    public function destroy(CertificateQueue $certificate)
    {
        try {
            // Delete certificate files if exist
            if ($certificate->uploaded_certificate_path) {
                Storage::disk('public')->delete($certificate->uploaded_certificate_path);
            }
            if ($certificate->auto_generated_certificate_path) {
                Storage::disk('public')->delete($certificate->auto_generated_certificate_path);
            }

            $certificate->delete();

            Log::info("Certificate queue entry deleted for user {$certificate->user_id} in course {$certificate->course_id}");

            return back()->with('success', 'Certificate queue entry deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting certificate: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete certificate: ' . $e->getMessage());
        }
    }

    /**
     * Get pending certificates count (for notifications/badges)
     */
    public function getPendingCount()
    {
        $count = CertificateQueue::where('status', 'pending')->count();

        return response()->json(['count' => $count]);
    }
}
