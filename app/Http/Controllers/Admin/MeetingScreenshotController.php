<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingScreenshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MeetingScreenshotController extends Controller
{
    /**
     * Upload multiple screenshots for a meeting
     */
    public function upload(Request $request, $course, $meeting)
    {
        // $course is the course slug from route, $meeting is the meeting ID
        // Find the meeting manually
        $meeting = Meeting::findOrFail($meeting);

        $request->validate([
            'screenshots' => 'required|array|min:1|max:10',
            'screenshots.*' => 'required|image|mimes:jpg,jpeg,png|max:5120', // Max 5MB per file
            'notes' => 'nullable|string',
        ]);

        $uploadedScreenshots = [];

        try {
            // Get the highest order number for this meeting
            $maxOrder = MeetingScreenshot::where('meeting_id', $meeting->id)->max('order') ?? 0;

            foreach ($request->file('screenshots') as $index => $file) {
                // Generate unique filename
                $filename = $meeting->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // Store in public disk
                $path = $file->storeAs('meeting-screenshots', $filename, 'public');

                // Create screenshot record
                $screenshot = MeetingScreenshot::create([
                    'meeting_id' => $meeting->id,
                    'screenshot_path' => $path,
                    'uploaded_by' => auth()->id(),
                    'notes' => $request->notes,
                    'order' => $maxOrder + $index + 1,
                ]);

                $uploadedScreenshots[] = $screenshot->load('uploader');
            }

            return back()->with([
                'success' => count($uploadedScreenshots) . ' screenshot(s) uploaded successfully!',
                'screenshots' => $uploadedScreenshots,
            ]);
        } catch (\Exception $e) {
            Log::error('Screenshot upload failed: ' . $e->getMessage());

            // Clean up any uploaded files on error
            foreach ($uploadedScreenshots as $screenshot) {
                if (Storage::disk('public')->exists($screenshot->screenshot_path)) {
                    Storage::disk('public')->delete($screenshot->screenshot_path);
                }
                $screenshot->delete();
            }

            return back()->withErrors(['error' => 'Failed to upload screenshots: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete a screenshot
     */
    public function delete(MeetingScreenshot $screenshot)
    {
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($screenshot->screenshot_path)) {
                Storage::disk('public')->delete($screenshot->screenshot_path);
            }

            // Delete record
            $screenshot->delete();

            return back()->with('success', 'Screenshot deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Screenshot delete failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete screenshot: ' . $e->getMessage()]);
        }
    }

    /**
     * Reorder screenshots
     */
    public function reorder(Request $request, $course, $meeting)
    {
        // $course is the course slug from route, $meeting is the meeting ID
        // Find the meeting manually
        $meeting = Meeting::findOrFail($meeting);

        $request->validate([
            'screenshots' => 'required|array',
            'screenshots.*.id' => 'required|exists:meeting_screenshots,id',
            'screenshots.*.order' => 'required|integer|min:0',
        ]);

        try {
            foreach ($request->screenshots as $screenshotData) {
                MeetingScreenshot::where('id', $screenshotData['id'])
                    ->where('meeting_id', $meeting->id)
                    ->update(['order' => $screenshotData['order']]);
            }

            return back()->with('success', 'Screenshots reordered successfully!');
        } catch (\Exception $e) {
            Log::error('Screenshot reorder failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to reorder screenshots: ' . $e->getMessage()]);
        }
    }

    /**
     * Update screenshot notes
     */
    public function updateNotes(Request $request, MeetingScreenshot $screenshot)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $screenshot->update([
                'notes' => $request->notes,
            ]);

            return back()->with('success', 'Screenshot notes updated successfully!');
        } catch (\Exception $e) {
            Log::error('Screenshot notes update failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update notes: ' . $e->getMessage()]);
        }
    }
}
