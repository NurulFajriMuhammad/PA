<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\assurance;
use App\Models\PerencanaanKka;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class assurancecontroller extends Controller
{
    /**
     * Menampilkan semua data assurance dengan relasi lengkap.
     */
    public function index()
    {
        $data = assurance::with([
            'suratTugas', 
            'statusPemeriksaan',
            'koordinator',
            'pengendaliTeknis',
            'ketuaTim',
            'auditor',
            'kka.temuan.analisis',
        ])
        ->orderBy('id', 'asc')
        ->get()
        ->map(function($item) {
            return $this->appendStatusInfo($item);
        });

        return response()->json($data);
    }

    private function appendStatusInfo($item)
    {
        // 1. Hitung status dinamis berdasarkan temuan yang di-load
        $calculated = 'Perencanaan';
        
        // Ambil semua temuan dari KKA
        $findings = collect();
        if ($item->kka) {
            foreach ($item->kka as $kka) {
                if ($kka->temuan) {
                    foreach ($kka->temuan as $temuan) {
                        $findings->push($temuan);
                    }
                }
            }
        }

        if ($findings->isEmpty()) {
            $calculated = 'Perencanaan';
        } else {
            // Cek status temuan
            $hasDraft = false;
            $allClosed = true;
            $findingIds = $findings->pluck('id');

            foreach ($findings as $f) {
                $status = strtolower($f->analisis->status ?? 'draft');
                if ($status === 'draft') $hasDraft = true;
                if (!in_array($status, ['close', 'closed', 'selesai'])) $allClosed = false;
            }

            if ($hasDraft) {
                $calculated = 'Pemeriksaan';
            } elseif ($allClosed) {
                $calculated = 'Selesai';
            } else {
                // Cek progress di tindak_lanjut untuk menentukan Monev vs Konfirmasi Auditee
                $hasProgress = DB::table('tindak_lanjut')
                    ->where(function($q) {
                        $q->where('jenis_audit', 'internal')
                          ->orWhereNull('jenis_audit');
                    })
                    ->whereIn('temuan_id', $findingIds)
                    ->where(function($q) {
                        $q->whereNotNull('keterangan')->orWhereNotNull('bukti');
                    })
                    ->exists();
                
                $calculated = $hasProgress ? 'Monev' : 'Konfirmasi Auditee';
            }
        }

        $statusInfo = DB::table('status_pemeriksaans')
            ->where('nama', $calculated)
            ->first();
        
        $item->status_label = $statusInfo ? $statusInfo->nama : $calculated;
        $item->status_color = $statusInfo ? $statusInfo->warna : '#94a3b8';
        return $item;
    }

    /**
     * Menyimpan data assurance baru dari form React.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'surat_tugas_id'    => 'required|exists:surat_tugas,id',
            'objek_pemeriksaan' => 'required|string|max:255',
            'nama_kegiatan'     => 'required|string|max:255',
            'periode_awal'      => 'nullable|date',
            'periode_akhir'     => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $assurance = assurance::create($request->all());

        return response()->json([
            'message' => 'Data assurance berhasil dibuat',
            'data'    => $assurance
        ], 201);
    }

    /**
     * Menampilkan detail satu data assurance.
     */
    public function show($id)
    {
        $assurance = assurance::with([
            'suratTugas', 'auditUniverse', 'statusPemeriksaan', 
            'koordinator', 'pengendaliTeknis', 'ketuaTim', 'auditor',
            'kka.temuan.analisis'
        ])
        ->find($id);

        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $assurance = $this->appendStatusInfo($assurance);

        return response()->json($assurance);
    }

    /**
     * Update data (misal saat pindah status dari Perencanaan ke Pemeriksaan).
     */
    public function update(Request $request, $id)
    {
        $assurance = assurance::find($id);
        
        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $assurance->update($request->all());

        return response()->json([
            'message' => 'Data assurance berhasil diupdate',
            'data'    => $assurance
        ]);
    }

    /**
     * Menghapus data.
     */
    public function destroy($id)
    {
        $assurance = assurance::find($id);
        
        if (!$assurance) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Hapus KKA, Temuan, dan Tindak Lanjut yang terkait
        $kkaIds = \Illuminate\Support\Facades\DB::table('perencanaan_kkas')->where('assurance_id', $id)->pluck('id');
        if ($kkaIds->isNotEmpty()) {
            $temuanIds = \Illuminate\Support\Facades\DB::table('pemeriksaan_temuan')->whereIn('kka_id', $kkaIds)->pluck('id');
            if ($temuanIds->isNotEmpty()) {
                \Illuminate\Support\Facades\DB::table('tindak_lanjut')
                    ->whereIn('temuan_id', $temuanIds)
                    ->where('jenis_audit', 'internal')
                    ->delete();
                \Illuminate\Support\Facades\DB::table('analisis_temuan')
                    ->whereIn('temuan_id', $temuanIds)
                    ->delete();
                \Illuminate\Support\Facades\DB::table('pemeriksaan_temuan')
                    ->whereIn('kka_id', $kkaIds)
                    ->delete();
            }
            \Illuminate\Support\Facades\DB::table('perencanaan_kkas')->where('assurance_id', $id)->delete();
        }

        $assurance->delete();
        return response()->json(['message' => 'Data berhasil dihapus']);
    }

    // =====================================================================
    // TRANSITION SYSTEM (IIA Std. 2020 — Role-Based Status Workflow)
    // =====================================================================

    /**
     * Cek transisi yang tersedia untuk user berdasarkan role & status saat ini
     */
    public function availableTransitions(Request $request, $id)
    {
        $audit = assurance::findOrFail($id);
        $user  = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $userRoles     = $user->roles->pluck('id')->toArray();
        $currentStatus = $audit->id_status_pemeriksaan;

        $transitions = DB::table('pengajuan_transitions')
            ->where('jenis', 'internal')
            ->where('status_pemeriksaan_id', $currentStatus)
            ->whereIn('role_id', $userRoles)
            ->get();

        $actions = [];
        foreach ($transitions as $tr) {
            if ($tr->status_selanjutnya_id) {
                $statusNext = DB::table('status_pemeriksaans')->where('id', $tr->status_selanjutnya_id)->first();
                if ($statusNext && strtolower($statusNext->nama) === 'selesai') continue;
                $actions[] = [
                    'action'         => 'approve',
                    'label'          => 'Ajukan ke ' . ($statusNext ? $statusNext->nama : 'Selanjutnya'),
                    'color'          => 'bg-emerald-600',
                    'next_status_id' => $tr->status_selanjutnya_id,
                ];
            }
            if ($tr->status_dikembalikan_id) {
                $statusBack = DB::table('status_pemeriksaans')->where('id', $tr->status_dikembalikan_id)->first();
                $actions[] = [
                    'action'         => 'reject',
                    'label'          => 'Kembalikan ke ' . ($statusBack ? $statusBack->nama : 'Sebelumnya'),
                    'color'          => 'bg-rose-600',
                    'next_status_id' => $tr->status_dikembalikan_id,
                ];
            }
        }

        return response()->json(['success' => true, 'data' => $actions]);
    }

    /**
     * Eksekusi transisi status
     */
    public function executeTransition(Request $request, $id)
    {
        $request->validate([
            'action'         => 'required|in:approve,reject',
            'next_status_id' => 'required|integer',
        ]);

        $audit = assurance::findOrFail($id);

        DB::beginTransaction();
        try {
            $nextStatus = DB::table('status_pemeriksaans')->where('id', $request->next_status_id)->first();

            $audit->id_status_pemeriksaan = $request->next_status_id;
            $audit->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Status berhasil diubah ke ' . ($nextStatus ? $nextStatus->nama : '')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // LHA APPROVAL WORKFLOW (IIA Std. 2420 & 2440)
    // =====================================================================

    /**
     * Auditor/PT submit LHA ke Kepala SPI untuk approval
     */
    public function submitLha(Request $request, $id)
    {
        $audit = assurance::findOrFail($id);

        if ($audit->lha_status === 'approved') {
            return response()->json(['success' => false, 'message' => 'LHA sudah disetujui, tidak bisa diubah'], 400);
        }

        $audit->update([
            'lha_status'       => 'submitted',
            'lha_submitted_by' => Auth::id(),
            'lha_submitted_at' => now(),
            'lha_catatan'      => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LHA berhasil disubmit ke Kepala SPI untuk persetujuan',
        ]);
    }

    /**
     * Kepala SPI approve atau reject LHA
     */
    public function approveLha(Request $request, $id)
    {
        $request->validate([
            'action'  => 'required|in:approve,reject',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $audit = assurance::findOrFail($id);

        if ($request->action === 'approve') {
            $audit->update([
                'lha_status'      => 'approved',
                'lha_approved_by' => Auth::id(),
                'lha_approved_at' => now(),
                'lha_catatan'     => $request->catatan,
            ]);

            return response()->json(['success' => true, 'message' => 'LHA telah disetujui — audit dapat dilanjutkan ke fase Tindak Lanjut']);
        } else {
            $audit->update([
                'lha_status'  => 'rejected',
                'lha_catatan' => $request->catatan,
            ]);

            return response()->json(['success' => true, 'message' => 'LHA dikembalikan — tim audit perlu merevisi laporan']);
        }
    }

    /**
     * Get status LHA untuk ditampilkan di AnalisisPenyebabTab
     */
    public function getLhaStatus($id)
    {
        $audit = assurance::with([
            'lhaSubmittedBy:id,name',
            'lhaApprovedBy:id,name',
        ])->findOrFail($id);

        return response()->json([
            'success'          => true,
            'lha_status'       => $audit->lha_status ?? 'draft',
            'lha_submitted_by' => $audit->lhaSubmittedBy?->name,
            'lha_submitted_at' => $audit->lha_submitted_at,
            'lha_approved_by'  => $audit->lhaApprovedBy?->name,
            'lha_approved_at'  => $audit->lha_approved_at,
            'lha_catatan'      => $audit->lha_catatan,
        ]);
    }
}