<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseTargetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CourseTargetCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = CourseTargetCategory::ordered()
            ->withCount(['courses' => function ($query) {
                $query->where('status', 'published');
            }])
            ->get();

        return Inertia::render('Admin/CourseTargetCategories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:course_target_categories,slug',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = CourseTargetCategory::create($validated);

        return redirect()->back()->with('success', 'Kategori target berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CourseTargetCategory $courseTargetCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('course_target_categories', 'slug')->ignore($courseTargetCategory->id),
            ],
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $courseTargetCategory->update($validated);

        return redirect()->back()->with('success', 'Kategori target berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseTargetCategory $courseTargetCategory)
    {
        // Check if there are courses using this category
        if ($courseTargetCategory->courses()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus kategori yang masih digunakan oleh pelatihan');
        }

        $courseTargetCategory->delete();

        return redirect()->back()->with('success', 'Kategori target berhasil dihapus');
    }

    /**
     * Update order for multiple categories
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:course_target_categories,id',
            'orders.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['orders'] as $item) {
            CourseTargetCategory::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return redirect()->back()->with('success', 'Urutan kategori berhasil diperbarui');
    }

    /**
     * Get all active categories (for dropdowns)
     */
    public function getActive()
    {
        $categories = CourseTargetCategory::active()->ordered()->get(['id', 'name', 'slug', 'icon', 'color']);
        return response()->json($categories);
    }
}
