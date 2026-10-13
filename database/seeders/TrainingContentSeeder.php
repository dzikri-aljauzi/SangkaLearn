<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\CourseTargetCategory;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Fleshes out the training catalogue with fictional demo data:
 *  - a 4-section syllabus (sections + reading lessons) for every course that has none,
 *  - target audience categories (Mahasiswa / Pemerintah / Perusahaan) per course,
 *  - a handful of student enrollments with progress and approved reviews.
 *
 * Idempotent: safe to run repeatedly and on an already-seeded database
 * (php artisan db:seed --class=TrainingContentSeeder --force).
 */
class TrainingContentSeeder extends Seeder
{
    public function run(): void
    {
        $courses = Course::with('category')->get();

        if ($courses->isEmpty()) {
            $this->command->warn('No courses found. Run DemoCourseSeeder / ProfessionalTrainingSeeder first.');
            return;
        }

        $syllabi = 0;
        foreach ($courses as $course) {
            if ($course->sections()->exists()) {
                continue;
            }
            $this->seedSyllabus($course);
            $syllabi++;
        }

        $this->seedTargetCategories($courses);
        [$enrollments, $reviews] = $this->seedEnrollmentsAndReviews($courses);

        $this->command->info("Training content seeded: {$syllabi} syllabi, {$enrollments} new enrollments, {$reviews} new reviews.");
    }

    private function seedSyllabus(Course $course): void
    {
        $objectives = $this->objectives($course);

        $outline = [
            ['Pengantar & Orientasi', 'Gambaran umum program, tujuan, dan cara belajar', [
                ["Selamat Datang di {$course->title}", 8, true],
                ['Tujuan Pembelajaran dan Cara Belajar yang Efektif', 10, false],
                ['Peta Materi dan Jadwal Belajar', 6, false],
            ]],
            ['Konsep Inti', 'Pemahaman konsep dan kerangka kerja utama', array_map(
                fn ($o, $i) => ['Modul ' . ($i + 1) . ': ' . $o, 25, $i === 0],
                array_slice($objectives, 0, 3),
                array_keys(array_slice($objectives, 0, 3))
            )],
            ['Studi Kasus & Praktik', 'Penerapan konsep pada skenario kerja nyata', [
                ['Studi Kasus: Penerapan di Organisasi Menengah', 30, false],
                ['Latihan Terbimbing dan Lembar Kerja', 35, false],
                ['Diskusi dan Tanya Jawab Umum', 15, false],
            ]],
            ['Evaluasi & Penutup', 'Ringkasan, persiapan asesmen, dan langkah lanjutan', [
                ['Ringkasan Materi dan Poin Kunci', 12, false],
                ['Persiapan Asesmen dan Contoh Soal', 20, false],
                ['Langkah Selanjutnya dan Sumber Belajar Tambahan', 8, false],
            ]],
        ];

        foreach ($outline as $sIndex => [$sTitle, $sDesc, $lessons]) {
            $section = CourseSection::firstOrCreate(
                ['course_id' => $course->id, 'title' => $sTitle],
                ['description' => $sDesc, 'sort_order' => $sIndex + 1, 'is_published' => true]
            );

            foreach ($lessons as $lIndex => [$lTitle, $minutes, $preview]) {
                Lesson::firstOrCreate(
                    ['course_id' => $course->id, 'section_id' => $section->id, 'title' => $lTitle],
                    [
                        'description' => "Materi {$sTitle} untuk program {$course->title}",
                        'content' => $this->lessonBody($course, $lTitle, $sTitle),
                        'type' => 'reading',
                        'duration_minutes' => $minutes,
                        'sort_order' => $lIndex + 1,
                        'is_published' => true,
                        'is_preview' => $preview,
                    ]
                );
            }
        }
    }

    /** @return string[] at least three learning objectives */
    private function objectives(Course $course): array
    {
        $raw = $course->learning_objectives;
        $list = is_array($raw) ? $raw : (json_decode((string) $raw, true) ?: preg_split('/\R/', trim((string) $raw)));
        $list = array_values(array_filter(array_map('trim', (array) $list)));

        $fallback = [
            'Memahami konsep dasar dan terminologi utama',
            'Menguasai metodologi dan kerangka kerja yang relevan',
            'Menerapkan praktik terbaik pada kasus nyata',
        ];

        return array_slice(array_merge($list, $fallback), 0, 3);
    }

