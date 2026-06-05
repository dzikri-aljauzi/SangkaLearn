<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CourseTypeController extends Controller
{
    /**
     * Display a listing of course types
     */
    public function index()
    {
        $courseTypes = CourseType::withCount('courses')
            ->ordered()
            ->get();

        return Inertia::render('Admin/CourseTypes/Index', [
            'courseTypes' => $courseTypes
        ]);
    }

    /**
     * Store a newly created course type
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:course_types,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:course_types,slug',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Set default icon if not provided
        if (empty($validated['icon'])) {
            $validated['icon'] = 'Award';
        }

        // Set default is_active if not provided
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        // Set default order if not provided (last position)
        if (!isset($validated['order'])) {
            // If has parent, get max order within same parent
            if (!empty($validated['parent_id'])) {
                $validated['order'] = CourseType::where('parent_id', $validated['parent_id'])->max('order') + 1;
            } else {
                // If parent, get max order of all parents
                $validated['order'] = CourseType::whereNull('parent_id')->max('order') + 1;
            }
        }

        $courseType = CourseType::create($validated);

        // Refresh the course types list for the response (children only for course forms)
        $courseTypes = CourseType::active()
                                ->children()
                                ->ordered()
                                ->select('id', 'parent_id', 'name', 'slug', 'color', 'icon')
                                ->get();

        return redirect()->back()->with([
            'success' => 'Tipe pelatihan berhasil ditambahkan!',
            'courseTypes' => $courseTypes,
            'newCourseTypeId' => $courseType->id,
        ]);
    }

    /**
     * Update the specified course type
     */
    public function update(Request $request, CourseType $courseType)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:course_types,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:course_types,slug,' . $courseType->id,
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $courseType->update($validated);

        return redirect()->back()->with('success', 'Tipe pelatihan berhasil diupdate!');
    }

    /**
     * Remove the specified course type
     */
    public function destroy(CourseType $courseType)
    {
        // Check if there are courses using this type
        if ($courseType->courses()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus tipe pelatihan yang masih digunakan oleh course!');
        }

        $courseType->delete();

        return redirect()->back()->with('success', 'Tipe pelatihan berhasil dihapus!');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(CourseType $courseType)
    {
        $courseType->update([
            'is_active' => !$courseType->is_active
        ]);

        return redirect()->back()->with('success', 'Status tipe pelatihan berhasil diubah!');
    }

    /**
     * Update order for multiple types
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'types' => 'required|array',
            'types.*.id' => 'required|exists:course_types,id',
            'types.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['types'] as $typeData) {
            CourseType::where('id', $typeData['id'])->update(['order' => $typeData['order']]);
        }

        return redirect()->back()->with('success', 'Urutan tipe pelatihan berhasil diupdate!');
    }
}
