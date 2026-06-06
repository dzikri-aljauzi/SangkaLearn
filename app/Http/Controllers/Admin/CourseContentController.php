<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Meeting;
use App\Models\MeetingAttendance;
use App\Models\Enrollment;
use App\Notifications\MeetingAlertNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CourseContentController extends Controller
{
    /**
     * Show course content management page
     */
    public function show(Course $course)
    {
        $course->load([
            'sections.lessons' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.assignments' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.quizzes' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.quizzes.questions' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.meetings' => function($query) {
                $query->orderBy('sort_order')->orderBy('scheduled_at');
            }
        ]);

        // Load course-level meetings (meetings without section_id)
        $courseLevelMeetings = Meeting::where('course_id', $course->id)
            ->whereNull('section_id')
            ->orderBy('scheduled_at')
            ->get();

        return Inertia::render('Admin/Courses/Content/Index', [
            'course' => $course,
            'courseLevelMeetings' => $courseLevelMeetings,
        ]);
    }

    /**
     * Store a new section
     */
    public function storeSection(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['course_id'] = $course->id;
        $validated['sort_order'] = $validated['sort_order'] ?? ($course->sections()->max('sort_order') + 1);
        $validated['is_published'] = true;

        $section = CourseSection::create($validated);

        return redirect()->back()->with('success', 'Section created successfully!');
    }

    /**
     * Update section
     */
    public function updateSection(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_published' => 'boolean',
        ]);

        $section->update($validated);

        return redirect()->back()->with('success', 'Section updated successfully!');
    }

    /**
     * Delete section
     */
    public function deleteSection(Course $course, CourseSection $section)
    {
        try {
            DB::beginTransaction();

            // Delete associated content
            $section->lessons()->delete();
            $section->assignments()->delete();
            $section->quizzes()->delete();
            
            $section->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Section deleted successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Failed to delete section.');
        }
    }

    /**
     * Store a new lesson
     */
    public function storeLesson(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:reading,video,quiz,assignment,document,live_session,scorm',
            'content' => 'nullable|string',
            'content_blocks' => 'nullable|array', // For structured text + image content
            'content_blocks.*.id' => 'nullable|string',
            'content_blocks.*.type' => 'nullable|in:text,image',
            'content_blocks.*.content' => 'nullable|string',
            'content_blocks.*.caption' => 'nullable|string',
            'content_blocks.*.order' => 'nullable|integer',
            'content_blocks.*.file' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'content_blocks.*.path' => 'nullable|string',
            'content_blocks.*.url' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'content_images' => 'nullable|array',
            'content_images.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:5120', // 5MB per image
            'image_positions' => 'nullable|array',
            'video_url' => 'nullable|string', // For Google Drive
            'video_provider' => 'nullable|in:drive,file', // Google Drive or direct upload
            'video_duration' => 'nullable|string',
            'video_file' => 'nullable|file|mimes:mp4,avi,mov,wmv,flv,webm,mkv|max:5242880', // Max 5GB
            'video_file_path' => 'nullable|string', // For chunked upload
            'video_size' => 'nullable|integer',
            'video_mime_type' => 'nullable|string',
            'document_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf|max:51200', // 50MB max
            'attachment' => 'nullable|file|max:10240', // 10MB max (backwards compatibility)
            'is_preview' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Validate video file is present if type is video and provider is file
        if ($validated['type'] === 'video' && ($request->input('video_provider') === 'file' || $validated['video_provider'] === 'file')) {
            if (!$request->has('video_file_path') && !$request->hasFile('video_file') && empty($validated['video_url'])) {
                return redirect()->back()->withErrors([
                    'video_file' => 'Video file is required when video provider is set to "Upload Video File"'
                ])->withInput();
            }
        }

        $validated['course_id'] = $course->id;
        $validated['section_id'] = $section->id;
        $validated['sort_order'] = $validated['sort_order'] ?? ($section->lessons()->max('sort_order') + 1);
        $validated['is_published'] = true;

        // Handle content images for reading type
        if ($request->hasFile('content_images') && $validated['type'] === 'reading') {
            $contentImages = [];
            $imagePositions = $request->input('image_positions', []);

            foreach ($request->file('content_images') as $index => $imageFile) {
                $imagePath = $imageFile->store('lessons/images', 'public');

                $contentImages[] = [
                    'path' => $imagePath,
                    'original_name' => $imageFile->getClientOriginalName(),
                    'size' => $imageFile->getSize(),
                    'mime_type' => $imageFile->getClientMimeType(),
                    'position' => $imagePositions[$index] ?? 'after_content', // before_content, after_content, inline
                    'order' => $index + 1
                ];
            }

            $validated['content_images'] = $contentImages;
        }

        // Handle content_blocks for structured text + image content (new system)
        if ($request->has('content_blocks') && !empty($validated['content_blocks'])) {
            $contentBlocks = [];

            foreach ($validated['content_blocks'] as $index => $block) {
                $blockData = [
                    'id' => $block['id'] ?? uniqid(),
                    'type' => $block['type'],
                    'order' => $block['order'] ?? $index,
                ];

                if ($block['type'] === 'text') {
                    $blockData['content'] = $block['content'] ?? '';
                } elseif ($block['type'] === 'image') {
                    // Check if there's a file upload
                    if ($request->hasFile("content_blocks.{$index}.file")) {
                        $imageFile = $request->file("content_blocks.{$index}.file");
                        $imagePath = $imageFile->store('lessons/content-blocks', 'public');
                        $blockData['path'] = $imagePath;
                        $blockData['url'] = asset('storage/' . $imagePath);
                    } elseif (isset($block['path'])) {
                        // Existing image (editing)
                        $blockData['path'] = $block['path'];
                        $blockData['url'] = $block['url'] ?? asset('storage/' . $block['path']);
                    }
                    $blockData['caption'] = $block['caption'] ?? '';
                }

                $contentBlocks[] = $blockData;
            }

            $validated['content_blocks'] = $contentBlocks;
        }

        // Handle document file upload
        if ($request->hasFile('document_file') && $validated['type'] === 'document') {
            $documentFile = $request->file('document_file');
            $documentPath = $documentFile->store('lessons/documents', 'public');

            $validated['document_file'] = $documentPath;
            $validated['document_filename'] = $documentFile->getClientOriginalName();
            $validated['document_size'] = $documentFile->getSize();
            $validated['document_mime_type'] = $documentFile->getClientMimeType();
        }

        // Handle video file upload (both chunked and direct)
        if ($validated['type'] === 'video') {
            // Check if video was uploaded via chunked upload
            if ($request->has('video_file_path')) {
                $validated['video_file'] = $request->input('video_file_path');
                $validated['video_size'] = $request->input('video_size');
                $validated['video_mime_type'] = $request->input('video_mime_type');
                $validated['video_provider'] = 'file';

                // Try to get video duration
                $fullPath = storage_path('app/public/' . $request->input('video_file_path'));
                if (file_exists($fullPath)) {
                    $validated['video_duration_seconds'] = $this->getVideoDuration($fullPath);
                }

                // Clear video_url if video file is uploaded
                $validated['video_url'] = null;

                // Remove video_file_path from validated array (not a database column)
                unset($validated['video_file_path']);
            }
            // Handle direct file upload (fallback)
            else if ($request->hasFile('video_file')) {
                $videoFile = $request->file('video_file');
                $videoPath = $videoFile->store('lessons/videos', 'public');

                $validated['video_file'] = $videoPath;
                $validated['video_size'] = $videoFile->getSize();
                $validated['video_mime_type'] = $videoFile->getClientMimeType();
                $validated['video_provider'] = 'file';

                // Try to get video duration using getID3 or ffprobe if available
                $validated['video_duration_seconds'] = $this->getVideoDuration($videoFile->getPathname());

                // Clear video_url if video file is uploaded
                $validated['video_url'] = null;
            }
        }

        if ($validated['type'] === 'video') {
            // Process video URL if provided (backwards compatibility)
            if (!empty($validated['video_url'])) {
                $videoInfo = $this->processVideoUrl($validated['video_url']);
                $validated['video_url'] = $videoInfo['url'];
                $validated['video_provider'] = $videoInfo['provider'];
            }
        }

        // Handle file upload (backwards compatibility)
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('lessons/attachments', 'public');

            $validated['attachments'] = [[
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]];
        }

        // Remove temporary fields that are not in the Lesson fillable array
        unset($validated['image_positions']);
        unset($validated['video_file_path']);
        unset($validated['attachment']); // Only 'attachments' is in fillable, not 'attachment'

        // Also unset content_images if it contains file uploads (not processed data)
        // It should only be an array of processed image data (with 'path' key)
        if (isset($validated['content_images']) && is_array($validated['content_images'])) {
            // Check if it's empty or contains file uploads instead of processed data
            if (empty($validated['content_images']) ||
                (isset($validated['content_images'][0]) && !isset($validated['content_images'][0]['path']))) {
                unset($validated['content_images']);
            }
        }

        // Log for debugging
        \Log::info('Creating lesson with validated data', ['type' => $validated['type'] ?? 'unknown', 'keys' => array_keys($validated)]);

        $lesson = Lesson::create($validated);

        return redirect()->back()->with('success', 'Lesson created successfully!');
    }

    /**
     * Update lesson
     */
    public function updateLesson(Request $request, Course $course, CourseSection $section, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:reading,video,quiz,assignment,document,live_session,scorm',
            'content' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'content_images' => 'nullable|array',
            'content_images.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:5120', // 5MB per image
            'image_positions' => 'nullable|array',
            'remove_content_images' => 'nullable|array',
            'video_url' => 'nullable|string',
            'video_provider' => 'nullable|in:drive,file', // Google Drive or direct upload
            'video_duration' => 'nullable|string',
            'video_file' => 'nullable|file|mimes:mp4,avi,mov,wmv,flv,webm,mkv|max:5242880', // Max 5GB
            'video_file_path' => 'nullable|string', // For chunked upload
            'video_size' => 'nullable|integer',
            'video_mime_type' => 'nullable|string',
            'document_file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf|max:51200', // 50MB max
            'attachment' => 'nullable|file|max:10240',
            'is_preview' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'integer|min:0',
            'remove_video' => 'boolean',
            'remove_document' => 'boolean',
        ]);

        // Validate video file for new lessons or when changing to file provider
        if ($validated['type'] === 'video' && ($request->input('video_provider') === 'file' || $validated['video_provider'] === 'file')) {
            $hasExistingVideo = $lesson->video_file && !$request->input('remove_video');
            $hasNewVideo = $request->has('video_file_path') || $request->hasFile('video_file');

            if (!$hasExistingVideo && !$hasNewVideo && empty($validated['video_url'])) {
                return redirect()->back()->withErrors([
                    'video_file' => 'Video file is required when video provider is set to "Upload Video File"'
                ])->withInput();
            }
        }

        // Handle document removal
        if ($request->input('remove_document', false)) {
            if ($lesson->document_file && Storage::disk('public')->exists($lesson->document_file)) {
                Storage::disk('public')->delete($lesson->document_file);
            }
            $validated['document_file'] = null;
            $validated['document_filename'] = null;
            $validated['document_size'] = null;
            $validated['document_mime_type'] = null;
        }

        // Handle content images removal
        if ($request->input('remove_content_images')) {
            $existingImages = $lesson->content_images ?? [];
            $removeIndices = $request->input('remove_content_images', []);

            foreach ($removeIndices as $index) {
                if (isset($existingImages[$index]['path']) && Storage::disk('public')->exists($existingImages[$index]['path'])) {
                    Storage::disk('public')->delete($existingImages[$index]['path']);
                }
                unset($existingImages[$index]);
            }

            $validated['content_images'] = array_values($existingImages);
        }

        // Handle video removal
        if ($request->input('remove_video', false)) {
            if ($lesson->video_file && Storage::disk('public')->exists($lesson->video_file)) {
                Storage::disk('public')->delete($lesson->video_file);
            }
            $validated['video_file'] = null;
            $validated['video_size'] = null;
            $validated['video_mime_type'] = null;
            $validated['video_duration_seconds'] = null;
            $validated['video_url'] = null;
            $validated['video_provider'] = null;
        } else {
            // Handle new content images for reading type
            if ($request->hasFile('content_images') && $validated['type'] === 'reading') {
                $existingImages = $lesson->content_images ?? [];
                $imagePositions = $request->input('image_positions', []);

                foreach ($request->file('content_images') as $index => $imageFile) {
                    $imagePath = $imageFile->store('lessons/images', 'public');

                    $existingImages[] = [
                        'path' => $imagePath,
                        'original_name' => $imageFile->getClientOriginalName(),
                        'size' => $imageFile->getSize(),
                        'mime_type' => $imageFile->getClientMimeType(),
                        'position' => $imagePositions[$index] ?? 'after_content',
                        'order' => count($existingImages) + 1
                    ];
                }

                $validated['content_images'] = $existingImages;
            }

            // Handle document file upload
            if ($request->hasFile('document_file') && $validated['type'] === 'document') {
                // Delete old document file if exists
                if ($lesson->document_file && Storage::disk('public')->exists($lesson->document_file)) {
                    Storage::disk('public')->delete($lesson->document_file);
                }

                $documentFile = $request->file('document_file');
                $documentPath = $documentFile->store('lessons/documents', 'public');

                $validated['document_file'] = $documentPath;
                $validated['document_filename'] = $documentFile->getClientOriginalName();
                $validated['document_size'] = $documentFile->getSize();
                $validated['document_mime_type'] = $documentFile->getClientMimeType();
            }

            // Handle video file upload (both chunked and direct)
            if ($validated['type'] === 'video') {
                // Check if video was uploaded via chunked upload
                if ($request->has('video_file_path')) {
                    // Delete old video file if exists
                    if ($lesson->video_file && Storage::disk('public')->exists($lesson->video_file)) {
                        Storage::disk('public')->delete($lesson->video_file);
                    }

                    $validated['video_file'] = $request->input('video_file_path');
                    $validated['video_size'] = $request->input('video_size');
                    $validated['video_mime_type'] = $request->input('video_mime_type');
                    $validated['video_provider'] = 'file';

                    // Try to get video duration
                    $fullPath = storage_path('app/public/' . $request->input('video_file_path'));
                    if (file_exists($fullPath)) {
                        $validated['video_duration_seconds'] = $this->getVideoDuration($fullPath);
                    }

                    // Clear video_url if video file is uploaded
                    $validated['video_url'] = null;

                    // Remove video_file_path from validated array (not a database column)
                    unset($validated['video_file_path']);
                }
                // Handle direct file upload (fallback)
                else if ($request->hasFile('video_file')) {
                    // Delete old video file if exists
                    if ($lesson->video_file && Storage::disk('public')->exists($lesson->video_file)) {
                        Storage::disk('public')->delete($lesson->video_file);
                    }

                    $videoFile = $request->file('video_file');
                    $videoPath = $videoFile->store('lessons/videos', 'public');

                    $validated['video_file'] = $videoPath;
                    $validated['video_size'] = $videoFile->getSize();
                    $validated['video_mime_type'] = $videoFile->getClientMimeType();
                    $validated['video_provider'] = 'file';

                    // Try to get video duration
                    $validated['video_duration_seconds'] = $this->getVideoDuration($videoFile->getPathname());

                    // Clear video_url if video file is uploaded
                    $validated['video_url'] = null;
                }
            }

            if ($validated['type'] === 'video') {
                // Process video URL if provided (backwards compatibility)
                if (!empty($validated['video_url'])) {
                    $videoInfo = $this->processVideoUrl($validated['video_url']);
                    $validated['video_url'] = $videoInfo['url'];
                    $validated['video_provider'] = $videoInfo['provider'];
                }
            }
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($lesson->attachments) {
                foreach ($lesson->attachments as $attachment) {
                    if (isset($attachment['path']) && Storage::disk('public')->exists($attachment['path'])) {
                        Storage::disk('public')->delete($attachment['path']);
                    }
                }
            }

            $file = $request->file('attachment');
            $path = $file->store('lessons/attachments', 'public');

            $validated['attachments'] = [[
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]];
        }

        // Remove temporary fields that are not in the Lesson fillable array
        unset($validated['image_positions']);
        unset($validated['video_file_path']);
        unset($validated['attachment']);
        unset($validated['remove_content_images']);
        unset($validated['remove_video']);
        unset($validated['remove_document']);

        $lesson->update($validated);

        return redirect()->back()->with('success', 'Lesson updated successfully!');
    }

    /**
     * Delete lesson
     */
    public function deleteLesson(Course $course, CourseSection $section, Lesson $lesson)
    {
        try {
            // Delete video file
            if ($lesson->video_file && Storage::disk('public')->exists($lesson->video_file)) {
                Storage::disk('public')->delete($lesson->video_file);
            }

            // Delete document file
            if ($lesson->document_file && Storage::disk('public')->exists($lesson->document_file)) {
                Storage::disk('public')->delete($lesson->document_file);
            }

            // Delete content images
            if ($lesson->content_images) {
                foreach ($lesson->content_images as $image) {
                    if (isset($image['path']) && Storage::disk('public')->exists($image['path'])) {
                        Storage::disk('public')->delete($image['path']);
                    }
                }
            }

            // Delete attachments (backwards compatibility)
            if ($lesson->attachments) {
                foreach ($lesson->attachments as $attachment) {
                    if (isset($attachment['path']) && Storage::disk('public')->exists($attachment['path'])) {
                        Storage::disk('public')->delete($attachment['path']);
                    }
                }
            }

            $lesson->delete();

            return redirect()->back()->with('success', 'Lesson deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete lesson.');
        }
    }

    /**
     * Store a new assignment
     */
    public function storeAssignment(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'max_points' => 'required|integer|min:1',
            'due_date' => 'nullable|date',
            'allow_late_submission' => 'boolean',
            'late_penalty_percent' => 'nullable|integer|min:0|max:100',
            'submission_types' => 'nullable|array',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['course_id'] = $course->id;
        $validated['section_id'] = $section->id;
        $validated['sort_order'] = $validated['sort_order'] ?? ($section->assignments()->max('sort_order') + 1);
        $validated['is_published'] = true;
        
        // Convert submission_types to JSON
        if (isset($validated['submission_types'])) {
            $validated['submission_types'] = json_encode($validated['submission_types']);
        } else {
            $validated['submission_types'] = json_encode(['file']);
        }

        $assignment = Assignment::create($validated);

        return redirect()->back()->with('success', 'Assignment created successfully!');
    }

    /**
     * Update assignment
     */
    public function updateAssignment(Request $request, Course $course, CourseSection $section, Assignment $assignment)
    {
        try {
            \Log::info('Assignment Update Request:', [
                'all_data' => $request->all(),
                'assignment_id' => $assignment->id,
                'section_id' => $section->id,
                'course_id' => $course->id
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'instructions' => 'nullable|string',
                'max_points' => 'required|numeric|min:1',
                'due_date' => 'nullable|date',
                'allow_late_submission' => 'nullable|boolean',
                'late_penalty_percent' => 'nullable|numeric|min:0|max:100',
                'submission_types' => 'nullable|array',
                'is_published' => 'nullable|boolean',
                'sort_order' => 'nullable|numeric|min:0',
            ]);

            \Log::info('Validated Data:', $validated);

            // Ensure boolean fields have proper values
            $validated['allow_late_submission'] = $validated['allow_late_submission'] ?? false;
            $validated['is_published'] = $validated['is_published'] ?? $assignment->is_published;

            // Convert numeric strings to integers
            $validated['max_points'] = (int) $validated['max_points'];
            if (isset($validated['late_penalty_percent'])) {
                $validated['late_penalty_percent'] = (int) $validated['late_penalty_percent'];
            }
            if (isset($validated['sort_order'])) {
                $validated['sort_order'] = (int) $validated['sort_order'];
            }

            // Convert submission_types to JSON if provided
            if (isset($validated['submission_types'])) {
                $validated['submission_types'] = json_encode($validated['submission_types']);
            }

            \Log::info('Data Before Update:', $validated);

            $assignment->update($validated);

            \Log::info('Assignment Updated Successfully');

            return redirect()->back()->with('success', 'Assignment updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation Error:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput()
                ->with('error', 'Validation failed: ' . json_encode($e->errors()));
        } catch (\Exception $e) {
            \Log::error('Assignment Update Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to update assignment: ' . $e->getMessage());
        }
    }

    /**
     * Delete assignment
     */
    public function deleteAssignment(Course $course, CourseSection $section, Assignment $assignment)
    {
        $assignment->delete();
        return redirect()->back()->with('success', 'Assignment deleted successfully!');
    }

    /**
     * Store a new quiz
     */
    public function storeQuiz(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'attempts_allowed' => 'integer|min:1',
            'passing_score' => 'numeric|min:0|max:100',
            'randomize_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
            'show_results_immediately' => 'boolean',
            'allow_retake_until_pass' => 'nullable|boolean',
            'max_retake_attempts' => 'nullable|integer|min:1',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
            'sort_order' => 'integer|min:0',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,text,fill_blank',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answers' => 'required|array',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.points' => 'required|numeric|min:0.1',
        ]);

        try {
            DB::beginTransaction();

            $quizData = [
                'course_id' => $course->id,
                'section_id' => $section->id,
                'sort_order' => $validated['sort_order'] ?? ($section->quizzes()->max('sort_order') + 1),
                'is_published' => true,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'instructions' => $validated['instructions'],
                'time_limit' => $validated['time_limit'],
                'attempts_allowed' => $validated['attempts_allowed'],
                'passing_score' => $validated['passing_score'],
                'randomize_questions' => $validated['randomize_questions'],
                'show_correct_answers' => $validated['show_correct_answers'],
                'show_results_immediately' => $validated['show_results_immediately'],
                'allow_retake_until_pass' => $validated['allow_retake_until_pass'] ?? false,
                'max_retake_attempts' => $validated['max_retake_attempts'] ?? null,
                'available_from' => $validated['available_from'],
                'available_until' => $validated['available_until'],
            ];

            $quiz = Quiz::create($quizData);

            // Create questions
            foreach ($validated['questions'] as $index => $questionData) {
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

            return redirect()->back()->with('success', 'Quiz created successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Failed to create quiz: ' . $e->getMessage());
        }
    }

    /**
     * Update quiz
     */
    public function updateQuiz(Request $request, Course $course, CourseSection $section, Quiz $quiz)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'attempts_allowed' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'randomize_questions' => 'nullable|boolean',
            'show_correct_answers' => 'nullable|boolean',
            'show_results_immediately' => 'nullable|boolean',
            'allow_retake_until_pass' => 'nullable|boolean',
            'max_retake_attempts' => 'nullable|integer|min:1',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
            'is_published' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,text,fill_blank',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answers' => 'required|array',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.points' => 'required|numeric|min:0.1',
        ]);

        try {
            DB::beginTransaction();

            // Update quiz data with proper defaults for optional fields
            $quizData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'instructions' => $validated['instructions'] ?? null,
                'time_limit' => $validated['time_limit'] ?? null,
                'attempts_allowed' => $validated['attempts_allowed'] ?? 1,
                'passing_score' => $validated['passing_score'] ?? 70,
                'randomize_questions' => $validated['randomize_questions'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'show_results_immediately' => $validated['show_results_immediately'] ?? true,
                'allow_retake_until_pass' => $validated['allow_retake_until_pass'] ?? false,
                'max_retake_attempts' => $validated['max_retake_attempts'] ?? null,
                'available_from' => $validated['available_from'] ?? null,
                'available_until' => $validated['available_until'] ?? null,
                'is_published' => $validated['is_published'] ?? $quiz->is_published,
                'sort_order' => $validated['sort_order'] ?? $quiz->sort_order,
            ];

            $quiz->update($quizData);

            // Delete existing questions
            $quiz->questions()->delete();

            // Create new questions
            foreach ($validated['questions'] as $index => $questionData) {
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

            return redirect()->back()->with('success', 'Quiz updated successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Failed to update quiz: ' . $e->getMessage());
        }
    }

    /**
     * Delete quiz
     */
    public function deleteQuiz(Course $course, CourseSection $section, Quiz $quiz)
    {
        $quiz->delete();
        return redirect()->back()->with('success', 'Quiz deleted successfully!');
    }

    /**
     * Reorder sections
     */
    public function reorderSections(Request $request, Course $course)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:course_sections,id',
            'sections.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($validated['sections'] as $sectionData) {
            CourseSection::where('id', $sectionData['id'])
                ->where('course_id', $course->id)
                ->update(['sort_order' => $sectionData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Section order updated successfully!');
    }

    /**
     * Reorder lessons within a section
     */
    public function reorderLessons(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($validated['lessons'] as $lessonData) {
            Lesson::where('id', $lessonData['id'])
                ->where('section_id', $section->id)
                ->update(['sort_order' => $lessonData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Lesson order updated successfully!');
    }

    /**
     * Move section up/down
     */
    public function moveSectionOrder(Request $request, Course $course, CourseSection $section)
    {
        $direction = $request->input('direction'); // 'up' or 'down'
        
        if ($direction === 'up') {
            $adjacentSection = CourseSection::where('course_id', $course->id)
                ->where('sort_order', '<', $section->sort_order)
                ->orderBy('sort_order', 'desc')
                ->first();
        } else {
            $adjacentSection = CourseSection::where('course_id', $course->id)
                ->where('sort_order', '>', $section->sort_order)
                ->orderBy('sort_order', 'asc')
                ->first();
        }

        if ($adjacentSection) {
            $tempOrder = $section->sort_order;
            $section->update(['sort_order' => $adjacentSection->sort_order]);
            $adjacentSection->update(['sort_order' => $tempOrder]);
        }

        return redirect()->back()->with('success', 'Section order updated successfully!');
    }

    /**
     * Move lesson up/down
     */
    public function moveLessonOrder(Request $request, Course $course, CourseSection $section, Lesson $lesson)
    {
        $direction = $request->input('direction'); // 'up' or 'down'
        
        if ($direction === 'up') {
            $adjacentLesson = Lesson::where('section_id', $section->id)
                ->where('sort_order', '<', $lesson->sort_order)
                ->orderBy('sort_order', 'desc')
                ->first();
        } else {
            $adjacentLesson = Lesson::where('section_id', $section->id)
                ->where('sort_order', '>', $lesson->sort_order)
                ->orderBy('sort_order', 'asc')
                ->first();
        }

        if ($adjacentLesson) {
            $tempOrder = $lesson->sort_order;
            $lesson->update(['sort_order' => $adjacentLesson->sort_order]);
            $adjacentLesson->update(['sort_order' => $tempOrder]);
        }

        return redirect()->back()->with('success', 'Lesson order updated successfully!');
    }

    /**
     * Store a new meeting
     */
    public function storeMeeting(Request $request, Course $course, CourseSection $section)
    {
        $validated = $request->validate([
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
        $validated['section_id'] = $section->id;
        $validated['sort_order'] = $validated['sort_order'] ?? ($section->meetings()->max('sort_order') + 1);

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
    public function updateMeeting(Request $request, Course $course, CourseSection $section, Meeting $meeting)
    {
        $validated = $request->validate([
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
    public function deleteMeeting(Course $course, CourseSection $section, Meeting $meeting)
    {
        $meeting->delete();
        return redirect()->back()->with('success', 'Meeting deleted successfully!');
    }

    /**
     * Send alert email to all enrolled students for a meeting
     */
    public function sendMeetingAlert(Meeting $meeting)
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
    public function getMeetingEnrolledStudents(Meeting $meeting)
    {
        $course = $meeting->course;

        $students = $course->enrollments()
            ->where('status', 'active')
            ->with('user:id,name,email')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->user->id,
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'enrolled_at' => $enrollment->created_at,
                ];
            });

        return response()->json([
            'students' => $students,
            'total' => $students->count(),
        ]);
    }

    /**
     * Process video URL and extract provider information
     */
    private function processVideoUrl($url)
    {
        $url = trim($url);

        // YouTube URL patterns
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $url, $match)) {
            $videoId = $match[1];
            // Add security parameters to prevent sharing and copying
            $securityParams = [
                'controls' => '1',           // Show player controls
                'disablekb' => '1',          // Disable keyboard shortcuts
                'fs' => '0',                 // Disable fullscreen
                'modestbranding' => '1',     // Remove YouTube branding
                'rel' => '0',                // Don't show related videos
                'showinfo' => '0',           // Don't show video info
                'iv_load_policy' => '3',     // Don't show annotations
                'cc_load_policy' => '0',     // Don't show captions by default
                'autoplay' => '0',           // Don't autoplay
                'loop' => '0',               // Don't loop video
                'enablejsapi' => '1'         // Enable JS API for additional control
            ];

            $queryString = http_build_query($securityParams);

            return [
                'url' => "https://www.youtube.com/embed/{$videoId}?{$queryString}",
                'provider' => 'youtube',
                'video_id' => $videoId
            ];
        }

        // Vimeo URL patterns
        if (preg_match('/(?:vimeo\.com\/)([0-9]+)/', $url, $match)) {
            $videoId = $match[1];
            return [
                'url' => "https://player.vimeo.com/video/{$videoId}",
                'provider' => 'vimeo',
                'video_id' => $videoId
            ];
        }

        // Google Drive URL patterns
        if (preg_match('/drive\.google\.com/', $url)) {
            // Extract file ID from various Google Drive URL formats
            if (preg_match('/\/file\/d\/([a-zA-Z0-9_-]+)/', $url, $match)) {
                $videoId = $match[1];
            } elseif (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $url, $match)) {
                $videoId = $match[1];
            } else {
                $videoId = null;
            }

            if ($videoId) {
                // Use preview endpoint which disables download by default
                return [
                    'url' => "https://drive.google.com/file/d/{$videoId}/preview",
                    'provider' => 'drive',
                    'video_id' => $videoId
                ];
            }
        }

        // For other URLs, treat as direct file/stream
        return [
            'url' => $url,
            'provider' => 'file',
            'video_id' => null
        ];
    }

    /**
     * Get video duration in seconds using ffprobe or getID3
     */
    private function getVideoDuration($filePath)
    {
        try {
            // Try ffprobe first (most reliable)
            if (function_exists('exec') && !empty(shell_exec('which ffprobe'))) {
                $output = shell_exec("ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"$filePath\"");
                if ($output && is_numeric(trim($output))) {
                    return (int) round(floatval(trim($output)));
                }
            }
            
            // Try using getID3 library if available
            if (class_exists('getID3')) {
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze($filePath);
                if (isset($fileInfo['playtime_seconds'])) {
                    return (int) round($fileInfo['playtime_seconds']);
                }
            }
            
            // Fallback: return null (will be handled gracefully)
            return null;
            
        } catch (\Exception $e) {
            \Log::warning('Failed to get video duration: ' . $e->getMessage());
            return null;
        }
    }
}