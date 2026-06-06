<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AlumniController extends Controller
{
    /**
     * Display a listing of alumni.
     */
    public function index(Request $request)
    {
        $query = Alumni::query()->with('user');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('program', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('testimonial', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $alumni = $query->ordered()
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Get certified users (approved certificates) for selection dropdown
        $certifiedUsers = $this->getCertifiedUsers();

        return Inertia::render('Admin/Alumni/Index', [
            'alumni' => $alumni,
            'certifiedUsers' => $certifiedUsers,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    /**
     * Get list of users who have been certified (certificates issued)
     * Data from certificates table (sertifikat yang sudah diterbitkan)
     */
    private function getCertifiedUsers()
    {
        return Certificate::with(['user', 'course'])
            ->where(function ($query) {
                // Valid certificates that are not revoked
                $query->where(function ($q) {
                    $q->where('is_valid', true);
                })->where(function ($q) {
                    $q->whereNull('is_revoked')
                      ->orWhere('is_revoked', false);
                });
            })
            ->orderBy('issued_at', 'desc')
            ->get()
            ->map(function ($cert) {
                // Get user's full name
                $userName = 'Unknown';
                if ($cert->user) {
                    $firstName = $cert->user->first_name ?? '';
                    $lastName = $cert->user->last_name ?? '';
                    $userName = trim($firstName . ' ' . $lastName);
                    if (empty($userName)) {
                        $userName = $cert->user->name ?? 'Unknown';
                    }
                }

                return [
                    'id' => $cert->id,
                    'user_id' => $cert->user_id,
                    'course_id' => $cert->course_id,
                    'user_name' => $userName,
                    'user_email' => $cert->user ? $cert->user->email : null,
                    'user_avatar' => $cert->user ? $cert->user->avatar : null,
                    'user_company' => $cert->user ? $cert->user->company : null,
                    'user_job_title' => $cert->user ? $cert->user->job_title : null,
                    'user_linkedin_url' => $cert->user ? $cert->user->linkedin_url : null,
                    'course_title' => $cert->course ? $cert->course->title : 'Unknown Course',
                    'certificate_number' => $cert->certificate_number,
                    'issued_at' => $cert->issued_at,
                    // Check if already added as alumni (by user_id and course_id combination)
                    'is_alumni' => Alumni::where('user_id', $cert->user_id)
                        ->where('program', $cert->course ? $cert->course->title : '')
                        ->exists(),
                ];
            });
    }

    /**
     * Store a newly created alumni.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'certificate_id' => 'nullable|exists:certificates,id',
            'name' => 'required|string|max:255',
            'program' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'testimonial' => 'required|string',
            'linkedin_url' => 'nullable|url|max:500',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'nullable',
        ]);

        // Remove certificate_id from validated data (we don't store it, just use for tracking)
        unset($validated['certificate_id']);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('alumni-photos', 'public');
        }

        // Handle is_active boolean
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $validated['sort_order'] = Alumni::max('sort_order') + 1;

        Alumni::create($validated);

        return redirect()->back()->with('success', 'Alumni berhasil ditambahkan.');
    }

    /**
     * Update the specified alumni.
     */
    public function update(Request $request, Alumni $alumni)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'certificate_id' => 'nullable|exists:certificates,id',
            'name' => 'required|string|max:255',
            'program' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'testimonial' => 'required|string',
            'linkedin_url' => 'nullable|url|max:500',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'nullable',
        ]);

        // Remove certificate_id from validated data
        unset($validated['certificate_id']);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($alumni->photo) {
                Storage::disk('public')->delete($alumni->photo);
            }
            $validated['photo'] = $request->file('photo')->store('alumni-photos', 'public');
        }

        // Handle is_active boolean
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $alumni->update($validated);

        return redirect()->back()->with('success', 'Alumni berhasil diperbarui.');
    }

    /**
     * Remove the specified alumni.
     */
    public function destroy(Alumni $alumni)
    {
        // Delete photo if exists
        if ($alumni->photo) {
            Storage::disk('public')->delete($alumni->photo);
        }

        $alumni->delete();

        return redirect()->back()->with('success', 'Alumni berhasil dihapus.');
    }

    /**
     * Update sort order.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:alumni,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            Alumni::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Urutan berhasil diperbarui.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Alumni $alumni)
    {
        $alumni->update(['is_active' => !$alumni->is_active]);

        return redirect()->back()->with('success', 'Status alumni berhasil diperbarui.');
    }
}
