<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PkptSpi; // Pastikan nama model Anda sesuai
use App\Models\AuditUniverse; 
use App\Models\RenstraSpi; // Model Jangka Panjang untuk ambil frekuensi

class pkptspicontroller extends Controller
{
    /**
     * Menampilkan semua data PKPT dengan relasi universe
     */
    public function index()
    {
        // return pkptspi::with('audit_universe')
        //     ->orderBy('year', 'desc')
        //     ->get();

        return pkptspi::with('audit_universe.plans')
        ->orderBy('year', 'desc')
        ->get();
    }

    /**
     * Menyimpan data PKPT baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'audit_universe_id' => 'required|exists:audit_universes,id',
            // Accept both field names for compatibility
            'risk_category'     => 'required_without:assessment_type|string',
            'assessment_type'   => 'required_without:risk_category|string',
            'frequency'         => 'required|string',
            'start_week'        => 'required|string',
            'end_week'          => 'required|string',
            'year'              => 'required|integer',
        ]);

        // Normalize payload to match DB column
        if (isset($validated['assessment_type'])) {
            $validated['risk_category'] = $validated['assessment_type'];
            unset($validated['assessment_type']);
        }

        $pkpt = pkptspi::create($validated);

        return response()->json([
            'message' => 'Rencana Tahunan berhasil dibuat',
            'data'    => $pkpt->load('audit_universe')
        ], 201);
    }

    /**
     * Update data PKPT
     */
    public function update(Request $request, $id)
    {
        $pkpt = pkptspi::findOrFail($id);

        $validated = $request->validate([
            'audit_universe_id' => 'required|exists:audit_universes,id',
            'risk_category'     => 'required|string',
            'frequency'         => 'required|string',
            'start_week'        => 'required|string',
            'end_week'          => 'required|string',
            'year'              => 'required|integer',
        ]);

        $pkpt->update($validated);

        return response()->json([
            'message' => 'Rencana Tahunan berhasil diperbarui',
            'data'    => $pkpt->load('audit_universe')
        ]);
    }

    /**
     * Menghapus data PKPT
     */
    public function destroy($id)
    {
        $pkpt = pkptspi::findOrFail($id);
        $pkpt->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}