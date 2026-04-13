<?php

namespace App\Http\Controllers;

use App\Models\ExternalAudit;
use App\Models\ExternalAuditTemuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ExternalAuditTemuanController extends Controller
{
    // ================= GET =================
    public function index($externalAuditId)
    {
        $data = ExternalAuditTemuan::where('external_audit_id', $externalAuditId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // ================= STORE =================
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'external_audit_id' => 'required|exists:external_audits,id',
                'masalah' => 'required|string',
                'kriteria' => 'nullable|string',
                'sebab' => 'nullable|string',
                'akibat' => 'nullable|string',
                'kondisi' => 'nullable|string',
                'rekomendasi' => 'nullable|string',
                'rencana' => 'nullable|string',
                'keterangan' => 'nullable|string',
                'target_penyelesaian' => 'nullable|date',
                'nilai_kerugian' => 'nullable|numeric',
                'lampiran' => 'nullable|file|max:5120'
            ]);

            // ================= STATUS AUTO =================
            $isComplete =
                !empty($validated['masalah']) &&
                !empty($validated['kriteria']) &&
                !empty($validated['sebab']) &&
                !empty($validated['akibat']) &&
                !empty($validated['kondisi']) &&
                !empty($validated['rekomendasi']) &&
                !empty($validated['rencana']) &&
                !empty($validated['target_penyelesaian']);

            $validated['status'] = $isComplete ? 'monev' : 'draft';

            // ================= UPLOAD FILE =================
            if ($request->hasFile('lampiran')) {
                $validated['lampiran'] = $request->file('lampiran')
                    ->store('temuan', 'public');
            }

            $temuan = ExternalAuditTemuan::create($validated);
            $externalAudit = ExternalAudit::find($validated['external_audit_id']);

            // ================= AUTO MASUK TINDAK LANJUT =================
            if ($validated['status'] === 'monev') {
                DB::table('tindak_lanjut')->insert([
                    'temuan_id' => $temuan->id,
                    'jenis_audit' => 'eksternal',
                    'masalah' => $temuan->masalah,
                    'rekomendasi' => $temuan->rekomendasi,
                    'target_selesai' => $temuan->target_penyelesaian,
                    'unit' => $externalAudit?->objek_pemeriksaan ?? $externalAudit?->objek_audit ?? $externalAudit?->lokasi ?? '-',
                    'status' => 'draft',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $temuan
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ================= UPDATE =================
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $temuan = ExternalAuditTemuan::findOrFail($id);

            $validated = $request->validate([
                'masalah' => 'required|string',
                'kriteria' => 'nullable|string',
                'sebab' => 'nullable|string',
                'akibat' => 'nullable|string',
                'kondisi' => 'nullable|string',
                'rekomendasi' => 'nullable|string',
                'rencana' => 'nullable|string',
                'keterangan' => 'nullable|string',
                'target_penyelesaian' => 'nullable|date',
                'nilai_kerugian' => 'nullable|numeric',
                'lampiran' => 'nullable|file|max:5120'
            ]);

            // ================= STATUS AUTO =================
            $isComplete =
                !empty($validated['masalah']) &&
                !empty($validated['kriteria']) &&
                !empty($validated['sebab']) &&
                !empty($validated['akibat']) &&
                !empty($validated['kondisi']) &&
                !empty($validated['rekomendasi']) &&
                !empty($validated['rencana']) &&
                !empty($validated['target_penyelesaian']);

            $validated['status'] = $isComplete ? 'monev' : 'draft';

            // ================= UPLOAD FILE =================
if ($request->hasFile('lampiran')) {

    // 🔥 kalau upload file baru → hapus lama
    if ($temuan->lampiran) {
        Storage::disk('public')->delete($temuan->lampiran);
    }

    $validated['lampiran'] = $request->file('lampiran')
        ->store('temuan', 'public');

} elseif ($request->input('lampiran') === null) {

    // 🔥 kalau user hapus file lama (tanpa upload baru)
    if ($temuan->lampiran) {
        Storage::disk('public')->delete($temuan->lampiran);
    }

    $validated['lampiran'] = null;
}

            $temuan->update($validated);
            $externalAudit = ExternalAudit::find($temuan->external_audit_id);

            // ================= SYNC TINDAK LANJUT =================
            if ($validated['status'] === 'monev') {
                $exists = DB::table('tindak_lanjut')
                    ->where('temuan_id', $temuan->id)
                    ->exists();

                if (!$exists) {
                    DB::table('tindak_lanjut')->insert([
                        'temuan_id' => $temuan->id,
                        'jenis_audit' => 'eksternal',
                        'masalah' => $temuan->masalah,
                        'rekomendasi' => $temuan->rekomendasi,
                        'target_selesai' => $temuan->target_penyelesaian,
                        'unit' => $externalAudit?->objek_pemeriksaan ?? $externalAudit?->objek_audit ?? $externalAudit?->lokasi ?? '-',
                        'status' => 'draft',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    DB::table('tindak_lanjut')
                        ->where('temuan_id', $temuan->id)
                        ->update([
                            'jenis_audit' => 'eksternal',
                            'masalah' => $temuan->masalah,
                            'rekomendasi' => $temuan->rekomendasi,
                            'target_selesai' => $temuan->target_penyelesaian,
                            'unit' => $externalAudit?->objek_pemeriksaan ?? $externalAudit?->objek_audit ?? $externalAudit?->lokasi ?? '-',
                            'updated_at' => now(),
                        ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $temuan
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ================= DELETE =================
    public function destroy($id)
    {
        $temuan = ExternalAuditTemuan::findOrFail($id);

        // hapus file
        if ($temuan->lampiran) {
            Storage::disk('public')->delete($temuan->lampiran);
        }

        // hapus tindak lanjut
        DB::table('tindak_lanjut')->where('temuan_id', $id)->delete();

        $temuan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted'
        ]);
    }
}
