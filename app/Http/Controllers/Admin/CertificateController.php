<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateQueue;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Meeting;
use App\Models\MeetingAttendance;
use App\Services\ProgressTrackingService;
use App\Services\CertificateGeneratorService;
use App\Notifications\CertificateAvailable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * CertificateController - Hybrid Version
 *
 * Combines OLD logic (list 100% completion from enrollments)
 * with NEW features (Phase 1-6: meeting screenshots, attendance validation)
 */
class CertificateController extends Controller
{
    protected $progressService;

    public function __construct(ProgressTrackingService $progressService)
    {
        $this->progressService = $progressService;
    }

    /**
     * Display all certificates (auto-generated and uploaded)
     * Combines all certificates in single view with search & filter
     * Also shows enrollments ready for certificates (100% progress but no cert yet)
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', ''); // all, approved, pending, rejected
        $type = $request->get('type', ''); // all, auto_generated, uploaded
        $courseId = $request->get('course_id', ''); // filter by course

        // Get enrollment IDs that already have certificates
        $enrollmentIdsWithCerts = CertificateQueue::pluck('enrollment_id')->toArray();

        // Get completedEnrollments (100% progress but no certificate yet - edge cases)
        $completedEnrollmentsQuery = Enrollment::with([
            'user',
            'course.category',
            'course.meetings'
        ])
            ->where('progress_percentage', 100)
            ->whereNotIn('id', $enrollmentIdsWithCerts)
            ->latest('completed_at');

        // Apply search filter for completedEnrollments
        if ($search) {
            $completedEnrollmentsQuery->where(function ($query) use ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where(function($q2) use ($search) {
                        $q2->where('first_name', 'ILIKE', "%{$search}%")
                           ->orWhere('last_name', 'ILIKE', "%{$search}%")
                           ->orWhere('email', 'ILIKE', "%{$search}%");
                    });
                })
                ->orWhereHas('course', function ($q) use ($search) {
                    $q->where('title', 'ILIKE', "%{$search}%");
                });
            });
        }

        $completedEnrollments = $completedEnrollmentsQuery->paginate(20)->through(function ($enrollment) {
            // Calculate meeting attendance
            $totalMeetings = $enrollment->course->meetings ? $enrollment->course->meetings->count() : 0;
            $attendedMeetings = 0;

            if ($totalMeetings > 0) {
                $attendedMeetings = MeetingAttendance::whereHas('meeting', function ($query) use ($enrollment) {
                    $query->where('course_id', $enrollment->course_id);
                })
                    ->where('user_id', $enrollment->user_id)
                    ->where('attended', true)
                    ->count();
            }

            return [
                'id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'progress_percentage' => $enrollment->progress_percentage,
                'completed_at' => $enrollment->completed_at,
                'zoom_screenshot_path' => $enrollment->zoom_screenshot_path,
                'zoom_screenshot_uploaded_at' => $enrollment->zoom_screenshot_uploaded_at,
                'user' => [
                    'id' => $enrollment->user->id,
                    'first_name' => $enrollment->user->first_name,
                    'last_name' => $enrollment->user->last_name,
                    'email' => $enrollment->user->email,
                    'avatar' => $enrollment->user->avatar,
                ],
                'course' => [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'require_zoom_screenshot' => $enrollment->course->require_zoom_screenshot,
                    'category' => $enrollment->course->category ? [
                        'name' => $enrollment->course->category->name,
                    ] : null,
                ],
                'total_meetings_count' => $totalMeetings,
                'meetings_attended_count' => $attendedMeetings,
            ];
        });

        // Build query for all certificates
        $certificatesQuery = CertificateQueue::with([
            'user',
            'course.category',
            'course.meetings',
            'enrollment'
        ])->latest('created_at');

        // Apply search filter
        if ($search) {
            $certificatesQuery->where(function ($query) use ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where(function($q2) use ($search) {
                        $q2->where('first_name', 'ILIKE', "%{$search}%")
                           ->orWhere('last_name', 'ILIKE', "%{$search}%")
                           ->orWhere('email', 'ILIKE', "%{$search}%");
                    });
                })
                ->orWhereHas('course', function ($q) use ($search) {
                    $q->where('title', 'ILIKE', "%{$search}%");
                })
                ->orWhere('certificate_number', 'ILIKE', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && $status !== 'all') {
            $certificatesQuery->where('status', $status);
        }

        // Apply type filter
        if ($type && $type !== 'all') {
            $certificatesQuery->where('certificate_type', $type);
        }

        // Apply course filter
        if ($courseId && $courseId !== 'all') {
            $certificatesQuery->where('course_id', $courseId);
        }

        $certificates = $certificatesQuery->paginate(20)->through(function ($cert) {
            // Calculate meeting attendance on-the-fly for accurate data
            $totalMeetings = $cert->course->meetings ? $cert->course->meetings->count() : 0;
            $attendedMeetings = 0;

            if ($totalMeetings > 0) {
                $attendedMeetings = MeetingAttendance::whereHas('meeting', function ($query) use ($cert) {
                    $query->where('course_id', $cert->course_id);
                })
                    ->where('user_id', $cert->user_id)
                    ->where('attended', true)
                    ->count();
            }

            $allMeetingsAttended = $totalMeetings === 0 || ($totalMeetings > 0 && $attendedMeetings === $totalMeetings);

            return [
                'id' => $cert->id,
                'enrollment_id' => $cert->enrollment_id,
                'certificate_number' => $cert->certificate_number,
                'certificate_type' => $cert->certificate_type,
                'is_primary' => $cert->is_primary,
                'status' => $cert->status,
                'auto_approved' => $cert->auto_approved,
                'completed_at' => $cert->completed_at,
                'approved_at' => $cert->approved_at,
                'rejected_at' => $cert->rejected_at,
                'certificate_file' => $cert->certificate_file,
                'user' => [
                    'id' => $cert->user->id,
                    'first_name' => $cert->user->first_name,
                    'last_name' => $cert->user->last_name,
                    'name' => trim($cert->user->first_name . ' ' . $cert->user->last_name),
                    'email' => $cert->user->email,
                    'avatar' => $cert->user->avatar,
                ],
                'course' => [
                    'id' => $cert->course->id,
                    'title' => $cert->course->title,
                    'slug' => $cert->course->slug,
                    'require_zoom_screenshot' => $cert->course->require_zoom_screenshot ?? false,
                    'category' => $cert->course->category ? [
                        'name' => $cert->course->category->name,
                    ] : null,
                ],
                'meetings_info' => [
                    'all_attended' => $allMeetingsAttended,
                    'attended_count' => $attendedMeetings,
                    'total_count' => $totalMeetings,
                ],
                'zoom_screenshot_path' => $cert->enrollment ? $cert->enrollment->zoom_screenshot_path : null,
                'zoom_screenshot_uploaded_at' => $cert->enrollment ? $cert->enrollment->zoom_screenshot_uploaded_at : null,
            ];
        });

        // Calculate stats - only count approved certificates for main display
        $stats = [
            'ready_for_certificate' => Enrollment::where('progress_percentage', 100)
                ->whereNotIn('id', $enrollmentIdsWithCerts)
                ->count(),
            'total_certificates' => CertificateQueue::where('status', 'approved')->count(),
            'auto_generated' => CertificateQueue::where('status', 'approved')
                ->where('certificate_type', 'auto_generated')->count(),
            'uploaded' => CertificateQueue::where('status', 'approved')
                ->where('certificate_type', 'uploaded')->count(),
            'approved' => CertificateQueue::where('status', 'approved')->count(),
            'pending' => CertificateQueue::where('status', 'pending')->count(),
            'rejected' => CertificateQueue::where('status', 'rejected')->count(),
            'this_month' => CertificateQueue::where('status', 'approved')
                ->whereYear('approved_at', now()->year)
                ->whereMonth('approved_at', now()->month)
                ->count()
        ];

        // Get list of courses that have certificates for filter dropdown
        $coursesWithCertificates = Course::whereHas('certificateQueues')
            ->select('id', 'title')
            ->orderBy('title')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                ];
            });

        return Inertia::render('Admin/Certificates/Index', [
            'completedEnrollments' => $completedEnrollments,
            'certificates' => $certificates,
            'stats' => $stats,
            'courses' => $coursesWithCertificates,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
                'course_id' => $courseId,
            ]
        ]);
    }

    /**
     * Show certificate tracking for an enrollment
     * Displays all certificates (auto-generated + uploaded) + timeline/history
     */
    public function show($enrollmentId)
    {
        $enrollment = Enrollment::with([
            'user',
            'course.sections.lessons',
            'course.sections.quizzes',
            'course.sections.assignments',
            'course.instructor',
            'course.meetings.screenshots.uploader',
            'course.meetings.attendances' => function ($query) use ($enrollmentId) {
                $enrollment = Enrollment::find($enrollmentId);
                if ($enrollment) {
                    $query->where('user_id', $enrollment->user_id);
                }
            },
        ])->findOrFail($enrollmentId);

        // Get all certificates for this enrollment
        $certificates = CertificateQueue::where('enrollment_id', $enrollmentId)
            ->with(['reviewer'])
            ->orderBy('is_primary', 'desc') // Primary first
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'certificate_number' => $cert->certificate_number,
                    'certificate_title' => $cert->certificate_title,
                    'certificate_type' => $cert->certificate_type,
                    'is_primary' => $cert->is_primary,
                    'status' => $cert->status,
                    'auto_approved' => $cert->auto_approved,
                    'certificate_file' => $cert->certificate_file,
                    'certificate_file_url' => $cert->certificate_file ? asset('storage/' . $cert->certificate_file) : null,
                    'rejection_reason' => $cert->rejection_reason,
                    'completed_at' => $cert->completed_at,
                    'approved_at' => $cert->approved_at,
                    'approved_by' => $cert->approved_by,
                    'rejected_at' => $cert->rejected_at,
                    'reviewed_at' => $cert->reviewed_at,
                    'reviewer' => $cert->reviewer ? [
                        'id' => $cert->reviewer->id,
                        'name' => trim($cert->reviewer->first_name . ' ' . $cert->reviewer->last_name),
                    ] : null,
                    'created_at' => $cert->created_at,
                ];
            });

        // Build timeline/history
        $timeline = [];
        foreach ($certificates as $cert) {
            // Certificate created
            $timeline[] = [
                'type' => 'certificate_created',
                'certificate_id' => $cert['id'],
                'certificate_type' => $cert['certificate_type'],
                'is_primary' => $cert['is_primary'],
                'timestamp' => $cert['created_at'],
                'description' => $cert['certificate_type'] === 'auto_generated'
                    ? 'Sertifikat utama otomatis dibuat oleh sistem'
                    : 'Sertifikat tambahan diupload',
            ];

            // Approved
            if ($cert['approved_at']) {
                $timeline[] = [
                    'type' => 'certificate_approved',
                    'certificate_id' => $cert['id'],
                    'timestamp' => $cert['approved_at'],
                    'description' => $cert['auto_approved']
                        ? 'Sertifikat otomatis disetujui oleh sistem'
                        : 'Sertifikat disetujui oleh ' . ($cert['reviewer']['name'] ?? 'Admin'),
                    'reviewer' => $cert['reviewer'],
                ];
            }

            // Rejected
            if ($cert['rejected_at']) {
                $timeline[] = [
                    'type' => 'certificate_rejected',
                    'certificate_id' => $cert['id'],
                    'timestamp' => $cert['rejected_at'],
                    'description' => 'Sertifikat ditolak oleh ' . ($cert['reviewer']['name'] ?? 'Admin'),
                    'reason' => $cert['rejection_reason'],
                    'reviewer' => $cert['reviewer'],
                ];
            }
        }

        // Sort timeline by timestamp descending (newest first)
        usort($timeline, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        // Get detailed progress
        $progressData = $this->progressService->getUserProgress(
            $enrollment->user_id,
            $enrollment->course_id
        );

        // Get meeting attendance details with screenshots
        $meetingAttendances = [];
        if ($enrollment->course && $enrollment->course->meetings) {
            foreach ($enrollment->course->meetings as $meeting) {
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
                            'uploaded_by' => $screenshot->uploader ? trim($screenshot->uploader->first_name . ' ' . $screenshot->uploader->last_name) : 'Admin',
                            'created_at' => $screenshot->created_at->format('Y-m-d H:i'),
                        ];
                    })->toArray(),
                ];
            }
        }

        // Calculate meeting attendance summary
        $totalMeetings = $enrollment->course ? $enrollment->course->meetings()->count() : 0;
        $attendedCount = 0;
        if ($enrollment->course) {
            $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($enrollment) {
                $query->where('course_id', $enrollment->course_id);
            })
                ->where('user_id', $enrollment->user_id)
                ->where('attended', true)
                ->count();
        }

        $allMeetingsAttended = $totalMeetings === 0 || ($totalMeetings > 0 && $attendedCount === $totalMeetings);

        return Inertia::render('Admin/Certificates/Show', [
            'enrollment' => [
                'id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'progress_percentage' => $enrollment->progress_percentage,
                'enrolled_at' => $enrollment->created_at,
                'completed_at' => $enrollment->completed_at,
                'all_meetings_attended' => $allMeetingsAttended,
                'meetings_attended_count' => $attendedCount,
                'total_meetings_count' => $totalMeetings,
                'zoom_screenshot_path' => $enrollment->zoom_screenshot_path,
                'zoom_screenshot_uploaded_at' => $enrollment->zoom_screenshot_uploaded_at,
                'user' => [
                    'id' => $enrollment->user->id,
                    'name' => trim($enrollment->user->first_name . ' ' . $enrollment->user->last_name),
                    'email' => $enrollment->user->email,
                    'phone' => $enrollment->user->phone ?? '-',
                ],
                'course' => [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'description' => $enrollment->course->description,
                    'instructor_name' => $enrollment->course->instructor ? trim($enrollment->course->instructor->first_name . ' ' . $enrollment->course->instructor->last_name) : 'N/A',
                    'require_zoom_screenshot' => $enrollment->course->require_zoom_screenshot,
                    'zoom_link' => $enrollment->course->zoom_link,
                ],
            ],
            'certificates' => $certificates,
            'timeline' => $timeline,
            'progress' => $progressData,
            'meetingAttendances' => $meetingAttendances,
        ]);
    }

    /**
     * Store certificate - with meeting attendance validation
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'course_id' => 'required|exists:courses,id',
                'certificate_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'grade' => 'nullable|string|max:10'
            ]);

            $enrollment = Enrollment::where('user_id', $request->user_id)
                ->where('course_id', $request->course_id)
                ->where('progress_percentage', 100)
                ->firstOrFail();

            // IMPORTANT: Validate meeting attendance before issuing certificate
            $course = Course::find($request->course_id);
            $totalMeetings = $course->meetings()->count();

            if ($totalMeetings > 0) {
                $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                    ->where('user_id', $request->user_id)
                    ->where('attended', true)
                    ->count();

                if ($attendedCount < $totalMeetings) {
                    return redirect()->back()
                        ->withErrors([
                            'error' => "Tidak dapat menerbitkan sertifikat! Peserta hanya hadir {$attendedCount} dari {$totalMeetings} meeting yang wajib diikuti. Silakan cek kehadiran di 'Kelola Meetings'."
                        ]);
                }
            }

            $path = null;
            if ($request->hasFile('certificate_file')) {
                $file = $request->file('certificate_file');
                $filename = 'certificate_' . $request->user_id . '_' . $request->course_id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('certificates', $filename, 'public');
            }

            $user = User::find($request->user_id);
            $course = Course::find($request->course_id);

            $certificate = Certificate::create([
                'user_id' => $request->user_id,
                'course_id' => $request->course_id,
                'certificate_number' => 'CERT-' . strtoupper(Str::random(8)),
                'title' => 'Certificate of Completion - ' . $course->title,
                'description' => 'This certifies that ' . $user->name . ' has successfully completed the course ' . $course->title,
                'issued_at' => now(),
                'certificate_file' => $path,
                'grade' => $request->grade,
                'completion_percentage' => 100.00,
                'verification_code' => Str::random(32),
                'is_valid' => true,
                'certificate_url' => $path ? Storage::url($path) : null
            ]);

            $enrollment->update([
                'status' => 'completed',
                'completed_at' => now(),
                'certificate_issued_at' => now(),
                'certificate_file' => $path,
            ]);

            // Send notification to student
            $user->notify(new CertificateAvailable($course, $enrollment, $path));

            Log::info("Certificate issued to user {$user->id} for course {$course->id}");

            return redirect()->route('admin.certificates.index')
                ->with('success', 'Sertifikat berhasil diupload dan siswa telah diterbitkan sertifikat! 🎉');

        } catch (\Exception $e) {
            Log::error('Error issuing certificate: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show preview certificate page before generating (Inertia page)
     */
    public function preview($enrollmentId)
    {
        $enrollment = Enrollment::with([
            'user',
            'course.instructor',
            'course.meetings.attendances' => function ($query) use ($enrollmentId) {
                $enrollment = Enrollment::find($enrollmentId);
                if ($enrollment) {
                    $query->where('user_id', $enrollment->user_id);
                }
            },
        ])->findOrFail($enrollmentId);

        // Calculate meeting attendance
        $totalMeetings = $enrollment->course->meetings()->count();
        $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($enrollment) {
            $query->where('course_id', $enrollment->course_id);
        })
            ->where('user_id', $enrollment->user_id)
            ->where('attended', true)
            ->count();

        $allMeetingsAttended = $totalMeetings === 0 || ($totalMeetings > 0 && $attendedCount === $totalMeetings);

        // Check for saved data in session first
        $sessionKey = 'certificate_data_' . $enrollmentId;
        $savedData = Session::get($sessionKey);

        // Helper to get instructor name - prioritize course.instructor_name field
        $getInstructorName = function() use ($enrollment) {
            // First: Check custom instructor_name field from course
            if (!empty($enrollment->course->instructor_name)) {
                return $enrollment->course->instructor_name;
            }
            // Second: Get from instructor relationship
            if ($enrollment->course->instructor) {
                return trim($enrollment->course->instructor->first_name . ' ' . $enrollment->course->instructor->last_name);
            }
            // Final fallback
            return 'Instructor';
        };

        // Prepare certificate data for preview - use saved data if available
        if ($savedData) {
            $certificateData = [
                'user_name' => $savedData['user_name'],
                'course_title' => $savedData['course_title'],
                'completion_date' => $savedData['completion_date'],
                'certificate_number' => $savedData['certificate_number'],
                'grade' => $savedData['grade'],
                'instructor_name' => !empty($savedData['instructor_name']) ? $savedData['instructor_name'] : $getInstructorName(),
                'is_saved' => true, // Flag to indicate data was loaded from session
            ];
        } else {
            $certificateData = [
                'user_name' => $enrollment->user->name,
                'course_title' => $enrollment->course->title,
                'completion_date' => $enrollment->completed_at ? $enrollment->completed_at->format('Y-m-d') : now()->format('Y-m-d'),
                'certificate_number' => 'CERT-' . strtoupper(Str::random(8)),
                'grade' => 'Excellent',
                'instructor_name' => $getInstructorName(),
                'is_saved' => false,
            ];
        }

        return Inertia::render('Admin/Certificates/Preview', [
            'enrollment' => [
                'id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'progress_percentage' => $enrollment->progress_percentage,
                'all_meetings_attended' => $allMeetingsAttended,
                'meetings_attended_count' => $attendedCount,
                'total_meetings_count' => $totalMeetings,
                'user' => [
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'phone' => $enrollment->user->phone ?? '-',
                ],
                'course' => [
                    'title' => $enrollment->course->title,
                    'instructor_name' => $enrollment->course->instructor ? $enrollment->course->instructor->name : 'N/A',
                ],
            ],
            'certificateData' => $certificateData,
        ]);
    }

    /**
     * Save certificate data to session for synchronization between Generate Auto and Perfect Layout
     */
    public function saveCertificateData(Request $request, $enrollmentId)
    {
        try {
            $request->validate([
                'user_name' => 'required|string|max:255',
                'course_title' => 'required|string|max:255',
                'completion_date' => 'required|date',
                'certificate_number' => 'required|string|max:100',
                'grade' => 'required|string|max:50',
                'instructor_name' => 'nullable|string|max:255',
            ]);

            // Store certificate data in session with enrollment ID as key
            $sessionKey = 'certificate_data_' . $enrollmentId;
            Session::put($sessionKey, [
                'user_name' => $request->user_name,
                'course_title' => $request->course_title,
                'completion_date' => $request->completion_date,
                'certificate_number' => $request->certificate_number,
                'grade' => $request->grade,
                'instructor_name' => $request->instructor_name,
                'updated_at' => now()->toDateTimeString(),
            ]);

            Log::info("Certificate data saved for enrollment {$enrollmentId}", [
                'data' => Session::get($sessionKey)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data sertifikat berhasil disimpan!',
                'data' => Session::get($sessionKey)
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving certificate data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get saved certificate data from session
     */
    public function getSavedCertificateData($enrollmentId)
    {
        $sessionKey = 'certificate_data_' . $enrollmentId;
        $savedData = Session::get($sessionKey);

        if ($savedData) {
            return response()->json([
                'success' => true,
                'data' => $savedData
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No saved data found'
        ], 404);
    }

    /**
     * Preview PDF certificate (stream PDF directly)
     */
    public function previewPdf($enrollmentId)
    {
        try {
            $enrollment = Enrollment::with([
                'user',
                'course.instructor',
            ])->findOrFail($enrollmentId);

            // Create temporary certificate queue object for preview
            $tempCertQueue = new CertificateQueue([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'enrollment_id' => $enrollment->id,
                'completed_at' => $enrollment->completed_at ?? now(),
            ]);
            $tempCertQueue->user = $enrollment->user;
            $tempCertQueue->course = $enrollment->course;
            $tempCertQueue->enrollment = $enrollment;

            // Use CertificateGeneratorService to preview
            $certificateGenerator = new CertificateGeneratorService();

            return $certificateGenerator->preview($tempCertQueue);

        } catch (\Exception $e) {
            Log::error('Certificate preview PDF error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return abort(500, 'Error generating certificate preview: ' . $e->getMessage());
        }
    }

    /**
     * Preview HTML certificate (printable version - PERFECT LAYOUT)
     * Synchronized with Generate Auto - uses saved data from session if available
     */
    public function previewHtml($enrollmentId)
    {
        try {
            $enrollment = Enrollment::with([
                'user',
                'course.instructor',
            ])->findOrFail($enrollmentId);

            // Check for saved data in session (from Generate Auto)
            $sessionKey = 'certificate_data_' . $enrollmentId;
            $savedData = Session::get($sessionKey);

            // Format completion date properly
            $formatCompletionDate = function($dateValue) {
                if (!$dateValue) {
                    return now()->locale('id')->isoFormat('DD MMMM YYYY');
                }
                try {
                    return \Carbon\Carbon::parse($dateValue)->locale('id')->isoFormat('DD MMMM YYYY');
                } catch (\Exception $e) {
                    return now()->locale('id')->isoFormat('DD MMMM YYYY');
                }
            };

            // Helper to get instructor name - prioritize course.instructor_name field
            $getInstructorName = function() use ($enrollment) {
                // First: Check custom instructor_name field from course
                if (!empty($enrollment->course->instructor_name)) {
                    return $enrollment->course->instructor_name;
                }
                // Second: Get from instructor relationship
                if ($enrollment->course->instructor) {
                    return trim($enrollment->course->instructor->first_name . ' ' . $enrollment->course->instructor->last_name);
                }
                // Final fallback
                return 'Instructor';
            };

            // If saved data exists in session, use it (synchronized with Generate Auto)
            if ($savedData) {
                Log::info("Using saved certificate data for enrollment {$enrollmentId}", $savedData);

                $certificateData = [
                    'student_name' => $savedData['user_name'],
                    'course_title' => $savedData['course_title'],
                    'completion_date' => $formatCompletionDate($savedData['completion_date']),
                    'certificate_number' => $savedData['certificate_number'],
                    // Use saved instructor_name if available, otherwise get from course
                    'instructor_name' => !empty($savedData['instructor_name']) ? $savedData['instructor_name'] : $getInstructorName(),

                    // Unit Kompetensi from course - dynamic array
                    'certificate_unit_kompetensi' => is_array($enrollment->course->certificate_unit_kompetensi)
                        ? array_filter($enrollment->course->certificate_unit_kompetensi)
                        : [],
                ];
            } else {
                // Default data from enrollment/course
                $certificateData = [
                    'student_name' => $enrollment->user->name,
                    'course_title' => $enrollment->course->title,
                    'completion_date' => $enrollment->completed_at
                        ? $enrollment->completed_at->locale('id')->isoFormat('DD MMMM YYYY')
                        : now()->locale('id')->isoFormat('DD MMMM YYYY'),
                    'certificate_number' => 'CERT/' . now()->year . '/' . strtoupper(Str::random(6)),
                    'instructor_name' => $getInstructorName(),

                    // Unit Kompetensi from course - dynamic array
                    'certificate_unit_kompetensi' => is_array($enrollment->course->certificate_unit_kompetensi)
                        ? array_filter($enrollment->course->certificate_unit_kompetensi)
                        : [],
                ];
            }

            return view('certificates.printable', $certificateData);

        } catch (\Exception $e) {
            Log::error('Certificate preview HTML error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return abort(500, 'Error generating certificate preview: ' . $e->getMessage());
        }
    }

    /**
     * Generate certificate automatically using template (after preview confirmation)
     */
    public function generateCertificate($enrollmentId)
    {
        try {
            $enrollment = Enrollment::with(['user', 'course.instructor'])->findOrFail($enrollmentId);

            // Validate meeting attendance
            $course = $enrollment->course;
            $totalMeetings = $course->meetings()->count();

            if ($totalMeetings > 0) {
                $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                    ->where('user_id', $enrollment->user_id)
                    ->where('attended', true)
                    ->count();

                if ($attendedCount < $totalMeetings) {
                    return redirect()->back()
                        ->withErrors([
                            'error' => "Tidak dapat generate sertifikat! Peserta hanya hadir {$attendedCount} dari {$totalMeetings} meeting yang wajib diikuti."
                        ]);
                }
            }

            // Helper to get instructor name - prioritize course.instructor_name field
            $getInstructorName = function() use ($course) {
                // First: Check custom instructor_name field from course
                if (!empty($course->instructor_name)) {
                    return $course->instructor_name;
                }
                // Second: Get from instructor relationship
                if ($course->instructor) {
                    return trim($course->instructor->first_name . ' ' . $course->instructor->last_name);
                }
                // Final fallback
                return 'Instructor';
            };

            // Get custom data from request if provided
            $certificateNumber = request('certificate_number', 'CERT-' . strtoupper(Str::random(8)));
            $userName = request('user_name', $enrollment->user->name);
            $courseTitle = request('course_title', $course->title);
            $completionDate = request('completion_date', now()->format('Y-m-d'));
            $grade = request('grade', 'Excellent');
            $instructorName = request('instructor_name', $getInstructorName());

            $certificateGenerator = new CertificateGeneratorService();

            // Create temporary certificate queue object for generator
            $tempCertQueue = new CertificateQueue([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'enrollment_id' => $enrollment->id,
                'completed_at' => $enrollment->completed_at ?? now(),
            ]);
            $tempCertQueue->user = $enrollment->user;
            $tempCertQueue->course = $enrollment->course;
            $tempCertQueue->enrollment = $enrollment;

            $pdfPath = $certificateGenerator->generate($tempCertQueue);

            if (!$pdfPath) {
                return back()->with('error', 'Gagal generate sertifikat PDF. Silakan cek logs.');
            }

            // Create certificate record with custom data
            $certificate = Certificate::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'certificate_number' => $certificateNumber,
                'title' => 'Certificate of Completion - ' . $courseTitle,
                'description' => 'This certifies that ' . $userName . ' has successfully completed the course ' . $courseTitle,
                'issued_at' => $completionDate,
                'certificate_file' => $pdfPath,
                'grade' => $grade,
                'completion_percentage' => 100.00,
                'verification_code' => Str::random(32),
                'is_valid' => true,
                'certificate_url' => Storage::url($pdfPath)
            ]);

            $enrollment->update([
                'status' => 'completed',
                'completed_at' => now(),
                'certificate_issued_at' => now(),
                'certificate_file' => $pdfPath,
            ]);

            // Send notification
            $enrollment->user->notify(new CertificateAvailable($course, $enrollment, $pdfPath));

            Log::info("Certificate auto-generated for user {$enrollment->user_id} in course {$enrollment->course_id}");

            return redirect()->route('admin.certificates.index')
                ->with('success', 'Sertifikat berhasil di-generate dan diterbitkan! 🎉');

        } catch (\Exception $e) {
            Log::error('Error generating certificate: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return back()->with('error', 'Gagal generate sertifikat: ' . $e->getMessage());
        }
    }

    public function destroy(Certificate $certificate)
    {
        try {
            if ($certificate->certificate_file) {
                Storage::disk('public')->delete($certificate->certificate_file);
            }

            $enrollment = Enrollment::where('user_id', $certificate->user_id)
                ->where('course_id', $certificate->course_id)
                ->first();

            if ($enrollment) {
                $enrollment->update([
                    'status' => 'active',
                    'completed_at' => null,
                    'certificate_issued_at' => null,
                    'certificate_file' => null,
                ]);
            }

            $certificate->delete();

            return redirect()->route('admin.certificates.index')
                ->with('success', 'Sertifikat berhasil dihapus dan status enrollment dikembalikan ke active.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function download(Certificate $certificate)
    {
        try {
            // Load relationships if not already loaded
            if (!$certificate->relationLoaded('user')) {
                $certificate->load('user');
            }
            if (!$certificate->relationLoaded('course')) {
                $certificate->load('course');
            }

            // Check if certificate has file
            if (!$certificate->certificate_file) {
                return redirect()->back()->withErrors(['error' => 'Certificate file belum diupload. Silakan upload file certificate terlebih dahulu.']);
            }

            // Check if certificate file exists in storage
            if (!Storage::disk('public')->exists($certificate->certificate_file)) {
                return redirect()->back()->withErrors(['error' => 'File certificate tidak ditemukan di storage. File mungkin telah dihapus atau dipindahkan.']);
            }

            // Generate safe filename
            $userName = $certificate->user ? $certificate->user->name : 'Unknown_User';
            $courseTitle = $certificate->course ? $certificate->course->title : 'Unknown_Course';

            $filename = 'certificate_' . $userName . '_' . $courseTitle;
            $filename = preg_replace('/[^A-Za-z0-9\-_]/', '_', $filename);

            $extension = pathinfo($certificate->certificate_file, PATHINFO_EXTENSION);
            $filename .= '.' . $extension;

            $fullPath = Storage::disk('public')->path($certificate->certificate_file);

            return response()->file($fullPath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);

        } catch (\Exception $e) {
            Log::error('Certificate download error: ' . $e->getMessage(), [
                'certificate_id' => $certificate->id,
                'file_path' => $certificate->certificate_file ?? 'null'
            ]);
            return abort(500, 'Error downloading certificate: ' . $e->getMessage());
        }
    }

    /**
     * Upload additional certificate (sertifikat tambahan)
     */
    public function uploadAdditional(Request $request)
    {
        try {
            $request->validate([
                'enrollment_id' => 'required|exists:enrollments,id',
                'certificate_title' => 'required|string|max:255',
                'certificate_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            ]);

            $enrollment = Enrollment::with(['user', 'course'])->findOrFail($request->enrollment_id);

            // Upload file
            $file = $request->file('certificate_file');
            $filename = 'uploaded_cert_' . $enrollment->user_id . '_' . $enrollment->course_id . '_' . time() . '.pdf';
            $path = $file->storeAs('certificates', $filename, 'public');

            // Calculate meeting stats
            $totalMeetings = $enrollment->course->meetings()->count();
            $attendedCount = 0;

            if ($totalMeetings > 0) {
                $attendedCount = MeetingAttendance::whereHas('meeting', function ($query) use ($enrollment) {
                    $query->where('course_id', $enrollment->course_id);
                })
                    ->where('user_id', $enrollment->user_id)
                    ->where('attended', true)
                    ->count();
            }

            // Generate certificate number automatically (same format as auto-generated)
            $certificateNumber = 'CERT-' . strtoupper(Str::random(8));

            // Create additional certificate entry
            $certificateQueue = CertificateQueue::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'enrollment_id' => $enrollment->id,
                'certificate_type' => 'uploaded',
                'certificate_number' => $certificateNumber,
                'certificate_title' => $request->certificate_title,
                'is_primary' => false,
                'status' => 'approved',
                'certificate_file' => $path,
                'uploaded_certificate_path' => $path,
                'completed_at' => $enrollment->completed_at ?? now(),
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'all_meetings_attended' => $totalMeetings > 0 && $attendedCount === $totalMeetings,
                'meetings_attended_count' => $attendedCount,
                'total_meetings_count' => $totalMeetings,
            ]);

            Log::info("Additional certificate uploaded for user {$enrollment->user_id} in course {$enrollment->course_id}");

            return redirect()->back()
                ->with('success', 'Sertifikat tambahan berhasil diupload!');

        } catch (\Exception $e) {
            Log::error('Error uploading additional certificate: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Regenerate primary certificate
     */
    public function regenerate(Request $request, $enrollmentId)
    {
        try {
            $enrollment = Enrollment::with(['user', 'course'])->findOrFail($enrollmentId);

            // Find primary certificate
            $primaryCert = CertificateQueue::where('enrollment_id', $enrollmentId)
                ->where('is_primary', true)
                ->first();

            if (!$primaryCert) {
                return redirect()->back()
                    ->withErrors(['error' => 'Sertifikat utama tidak ditemukan.']);
            }

            // Delete old certificate file
            if ($primaryCert->certificate_file && Storage::disk('public')->exists($primaryCert->certificate_file)) {
                Storage::disk('public')->delete($primaryCert->certificate_file);
            }

            // Regenerate certificate
            $certificateGenerator = new CertificateGeneratorService();
            $certificatePath = $certificateGenerator->generate($primaryCert);

            if ($certificatePath) {
                // Update queue with new certificate
                $primaryCert->update([
                    'certificate_file' => $certificatePath,
                    'auto_generated_certificate_path' => $certificatePath,
                    'status' => 'approved',
                    'approved_at' => now(),
                    'approved_by' => auth()->id(),
                ]);

                // Update enrollment
                $enrollment->update([
                    'certificate_file' => $certificatePath,
                ]);

                Log::info("Certificate regenerated for user {$enrollment->user_id} in course {$enrollment->course_id}");

                return redirect()->back()
                    ->with('success', 'Sertifikat berhasil di-generate ulang!');
            } else {
                return redirect()->back()
                    ->withErrors(['error' => 'Gagal generate sertifikat. Silakan coba lagi.']);
            }

        } catch (\Exception $e) {
            Log::error('Error regenerating certificate: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete certificate from queue
     */
    public function deleteCertificate($certificateId)
    {
        try {
            $cert = CertificateQueue::findOrFail($certificateId);

            // Don't allow deleting primary certificate if it's the only one
            if ($cert->is_primary) {
                $otherCerts = CertificateQueue::where('enrollment_id', $cert->enrollment_id)
                    ->where('id', '!=', $cert->id)
                    ->count();

                if ($otherCerts === 0) {
                    return redirect()->back()
                        ->withErrors(['error' => 'Tidak dapat menghapus sertifikat utama karena ini satu-satunya sertifikat.']);
                }
            }

            // Delete file from storage
            if ($cert->certificate_file && Storage::disk('public')->exists($cert->certificate_file)) {
                Storage::disk('public')->delete($cert->certificate_file);
            }

            $cert->delete();

            Log::info("Certificate deleted: {$cert->id}");

            return redirect()->back()
                ->with('success', 'Sertifikat berhasil dihapus.');

        } catch (\Exception $e) {
            Log::error('Error deleting certificate: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Download certificate from queue
     */
    public function downloadCertificate($certificateId)
    {
        try {
            $cert = CertificateQueue::with(['user', 'course'])->findOrFail($certificateId);

            if (!$cert->certificate_file) {
                return redirect()->back()->withErrors(['error' => 'File sertifikat tidak ditemukan.']);
            }

            if (!Storage::disk('public')->exists($cert->certificate_file)) {
                return redirect()->back()->withErrors(['error' => 'File sertifikat tidak ada di storage.']);
            }

            // Generate filename
            $userName = trim($cert->user->first_name . ' ' . $cert->user->last_name);
            $courseTitle = $cert->course->title;
            $filename = 'certificate_' . $userName . '_' . $courseTitle . '.pdf';
            $filename = preg_replace('/[^A-Za-z0-9\-_.]/', '_', $filename);

            $fullPath = Storage::disk('public')->path($cert->certificate_file);

            return response()->download($fullPath, $filename);

        } catch (\Exception $e) {
            Log::error('Certificate download error: ' . $e->getMessage());
            return abort(500, 'Error downloading certificate: ' . $e->getMessage());
        }
    }
}
