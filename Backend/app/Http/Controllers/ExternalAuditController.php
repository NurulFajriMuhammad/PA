<?php

namespace App\Http\Controllers;

use App\Models\ExternalAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExternalAuditController extends Controller
{
    // GET DATA
    public function index()
    {
        $data = ExternalAudit::with(['temuan', 'statusPemeriksaan'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(function($item) {
                $item->status_label = $item->statusPemeriksaan ? $item->statusPemeriksaan->nama : ($item->status ?: 'Perencanaan');
                $item->status_color = $item->statusPemeriksaan ? $item->statusPemeriksaan->warna : '#94a3b8';
                return $item;
            });

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
                'lembaga_pemeriksa' => 'nullable|string',
                'status' => 'nullable|string',
                'keterangan' => 'nullable|string',
            ]);

            $statusPerencanaan = DB::table('status_pemeriksaans')->where('nama', 'Perencanaan')->first();
            if ($statusPerencanaan) {
                $validated['id_status_pemeriks'] = $statusPerencanaan->id;
            }

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
        $data = ExternalAudit::with(['temuan', 'statusPemeriksaan'])->findOrFail($id);

        $data->status_label = $data->statusPemeriksaan ? $data->statusPemeriksaan->nama : ($data->status ?: 'Perencanaan');
        $data->status_color = $data->statusPemeriksaan ? $data->statusPemeriksaan->warna : '#94a3b8';

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
            'lembaga_pemeriksa' => 'nullable|string',
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

    // AVAILABLE TRANSITIONS
    public function availableTransitions(Request $request, $id)
    {
        $audit = ExternalAudit::findOrFail($id);
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $userRoles = $user->roles->pluck('id')->toArray();
        $currentStatusId = $audit->id_status_pemeriks;

        // Cari aturan transisi untuk status saat ini & role user
        $transitions = DB::table('pengajuan_transitions')
            ->where('jenis', 'eksternal')
            ->where('status_pemeriksaan_id', $currentStatusId)
            ->whereIn('role_id', $userRoles)
            ->get();

        $actions = [];
        foreach ($transitions as $tr) {
            if ($tr->status_selanjutnya_id) {
                $statusNext = DB::table('status_pemeriksaans')->where('id', $tr->status_selanjutnya_id)->first();
                
                // 🔥 HIDE MANUAL 'SELESAI' TRANSITION
                if ($statusNext && strtolower($statusNext->nama) === 'selesai') {
                    continue;
                }

                $actions[] = [
                    'action' => 'approve',
                    'label' => 'Ajukan ke ' . ($statusNext ? $statusNext->nama : 'Selanjutnya'),
                    'color' => 'bg-emerald-600',
                    'next_status_id' => $tr->status_selanjutnya_id
                ];
            }
            if ($tr->status_dikembalikan_id) {
                $statusBack = DB::table('status_pemeriksaans')->where('id', $tr->status_dikembalikan_id)->first();
                $actions[] = [
                    'action' => 'reject',
                    'label' => 'Kembalikan ke ' . ($statusBack ? $statusBack->nama : 'Sebelumnya'),
                    'color' => 'bg-rose-600',
                    'next_status_id' => $tr->status_dikembalikan_id
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }

    // EXECUTE TRANSITION
    public function executeTransition(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'next_status_id' => 'required|integer'
        ]);

        $audit = ExternalAudit::findOrFail($id);

        DB::beginTransaction();
        try {
            $nextStatus = DB::table('status_pemeriksaans')->where('id', $request->next_status_id)->first();
            
            // 🔥 SIDE EFFECTS UNTUK SINKRONISASI STATUS TEMUAN
            if ($nextStatus) {
                $this->handleStatusSideEffects($id, $nextStatus->nama);
            }

            $audit->id_status_pemeriks = $request->next_status_id;
            // Optionally update the string status for fallback
            if ($nextStatus) {
                $audit->status = $nextStatus->nama;
            }
            $audit->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Status berhasil diubah ke ' . ($nextStatus ? $nextStatus->nama : '')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status: ' . $e->getMessage()
            ], 500);
        }
    }

    private function handleStatusSideEffects($id, $nextStatusName)
    {
        $statusName = strtolower($nextStatusName);
        
        // 1. Jika pindah ke Konfirmasi Auditee
        if ($statusName === 'konfirmasi auditee') {
            DB::table('external_audit_temuan')
                ->where('external_audit_id', $id)
                ->update(['status' => 'Menunggu Konfirmasi']);
        }

        // 2. Jika pindah ke Pengisian RTL
        if ($statusName === 'pengisian rtl') {
            DB::table('external_audit_temuan')
                ->where('external_audit_id', $id)
                ->update(['status' => 'Pengisian RTL']);

            // Pastikan data masuk ke tabel tindak_lanjut
            $temuanList = DB::table('external_audit_temuan')
                ->where('external_audit_id', $id)
                ->get();

            foreach ($temuanList as $t) {
                $exists = DB::table('tindak_lanjut')
                    ->where('temuan_id', $t->id)
                    ->where('jenis_audit', 'eksternal')
                    ->exists();

                if (!$exists) {
                    DB::table('tindak_lanjut')->insert([
                        'temuan_id' => $t->id,
                        'unit' => $t->unit ?? '-',
                        'masalah' => $t->masalah,
                        'rekomendasi' => $t->rekomendasi,
                        'target_selesai' => $t->target_penyelesaian,
                        'jenis_audit' => 'eksternal',
                        'status' => 'draft', // status internal tindak_lanjut tetap draft sampai ada progres
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
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