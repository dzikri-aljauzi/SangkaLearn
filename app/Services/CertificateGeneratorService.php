<?php

namespace App\Services;

use App\Models\CertificateQueue;
use App\Models\Course;
use App\Models\User;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CertificateGeneratorService
{
    /**
     * Generate certificate PDF for a student
     *
     * @param CertificateQueue $certificateQueue
     * @return string|null Path to generated PDF
     */
    public function generate(CertificateQueue $certificateQueue)
    {
        try {
            // Increase memory limit for PDF generation
            $oldMemoryLimit = ini_get('memory_limit');
            ini_set('memory_limit', '512M');

            $student = $certificateQueue->user;
            // Load course with instructor relationship for fallback name
            $course = $certificateQueue->course->load('instructor');

            // Prepare certificate data
            $certificateData = $this->prepareCertificateData($student, $course, $certificateQueue);

            // Generate HTML from view
            $html = view('certificates.template', $certificateData)->render();

            // Generate PDF using Snappy (wkhtmltopdf)
            // Options are configured in config/snappy.php
            $pdfContent = SnappyPdf::loadHTML($html)->output();

            // Generate filename
            $filename = $this->generateFilename($student, $course);

            // Save PDF to storage
            $path = 'certificates/' . $filename;
            Storage::disk('public')->put($path, $pdfContent);

            // Save the certificate number to the queue record
            $certificateQueue->update([
                'certificate_number' => $certificateData['certificate_number'],
            ]);

            // Restore original memory limit
            ini_set('memory_limit', $oldMemoryLimit);

            Log::info("Certificate PDF generated successfully for user {$student->id} in course {$course->id} with number {$certificateData['certificate_number']}");

            return $path;
        } catch (\Exception $e) {
            Log::error('Error generating certificate PDF: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Restore memory limit even on error
            if (isset($oldMemoryLimit)) {
                ini_set('memory_limit', $oldMemoryLimit);
            }

            return null;
        }
    }

    /**
     * Prepare certificate data for template
     *
     * @param User $student
     * @param Course $course
     * @param CertificateQueue $certificateQueue
     * @return array
     */
    private function prepareCertificateData(User $student, Course $course, CertificateQueue $certificateQueue)
    {
        // Format completion date in Indonesian
        Carbon::setLocale('id');
        $completionDate = Carbon::parse($certificateQueue->completed_at);

        // Get competency units from course sections
        $competencyUnits = $this->getCompetencyUnits($course);

        // Get instructor name - prefer saved value, fallback to instructor's actual name
        $instructorName = $course->instructor_name;
        if (empty($instructorName) && $course->instructor) {
            $instructorName = trim($course->instructor->first_name . ' ' . $course->instructor->last_name);
        }
        // Final fallback if no instructor
        if (empty($instructorName)) {
            $instructorName = 'Instructor';
        }

        return [
            'student_name' => strtoupper($student->name),
            'course_title' => $course->title,
            'course_description' => $course->description,
            'instructor_name' => $instructorName,
            'completion_date' => $completionDate->translatedFormat('d F Y'),
            'completion_day' => $completionDate->translatedFormat('l'),
            'certificate_number' => $this->generateCertificateNumber($student, $course, $certificateQueue),
            'issue_date' => Carbon::now()->translatedFormat('d F Y'),
            'student_id' => $student->id,
            'course_id' => $course->id,
            'enrollment_date' => $certificateQueue->enrollment ?
                Carbon::parse($certificateQueue->enrollment->created_at)->translatedFormat('d F Y') : '-',
            'competency_units' => $competencyUnits,
            // Unit Kompetensi - dynamic array for certificate template
            'certificate_unit_kompetensi' => is_array($course->certificate_unit_kompetensi)
                ? array_filter($course->certificate_unit_kompetensi)
                : [],
        ];
    }

    /**
     * Get competency units from course
     *
     * @param Course $course
     * @return array
     */
    private function getCompetencyUnits(Course $course)
    {
        $units = [];

        // Get units from course metadata if available
        if (!empty($course->competency_units)) {
            return is_array($course->competency_units) ? $course->competency_units : json_decode($course->competency_units, true) ?? [];
        }

        // Otherwise, generate from course sections
        $sections = $course->sections()->with('lessons')->get();

        foreach ($sections as $section) {
            if (!empty($section->title)) {
                $units[] = $section->title;
            }
        }

        return $units;
    }

    /**
     * Generate unique certificate number
     * Format: CERT/YYYY/RANDOM5CHARS
     * Random characters ensure uniqueness per certificate issuance
     * Each course and each student will get a different certificate number
     *
     * @param User $student
     * @param Course $course
     * @param CertificateQueue $certificateQueue
     * @return string
     */
    private function generateCertificateNumber(User $student, Course $course, CertificateQueue $certificateQueue)
    {
        $year = Carbon::parse($certificateQueue->completed_at)->format('Y');

        // Generate unique random string (5 alphanumeric characters)
        // Using a combination that includes course and student info for added uniqueness
        $uniqueBase = $course->id . $student->id . microtime(true) . mt_rand(1000, 9999);
        $randomChars = strtoupper(substr(md5($uniqueBase), 0, 5));

        // Ensure we don't have certificate number collision
        $maxAttempts = 10;
        $attempt = 0;
        $certificateNumber = sprintf('CERT/%s/%s', $year, $randomChars);

        while ($this->certificateNumberExists($certificateNumber) && $attempt < $maxAttempts) {
            $uniqueBase = $course->id . $student->id . microtime(true) . mt_rand(1000, 9999) . $attempt;
            $randomChars = strtoupper(substr(md5($uniqueBase), 0, 5));
            $certificateNumber = sprintf('CERT/%s/%s', $year, $randomChars);
            $attempt++;
        }

        return $certificateNumber;
    }

    /**
     * Check if certificate number already exists
     *
     * @param string $certificateNumber
     * @return bool
     */
    private function certificateNumberExists(string $certificateNumber): bool
    {
        // Check in certificate_queue table
        return CertificateQueue::where('certificate_number', $certificateNumber)->exists();
    }

    /**
     * Generate PDF filename
     *
     * @param User $student
     * @param Course $course
     * @return string
     */
    private function generateFilename(User $student, Course $course)
    {
        $timestamp = time();
        $studentName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $student->name);
        $courseSlug = $course->slug ?? preg_replace('/[^A-Za-z0-9_\-]/', '_', $course->title);

        return "certificate_{$studentName}_{$courseSlug}_{$timestamp}.pdf";
    }

    /**
     * Preview certificate without saving (for testing)
     *
     * @param CertificateQueue $certificateQueue
     * @return \Illuminate\Http\Response
     */
    public function preview(CertificateQueue $certificateQueue)
    {
        try {
            // Increase memory limit for PDF generation
            $oldMemoryLimit = ini_get('memory_limit');
            ini_set('memory_limit', '512M');

            $student = $certificateQueue->user;
            // Load course with instructor relationship for fallback name
            $course = $certificateQueue->course->load('instructor');

            $certificateData = $this->prepareCertificateData($student, $course, $certificateQueue);

            // Generate HTML from view
            $html = view('certificates.template', $certificateData)->render();

            // Restore original memory limit before returning
            ini_set('memory_limit', $oldMemoryLimit);

            // Generate and stream PDF using Snappy (wkhtmltopdf)
            return SnappyPdf::loadHTML($html)
                ->inline('certificate_preview.pdf');

        } catch (\Exception $e) {
            Log::error('Error previewing certificate PDF: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Restore memory limit even on error
            if (isset($oldMemoryLimit)) {
                ini_set('memory_limit', $oldMemoryLimit);
            }

            throw $e;
        }
    }
}
