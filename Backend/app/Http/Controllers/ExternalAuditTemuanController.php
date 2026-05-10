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
            ->orderBy('id', 'asc')
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
                'kategori' => 'nullable|string',
                'lampiran' => 'nullable|file|max:5120'
            ]);

            $externalAudit = ExternalAudit::find($validated['external_audit_id']);
            if ($externalAudit && strtolower($externalAudit->status) === 'selesai') {
                return response()->json([
                    'success' => false,
                    'message' => 'Audit sudah selesai. Tidak dapat menambah temuan lagi.'
                ], 422);
            }

            // ================= STATUS AUTO =================
            $isComplete =
                !empty($validated['masalah']) &&
                !empty($validated['kriteria']) &&
                !empty($validated['sebab']) &&
                !empty($validated['akibat']) &&
                !empty($validated['kondisi']) &&
                !empty($validated['rekomendasi']) &&
                !empty($validated['rencana']) &&
                !empty($validated['target_penyelesaian']) &&
                !empty($validated['kategori']);

            $validated['status'] = 'Draft Temuan';

            // ================= UPLOAD FILE =================
            if ($request->hasFile('lampiran')) {
                $file = $request->file('lampiran');
                $validated['lampiran'] = $file->store('temuan', 'public');
                $validated['nama_lampiran'] = $file->getClientOriginalName();
            }

            if ($request->has('rencana')) {
                $validated['rencana_koreksi'] = $request->rencana;
            }

            $temuan = ExternalAuditTemuan::create($validated);
            $externalAudit = ExternalAudit::find($validated['external_audit_id']);

            // ================= AUTO TRANSITION TO PEMERIKSAAN =================
            if ($externalAudit) {
                $statusPerencanaan = DB::table('status_pemeriksaans')->where('nama', 'Perencanaan')->first();
                $statusPemeriksaan = DB::table('status_pemeriksaans')->where('nama', 'Pemeriksaan')->first();

                if ($statusPemeriksaan && (!$externalAudit->id_status_pemeriks || ($statusPerencanaan && $externalAudit->id_status_pemeriks == $statusPerencanaan->id))) {
                    $externalAudit->id_status_pemeriks = $statusPemeriksaan->id;
                    $externalAudit->status = $statusPemeriksaan->nama;
                    $externalAudit->save();
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

    // ================= UPDATE =================
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $temuan = ExternalAuditTemuan::findOrFail($id);

            $validated = $request->validate([
                'masalah' => 'sometimes|required|string',
                'kriteria' => 'nullable|string',
                'sebab' => 'nullable|string',
                'akibat' => 'nullable|string',
                'kondisi' => 'nullable|string',
                'rekomendasi' => 'nullable|string',
                'rencana' => 'nullable|string',
                'keterangan' => 'nullable|string',
                'target_penyelesaian' => 'nullable|date',
                'nilai_kerugian' => 'nullable|numeric',
                'kategori' => 'nullable|string',
                'lampiran' => 'nullable|file|max:5120',
                'status' => 'nullable|string'
            ]);

            // ================= STATUS AUTO =================
            $isComplete =
                !empty($validated['masalah'] ?? $temuan->masalah) &&
                !empty($validated['kriteria'] ?? $temuan->kriteria) &&
                !empty($validated['sebab'] ?? $temuan->sebab) &&
                !empty($validated['akibat'] ?? $temuan->akibat) &&
                !empty($validated['kondisi'] ?? $temuan->kondisi) &&
                !empty($validated['rekomendasi'] ?? $temuan->rekomendasi) &&
                !empty($validated['rencana'] ?? $temuan->rencana) &&
                !empty($validated['target_penyelesaian'] ?? $temuan->target_penyelesaian) &&
                !empty($validated['kategori'] ?? $temuan->kategori);


            // ================= UPLOAD FILE =================
if ($request->hasFile('lampiran')) {

    // 🔥 kalau upload file baru → hapus lama
    if ($temuan->lampiran) {
        Storage::disk('public')->delete($temuan->lampiran);
    }

    $file = $request->file('lampiran');
    $validated['lampiran'] = $file->store('temuan', 'public');
    $validated['nama_lampiran'] = $file->getClientOriginalName();

} elseif ($request->has('lampiran') && $request->input('lampiran') === null) {

    // 🔥 kalau user hapus file lama secara eksplisit (tanpa upload baru)
    if ($temuan->lampiran) {
        Storage::disk('public')->delete($temuan->lampiran);
    }

    $validated['lampiran'] = null;
}

            if ($request->has('rencana')) {
                $validated['rencana_koreksi'] = $request->rencana;
            }

            $temuan->update($validated);
            $externalAudit = ExternalAudit::find($temuan->external_audit_id);

            // [REMOVE] Sync tindak lanjut dipindah ke proses konfirmasi auditee
            /*
            if ($validated['status'] === 'monev') {
                ...
            }
            */

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
        $auditId = $temuan->external_audit_id;

        // Hapus file lampiran
        if ($temuan->lampiran) {
            Storage::disk('public')->delete($temuan->lampiran);
        }

        // Hapus tindak lanjut terkait
        DB::table('tindak_lanjut')->where('temuan_id', $id)->where('jenis_audit', 'eksternal')->delete();

        $temuan->delete();

        // 🔁 Auto-revert ke Perencanaan jika tidak ada temuan tersisa
        $sisaTemuan = DB::table('external_audit_temuan')
            ->where('external_audit_id', $auditId)->count();

        if ($sisaTemuan === 0) {
            $statusPemeriksaan = DB::table('status_pemeriksaans')->where('nama', 'Pemeriksaan')->first();
            $statusPerencanaan = DB::table('status_pemeriksaans')->where('nama', 'Perencanaan')->first();
            $audit = ExternalAudit::find($auditId);

            if ($audit && $statusPemeriksaan && $statusPerencanaan
                && $audit->id_status_pemeriks == $statusPemeriksaan->id) {
                $audit->id_status_pemeriks = $statusPerencanaan->id;
                $audit->status = $statusPerencanaan->nama;
                $audit->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Temuan berhasil dihapus'
        ]);
    }
}
