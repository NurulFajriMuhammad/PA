<?php

namespace App\Http\Controllers;
use App\Models\AuditUniverse;
use Illuminate\Http\Request;

class AuditUniverseController extends Controller
{
    // Mengambil semua data untuk ditampilkan di Grid
    public function index()
    {
        $data = AuditUniverse::all();
        return response()->json($data);
        $universes = AuditUniverse::with('plans')->get();
    return response()->json($universes);
    }

    // Menyimpan data baru dari Modal
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sub_unit' => 'required|string',
            'assessment_type' => 'required',
            'category' => 'required',
            'risk_register' => 'required',
            'corporate_risk_category' => 'required',
            'risk' => 'required|in:Low,Medium,High',
            'last_audit' => 'nullable'
        ]);

        $audit = AuditUniverse::create($validated);

        return response()->json([
            'message' => 'Data berhasil disimpan!',
            'data' => $audit
        ], 201);
    }

        public function destroy($id)
    {
        $audit = AuditUniverse::find($id);
        
        if (!$audit) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $audit->delete();

        return response()->json(['message' => 'Data berhasil dihapus'], 200);
    }
    }
