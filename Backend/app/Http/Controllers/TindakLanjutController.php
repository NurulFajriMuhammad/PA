<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TindakLanjut;
use Illuminate\Support\Facades\DB;

class TindakLanjutController extends Controller
{
    // =========================
    // 🔵 GENERATE DARI ANALISIS
    // =========================
    public function generate(Request $request)
    {
        try {

            $request->validate([
                'temuan_ids' => 'required|array'
            ]);

            $ids = $request->temuan_ids;

            $dataList = DB::table('pemeriksaan_temuan as t')
                ->leftJoin('analisis_temuan as at', 'at.temuan_id', '=', 't.id')
                ->leftJoin('kka as k', 't.kka_id', '=', 'k.id')

                ->select(
                    't.id as temuan_id',
                    't.masalah',
                    't.rekomendasi',
                    DB::raw("COALESCE(k.nama, '-') as unit"),
                    'at.target_penyelesaian',
                    DB::raw("COALESCE(at.status, 'draft') as status")
                )
                ->whereIn('t.id', $ids)
                ->get();

            if ($dataList->isEmpty()) {
                return response()->json([
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $insertData = [];

            foreach ($dataList as $d) {

                $exists = DB::table('tindak_lanjut')
                    ->where('temuan_id', $d->temuan_id)
                    ->exists();

                if (!$exists) {
                    $insertData[] = [
                        'temuan_id' => $d->temuan_id,
                        'masalah' => $d->masalah,
                        'rekomendasi' => $d->rekomendasi,
                        'target_selesai' => $d->target_penyelesaian,
                        'unit' => $d->unit,
                        'status' => $d->status ?? 'draft',
                        'progres' => 0,
                        'keterangan' => null,
                        'tanggal' => null,
                        'bukti' => null,
                        'pic' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($insertData)) {
                DB::table('tindak_lanjut')->insert($insertData);
            }

            return response()->json([
                'message' => 'Berhasil generate tindak lanjut 🚀'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // 🟢 GET DATA MONITORING
    // =========================
    public function index()
    {
        $data = TindakLanjut::orderBy('id', 'asc')->get();

        return response()->json([
            'data' => $data
        ]);
    }

    // =========================
    // 🟡 DETAIL PER TEMUAN
    // =========================
    public function detail($temuanId)
    {
        $data = DB::table('pemeriksaan_temuan as t')

            ->leftJoin('analisis_temuan as at', 't.id', '=', 'at.temuan_id')
            ->leftJoin('tindak_lanjut as tl', 't.id', '=', 'tl.temuan_id')

            ->select(
                't.id',
                't.masalah',
                't.kondisi',
                't.kriteria',
                't.sebab',
                't.akibat',
                't.lampiran',
                't.rekomendasi',

                'at.analisa',
                'at.rencana_koreksi',
                'at.rencana_kolektif',
                'at.target_penyelesaian',
                'at.status as status_temuan',

                'tl.id as tl_id',
                'tl.tahun',
                'tl.bulan',
                'tl.keterangan',
                'tl.progres',
                'tl.tanggal',
                'tl.bukti'
            )
            ->where('t.id', $temuanId)
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        // 🔥 DATA TEMUAN
        $temuan = [
            'id' => $data[0]->id,
            'masalah' => $data[0]->masalah,
            'kondisi' => $data[0]->kondisi,
            'kriteria' => $data[0]->kriteria,
            'sebab' => $data[0]->sebab,
            'akibat' => $data[0]->akibat,
            'lampiran' => $data[0]->lampiran,
            'rekomendasi' => $data[0]->rekomendasi,
            'analisa' => $data[0]->analisa,
            'rencana_koreksi' => $data[0]->rencana_koreksi,
            'rencana_kolektif' => $data[0]->rencana_kolektif,
            'target_selesai' => $data[0]->target_penyelesaian,
            'status' => $data[0]->status_temuan ?? 'draft',
        ];

        // 🔥 HISTORI TINDAK LANJUT
        $tindakLanjut = collect($data)
            ->filter(fn($d) => $d->tl_id !== null)
            ->map(function ($d) {
                return [
                    'id' => $d->tl_id,
                    'tahun' => $d->tahun,
                    'bulan' => $d->bulan,
                    'keterangan' => $d->keterangan,
                    'progres' => $d->progres,
                    'tanggal' => $d->tanggal,
                    'bukti' => $d->bukti,
                ];
            })
            ->sortBy('id') // 🔥 urut kecil → besar
            ->values();

        return response()->json([
            'temuan' => $temuan,
            'tindak_lanjut' => $tindakLanjut
        ]);
    }

    // =========================
    // 🔴 UPDATE / TAMBAH TL
    // =========================
    public function update(Request $request, $id)
    {
        $data = TindakLanjut::find($id);

        if (!$data) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'keterangan' => 'nullable|string',
            'progres' => 'nullable|integer|min:0|max:100',
            'tanggal' => 'nullable|date',
            'tahun' => 'nullable|integer',
            'bulan' => 'nullable|integer|min:1|max:12',
            'bukti' => 'nullable|file|max:5120'
        ]);

        // upload file
        if ($request->hasFile('bukti')) {
            $data->bukti = $request->file('bukti')->store('tindak_lanjut', 'public');
        }

        // update field
        $data->keterangan = $request->keterangan ?? $data->keterangan;
        $data->progres = $request->progres ?? $data->progres;
        $data->tanggal = $request->tanggal ?? $data->tanggal;
        $data->tahun = $request->tahun ?? $data->tahun;
        $data->bulan = $request->bulan ?? $data->bulan;

        // 🔥 AUTO STATUS
        $data->status = ($data->progres == 100) ? 'close' : 'monev';

        $data->save();

        return response()->json([
            'message' => 'Tindak lanjut berhasil disimpan'
        ]);
    }
}