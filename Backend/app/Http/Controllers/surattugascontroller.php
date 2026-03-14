<?php

namespace App\Http\Controllers;
use App\Models\surattugas;
use Illuminate\Http\Request;

class surattugascontroller extends Controller
{
    public function index()
    {
        return response()->json(
            SuratTugas::orderBy('id', 'asc')->get()
        );        
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_surat' => 'required|unique:surat_tugas',
            'tanggal_surat' => 'required|date',
            'periode_pemeriksaan' => 'required',
            'deskripsi' => 'required',
            'koordinator' => 'required',
            'pengendali_teknis' => 'required',
            'ketua' => 'required',
            'auditor' => 'required', // String nama-nama auditor
        ]);

        $surat = SuratTugas::create($validated);
        return response()->json($surat, 201);
    }

    public function update(Request $request, $id)
    {
        $surat = SuratTugas::findOrFail($id);
        $surat->update($request->all());
        return response()->json($surat);
    }

    public function destroy($id)
    {
        SuratTugas::destroy($id);
        return response()->json(['message' => 'Data berhasil dihapus']);
    }
}
