<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Course;
use App\Models\CourseSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Quiz::with(['course', 'section'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->course_id, function ($query, $courseId) {
                $query->where('course_id', $courseId);
            });

        $quizzes = $query->latest()->paginate(15);

        return Inertia::render('Admin/Quizzes/Index', [
            'quizzes' => $quizzes,
            'filters' => $request->only(['search', 'course_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $courses = Course::with('sections')->where('status', 'published')->get();
        $course = null;
        $sections = collect();

        if ($request->course_id) {
            $course = Course::with('sections')->find($request->course_id);
            $sections = $course ? $course->sections : collect();
        }

        return Inertia::render('Admin/Quizzes/Create', [
            'courses' => $courses,
            'selectedCourse' => $course,
            'sections' => $sections,
            'course_id' => $request->course_id,
            'section_id' => $request->section_id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'section_id' => 'nullable|exists:course_sections,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'attempts_allowed' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'randomize_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
            'show_results_immediately' => 'boolean',
            'is_published' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,text,fill_blank',
            'questions.*.points' => 'required|numeric|min:0.1',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answers' => 'required|array|min:1',
            'questions.*.explanation' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Create quiz
            $quiz = Quiz::create([
                'course_id' => $validated['course_id'],
                'section_id' => $validated['section_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'instructions' => $validated['instructions'],
                'time_limit' => $validated['time_limit'],
                'attempts_allowed' => $validated['attempts_allowed'],
                'passing_score' => $validated['passing_score'],
                'randomize_questions' => $validated['randomize_questions'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'show_results_immediately' => $validated['show_results_immediately'] ?? true,
                'is_published' => $validated['is_published'] ?? false,
            ]);

            // Create questions
            foreach ($validated['questions'] as $index => $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'correct_answers' => $questionData['correct_answers'],
                    'explanation' => $questionData['explanation'],
                    'points' => $questionData['points'],
                    'sort_order' => $index + 1,
                ]);
            }

            DB::commit();

            return redirect()->route('admin.quizzes.index')
                           ->with('success', 'Quiz created successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to create quiz: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Quiz $quiz)
    {
        $quiz->load(['course', 'section', 'questions' => function ($query) {
            $query->orderBy('sort_order');
        }]);

        return Inertia::render('Admin/Quizzes/Show', [
            'quiz' => $quiz
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quiz $quiz)
    {
        $quiz->load(['questions' => function ($query) {
            $query->orderBy('sort_order');
        }]);
        
        $courses = Course::with('sections')->where('status', 'published')->get();
        $sections = CourseSection::where('course_id', $quiz->course_id)->get();

        return Inertia::render('Admin/Quizzes/Edit', [
            'quiz' => $quiz,
            'courses' => $courses,
            'sections' => $sections,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'attempts_allowed' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'randomize_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
            'show_results_immediately' => 'boolean',
            'is_published' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,text,fill_blank',
            'questions.*.points' => 'required|numeric|min:0.1',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answers' => 'required|array|min:1',
            'questions.*.explanation' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Update quiz
            $quiz->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'instructions' => $validated['instructions'],
                'time_limit' => $validated['time_limit'],
                'attempts_allowed' => $validated['attempts_allowed'],
                'passing_score' => $validated['passing_score'],
                'randomize_questions' => $validated['randomize_questions'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'show_results_immediately' => $validated['show_results_immediately'] ?? true,
                'is_published' => $validated['is_published'] ?? false,
            ]);

            // Delete existing questions
            $quiz->questions()->delete();

            // Create new questions
            foreach ($validated['questions'] as $index => $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'correct_answers' => $questionData['correct_answers'],
                    'explanation' => $questionData['explanation'],
                    'points' => $questionData['points'],
                    'sort_order' => $index + 1,
                ]);
            }

            DB::commit();

            return redirect()->route('admin.quizzes.index')
                           ->with('success', 'Quiz updated successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to update quiz: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz)
    {
        try {
            $quiz->delete();
            return redirect()->route('admin.quizzes.index')
                           ->with('success', 'Quiz deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                           ->with('error', 'Failed to delete quiz: ' . $e->getMessage());
        }
    }
}
