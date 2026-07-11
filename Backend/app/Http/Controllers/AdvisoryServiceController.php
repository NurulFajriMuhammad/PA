<?php

namespace App\Http\Controllers;

use App\Models\AdvisoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdvisoryServiceController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => AdvisoryService::orderBy('id', 'asc')->get()
        ]);
    }

public function store(Request $request)
{
    $validated = $request->validate([
        'tanggal_kegiatan' => 'required|date',
        'unit' => 'nullable|string',
        'unit_id' => 'nullable|exists:units,id',
        'contact_person' => 'required|string',
        'no_telepon' => 'nullable|string',
        'waktu_mulai' => 'nullable|date_format:H:i',
        'waktu_selesai' => 'nullable|date_format:H:i|after:waktu_mulai',
        'uraian_konsultasi' => 'required|string',
        'opini_spi' => 'nullable|string',
        'pengawas' => 'nullable|string',
        'keterangan' => 'nullable|string',
    ]);

    // AUTO NOMOR
    $last = AdvisoryService::latest()->first();
    $number = $last ? $last->id + 1 : 1;

    $validated['nomor_advisory'] = 'ADV-' . date('Y') . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);

    $data = AdvisoryService::create($validated);

    return response()->json($data);
}

public function update(Request $request, $id)
{
    $data = AdvisoryService::findOrFail($id);

    $validated = $request->validate([
        'tanggal_kegiatan' => 'required|date',
        'unit' => 'nullable|string',
        'unit_id' => 'nullable|exists:units,id',
        'contact_person' => 'required|string',
        'no_telepon' => 'nullable|string',
        'waktu_mulai' => 'nullable|date_format:H:i',
        'waktu_selesai' => 'nullable|date_format:H:i|after:waktu_mulai',
        'uraian_konsultasi' => 'required|string',
        'opini_spi' => 'nullable|string',
        'pengawas' => 'nullable|string',
        'keterangan' => 'nullable|string',
    ]);

    $data->update($validated);

    return response()->json($data);
}

    public function destroy($id)
    {
        $data = AdvisoryService::findOrFail($id);


        $data->delete();

        return response()->json(['success' => true]);
    }

    public function getUnits()
    {
        $units = DB::table('units')->select('id','nama','kode')->orderBy('nama')->get();

        return response()->json([
            'data' => $units
        ]);
    }
}