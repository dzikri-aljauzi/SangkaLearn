<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories for public view
     */
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->with('courses')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Display a single category for public view
     */
    public function show(Category $category)
    {
        $category->load(['courses' => function ($query) {
            $query->where('status', 'published')
                ->with('instructor', 'category');
        }]);

        return Inertia::render('Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Display a listing of categories for admin
     */
    public function adminIndex()
    {
        $categories = Category::withCount('courses')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Set default values
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $category = Category::create($validated);

        return back()->with([
            'success' => 'Category created successfully!',
            'category' => $category
        ]);
    }

    /**
     * Update an existing category
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        // Generate slug from name if name changed
        if ($request->name !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return back()->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified category
     */
    public function destroy(Category $category)
    {
        // Check if category has courses
        if ($category->courses()->count() > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete category with existing courses. Please move or delete the courses first.'
            ]);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully!');
    }
}
