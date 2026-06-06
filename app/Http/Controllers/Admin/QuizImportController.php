<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class QuizImportController extends Controller
{
    /**
     * Download Excel template for quiz import
     */
    public function downloadTemplate()
    {
        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set sheet title
            $sheet->setTitle('Quiz Questions');

            // Header styling
            $headerStyle = [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4'],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ];

            // Set headers
            $headers = [
                'A1' => 'Question Number',
                'B1' => 'Question Text',
                'C1' => 'Question Type',
                'D1' => 'Option A',
                'E1' => 'Option B',
                'F1' => 'Option C',
                'G1' => 'Option D',
                'H1' => 'Correct Answer(s)',
                'I1' => 'Points',
                'J1' => 'Explanation',
            ];

            foreach ($headers as $cell => $value) {
                $sheet->setCellValue($cell, $value);
                $sheet->getStyle($cell)->applyFromArray($headerStyle);
            }

            // Set column widths
            $sheet->getColumnDimension('A')->setWidth(15);
            $sheet->getColumnDimension('B')->setWidth(50);
            $sheet->getColumnDimension('C')->setWidth(20);
            $sheet->getColumnDimension('D')->setWidth(30);
            $sheet->getColumnDimension('E')->setWidth(30);
            $sheet->getColumnDimension('F')->setWidth(30);
            $sheet->getColumnDimension('G')->setWidth(30);
            $sheet->getColumnDimension('H')->setWidth(20);
            $sheet->getColumnDimension('I')->setWidth(10);
            $sheet->getColumnDimension('J')->setWidth(40);

            // Add example data
            $examples = [
                [
                    1,
                    'What is the capital of France?',
                    'multiple_choice',
                    'London',
                    'Paris',
                    'Berlin',
                    'Madrid',
                    'B',
                    1,
                    'Paris is the capital city of France.'
                ],
                [
                    2,
                    'The Earth revolves around the Sun.',
                    'true_false',
                    'True',
                    'False',
                    '',
                    '',
                    'A',
                    1,
                    'The Earth orbits the Sun once every 365.25 days.'
                ],
                [
                    3,
                    'Which of the following are programming languages? (Select all that apply)',
                    'multiple_choice',
                    'Python',
                    'HTML',
                    'Java',
                    'CSS',
                    'A,C',
                    2,
                    'Python and Java are programming languages. HTML and CSS are markup/styling languages.'
                ],
            ];

            $row = 2;
            foreach ($examples as $example) {
                $col = 'A';
                foreach ($example as $value) {
                    $sheet->setCellValue($col . $row, $value);
                    $col++;
                }
                $row++;
            }

            // Add instructions sheet
            $instructionSheet = $spreadsheet->createSheet();
            $instructionSheet->setTitle('Instructions');

            $instructions = [
                ['QUIZ IMPORT TEMPLATE - INSTRUCTIONS'],
                [''],
                ['How to use this template:'],
                [''],
                ['1. QUESTION NUMBER: Sequential number for each question (1, 2, 3, ...)'],
                ['2. QUESTION TEXT: The actual question text'],
                ['3. QUESTION TYPE: Must be one of:'],
                ['   - multiple_choice (for questions with multiple options, single or multiple correct answers)'],
                ['   - true_false (for true/false questions)'],
                ['   - text (for text-based answers)'],
                ['   - fill_blank (for fill in the blank questions)'],
                [''],
                ['4. OPTIONS (A, B, C, D):'],
                ['   - For multiple_choice: Fill all options you need (minimum 2)'],
                ['   - For true_false: Option A = "True", Option B = "False" (leave C and D empty)'],
                ['   - For text/fill_blank: Leave all options empty'],
                [''],
                ['5. CORRECT ANSWER(S):'],
                ['   - For single answer: Enter the letter (A, B, C, or D)'],
                ['   - For multiple answers: Enter letters separated by comma (e.g., "A,C" or "B,D")'],
                ['   - For true_false: A for True, B for False'],
                ['   - For text/fill_blank: Enter the correct answer text'],
                [''],
                ['6. POINTS: Numeric value for question points (e.g., 1, 2, 5)'],
                [''],
                ['7. EXPLANATION: Optional explanation shown after answering'],
                [''],
                ['IMPORTANT NOTES:'],
                ['- Do not change the header row (row 1)'],
                ['- Delete the example rows before importing your questions'],
                ['- All fields are required except Explanation'],
                ['- Question Type must match exactly (case-sensitive)'],
                ['- For multiple correct answers, use comma without spaces: A,C not A, C'],
                ['- Save as .xlsx or .csv format'],
                [''],
                ['EXAMPLES:'],
                ['See the "Quiz Questions" sheet for examples of each question type.'],
            ];

            $iRow = 1;
            foreach ($instructions as $instruction) {
                $instructionSheet->setCellValue('A' . $iRow, $instruction[0]);
                if ($iRow === 1) {
                    $instructionSheet->getStyle('A' . $iRow)->applyFromArray([
                        'font' => ['bold' => true, 'size' => 14],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'FFC000'],
                        ],
                    ]);
                }
                $iRow++;
            }
            $instructionSheet->getColumnDimension('A')->setWidth(80);

            // Set active sheet back to Quiz Questions
            $spreadsheet->setActiveSheetIndex(0);

            // Create writer and save to output
            $writer = new Xlsx($spreadsheet);

            $fileName = 'quiz_import_template_' . date('Y-m-d') . '.xlsx';
            $tempFile = tempnam(sys_get_temp_dir(), 'quiz_template_');

            $writer->save($tempFile);

            return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Failed to generate quiz template: ' . $e->getMessage());
            return back()->with('error', 'Failed to generate template: ' . $e->getMessage());
        }
    }

    /**
     * Import quiz questions from Excel/CSV
     */
    public function import(Request $request, Course $course, CourseSection $section)
    {
        try {
            $validated = $request->validate([
                'import_file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
                'quiz_title' => 'required|string|max:255',
                'quiz_description' => 'nullable|string',
                'quiz_instructions' => 'nullable|string',
                'time_limit' => 'nullable|integer|min:1',
                'attempts_allowed' => 'nullable|integer|min:1',
                'passing_score' => 'nullable|numeric|min:0|max:100',
                'randomize_questions' => 'nullable|boolean',
                'show_correct_answers' => 'nullable|boolean',
                'show_results_immediately' => 'nullable|boolean',
            ]);

            $file = $request->file('import_file');

            // Load spreadsheet
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $data = $sheet->toArray();

            // Remove header row
            $headers = array_shift($data);

            // Validate and parse questions
            $questions = [];
            $errors = [];
            $rowNumber = 2; // Start from row 2 (after header)

            foreach ($data as $row) {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    $rowNumber++;
                    continue;
                }

                try {
                    $question = $this->parseQuestionRow($row, $rowNumber);
                    if ($question) {
                        $questions[] = $question;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                }

                $rowNumber++;
            }

            // If there are errors, return them
            if (!empty($errors)) {
                return back()->withErrors(['import_file' => $errors])->withInput();
            }

            // If no questions found
            if (empty($questions)) {
                return back()->withErrors(['import_file' => 'No valid questions found in the file.'])->withInput();
            }

            // Create quiz with imported questions
            DB::beginTransaction();

            $quiz = Quiz::create([
                'course_id' => $course->id,
                'section_id' => $section->id,
                'title' => $validated['quiz_title'],
                'description' => $validated['quiz_description'] ?? null,
                'instructions' => $validated['quiz_instructions'] ?? null,
                'time_limit' => $validated['time_limit'] ?? null,
                'attempts_allowed' => $validated['attempts_allowed'] ?? 1,
                'passing_score' => $validated['passing_score'] ?? 70,
                'randomize_questions' => $validated['randomize_questions'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'show_results_immediately' => $validated['show_results_immediately'] ?? true,
                'sort_order' => $section->quizzes()->max('sort_order') + 1,
                'is_published' => true,
            ]);

            // Create questions
            foreach ($questions as $index => $questionData) {
                $quiz->questions()->create([
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'],
                    'correct_answers' => $questionData['correct_answers'],
                    'explanation' => $questionData['explanation'],
                    'points' => $questionData['points'],
                    'sort_order' => $index + 1,
                ]);
            }

            DB::commit();

            return back()->with('success', "Quiz created successfully with {$quiz->questions()->count()} questions!");

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Quiz import failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to import quiz: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Parse a single question row from Excel
     */
    private function parseQuestionRow($row, $rowNumber)
    {
        // Extract data from row
        $questionNumber = $row[0] ?? null;
        $questionText = $row[1] ?? null;
        $questionType = $row[2] ?? null;
        $optionA = $row[3] ?? null;
        $optionB = $row[4] ?? null;
        $optionC = $row[5] ?? null;
        $optionD = $row[6] ?? null;
        $correctAnswer = $row[7] ?? null;
        $points = $row[8] ?? 1;
        $explanation = $row[9] ?? null;

        // Validate required fields
        if (empty($questionText)) {
            throw new \Exception("Question text is required");
        }

        if (empty($questionType)) {
            throw new \Exception("Question type is required");
        }

        // Validate question type
        $validTypes = ['multiple_choice', 'true_false', 'text', 'fill_blank'];
        if (!in_array($questionType, $validTypes)) {
            throw new \Exception("Invalid question type '{$questionType}'. Must be one of: " . implode(', ', $validTypes));
        }

        // Parse based on question type
        $options = null;
        $correctAnswers = [];

        switch ($questionType) {
            case 'multiple_choice':
                // Build options array
                $options = array_filter([
                    $optionA,
                    $optionB,
                    $optionC,
                    $optionD,
                ], function($option) {
                    return !empty(trim($option));
                });

                if (count($options) < 2) {
                    throw new \Exception("Multiple choice questions must have at least 2 options");
                }

                // Reset array keys
                $options = array_values($options);

                // Parse correct answers
                if (empty($correctAnswer)) {
                    throw new \Exception("Correct answer is required");
                }

                // Handle multiple correct answers (e.g., "A,C" or "B,D")
                $correctLetters = array_map('trim', explode(',', strtoupper($correctAnswer)));

                foreach ($correctLetters as $letter) {
                    $index = ord($letter) - ord('A'); // Convert A=0, B=1, C=2, D=3

                    if ($index < 0 || $index >= count($options)) {
                        throw new \Exception("Invalid correct answer '{$letter}'. Must be A-" . chr(ord('A') + count($options) - 1));
                    }

                    $correctAnswers[] = $options[$index];
                }
                break;

            case 'true_false':
                $options = ['True', 'False'];

                if (empty($correctAnswer)) {
                    throw new \Exception("Correct answer is required");
                }

                $correctLetter = strtoupper(trim($correctAnswer));
                if ($correctLetter === 'A') {
                    $correctAnswers = ['True'];
                } elseif ($correctLetter === 'B') {
                    $correctAnswers = ['False'];
                } else {
                    throw new \Exception("For true/false questions, correct answer must be A (True) or B (False)");
                }
                break;

            case 'text':
            case 'fill_blank':
                if (empty($correctAnswer)) {
                    throw new \Exception("Correct answer is required");
                }
                $correctAnswers = [trim($correctAnswer)];
                break;
        }

        return [
            'question' => $questionText,
            'type' => $questionType,
            'options' => $options,
            'correct_answers' => $correctAnswers,
            'explanation' => $explanation,
            'points' => floatval($points),
        ];
    }
}
