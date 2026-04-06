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

        $tim = [
            'ketua' => $assurance->ketuaTim->name ?? '-',
            'pengendali_teknis' => $assurance->pengendaliTeknis->name ?? '-',
            'koordinator' => $assurance->koordinator->name ?? '-',
            'auditor' => $assurance->auditor->name ?? '-',
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
            ->where('k.assurance_id', $id)
            ->select(
                't.*',
                'u.name as auditor',
                'k.uraian'
            )
            ->get();

        return response()->json([
            'assurance' => $dataAssurance,
            'tim' => $tim,
            'kka' => $kka,
            'temuan' => $temuan
        ]);
    }
}