    private function lessonBody(Course $course, string $lessonTitle, string $sectionTitle): string
    {
        return "## {$lessonTitle}\n\n"
            . "Materi ini merupakan bagian dari bagian \"{$sectionTitle}\" pada program {$course->title}. "
            . "Seluruh isi dalam lingkungan demo ini bersifat contoh dan dibuat untuk keperluan tampilan portofolio.\n\n"
            . "### Poin utama\n"
            . "- Pahami konteks dan tujuan dari topik ini sebelum masuk ke detail.\n"
            . "- Hubungkan konsep dengan pengalaman kerja Anda sehari-hari.\n"
            . "- Catat pertanyaan untuk dibahas pada sesi diskusi.\n\n"
            . "### Aktivitas belajar\n"
            . "Baca materi dengan saksama, kerjakan latihan singkat di akhir bagian, lalu lanjutkan ke materi berikutnya setelah menandai bagian ini selesai.";
    }

    private function seedTargetCategories($courses): void
    {
        $targets = CourseTargetCategory::pluck('id', 'slug');
        if ($targets->isEmpty()) {
            return;
        }

        foreach ($courses as $course) {
            if ($course->targetCategories()->exists()) {
                continue;
            }

            $slugs = ['perusahaan'];
            if ($course->level === 'beginner') {
                $slugs[] = 'mahasiswa';
            }
            if (in_array($course->category?->slug, ['risk-management', 'finance', 'certification'], true)) {
                $slugs[] = 'pemerintah';
            }

            $ids = collect($slugs)->map(fn ($s) => $targets[$s] ?? null)->filter()->all();
            $course->targetCategories()->syncWithoutDetaching($ids);
        }
    }

    /** @return array{int,int} [new enrollments, new reviews] */
    private function seedEnrollmentsAndReviews($courses): array
    {
        $students = User::whereHas('roles', fn ($q) => $q->where('name', 'student'))->get();
        $published = $courses->where('status', 'published')->values();

        if ($students->isEmpty() || $published->isEmpty()) {
            return [0, 0];
        }

        $comments = [
            'Materinya runtut dan mudah dipahami. Studi kasusnya relevan dengan pekerjaan saya.',
            'Instruktur menjelaskan dengan jelas, dan latihannya membantu menerapkan konsep.',
            'Program yang terstruktur. Cocok untuk persiapan sertifikasi.',
            'Kontennya padat dan praktis, jadwal belajarnya fleksibel.',
        ];

        $enrollments = 0;
        $reviews = 0;

        foreach ($students as $sIndex => $student) {
            foreach ($published->slice($sIndex * 2, 3) as $cIndex => $course) {
                $state = ($cIndex + $sIndex) % 3; // 0 = completed, 1 = in progress, 2 = just started
                $progress = [100, 55, 10][$state];

                $enrollment = Enrollment::firstOrCreate(
                    ['user_id' => $student->id, 'course_id' => $course->id],
                    [
                        'status' => $state === 0 ? 'completed' : 'active',
                        'enrollment_type' => 'manual',
                        'progress_percentage' => $progress,
                        'enrolled_at' => now()->subDays(20 - $cIndex * 5),
                        'completed_at' => $state === 0 ? now()->subDays(3) : null,
                        'last_accessed_at' => now()->subDays($cIndex),
                    ]
                );
                $enrollments += $enrollment->wasRecentlyCreated ? 1 : 0;

                if ($state === 0) {
                    $review = Review::firstOrCreate(
                        ['user_id' => $student->id, 'reviewable_type' => Course::class, 'reviewable_id' => $course->id],
                        [
                            'rating' => 4 + (($sIndex + $cIndex) % 2),
                            'title' => 'Pengalaman belajar yang baik',
                            'content' => $comments[($sIndex + $cIndex) % count($comments)],
                            'is_verified_purchase' => false,
                            'is_approved' => true,
                            'is_featured' => false,
                        ]
                    );
                    $reviews += $review->wasRecentlyCreated ? 1 : 0;
                }
            }
        }

        return [$enrollments, $reviews];
    }
}
