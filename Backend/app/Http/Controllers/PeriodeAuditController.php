<?php

namespace App\Http\Controllers;

use App\Models\PeriodeAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PeriodeAuditController extends Controller
{
    public function index()
    {
        $periode = PeriodeAudit::orderBy('tahun', 'desc')->get();
        return response()->json($periode);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tahun' => 'required|string|max:4',
            'nama_periode' => 'required|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'is_active' => 'boolean',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Kalau diset aktif, nonaktifkan periode lain (opsional, asumsikan hanya ada 1 periode aktif)
        if ($request->is_active) {
            PeriodeAudit::where('is_active', true)->update(['is_active' => false]);
        }

        $periode = PeriodeAudit::create($request->all());

        return response()->json([
            'message' => 'Periode Audit berhasil ditambahkan',
            'data' => $periode
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $periode = PeriodeAudit::find($id);

        if (!$periode) {
            return response()->json(['message' => 'Periode Audit tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tahun' => 'required|string|max:4',
            'nama_periode' => 'required|string|max:255',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'is_active' => 'boolean',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->is_active && !$periode->is_active) {
            PeriodeAudit::where('is_active', true)->where('id', '!=', $id)->update(['is_active' => false]);
        }

        $periode->update($request->all());

        return response()->json([
            'message' => 'Periode Audit berhasil diupdate',
            'data' => $periode
        ]);
    }

    public function destroy($id)
    {
        $periode = PeriodeAudit::find($id);

        if (!$periode) {
            return response()->json(['message' => 'Periode Audit tidak ditemukan'], 404);
        }

        $periode->delete();

        return response()->json(['message' => 'Periode Audit berhasil dihapus']);
    }
}
