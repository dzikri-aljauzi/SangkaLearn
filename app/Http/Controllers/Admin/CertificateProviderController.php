<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CertificateProviderController extends Controller
{
    /**
     * Display a listing of certificate providers
     */
    public function index()
    {
        $providers = CertificateProvider::withCount('courses')
            ->ordered()
            ->get();

        return Inertia::render('Admin/CertificateProviders/Index', [
            'providers' => $providers
        ]);
    }

    /**
     * Store a newly created certificate provider
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:certificate_providers,slug',
            'code' => 'required|string|unique:certificate_providers,code|max:50',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('certificate-logos', 'public');
        }

        $provider = CertificateProvider::create($validated);

        return redirect()->back()->with('success', 'Penyedia sertifikat berhasil ditambahkan!');
    }

    /**
     * Update the specified certificate provider
     */
    public function update(Request $request, CertificateProvider $certificateProvider)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:certificate_providers,slug,' . $certificateProvider->id,
            'code' => 'required|string|unique:certificate_providers,code,' . $certificateProvider->id . '|max:50',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($certificateProvider->logo) {
                \Storage::disk('public')->delete($certificateProvider->logo);
            }
            $validated['logo'] = $request->file('logo')->store('certificate-logos', 'public');
        }

        $certificateProvider->update($validated);

        return redirect()->back()->with('success', 'Penyedia sertifikat berhasil diperbarui!');
    }

    /**
     * Remove the specified certificate provider
     */
    public function destroy(CertificateProvider $certificateProvider)
    {
        // Check if provider is being used by any courses
        if ($certificateProvider->courses()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus penyedia sertifikat yang sedang digunakan oleh kursus.');
        }

        // Delete logo if exists
        if ($certificateProvider->logo) {
            \Storage::disk('public')->delete($certificateProvider->logo);
        }

        $certificateProvider->delete();

        return redirect()->back()->with('success', 'Penyedia sertifikat berhasil dihapus!');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(CertificateProvider $certificateProvider)
    {
        $certificateProvider->update([
            'is_active' => !$certificateProvider->is_active
        ]);

        $status = $certificateProvider->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Penyedia sertifikat berhasil {$status}!");
    }
}
