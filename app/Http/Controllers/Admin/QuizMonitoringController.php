<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with(['course', 'section', 'attempts' => function($q) {
            $q->with(['user', 'quiz']);
        }]);

        // Filter by course
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        // Search by title
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $quizzes = $query->latest()->paginate(10)->withQueryString();

        // Get statistics for each quiz
        $quizzes->getCollection()->transform(function ($quiz) {
            $completedAttempts = $quiz->attempts->where('status', 'completed');

            $quiz->stats = [
                'total_attempts' => $quiz->attempts->count(),
                'completed_attempts' => $completedAttempts->count(),
                'in_progress_attempts' => $quiz->attempts->where('status', 'in_progress')->count(),
                'average_score' => round($completedAttempts->avg('percentage'), 2),
                'pass_rate' => $completedAttempts->count() > 0 ?
                    round(($completedAttempts->where('percentage', '>=', $quiz->passing_score ?? 70)->count() / $completedAttempts->count()) * 100, 1) : 0,
            ];
            return $quiz;
        });

        $courses = Course::select('id', 'title')->get();

        return Inertia::render('Admin/QuizMonitoring/Index', [
            'quizzes' => $quizzes,
            'courses' => $courses,
            'filters' => [
                'search' => $request->search,
                'course_id' => $request->course_id,
            ]
        ]);
    }

    public function show($id)
    {
        $quiz = Quiz::with([
            'course',
            'section',
            'questions', // Remove ->with('options') - options is a JSON field, not a relationship
            'attempts' => function($q) {
                $q->with(['user', 'quiz'])
                ->orderBy('completed_at', 'desc');
            }
        ])->findOrFail($id);

        $completedAttempts = $quiz->attempts->where('status', 'completed');

        // Get detailed statistics
        $stats = [
            'total_attempts' => $quiz->attempts->count(),
            'completed_attempts' => $completedAttempts->count(),
            'in_progress_attempts' => $quiz->attempts->where('status', 'in_progress')->count(),
            'average_score' => round($completedAttempts->avg('percentage'), 2),
            'highest_score' => $completedAttempts->max('percentage'),
            'lowest_score' => $completedAttempts->min('percentage'),
            'pass_rate' => $completedAttempts->count() > 0 ?
                round(($completedAttempts->where('percentage', '>=', $quiz->passing_score ?? 70)->count() / $completedAttempts->count()) * 100, 1) : 0,
            'average_time_taken' => round($completedAttempts->avg('time_taken'), 2),
        ];

        // Question analysis
        $questionStats = [];
        foreach ($quiz->questions as $question) {
            $correctCount = 0;
            $totalCount = 0;
            $wrongAnswers = [];

            foreach ($quiz->attempts->where('status', 'completed') as $attempt) {
                if (!empty($attempt->answers) && is_array($attempt->answers)) {
                    if (isset($attempt->answers[$question->id])) {
                        $userAnswer = $attempt->answers[$question->id];
                        $totalCount++;

                        $isCorrect = $question->checkAnswer($userAnswer);
                        if ($isCorrect) {
                            $correctCount++;
                        } else {
                            $wrongAnswers[] = $userAnswer;
                        }
                    }
                }
            }

            $questionStats[] = [
                'id' => $question->id,
                'question' => $question->question,
                'type' => $question->type,
                'correct_answers' => $correctCount,
                'total_answers' => $totalCount,
                'success_rate' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0,
                'points' => $question->points,
            ];
        }

        return Inertia::render('Admin/QuizMonitoring/Show', [
            'quiz' => $quiz,
            'stats' => $stats,
            'questionStats' => $questionStats
        ]);
    }

    public function showAttempt($quizId, $attemptId)
    {
        $attempt = QuizAttempt::with([
            'user',
            'quiz' => function($q) {
                $q->with(['course', 'questions']); // Load quiz questions directly
            }
        ])->where('quiz_id', $quizId)
          ->where('id', $attemptId)
          ->firstOrFail();

        // Process answers to include question data
        $processedAnswers = [];
        if (!empty($attempt->answers) && is_array($attempt->answers)) {
            foreach ($attempt->answers as $questionId => $answer) {
                $question = $attempt->quiz->questions->firstWhere('id', $questionId);
                if ($question) {
                    $processedAnswers[] = [
                        'question_id' => $questionId,
                        'question' => $question->question,
                        'type' => $question->type,
                        'options' => $question->options,
                        'correct_answers' => $question->correct_answers,
                        'user_answer' => $answer,
                        'is_correct' => $question->checkAnswer($answer),
                        'points' => $question->points,
                    ];
                }
            }
        }

        return Inertia::render('Admin/QuizMonitoring/AttemptDetail', [
            'attempt' => $attempt,
            'processedAnswers' => $processedAnswers
        ]);
    }

    public function exportResults($id)
    {
        $quiz = Quiz::with([
            'course',
            'section',
            'questions',
            'attempts' => function($q) {
                $q->with(['user'])
                  ->where('status', 'completed')
                  ->orderBy('completed_at');
            }
        ])->findOrFail($id);

        // Calculate statistics
        $completedAttempts = $quiz->attempts;
        $totalAttempts = $completedAttempts->count();
        $averageScore = $totalAttempts > 0 ? round($completedAttempts->avg('percentage'), 2) : 0;
        $highestScore = $totalAttempts > 0 ? $completedAttempts->max('percentage') : 0;
        $lowestScore = $totalAttempts > 0 ? $completedAttempts->min('percentage') : 0;
        $passRate = $totalAttempts > 0 ?
            round(($completedAttempts->where('percentage', '>=', $quiz->passing_score ?? 70)->count() / $totalAttempts) * 100, 1) : 0;

        // Use PhpSpreadsheet for better Excel formatting
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();

        // ==================== SHEET 1: Quiz Summary ====================
        $summarySheet = $spreadsheet->getActiveSheet();
        $summarySheet->setTitle('Quiz Summary');

        $row = 1;

        // Title section
        $summarySheet->setCellValue('A' . $row, 'QUIZ RESULTS REPORT');
        $summarySheet->mergeCells('A' . $row . ':D' . $row);
        $summarySheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
        ]);
        $summarySheet->getRowDimension($row)->setRowHeight(30);
        $row += 2;

        // Quiz Information
        $summarySheet->setCellValue('A' . $row, 'Quiz Information');
        $summarySheet->mergeCells('A' . $row . ':D' . $row);
        $summarySheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E5E7EB']],
        ]);
        $row++;

        $infoData = [
            ['Quiz Title:', $quiz->title],
            ['Course:', $quiz->course->title ?? 'N/A'],
            ['Section:', $quiz->section->title ?? 'N/A'],
            ['Total Questions:', $quiz->questions->count()],
            ['Passing Score:', ($quiz->passing_score ?? 70) . '%'],
            ['Time Limit:', $quiz->time_limit ? $quiz->time_limit . ' minutes' : 'No limit'],
            ['Generated On:', now()->format('Y-m-d H:i:s')],
        ];

        foreach ($infoData as $info) {
            $summarySheet->setCellValue('A' . $row, $info[0]);
            $summarySheet->setCellValue('B' . $row, $info[1]);
            $summarySheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
        }
        $row++;

        // Statistics Section
        $summarySheet->setCellValue('A' . $row, 'Quiz Statistics');
        $summarySheet->mergeCells('A' . $row . ':D' . $row);
        $summarySheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E5E7EB']],
        ]);
        $row++;

        $statsData = [
            ['Total Completed Attempts:', $totalAttempts],
            ['Average Score:', $averageScore . '%'],
            ['Highest Score:', $highestScore . '%'],
            ['Lowest Score:', $lowestScore . '%'],
            ['Pass Rate:', $passRate . '%'],
            ['Students Passed:', $completedAttempts->where('percentage', '>=', $quiz->passing_score ?? 70)->count()],
            ['Students Failed:', $completedAttempts->where('percentage', '<', $quiz->passing_score ?? 70)->count()],
        ];

        foreach ($statsData as $stat) {
            $summarySheet->setCellValue('A' . $row, $stat[0]);
            $summarySheet->setCellValue('B' . $row, $stat[1]);
            $summarySheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
        }

        // Auto-size columns
        $summarySheet->getColumnDimension('A')->setWidth(30);
        $summarySheet->getColumnDimension('B')->setWidth(40);

        // ==================== SHEET 2: Student Results ====================
        $resultsSheet = $spreadsheet->createSheet();
        $resultsSheet->setTitle('Student Results');

        // Header row
        $headers = ['#', 'Student Name', 'Email', 'Score (Points)', 'Percentage', 'Status', 'Time Taken', 'Started At', 'Completed At', 'Attempt #'];
        $col = 'A';
        foreach ($headers as $header) {
            $resultsSheet->setCellValue($col . '1', $header);
            $col++;
        }

        // Style header
        $resultsSheet->getStyle('A1:J1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
        ]);
        $resultsSheet->getRowDimension(1)->setRowHeight(25);

        // Data rows
        $row = 2;
        $no = 1;
        foreach ($quiz->attempts as $attempt) {
            $percentage = $attempt->percentage ?? 0;
            $status = $percentage >= ($quiz->passing_score ?? 70) ? 'PASSED' : 'FAILED';
            $timeTaken = $attempt->time_taken ? $this->formatDuration($attempt->time_taken) : 'N/A';
            $attemptNumber = $quiz->attempts->where('user_id', $attempt->user_id)->count();

            $resultsSheet->setCellValue('A' . $row, $no++);
            $resultsSheet->setCellValue('B' . $row, $attempt->user->name);
            $resultsSheet->setCellValue('C' . $row, $attempt->user->email);
            $resultsSheet->setCellValue('D' . $row, $attempt->score);
            $resultsSheet->setCellValue('E' . $row, $percentage . '%');
            $resultsSheet->setCellValue('F' . $row, $status);
            $resultsSheet->setCellValue('G' . $row, $timeTaken);
            $resultsSheet->setCellValue('H' . $row, $attempt->started_at ? $attempt->started_at->format('Y-m-d H:i:s') : 'N/A');
            $resultsSheet->setCellValue('I' . $row, $attempt->completed_at ? $attempt->completed_at->format('Y-m-d H:i:s') : 'N/A');
            $resultsSheet->setCellValue('J' . $row, $attemptNumber);

            // Color code status
            $statusColor = $status === 'PASSED' ? '10B981' : 'EF4444';
            $resultsSheet->getStyle('F' . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => $statusColor]],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            ]);

            // Add borders
            $resultsSheet->getStyle('A' . $row . ':J' . $row)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            ]);

            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'J') as $col) {
            $resultsSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Freeze header row
        $resultsSheet->freezePane('A2');

        // ==================== SHEET 3: Detailed Answers ====================
        $detailsSheet = $spreadsheet->createSheet();
        $detailsSheet->setTitle('Detailed Answers');

        // Header
        $detailHeaders = ['#', 'Student Name', 'Question #', 'Question Text', 'Question Type', 'Correct Answer(s)', 'Student Answer', 'Status', 'Points'];
        $col = 'A';
        foreach ($detailHeaders as $header) {
            $detailsSheet->setCellValue($col . '1', $header);
            $col++;
        }

        // Style header
        $detailsSheet->getStyle('A1:I1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
        ]);
        $detailsSheet->getRowDimension(1)->setRowHeight(25);

        // Data rows
        $row = 2;
        $no = 1;
        foreach ($quiz->attempts as $attempt) {
            if (!empty($attempt->answers) && is_array($attempt->answers)) {
                $questionNumber = 1;
                foreach ($quiz->questions as $question) {
                    if (isset($attempt->answers[$question->id])) {
                        $userAnswer = $attempt->answers[$question->id];
                        $isCorrect = $question->checkAnswer($userAnswer);

                        // Format answers
                        $correctAnswersStr = is_array($question->correct_answers) ? implode(', ', $question->correct_answers) : $question->correct_answers;
                        $userAnswerStr = is_array($userAnswer) ? implode(', ', $userAnswer) : $userAnswer;

                        $detailsSheet->setCellValue('A' . $row, $no);
                        $detailsSheet->setCellValue('B' . $row, $attempt->user->name);
                        $detailsSheet->setCellValue('C' . $row, $questionNumber);
                        $detailsSheet->setCellValue('D' . $row, $question->question);
                        $detailsSheet->setCellValue('E' . $row, ucfirst(str_replace('_', ' ', $question->type)));
                        $detailsSheet->setCellValue('F' . $row, $correctAnswersStr);
                        $detailsSheet->setCellValue('G' . $row, $userAnswerStr);
                        $detailsSheet->setCellValue('H' . $row, $isCorrect ? 'CORRECT' : 'WRONG');
                        $detailsSheet->setCellValue('I' . $row, $isCorrect ? $question->points : 0);

                        // Color code status
                        $statusColor = $isCorrect ? '10B981' : 'EF4444';
                        $detailsSheet->getStyle('H' . $row)->applyFromArray([
                            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => $statusColor]],
                            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
                        ]);

                        // Add borders
                        $detailsSheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
                        ]);

                        $row++;
                        $questionNumber++;
                    }
                }
                $no++;
            }
        }

        // Auto-size columns
        foreach (range('A', 'I') as $col) {
            $detailsSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Freeze header row
        $detailsSheet->freezePane('A2');

        // Set active sheet back to first sheet
        $spreadsheet->setActiveSheetIndex(0);

        // Generate and download
        $fileName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $quiz->title) . '_Results_' . date('Y-m-d_His') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        $tempFile = tempnam(sys_get_temp_dir(), 'quiz_export_');
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Format duration in seconds to readable format
     */
    private function formatDuration($seconds)
    {
        if (!$seconds) return '0s';

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = floor($seconds % 60);

        $parts = [];
        if ($hours > 0) $parts[] = $hours . 'h';
        if ($minutes > 0) $parts[] = $minutes . 'm';
        if ($secs > 0 || empty($parts)) $parts[] = $secs . 's';

        return implode(' ', $parts);
    }

    private function getMostCommonWrongAnswer($answers, $question)
    {
        if ($question->type !== 'multiple_choice') {
            return null;
        }

        $wrongAnswers = $answers->where('is_correct', false);
        if ($wrongAnswers->isEmpty()) {
            return null;
        }

        $answerCounts = $wrongAnswers->countBy('selected_option');
        $mostCommon = $answerCounts->sortDesc()->keys()->first();

        $option = $question->options->where('id', $mostCommon)->first();
        return $option ? $option->option_text : null;
    }

    public function editAttempt($quizId, $attemptId)
    {
        $attempt = QuizAttempt::with([
            'user',
            'quiz' => function($q) {
                $q->with(['course', 'questions']);
            }
        ])->where('quiz_id', $quizId)
          ->where('id', $attemptId)
          ->firstOrFail();

        return Inertia::render('Admin/QuizMonitoring/EditAttempt', [
            'attempt' => $attempt,
            'quiz' => $attempt->quiz
        ]);
    }

    public function updateAttempt(Request $request, $quizId, $attemptId)
    {
        $attempt = QuizAttempt::where('quiz_id', $quizId)
            ->where('id', $attemptId)
            ->firstOrFail();

        $request->validate([
            'score' => 'required|numeric|min:0',
            'percentage' => 'required|numeric|min:0|max:100',
        ]);

        $attempt->update([
            'score' => $request->score,
            'percentage' => $request->percentage,
            'is_passed' => $request->percentage >= ($attempt->quiz->passing_score ?? 70)
        ]);

        return redirect()->route('admin.quizzes.monitoring.show', $quizId)
            ->with('success', 'Quiz attempt updated successfully');
    }

    public function deleteAttempt($quizId, $attemptId)
    {
        $attempt = QuizAttempt::where('quiz_id', $quizId)
            ->where('id', $attemptId)
            ->firstOrFail();

        $attempt->delete();

        return redirect()->route('admin.quizzes.monitoring.show', $quizId)
            ->with('success', 'Quiz attempt deleted successfully');
    }
}