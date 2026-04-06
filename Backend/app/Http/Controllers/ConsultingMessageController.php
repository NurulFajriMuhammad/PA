<?php

namespace App\Http\Controllers;

use App\Models\Consulting;
use App\Models\ConsultingMessage;
use Illuminate\Http\Request;
use App\Events\MessageSent;

class ConsultingMessageController extends Controller
{
    // ================= GET CHAT =================
    public function messages($id)
    {
        $messages = ConsultingMessage::where('consulting_id', $id)
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    // ================= DETAIL CONSULTING + VALIDASI ROLE =================
    public function show($id)
    {
        $data = Consulting::with(['unit', 'role'])->findOrFail($id);
        $user = auth()->user();

        // ❗ kalau belum login
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        // ❗ kalau user tidak punya role
        if (!$user->roles || $user->roles->isEmpty()) {
            return response()->json([
                'message' => 'No Role Assigned'
            ], 403);
        }

        $userRoleId = $user->roles->first()->id;

        // ❗ validasi akses role
        if ($data->role_id && $data->role_id != $userRoleId) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= SEND MESSAGE =================
public function send(Request $request)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 401);
    }

    $validated = $request->validate([
        'consulting_id' => 'required|exists:consultings,id',
        'message' => 'required|string',
    ]);

    $data = ConsultingMessage::create([
        'consulting_id' => $validated['consulting_id'],
        'sender_id' => $user->id,
        'message' => $validated['message'],
    ]);

    // 🔥 SAFE BROADCAST
    try {
        broadcast(new MessageSent($data))->toOthers();
    } catch (\Exception $e) {
        \Log::error('Broadcast Error: ' . $e->getMessage());
    }

    return response()->json([
        'success' => true,
        'data' => $data->load('sender:id,name')
    ]);
}
}