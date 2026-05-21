<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AnalisisTemuan;
use App\Models\PemeriksaanTemuan;
use Illuminate\Support\Facades\Storage;

class AnalisisTemuanController extends Controller
{
    public function store(Request $request, $temuanId)
    {
        $data = $request->except(['lampiran', 'nilai_kerugian']);
        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');

            $path = $file->store('analisis_lampiran', 'public');

            $data['lampiran'] = $path;
            $data['lampiran_name'] = $file->getClientOriginalName();
        }

        $data['temuan_id'] = $temuanId;

        $analisis = AnalisisTemuan::updateOrCreate(
            ['temuan_id' => $temuanId],
            $data
        );

        if ($request->has('nilai_kerugian')) {
            $temuan = PemeriksaanTemuan::find($temuanId);
            if ($temuan) {
                $val = $request->nilai_kerugian;
                // Bersihkan karakter non-digit (seperti Rp, titik, spasi)
                $cleanVal = preg_replace('/\D/', '', $val);
                $temuan->update(['nilai_kerugian' => $cleanVal !== '' ? (int)$cleanVal : null]);
            }
        }

        return response()->json([
            'message' => 'Analisis berhasil disimpan',
            'data' => $analisis
        ]);
    }


    public function show($temuanId)
    {
        $data = AnalisisTemuan::with('temuan')
            ->where('temuan_id', $temuanId)
            ->first();

        return response()->json([
            'data' => $data
        ]);
    }


    public function index()
    {
        $data = AnalisisTemuan::with('temuan')
            ->latest()
            ->get();

        return response()->json([
            'data' => $data
        ]);
    }

    public function destroy($id)
    {
        $data = AnalisisTemuan::findOrFail($id);

        if ($data->lampiran) {
            Storage::disk('public')->delete($data->lampiran);
        }

        $data->delete();

        return response()->json([
            'message' => 'Analisis dihapus'
        ]);
    }

    public function getAllWithAnalisis($assuranceId)
    {
        $data = PemeriksaanTemuan::with('analisis')
            ->where('assurance_id', $assuranceId)
            ->get();

        return response()->json([
            'data' => $data
        ]);
    }
}