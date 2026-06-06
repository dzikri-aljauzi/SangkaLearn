<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpecializationController extends Controller
{
    /**
     * Get all active specializations
     */
    public function index()
    {
        try {
            $specializations = Specialization::active()->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $specializations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching specializations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch specializations'
            ], 500);
        }
    }

    /**
     * Store a new specialization
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:specializations,name',
                'description' => 'nullable|string|max:1000'
            ]);

            $specialization = Specialization::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Specialization added successfully',
                'data' => $specialization
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating specialization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create specialization'
            ], 500);
        }
    }

    /**
     * Update a specialization
     */
    public function update(Request $request, Specialization $specialization)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:specializations,name,' . $specialization->id,
                'description' => 'nullable|string|max:1000',
                'is_active' => 'boolean'
            ]);

            $specialization->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Specialization updated successfully',
                'data' => $specialization
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating specialization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update specialization'
            ], 500);
        }
    }

    /**
     * Delete a specialization
     */
    public function destroy(Specialization $specialization)
    {
        try {
            $specialization->delete();

            return response()->json([
                'success' => true,
                'message' => 'Specialization deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting specialization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete specialization'
            ], 500);
        }
    }
}
