<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use App\Events\MessageRead;
use App\Events\UserTyping;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display conversations list
     */
    public function index()
    {
        $conversations = Auth::user()->conversations()
            ->with(['participants.roles', 'latestMessage.user'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        // Add unread count for each conversation
        $conversations->getCollection()->transform(function ($conversation) {
            $conversation->unread_count = $conversation->getUnreadCountForUser(Auth::id());

            // Get other participants (excluding current user) with their roles
            $conversation->other_participants = $conversation->participants
                ->where('id', '!=', Auth::id())
                ->values()
                ->map(function ($participant) {
                    $participant->role = $participant->roles->first()?->name ?? 'user';
                    return $participant;
                });

            return $conversation;
        });

        // Get route prefix for this role
        $routePrefix = $this->getRoutePrefix();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'routePrefix' => $routePrefix,
        ]);
    }

    /**
     * Show specific conversation
     */
    public function show($conversationId)
    {
        try {
            // Manually resolve conversation with better error handling
            $conversation = Conversation::findOrFail($conversationId);

            \Log::info('Viewing conversation', [
                'conversation_id' => $conversationId,
                'user_id' => Auth::id()
            ]);

            // Check if user is participant
            if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
                \Log::warning('Unauthorized conversation access attempt', [
                    'conversation_id' => $conversationId,
                    'user_id' => Auth::id()
                ]);
                abort(403, 'Unauthorized: You are not a participant of this conversation');
            }

            // Load messages with user info
            $messages = $conversation->messages()
                ->with('user')
                ->paginate(50);

            // Get other participants
            $participants = $conversation->participants()
                ->where('users.id', '!=', Auth::id())
                ->get();

            // Mark conversation as read
            $conversation->markAsReadForUser(Auth::id());

            // Broadcast read event (with try-catch to prevent errors)
            try {
                broadcast(new MessageRead(Auth::user(), $conversation))->toOthers();
            } catch (\Exception $broadcastError) {
                // Log broadcast error but don't fail the operation
                \Log::warning('Broadcast read failed: ' . $broadcastError->getMessage());
            }

            // Get route prefix for this role
            $routePrefix = $this->getRoutePrefix();

            return Inertia::render('Messages/Show', [
                'conversation' => $conversation,
                'messages' => $messages,
                'participants' => $participants,
                'routePrefix' => $routePrefix,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Conversation not found', [
                'conversation_id' => $conversationId,
                'user_id' => Auth::id()
            ]);

            $routePrefix = $this->getRoutePrefix();
            return redirect()->route("{$routePrefix}.messages.index")
                ->with('error', 'Conversation not found or has been deleted.');
        }
    }

    /**
     * Create new conversation
     */
    public function create()
    {
        $currentUser = Auth::user();
        $currentUserRole = $currentUser->roles->first()?->name;

        // Get users for recipient selection based on role restrictions
        $query = User::where('id', '!=', $currentUser->id)
            ->with('roles')
            ->whereNotNull('first_name')
            ->whereNotNull('last_name');

        // Apply role-based filtering
        switch ($currentUserRole) {
            case 'sub_admin':
                // Sub admin can only message their assigned special students
                $query->where('assigned_sub_admin_id', $currentUser->id)
                      ->where('user_type', 'special');
                break;

            case 'instructor':
                // Instructor can message:
                // 1. Admin users
                // 2. Students enrolled in their courses
                $query->where(function($q) use ($currentUser) {
                    $q->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'admin');
                    })
                    ->orWhereHas('enrollments.course', function($courseQuery) use ($currentUser) {
                        $courseQuery->where('instructor_id', $currentUser->id);
                    });
                });
                break;

            case 'student':
                // Students can ONLY message admin users
                $query->whereHas('roles', function($roleQuery) {
                    $roleQuery->where('name', 'admin');
                });
                break;

            case 'admin':
                // Admin can message anyone (no additional restrictions)
                break;

            default:
                // Default: can only message admins (safest fallback)
                $query->whereHas('roles', function($roleQuery) {
                    $roleQuery->where('name', 'admin');
                });
                break;
        }

        $users = $query->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
            ->distinct()
            ->orderBy('first_name')
            ->get()
            ->map(function ($user) {
                $user->role = $user->roles->first()?->name ?? 'user';
                $user->full_name = trim($user->first_name . ' ' . $user->last_name);
                return $user;
            });

        \Log::info('New message recipients loaded', [
            'user_role' => $currentUserRole,
            'recipients_count' => $users->count(),
            'user_id' => $currentUser->id
        ]);

        // Get route prefix for this role
        $routePrefix = $this->getRoutePrefix();

        return Inertia::render('Messages/Create', [
            'users' => $users,
            'currentUserRole' => $currentUserRole,
            'routePrefix' => $routePrefix,
        ]);
    }

    /**
     * Store new conversation
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Starting conversation creation', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            // Content is required only if no attachments
            $rules = [
                'recipients' => 'required|array|min:1',
                'recipients.*' => 'required|integer|exists:users,id',
                'subject' => 'required|string|min:3|max:255',
                'attachments.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip,txt',
            ];

            // If no attachments, content is required
            if (!$request->hasFile('attachments')) {
                $rules['content'] = 'required|string|min:1|max:10000';
            } else {
                $rules['content'] = 'nullable|string|max:10000';
            }

            $validated = $request->validate($rules);

            \Log::info('Validation passed', ['validated' => $validated]);

            // Verify all recipients exist and have required fields
            $recipientUsers = User::whereIn('id', $validated['recipients'])
                ->whereNotNull('first_name')
                ->whereNotNull('last_name')
                ->pluck('id')
                ->toArray();

            if (count($recipientUsers) !== count($validated['recipients'])) {
                \Log::warning('Some recipients are invalid or incomplete');
                return back()->withErrors([
                    'recipients' => 'One or more selected recipients are invalid. Please try again.'
                ])->withInput();
            }

            $currentUser = Auth::user();
            $currentUserRole = $currentUser->roles->first()?->name;

            // Remove current user from recipients if somehow included
            $recipients = array_diff($validated['recipients'], [$currentUser->id]);

            if (empty($recipients)) {
                \Log::warning('No recipients after filtering');
                return back()->withErrors(['recipients' => 'At least one recipient is required.']);
            }

            // Additional validation for sub admin role
            if ($currentUserRole === 'sub_admin') {
                $allowedRecipients = User::where('assigned_sub_admin_id', $currentUser->id)
                    ->where('user_type', 'special')
                    ->pluck('id')
                    ->toArray();

                $invalidRecipients = array_diff($recipients, $allowedRecipients);
                if (!empty($invalidRecipients)) {
                    \Log::warning('Sub admin trying to message non-assigned users', [
                        'invalid_recipients' => $invalidRecipients
                    ]);
                    return back()->withErrors(['recipients' => 'You can only message students assigned to you.']);
                }
            }

            DB::beginTransaction();

            // Create conversation
            $conversation = Conversation::create([
                'subject' => $validated['subject'],
                'last_message_at' => now(),
            ]);

            \Log::info('Conversation created', ['conversation_id' => $conversation->id]);

            // Add participants (current user + recipients)
            $participantIds = array_merge([Auth::id()], $recipients);
            foreach ($participantIds as $userId) {
                $conversation->participants()->attach($userId, [
                    'last_read_at' => $userId === Auth::id() ? now() : null,
                ]);
            }

            \Log::info('Participants added', ['participant_count' => count($participantIds)]);

            // Handle file uploads
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('message_attachments', 'public');
                    $attachmentPaths[] = [
                        'path' => $path,
                        'name' => $file->getClientOriginalName(),
                        'type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }

            // Create initial message (content can be empty if attachments exist)
            $message = $conversation->messages()->create([
                'user_id' => Auth::id(),
                'content' => $validated['content'] ?? '',
                'attachments' => !empty($attachmentPaths) ? json_encode($attachmentPaths) : null,
            ]);

            \Log::info('Initial message created', ['message_id' => $message->id]);

            // Broadcast message sent event (with try-catch to prevent errors)
            try {
                broadcast(new MessageSent($message, $conversation))->toOthers();
            } catch (\Exception $broadcastError) {
                // Log broadcast error but don't fail the message send
                \Log::warning('Broadcast failed: ' . $broadcastError->getMessage());
            }

            // Send notification to recipients about new message
            try {
                $recipientUsers = User::whereIn('id', $recipients)->get();
                // Set subject on message for notification
                $message->subject = $conversation->subject;
                Notification::send($recipientUsers, new NewMessageReceived($message, $currentUser, $conversation->id));
            } catch (\Exception $notifError) {
                \Log::warning('Failed to send new message notifications: ' . $notifError->getMessage());
            }

            DB::commit();

            \Log::info('Conversation creation successful', ['conversation_id' => $conversation->id]);

            // Get role-specific route prefix
            $routePrefix = $this->getRoutePrefix();

            // Redirect to the conversation page
            // This ensures proper URL structure and conversation is accessible
            return redirect()->route("{$routePrefix}.messages.show", $conversation->id)
                ->with('success', 'Message sent successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollback();
            }

            \Log::error('Failed to create conversation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);

            return back()->withErrors([
                'error' => 'Failed to send message. Please try again. Error: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Send message to existing conversation
     */
    public function sendMessage(Request $request, $conversationId)
    {
        try {
            // Manually resolve conversation with better error handling
            $conversation = Conversation::findOrFail($conversationId);

            \Log::info('Sending message to conversation', [
                'conversation_id' => $conversationId,
                'user_id' => Auth::id()
            ]);

            // Check if user is participant
            if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
                \Log::warning('Unauthorized message send attempt', [
                    'conversation_id' => $conversationId,
                    'user_id' => Auth::id()
                ]);
                abort(403, 'Unauthorized: You are not a participant of this conversation');
            }

            // Content is required only if no attachments
            $rules = [
                'attachments.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip,txt',
            ];

            // If no attachments, content is required
            if (!$request->hasFile('attachments')) {
                $rules['content'] = 'required|string|max:10000';
            } else {
                $rules['content'] = 'nullable|string|max:10000';
            }

            $validated = $request->validate($rules);

            // Handle file uploads
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('message_attachments', 'public');
                    $attachmentPaths[] = [
                        'path' => $path,
                        'name' => $file->getClientOriginalName(),
                        'type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }

            // Create message (content can be empty if attachments exist)
            $message = $conversation->messages()->create([
                'user_id' => Auth::id(),
                'content' => $validated['content'] ?? '',
                'attachments' => !empty($attachmentPaths) ? json_encode($attachmentPaths) : null,
            ]);

            // Load user relationship for the message
            $message->load('user');

            // Update conversation last message time
            $conversation->update([
                'last_message_at' => now(),
            ]);

            // Reset read status for all participants except sender
            $participantIds = $conversation->participants()->where('users.id', '!=', Auth::id())->pluck('users.id');
            foreach ($participantIds as $participantId) {
                $conversation->participants()->updateExistingPivot($participantId, ['last_read_at' => null]);
            }

            // Broadcast message sent event (with try-catch to prevent errors)
            try {
                broadcast(new MessageSent($message, $conversation))->toOthers();
            } catch (\Exception $broadcastError) {
                // Log broadcast error but don't fail the message send
                \Log::warning('Broadcast failed: ' . $broadcastError->getMessage());
            }

            // Send notification to other participants about new message
            try {
                $currentUser = Auth::user();
                $otherParticipants = $conversation->participants()
                    ->where('users.id', '!=', Auth::id())
                    ->get();

                if ($otherParticipants->count() > 0) {
                    // Set subject on message for notification
                    $message->subject = $conversation->subject;
                    Notification::send($otherParticipants, new NewMessageReceived($message, $currentUser, $conversation->id));
                }
            } catch (\Exception $notifError) {
                \Log::warning('Failed to send new message notifications: ' . $notifError->getMessage());
            }

            \Log::info('Message sent successfully', [
                'message_id' => $message->id,
                'conversation_id' => $conversation->id
            ]);

            // Check if this is a file upload request (from FormData)
            if ($request->hasFile('attachments')) {
                // For file uploads via Inertia, return redirect back
                return back()->with('success', 'Message sent successfully!');
            }

            // For regular AJAX requests (text-only), return JSON
            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully!',
                'data' => [
                    'message' => $message,
                    'conversation_id' => $conversation->id
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Conversation not found', [
                'conversation_id' => $conversationId,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found. The conversation may have been deleted or you may not have access to it.'
            ], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'conversation_id' => $conversationId
            ]);

            // If request has files or is Inertia request, return back with errors
            if ($request->hasFile('attachments') || $request->header('X-Inertia')) {
                return back()->withErrors($e->errors())->withInput();
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Message send failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'conversation_id' => $conversationId,
                'user_id' => Auth::id()
            ]);

            // If request has files or is Inertia request, return back with error
            if ($request->hasFile('attachments') || $request->header('X-Inertia')) {
                return back()->with('error', 'Failed to send message: ' . $e->getMessage());
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search users for new message
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('search', '');
        $currentUser = Auth::user();
        $currentUserRole = $currentUser->roles->first()?->name;

        $query = User::where('id', '!=', $currentUser->id)
            ->with('roles')
            ->whereNotNull('first_name')
            ->whereNotNull('last_name')
            ->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });

        // Apply same role-based filtering as create() method
        switch ($currentUserRole) {
            case 'sub_admin':
                // Sub admin can only search their assigned special students
                $query->where('assigned_sub_admin_id', $currentUser->id)
                      ->where('user_type', 'special');
                break;

            case 'instructor':
                // Instructor can search:
                // 1. Admin users
                // 2. Students enrolled in their courses
                $query->where(function($q) use ($currentUser) {
                    $q->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'admin');
                    })
                    ->orWhereHas('enrollments.course', function($courseQuery) use ($currentUser) {
                        $courseQuery->where('instructor_id', $currentUser->id);
                    });
                });
                break;

            case 'student':
                // Students can ONLY search admin users
                $query->whereHas('roles', function($roleQuery) {
                    $roleQuery->where('name', 'admin');
                });
                break;

            case 'admin':
                // Admin can search anyone (no additional restrictions)
                break;

            default:
                // Default: can only search admins
                $query->whereHas('roles', function($roleQuery) {
                    $roleQuery->where('name', 'admin');
                });
                break;
        }

        $users = $query->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
            ->distinct()
            ->orderBy('first_name')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                $user->role = $user->roles->first()?->name ?? 'user';
                return $user;
            });

        return response()->json($users);
    }

    /**
     * Handle typing indicator
     */
    public function typing(Request $request, $conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            // Check if user is participant
            if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'is_typing' => 'required|boolean',
            ]);

            // Broadcast typing event (with try-catch to prevent errors)
            try {
                broadcast(new UserTyping(Auth::user(), $conversation, $validated['is_typing']))->toOthers();
            } catch (\Exception $broadcastError) {
                // Log broadcast error but don't fail the operation
                \Log::warning('Broadcast typing failed: ' . $broadcastError->getMessage());
            }

            return response()->json(['status' => 'success']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }
    }

    /**
     * Get latest messages (for polling)
     */
    public function getMessages(Request $request, $conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            // Check if user is participant
            if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $since = $request->get('since');

            $query = $conversation->messages()
                ->with('user')
                ->orderBy('created_at', 'desc');

            if ($since) {
                $query->where('created_at', '>', $since);
            }

            $messages = $query->limit(50)->get()->reverse()->values();

            return response()->json([
                'messages' => $messages,
                'conversation_id' => $conversation->id,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead($conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            // Check if user is participant
            if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $conversation->markAsReadForUser(Auth::id());

            // Broadcast read event (with try-catch to prevent errors)
            try {
                broadcast(new MessageRead(Auth::user(), $conversation))->toOthers();
            } catch (\Exception $broadcastError) {
                // Log broadcast error but don't fail the operation
                \Log::warning('Broadcast read failed: ' . $broadcastError->getMessage());
            }

            return response()->json(['status' => 'success']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }
    }

    /**
     * Update message (edit)
     */
    public function updateMessage(Request $request, Message $message)
    {
        try {
            // Check if user owns the message
            if ($message->user_id !== Auth::id()) {
                return back()->with('error', 'Unauthorized: You can only edit your own messages');
            }

            // Check if message is within 5 minutes edit window
            $minutesSinceCreation = $message->created_at->diffInMinutes(now());
            if ($minutesSinceCreation > 5) {
                return back()->with('error', 'Edit time limit exceeded. Messages can only be edited within 5 minutes.');
            }

            // Validate request
            $validated = $request->validate([
                'content' => 'required|string|min:1|max:10000',
                'attachments.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip,txt',
                'existing_attachments' => 'nullable|array', // IDs of attachments to keep
            ]);

            // Handle file attachments
            $attachmentPaths = [];

            // Keep existing attachments if specified
            if ($request->has('existing_attachments') && !empty($request->existing_attachments)) {
                $existingAttachments = json_decode($message->attachments, true) ?? [];
                foreach ($request->existing_attachments as $index) {
                    if (isset($existingAttachments[$index])) {
                        $attachmentPaths[] = $existingAttachments[$index];
                    }
                }
            }

            // Add new attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('message_attachments', 'public');
                    $attachmentPaths[] = [
                        'path' => $path,
                        'name' => $file->getClientOriginalName(),
                        'type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }

            // Update message
            $message->update([
                'content' => $validated['content'],
                'attachments' => !empty($attachmentPaths) ? json_encode($attachmentPaths) : null,
                'edited_at' => now(),
            ]);

            \Log::info('Message updated', [
                'message_id' => $message->id,
                'user_id' => Auth::id(),
                'has_attachments' => !empty($attachmentPaths)
            ]);

            // Get route prefix and redirect to conversation
            $routePrefix = $this->getRoutePrefix();
            return redirect()->route("{$routePrefix}.messages.show", $message->conversation_id)
                ->with('success', 'Message updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            \Log::error('Message update failed', [
                'error' => $e->getMessage(),
                'message_id' => $message->id,
                'user_id' => Auth::id()
            ]);

            return back()->with('error', 'Failed to update message: ' . $e->getMessage());
        }
    }

    /**
     * Delete message
     */
    public function deleteMessage(Message $message)
    {
        try {
            // Check if user owns the message
            if ($message->user_id !== Auth::id()) {
                return back()->with('error', 'Unauthorized: You can only delete your own messages');
            }

            // Check if message is within 5 minutes delete window
            $minutesSinceCreation = $message->created_at->diffInMinutes(now());
            if ($minutesSinceCreation > 5) {
                return back()->with('error', 'Delete time limit exceeded. Messages can only be deleted within 5 minutes.');
            }

            \Log::info('Message deleted', [
                'message_id' => $message->id,
                'user_id' => Auth::id()
            ]);

            // Get conversation ID before deleting
            $conversationId = $message->conversation_id;

            // Soft delete the message
            $message->delete();

            // Get route prefix and redirect to conversation
            $routePrefix = $this->getRoutePrefix();
            return redirect()->route("{$routePrefix}.messages.show", $conversationId)
                ->with('success', 'Message deleted successfully!');

        } catch (\Exception $e) {
            \Log::error('Message delete failed', [
                'error' => $e->getMessage(),
                'message_id' => $message->id,
                'user_id' => Auth::id()
            ]);

            return back()->with('error', 'Failed to delete message: ' . $e->getMessage());
        }
    }

    /**
     * Get route prefix based on user's role
     */
    private function getRoutePrefix()
    {
        $user = Auth::user();
        $role = $user->roles->first()?->name;

        return match($role) {
            'admin' => 'admin',
            'sub_admin' => 'subadmin',
            'instructor' => 'instructor',
            'student' => 'student',
            default => 'student', // Fallback to student routes
        };
    }
}