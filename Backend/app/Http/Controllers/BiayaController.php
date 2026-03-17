<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Biaya;
use App\Models\PerencanaanKka;

class BiayaController extends Controller
{

    // ambil semua biaya berdasarkan assurance
    public function index($assuranceId)
    {
        $data = Biaya::with('kka')
            ->whereHas('kka', function ($q) use ($assuranceId) {
                $q->where('assurance_id', $assuranceId);
            })
            ->get();

        return response()->json([
            'data' => $data
        ]);
    }


    // tambah biaya
    public function store(Request $request)
    {

        // $request->validate([
        //     'kka_id' => 'required',
        //     'nama' => 'required',
        //     'jenis_akomodasi' => 'required',
        //     'nilai_realisasi' => 'required|numeric'
        // ]);

        $request->validate([
            'kka_id' => 'required|exists:perencanaan_kkas,id',
            'nama' => 'required|string',
            'jenis_akomodasi' => 'required|string',
            'nilai_realisasi' => 'required|numeric'
        ]);

        $data = Biaya::create([
            'kka_id' => $request->kka_id,
            'nama' => $request->nama,
            'jenis_akomodasi' => $request->jenis_akomodasi,
            'nilai_realisasi' => $request->nilai_realisasi
        ]);

        return response()->json([
            'message' => 'Data biaya berhasil disimpan',
            'data' => $data
        ]);
    }


    // update biaya
    public function update(Request $request, $id)
    {

        $data = Biaya::findOrFail($id);

        $data->update([
            'nama' => $request->nama,
            'jenis_akomodasi' => $request->jenis_akomodasi,
            'nilai_realisasi' => $request->nilai_realisasi
        ]);

        return response()->json([
            'message' => 'Data berhasil diupdate'
        ]);
    }


    // delete biaya
    public function destroy($id)
    {

        Biaya::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}