<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\assurance;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function show($id)
    {
        $assurance = assurance::with([
            'suratTugas',
            'ketuaTim',
            'pengendaliTeknis',
            'koordinator',
            'auditor'
        ])->findOrFail($id);

        $dataAssurance = [
            'nama_kegiatan' => $assurance->nama_kegiatan,
            'objek_pemeriksaan' => $assurance->objek_pemeriksaan,
            'tujuan' => $assurance->tujuan,
            'ruang_lingkup' => $assurance->ruang_lingkup,
            'periode_awal' => $assurance->periode_awal,
            'periode_akhir' => $assurance->periode_akhir,
            'lokasi' => $assurance->lokasi,
            'nomor_surat' => $assurance->suratTugas->nomor_surat ?? '-',
        ];

        $auditorsNames = [];
        if ($assurance->auditors && count($assurance->auditors) > 1) {
            $auditorsNames = collect($assurance->auditors)->pluck('name')->toArray();
        } elseif ($assurance->suratTugas && $assurance->suratTugas->auditor) {
            $auditorsNames = explode(', ', $assurance->suratTugas->auditor);
        } elseif ($assurance->auditor) {
            $auditorsNames[] = $assurance->auditor->name;
        }

        $tim = [
            'ketua' => $assurance->ketuaTim->name ?? '-',
            'pengendali_teknis' => $assurance->pengendaliTeknis->name ?? '-',
            'koordinator' => $assurance->koordinator->name ?? '-',
            'auditor' => !empty($auditorsNames) ? implode(', ', $auditorsNames) : '-',
            'kepala_spi' => \App\Models\User::role('Kepala SPI')->first()->name ?? '-',
        ];

        $kka = DB::table('perencanaan_kkas')
            ->where('assurance_id', $id)
            ->get();

        // $temuan = DB::table('pemeriksaan_temuan as t')
        //     ->join('perencanaan_kkas as k', 't.kka_id', '=', 'k.id')
        //     ->where('k.assurance_id', $id)
        //     ->select('t.*')
        //     ->get();
        $temuan = DB::table('pemeriksaan_temuan as t')
            ->join('perencanaan_kkas as k', 't.kka_id', '=', 'k.id')
            ->join('users as u', 'k.user_id', '=', 'u.id')
            ->leftJoin('analisis_temuan as a', 't.id', '=', 'a.temuan_id')
            ->leftJoin('tindak_lanjut as tl', 't.id', '=', 'tl.temuan_id')
            ->where('k.assurance_id', $id)
            ->select(
                't.*',
                'u.name as auditor',
                'k.uraian',
                'a.rencana_koreksi',
                'a.target_penyelesaian',
                'a.status as status_rtl',
                'tl.updated_at as tanggal_rtl'
            )
            ->orderBy('t.id', 'asc')
            ->orderBy('tl.id', 'desc')
            ->orderBy('a.id', 'desc')
            ->get()
            ->unique('id')
            ->values();

        return response()->json([
            'assurance' => $dataAssurance,
            'tim' => $tim,
            'kka' => $kka,
            'temuan' => $temuan
        ]);
    }
}