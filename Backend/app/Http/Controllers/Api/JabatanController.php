<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JabatanController extends Controller
{
public function index() {
        // Ambil jabatan beserta semua units yang dipegangnya
        $jabatans = Jabatan::with('units')->orderBy('id', 'asc')->get();
        return response()->json($jabatans);
    }

public function store(Request $request)
{
    $v = Validator::make($request->all(), [
        'nama' => 'required|string|max:255',
        'unit_ids' => 'nullable|array', // Menangkap array [1, 2, 3] dari frontend
    ]);
    
    if ($v->fails()) return response()->json($v->errors(), 422);

    // 1. Simpan nama jabatan ke tabel 'jabatans'
    $jabatan = Jabatan::create(['nama' => $request->nama]);

    // 2. Hubungkan ke tabel 'jabatan_unit' menggunakan sync
    if ($request->has('unit_ids')) {
        $jabatan->units()->sync($request->unit_ids);
    }

    return response()->json($jabatan->load('units'), 201);
}

public function update(Request $request, $id)
{
    $jabatan = Jabatan::find($id);
    if (!$jabatan) return response()->json(['message' => 'Not Found'], 404);

    $v = Validator::make($request->all(), [
        'nama' => 'required|string|max:255',
        'unit_ids' => 'nullable|array',
    ]);
    
    if ($v->fails()) return response()->json($v->errors(), 422);

    $jabatan->update(['nama' => $request->nama]);

    // Update relasi di tabel pivot (menghapus yang lama, ganti yang baru)
    if ($request->has('unit_ids')) {
        $jabatan->units()->sync($request->unit_ids);
    }

    return response()->json($jabatan->load('units'));
}

    public function destroy($id) {
        $jabatan = Jabatan::find($id);
        if (!$jabatan) return response()->json(['message' => 'Not Found'], 404);
        
        $jabatan->delete();
        return response()->json(['message' => 'Deleted']);
    }
}