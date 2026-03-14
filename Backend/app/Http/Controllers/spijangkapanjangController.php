<?php

namespace App\Http\Controllers;

use App\Models\spijangkapanjang;
use App\Models\AuditUniverse;
use Illuminate\Http\Request;

class spijangkapanjangController extends Controller
{
    // 1. Mengambil semua data rencana beserta relasi audit universe
    public function index()
    {
        // Menggunakan with('audit_universe') agar data nama & risiko ikut terbawa
        $data = spijangkapanjang::with('audit_universe')->get();
        return response()->json($data);
    }

    // 2. Menyimpan data rencana baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'audit_universe_id' => 'required|exists:audit_universes,id',
            'frequency'         => 'required|string',
            'prep_year'         => 'required|integer',
            'audit_year'        => 'required|integer',
        ]);

        $plan = spijangkapanjang::create($validated);

        return response()->json([
            'message' => 'Rencana SPI Jangka Panjang berhasil disimpan!',
            'data'    => $plan->load('audit_universe') // Load relasi untuk respon instan di frontend
        ], 201);
    }

    // 3. Menghapus data rencana
    public function destroy($id)
    {
        $plan = spijangkapanjang::find($id);

        if (!$plan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $plan->delete();

        return response()->json(['message' => 'Data berhasil dihapus'], 200);
    }
}