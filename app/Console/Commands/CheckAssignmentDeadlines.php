<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use App\Models\User;
use App\Models\Enrollment;
use App\Notifications\AssignmentDeadlineApproaching;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckAssignmentDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assignments:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for assignments with approaching deadlines and notify students';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for assignment deadlines...');

        // Get today and 2 days from now
        $today = Carbon::today();
        $twoDaysFromNow = Carbon::today()->addDays(2)->endOfDay();

        // Find assignments with due dates in the next 2 days
        $upcomingAssignments = Assignment::whereNotNull('due_date')
            ->whereBetween('due_date', [$today, $twoDaysFromNow])
            ->where('is_published', true)
            ->with('course', 'section')
            ->get();

        if ($upcomingAssignments->isEmpty()) {
            $this->info('No assignments with approaching deadlines found.');
            return 0;
        }

        $notificationsSent = 0;

        foreach ($upcomingAssignments as $assignment) {
            try {
                $dueDate = Carbon::parse($assignment->due_date);
                $daysRemaining = $today->diffInDays($dueDate, false);

                // Only send notification for 2 days and 1 day before (not same day)
                if ($daysRemaining < 0 || $daysRemaining > 2) {
                    continue;
                }

                // Get enrolled students for this course
                $enrolledStudents = User::whereHas('enrollments', function($query) use ($assignment) {
                    $query->where('course_id', $assignment->course_id)
                          ->where('status', '!=', 'completed');
                })->get();

                // Filter students who haven't submitted yet
                $studentsToNotify = $enrolledStudents->filter(function($student) use ($assignment) {
                    $submission = $student->assignmentSubmissions()
                        ->where('assignment_id', $assignment->id)
                        ->first();

                    // Notify if no submission or submission is still in draft
                    return !$submission || $submission->status === 'draft';
                });

                if ($studentsToNotify->count() > 0) {
                    // Send notifications
                    Notification::send(
                        $studentsToNotify,
                        new AssignmentDeadlineApproaching(
                            $assignment,
                            $assignment->course,
                            $daysRemaining
                        )
                    );

                    $notificationsSent += $studentsToNotify->count();

                    $this->info(
                        "Sent {$studentsToNotify->count()} notification(s) for assignment: {$assignment->title} " .
                        "(Due in {$daysRemaining} day(s))"
                    );
                }

            } catch (\Exception $e) {
                Log::error('Error sending assignment deadline notification: ' . $e->getMessage(), [
                    'assignment_id' => $assignment->id,
                    'error' => $e->getTraceAsString()
                ]);

                $this->error("Failed to process assignment: {$assignment->title}");
            }
        }

        $this->info("Total notifications sent: {$notificationsSent}");
        return 0;
    }
}
