<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\assurance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class assurancecontroller extends Controller
{
    /**
     * Menampilkan semua data assurance dengan relasi lengkap.
     */
    public function index()
    {
        // Mengambil data dengan 'with' agar frontend dapat nama (bukan cuma ID)
        $data = assurance::with([
            'suratTugas', 
            'statusPemeriksaan',
            'koordinator',
            'pengendaliTeknis',
            'ketuaTim',
            'auditor'
        ])->latest()->get();

        return response()->json($data);
    }

    /**
     * Menyimpan data assurance baru dari form React.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'surat_tugas_id'    => 'required|exists:surat_tugas,id',
            'objek_pemeriksaan' => 'required|string|max:255',
            'nama_kegiatan'     => 'required|string|max:255',
            'periode_awal'      => 'nullable|date',
            'periode_akhir'     => 'nullable|date',
            // Default status akan otomatis 1 (Perencanaan) dari Model
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $assurance = assurance::create($request->all());

        return response()->json([
            'message' => 'Data assurance berhasil dibuat',
            'data'    => $assurance
        ], 201);
    }

    /**
     * Menampilkan detail satu data assurance.
     */
    public function show($id)
    {
        $assurance = assurance::with([
            'suratTugas', 'auditUniverse', 'statusPemeriksaan', 
            'koordinator', 'pengendaliTeknis', 'ketuaTim', 'auditor'
        ])->find($id);

        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($assurance);
    }

    /**
     * Update data (misal saat pindah status dari Perencanaan ke Pemeriksaan).
     */
    public function update(Request $request, $id)
    {
        $assurance = assurance::find($id);
        
        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $assurance->update($request->all());

        return response()->json([
            'message' => 'Data assurance berhasil diupdate',
            'data'    => $assurance
        ]);
    }

    /**
     * Menghapus data.
     */
    public function destroy($id)
    {
        $assurance = assurance::find($id);
        
        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $assurance->delete();
        return response()->json(['message' => 'Data berhasil dihapus']);
    }
}