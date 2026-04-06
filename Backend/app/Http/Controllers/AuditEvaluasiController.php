<?php

namespace App\Http\Controllers;

use App\Models\AuditEvaluasi;
use Illuminate\Http\Request;

class AuditEvaluasiController extends Controller
{
    // ================= GET =================
    public function index()
    {
        $data = AuditEvaluasi::with('unit')->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= STORE =================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'program' => 'required|string',
            'unit_id' => 'nullable|exists:units,id',
            'periode' => 'nullable|string',
            'tanggal_evaluasi' => 'nullable|date',
            'target' => 'nullable|numeric',
            'realisasi' => 'nullable|numeric',
            'kesimpulan' => 'nullable|string',
            'rekomendasi' => 'nullable|string',
            'auditor' => 'nullable|string',
        ]);

        // 🔥 AUTO NOMOR
        $last = AuditEvaluasi::latest()->first();
        $number = $last ? $last->id + 1 : 1;

        $validated['nomor_evaluasi'] =
            'EVL-' . date('Y') . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);

        // 🔥 HITUNG SKOR
        if (!empty($validated['target']) && !empty($validated['realisasi'])) {
            $validated['skor'] =
                ($validated['realisasi'] / $validated['target']) * 100;
        } else {
            $validated['skor'] = 0;
        }

        // 🔥 STATUS OTOMATIS
        $validated['status'] =
            $validated['skor'] >= 85 ? 'Very Good' :
            ($validated['skor'] >= 70 ? 'Good' : 'Need Improvement');

        $data = AuditEvaluasi::create($validated);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= UPDATE =================
    public function update(Request $request, $id)
    {
        $data = AuditEvaluasi::findOrFail($id);

        $validated = $request->validate([
            'program' => 'required|string',
            'unit_id' => 'nullable|exists:units,id',
            'periode' => 'nullable|string',
            'tanggal_evaluasi' => 'nullable|date',
            'target' => 'nullable|numeric',
            'realisasi' => 'nullable|numeric',
            'kesimpulan' => 'nullable|string',
            'rekomendasi' => 'nullable|string',
            'auditor' => 'nullable|string',
        ]);

        // 🔥 HITUNG ULANG SKOR
        if (!empty($validated['target']) && !empty($validated['realisasi'])) {
            $validated['skor'] =
                ($validated['realisasi'] / $validated['target']) * 100;
        } else {
            $validated['skor'] = 0;
        }

        // 🔥 STATUS
        $validated['status'] =
            $validated['skor'] >= 85 ? 'Very Good' :
            ($validated['skor'] >= 70 ? 'Good' : 'Need Improvement');

        $data->update($validated);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= DELETE =================
    public function destroy($id)
    {
        $data = AuditEvaluasi::findOrFail($id);
        $data->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted'
        ]);
    }
}