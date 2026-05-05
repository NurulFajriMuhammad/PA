<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\assurance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
}