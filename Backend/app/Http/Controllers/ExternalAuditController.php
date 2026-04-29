<?php

namespace App\Http\Controllers;

use App\Models\ExternalAudit;
use Illuminate\Http\Request;

class ExternalAuditController extends Controller
{
    // GET DATA
    public function index()
    {
        $data = ExternalAudit::with('temuan')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // STORE DATA
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'objek_pemeriksaan' => 'required|string',
                'nama_kegiatan' => 'required|string',
                'tujuan' => 'nullable|string',
                'objek_audit' => 'nullable|string',
                'ruang_lingkup' => 'nullable|string',
                'metodologi' => 'nullable|string',
                'periode_awal' => 'nullable|date',
                'periode_akhir' => 'nullable|date',
                'lokasi' => 'nullable|string',
                'status' => 'nullable|string',
                'keterangan' => 'nullable|string',
            ]);

            $data = ExternalAudit::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    // SHOW DETAIL
    public function show($id)
    {
        $data = ExternalAudit::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $data = ExternalAudit::findOrFail($id);

        $validated = $request->validate([
            'objek_pemeriksaan' => 'required|string',
            'nama_kegiatan' => 'required|string',
            'tujuan' => 'nullable|string',
            'objek_audit' => 'nullable|string',
            'ruang_lingkup' => 'nullable|string',
            'metodologi' => 'nullable|string',
            'periode_awal' => 'nullable|date',
            'periode_akhir' => 'nullable|date',
            'lokasi' => 'nullable|string',
            'status' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $data->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diupdate',
            'data' => $data
        ]);
    }

    // DELETE
    public function destroy($id)
    {
        $data = ExternalAudit::findOrFail($id);

        $temuanIds = \Illuminate\Support\Facades\DB::table('external_audit_temuan')
            ->where('external_audit_id', $id)
            ->pluck('id');
            
        if ($temuanIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('tindak_lanjut')
                ->whereIn('temuan_id', $temuanIds)
                ->where('jenis_audit', 'eksternal')
                ->delete();
                
            \Illuminate\Support\Facades\DB::table('external_audit_temuan')
                ->where('external_audit_id', $id)
                ->delete();
        }

        $data->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus'
        ]);
    }
}