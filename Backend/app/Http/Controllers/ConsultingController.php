<?php

namespace App\Http\Controllers;

use App\Models\Consulting;
use Illuminate\Http\Request;

class ConsultingController extends Controller
{
    // ================= GET =================
    public function index()
    {
        $data = Consulting::with(['unit', 'role'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= STORE =================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'proyek' => 'required|string',
            'klien' => 'nullable|string',
            'unit_id' => 'nullable|exists:units,id',
            'role_id' => 'nullable|exists:roles,id',
            'prioritas' => 'nullable|string',
            'tahap' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        // 🔥 AUTO KODE
        $last = Consulting::latest()->first();
        $number = $last ? $last->id + 1 : 1;

        $validated['kode_consulting'] =
            'CON-' . date('Y') . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);

        $data = Consulting::create($validated);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= UPDATE =================
    public function update(Request $request, $id)
    {
        $data = Consulting::findOrFail($id);

        $validated = $request->validate([
            'proyek' => 'required|string',
            'klien' => 'nullable|string',
            'unit_id' => 'nullable|exists:units,id',
            'role_id' => 'nullable|exists:roles,id',
            'prioritas' => 'nullable|string',
            'tahap' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $data->update($validated);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= DELETE =================
    public function destroy($id)
    {
        $data = Consulting::findOrFail($id);
        $data->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted'
        ]);
    }
}