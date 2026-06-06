<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobInformationController extends Controller
{
    /**
     * Display a listing of job informations.
     */
    public function index(Request $request)
    {
        $query = JobInformation::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $jobs = $query->ordered()
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Get unique locations for filter
        $locations = JobInformation::select('location')
            ->distinct()
            ->pluck('location')
            ->filter()
            ->values();

        return Inertia::render('Admin/JobInformation/Index', [
            'jobs' => $jobs,
            'locations' => $locations,
            'filters' => $request->only(['search', 'status', 'type', 'per_page']),
        ]);
    }

    /**
     * Store a newly created job information.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'location' => 'required|string|max:255',
            'type' => 'required|in:full-time,part-time,contract,internship',
            'deadline' => 'nullable|date',
            'requirements' => 'nullable|array',
            'requirements.*' => 'nullable|string',
            'description' => 'nullable|string',
            'apply_url' => 'nullable|url|max:500',
            'is_active' => 'nullable',
        ]);

        // Handle logo upload
        if ($request->hasFile('company_logo')) {
            $validated['company_logo'] = $request->file('company_logo')->store('job-logos', 'public');
        }

        // Handle is_active boolean
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        // Handle empty requirements
        if (!isset($validated['requirements']) || empty($validated['requirements'])) {
            $validated['requirements'] = [];
        }

        $validated['sort_order'] = JobInformation::max('sort_order') + 1;

        JobInformation::create($validated);

        return redirect()->back()->with('success', 'Lowongan berhasil ditambahkan.');
    }

    /**
     * Update the specified job information.
     */
    public function update(Request $request, JobInformation $jobInformation)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'location' => 'required|string|max:255',
            'type' => 'required|in:full-time,part-time,contract,internship',
            'deadline' => 'nullable|date',
            'requirements' => 'nullable|array',
            'requirements.*' => 'nullable|string',
            'description' => 'nullable|string',
            'apply_url' => 'nullable|url|max:500',
            'is_active' => 'nullable',
        ]);

        // Handle logo upload
        if ($request->hasFile('company_logo')) {
            // Delete old logo if exists
            if ($jobInformation->company_logo) {
                Storage::disk('public')->delete($jobInformation->company_logo);
            }
            $validated['company_logo'] = $request->file('company_logo')->store('job-logos', 'public');
        }

        // Handle is_active boolean
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        // Handle empty requirements
        if (!isset($validated['requirements']) || empty($validated['requirements'])) {
            $validated['requirements'] = [];
        }

        $jobInformation->update($validated);

        return redirect()->back()->with('success', 'Lowongan berhasil diperbarui.');
    }

    /**
     * Remove the specified job information.
     */
    public function destroy(JobInformation $jobInformation)
    {
        // Delete logo if exists
        if ($jobInformation->company_logo) {
            Storage::disk('public')->delete($jobInformation->company_logo);
        }

        $jobInformation->delete();

        return redirect()->back()->with('success', 'Lowongan berhasil dihapus.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(JobInformation $jobInformation)
    {
        $jobInformation->update(['is_active' => !$jobInformation->is_active]);

        return redirect()->back()->with('success', 'Status lowongan berhasil diperbarui.');
    }

    /**
     * Update sort order.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:job_informations,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            JobInformation::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Urutan berhasil diperbarui.');
    }
}
