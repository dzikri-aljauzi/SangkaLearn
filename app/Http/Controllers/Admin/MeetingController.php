<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Meeting;
use App\Models\MeetingAttendance;
use App\Models\Enrollment;
use App\Notifications\MeetingAlertNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MeetingController extends Controller
{
    /**
     * Display meetings for a course
     */
    public function index(Course $course)
    {
        $meetings = $course->meetings()
            ->with(['attendances.user', 'section'])
            ->orderBy('scheduled_at', 'asc')
            ->get()
            ->map(function ($meeting) {
                $meeting->attendance_stats = $meeting->getAttendanceStats();
                return $meeting;
            });

        return Inertia::render('Admin/Meetings/Index', [
            'course' => $course->load('sections'),
            'meetings' => $meetings,
        ]);
    }

    /**
     * Store a new meeting
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'section_id' => 'nullable|exists:course_sections,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'zoom_link' => 'required|url',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'notes' => 'nullable|string',
            'meeting_id' => 'nullable|string',
            'passcode' => 'nullable|string',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['course_id'] = $course->id;

        $meeting = Meeting::create($validated);

        // Automatically create attendance records for all enrolled students
        $enrollments = $course->enrollments()->where('status', 'active')->get();

        foreach ($enrollments as $enrollment) {
            MeetingAttendance::create([
                'meeting_id' => $meeting->id,
                'user_id' => $enrollment->user_id,
                'attended' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Meeting created successfully!');
    }

    /**
     * Update an existing meeting
     */
    public function update(Request $request, Course $course, Meeting $meeting)
    {
        $validated = $request->validate([
            'section_id' => 'nullable|exists:course_sections,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'zoom_link' => 'required|url',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'notes' => 'nullable|string',
            'meeting_id' => 'nullable|string',
            'passcode' => 'nullable|string',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $meeting->update($validated);

        return redirect()->back()->with('success', 'Meeting updated successfully!');
    }

    /**
     * Delete a meeting
     */
    public function destroy(Course $course, Meeting $meeting)
    {
        $meeting->delete();

        return redirect()->back()->with('success', 'Meeting deleted successfully!');
    }

    /**
     * Upload attendance proof (screenshot)
     */
    public function uploadAttendanceProof(Request $request, Course $course, Meeting $meeting)
    {
        $request->validate([
            'attendance_proof' => 'required|image|max:5120', // Max 5MB
        ]);

        // Delete old proof if exists
        if ($meeting->attendance_proof) {
            Storage::disk('public')->delete($meeting->attendance_proof);
        }

        $path = $request->file('attendance_proof')->store('meeting-attendance-proofs', 'public');

        $meeting->update([
            'attendance_proof' => $path,
        ]);

        return redirect()->back()->with('success', 'Attendance proof uploaded successfully!');
    }

    /**
     * Mark attendance for students
     */
    public function markAttendance(Request $request, Course $course, Meeting $meeting)
    {
        $validated = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.user_id' => 'required|exists:users,id',
            'attendances.*.attended' => 'required|boolean',
            'attendances.*.notes' => 'nullable|string',
        ]);

        foreach ($validated['attendances'] as $attendanceData) {
            $attendance = MeetingAttendance::firstOrCreate([
                'meeting_id' => $meeting->id,
                'user_id' => $attendanceData['user_id'],
            ]);

            if ($attendanceData['attended']) {
                $attendance->markAsAttended(
                    auth()->user(),
                    $attendanceData['notes'] ?? null
                );
            } else {
                $attendance->markAsNotAttended(
                    auth()->user(),
                    $attendanceData['notes'] ?? null
                );
            }
        }

        return redirect()->back()->with('success', 'Attendance marked successfully!');
    }

    /**
     * Get meeting attendance details
     */
    public function showAttendance(Course $course, Meeting $meeting)
    {
        $meeting->load([
            'attendances.user',
            'attendances.markedBy',
            'course.enrollments.user',
            'screenshots.uploader'
        ]);

        $enrolledStudents = $course->enrollments()
            ->where('status', 'active')
            ->with('user')
            ->get();

        // Ensure all enrolled students have attendance records
        foreach ($enrolledStudents as $enrollment) {
            MeetingAttendance::firstOrCreate([
                'meeting_id' => $meeting->id,
                'user_id' => $enrollment->user_id,
            ], [
                'attended' => false,
            ]);
        }

        // Reload attendances after creating missing ones
        $meeting->load('attendances.user');

        // Add screenshot URLs
        $meeting->screenshots->each(function ($screenshot) {
            $screenshot->url = $screenshot->screenshot_url;
        });

        return Inertia::render('Admin/Meetings/Attendance', [
            'course' => $course,
            'meeting' => $meeting,
            'attendanceStats' => $meeting->getAttendanceStats(),
            'screenshots' => $meeting->screenshots,
        ]);
    }

    /**
     * Send alert email to all enrolled students
     */
    public function sendAlert(Course $course, Meeting $meeting)
    {
        try {
            $course = $meeting->course;

            // Get all active enrolled students
            $enrolledStudents = $course->enrollments()
                ->where('status', 'active')
                ->with('user')
                ->get()
                ->pluck('user');

            if ($enrolledStudents->isEmpty()) {
                return redirect()->back()->with('error', 'Tidak ada peserta terdaftar untuk mengirim alert.');
            }

            // Send notification to all enrolled students
            Notification::send($enrolledStudents, new MeetingAlertNotification($meeting, $course));

            // Update meeting alert tracking
            $meeting->update([
                'alert_sent' => true,
                'alert_sent_at' => now(),
                'alert_sent_by' => auth()->id(),
                'alert_recipients_count' => $enrolledStudents->count(),
            ]);

            Log::info("Meeting alert sent for meeting {$meeting->id} to {$enrolledStudents->count()} students");

            return redirect()->back()->with('success', "Alert berhasil dikirim ke {$enrolledStudents->count()} peserta!");

        } catch (\Exception $e) {
            Log::error('Error sending meeting alert: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengirim alert: ' . $e->getMessage());
        }
    }

    /**
     * Get enrolled students list for preview before sending alert
     */
    public function getEnrolledStudents(Course $course, Meeting $meeting)
    {
        try {
            $enrollments = $course->enrollments()
                ->where('status', 'active')
                ->whereHas('user')
                ->with('user')
                ->get();

            $students = [];
            foreach ($enrollments as $enrollment) {
                if ($enrollment->user) {
                    $students[] = [
                        'id' => $enrollment->user->id,
                        'name' => $enrollment->user->name ?: trim($enrollment->user->first_name . ' ' . $enrollment->user->last_name),
                        'email' => $enrollment->user->email,
                        'enrolled_at' => $enrollment->created_at,
                    ];
                }
            }

            return response()->json([
                'students' => $students,
                'total' => count($students),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching enrolled students: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            return response()->json([
                'students' => [],
                'total' => 0,
                'error' => 'Failed to fetch students: ' . $e->getMessage(),
            ], 500);
        }
    }
}
