<?php

namespace App\Http\Controllers;

use App\Models\rkaspi;
use Illuminate\Http\Request;

class rkaspicontroller extends Controller
{
    // Ambil Semua Data
    public function index() {
        return response()->json(rkaspi::orderBy('id', 'asc')->get());
    }

    // Simpan Data Baru (Input Bebas)
    public function store(Request $request) {
        $request->validate([
            'kpi' => 'required',
            'min' => 'nullable',
            'max' => 'nullable',
            'nilai' => 'nullable',
            'satuan' => 'nullable',
        ]);

        $rka = rkaspi::create([
            'kpi_name' => $request->kpi,
            'polaritas_min' => $request->min,
            'polaritas_max' => $request->max,
            'nilai_realisasi' => $request->nilai,
            'satuan' => $request->satuan,
            'tahun' => $request->tahun ?? 2024,
        ]);

        return response()->json($rka, 201);
    }

    // Update Data (Optional - Buat Edit Baris)
    public function update(Request $request, $id) {
        $rka = rkaspi::findOrFail($id);
        $rka->update($request->all());
        return response()->json($rka, 200);
    }

    // Hapus Data
    public function destroy($id) {
        rkaspi::destroy($id);
        return response()->json(['message' => 'Data berhasil dihapus'], 200);
    }
}