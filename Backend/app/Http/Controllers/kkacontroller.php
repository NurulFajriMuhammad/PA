<?php

namespace App\Http\Controllers;

use App\Models\kka; // Jangan lupa import modelnya
use Illuminate\Http\Request;

class kkacontroller extends Controller
{
    // Mengambil semua data KKA
    public function index()
    {
        $data = kka::orderBy('created_at', 'asc')->get();
        return response()->json($data);
    }

    // Menyimpan KKA baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|unique:kka,id', // Validasi No. KKA tidak boleh duplikat
            'nama' => 'required|string|max:255',
            'keterangan' => 'nullable'
        ]);

        $kka = kka::create($validated);

        return response()->json([
            'data' => $kka
        ], 201);
    }

    // Mengupdate data KKA
    public function update(Request $request, $id)
    {
        $kka = kka::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'keterangan' => 'nullable'
        ]);

        $kka->update($validated);

        return response()->json([
            'data' => $kka
        ]);
    }

    // Menghapus data KKA
    public function destroy($id)
    {
        $kka = kka::findOrFail($id);
        $kka->delete();

        return response()->json([
            'message' => 'Template KKA berhasil dihapus'
        ]);
    }
}