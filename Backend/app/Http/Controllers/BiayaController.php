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
        $request->validate([
            'kka_id' => 'required|exists:perencanaan_kkas,id',
            'nama' => 'required|string',
            'jenis_akomodasi' => 'required|string',
            'nilai_realisasi' => 'required|numeric',
            'pelaksana' => 'nullable|string',
            'tgl_realisasi' => 'nullable|string',
            'bukti' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:5120'
        ]);

        $buktiPath = null;
        if ($request->hasFile('bukti')) {
            $buktiPath = $request->file('bukti')->store('bukti_biaya', 'public');
        }

        $data = Biaya::create([
            'kka_id' => $request->kka_id,
            'nama' => $request->nama,
            'jenis_akomodasi' => $request->jenis_akomodasi,
            'nilai_realisasi' => $request->nilai_realisasi,
            'pelaksana' => $request->pelaksana,
            'tgl_realisasi' => $request->tgl_realisasi,
            'bukti' => $buktiPath
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

        $request->validate([
            'nama' => 'required|string',
            'jenis_akomodasi' => 'required|string',
            'nilai_realisasi' => 'required|numeric',
            'pelaksana' => 'nullable|string',
            'tgl_realisasi' => 'nullable|string',
            'bukti' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:5120'
        ]);

        $updateData = [
            'nama' => $request->nama,
            'jenis_akomodasi' => $request->jenis_akomodasi,
            'nilai_realisasi' => $request->nilai_realisasi,
            'pelaksana' => $request->pelaksana,
            'tgl_realisasi' => $request->tgl_realisasi
        ];

        if ($request->hasFile('bukti')) {
            if ($data->bukti) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($data->bukti);
            }
            $updateData['bukti'] = $request->file('bukti')->store('bukti_biaya', 'public');
        }

        $data->update($updateData);

        return response()->json([
            'message' => 'Data berhasil diupdate'
        ]);
    }


    // delete biaya
    public function destroy($id)
    {
        $data = Biaya::findOrFail($id);
        if ($data->bukti) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($data->bukti);
        }
        $data->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}