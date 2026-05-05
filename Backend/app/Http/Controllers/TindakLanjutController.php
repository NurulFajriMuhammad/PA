<?php

namespace App\Http\Controllers;

use App\Models\AnalisisTemuan;
use App\Models\TindakLanjut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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

            $dataList = DB::table('pemeriksaan_temuan as t')
                ->leftJoin('analisis_temuan as at', 'at.temuan_id', '=', 't.id')
                ->leftJoin('perencanaan_kkas as pk', 't.kka_id', '=', 'pk.id')
                ->leftJoin('assurance as a', 'pk.assurance_id', '=', 'a.id')

                ->select(
                    't.id as temuan_id',
                    't.masalah',
                    't.rekomendasi',
                    DB::raw("'internal' as jenis_audit"),
                    DB::raw("COALESCE(a.objek_pemeriksaan, a.nama_kegiatan, a.objek_audit, a.lokasi, '-') as unit"),
                    'at.target_penyelesaian',
                    DB::raw("COALESCE(at.status, 'draft') as status")
                )
                ->whereIn('t.id', $request->temuan_ids)
                ->orderBy('t.id', 'asc')
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
                        'jenis_audit' => $d->jenis_audit ?? 'internal',
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
                        'hasil_evaluasi' => null,
                        'kesimpulan' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($insertData)) {
                DB::table('tindak_lanjut')->insert($insertData);
            }

            foreach ($request->temuan_ids as $tid) {
                \App\Models\AnalisisTemuan::updateOrCreate(
                    ['temuan_id' => $tid],
                    ['status' => 'monev']
                );
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
        $hasJenisAuditColumn = Schema::hasColumn('tindak_lanjut', 'jenis_audit');

        $data = DB::table('tindak_lanjut as tl')
            ->leftJoin('pemeriksaan_temuan as pt', 'tl.temuan_id', '=', 'pt.id')
            ->leftJoin('analisis_temuan as at', 'pt.id', '=', 'at.temuan_id')
            ->leftJoin('perencanaan_kkas as pk', 'pt.kka_id', '=', 'pk.id')
            ->leftJoin('assurance as a', 'pk.assurance_id', '=', 'a.id')
            ->leftJoin('external_audit_temuan as eat', 'tl.temuan_id', '=', 'eat.id')
            ->leftJoin('external_audits as ea', 'eat.external_audit_id', '=', 'ea.id')
            ->select([
                'tl.id',
                'tl.temuan_id',
                DB::raw("COALESCE(tl.masalah, pt.masalah, eat.masalah, '-') as masalah"),
                DB::raw("COALESCE(tl.rekomendasi, pt.rekomendasi, eat.rekomendasi, '-') as rekomendasi"),
                DB::raw("COALESCE(tl.target_selesai, a.periode_akhir, eat.target_penyelesaian) as target_selesai"),
                DB::raw("
                    CASE 
                        WHEN COALESCE(at.status, eat.status) = 'close' THEN 'close'
                        WHEN EXISTS (
                            SELECT 1 FROM tindak_lanjut sub 
                            WHERE sub.temuan_id = tl.temuan_id 
                            AND (sub.keterangan IS NOT NULL OR sub.bukti IS NOT NULL)
                        ) THEN COALESCE(at.status, eat.status, 'monev')
                        ELSE 'draft'
                    END as status
                "),
                DB::raw(
                    $hasJenisAuditColumn
                        ? "COALESCE(tl.jenis_audit, CASE WHEN eat.id IS NOT NULL THEN 'eksternal' ELSE 'internal' END) as jenis_audit"
                        : "CASE WHEN eat.id IS NOT NULL THEN 'eksternal' ELSE 'internal' END as jenis_audit"
                ),
                DB::raw("COALESCE(NULLIF(NULLIF(TRIM(tl.unit), ''), '-'), a.objek_pemeriksaan, a.objek_audit, ea.objek_pemeriksaan, ea.objek_audit, ea.lokasi, '-') as unit"),
            ])
            ->whereIn('tl.id', function ($query) {
                $query->from('tindak_lanjut')
                    ->selectRaw('MIN(id)')
                    ->groupBy('temuan_id');
            })
            ->orderBy('tl.id', 'asc')
            ->get();

        return response()->json([
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $data = TindakLanjut::find($id);

        if (!$data) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'data' => $data
        ]);
    }

    // =========================
    // 🟡 DETAIL PER TEMUAN
    // =========================
    public function detail($temuanId)
    {
        $jenis = request()->query('jenis', 'internal');
        
        $hasReviewColumns =
            Schema::hasColumn('tindak_lanjut', 'hasil_evaluasi') &&
            Schema::hasColumn('tindak_lanjut', 'kesimpulan');

        $selectColumns = [
            't.id',
            't.masalah',
            't.kondisi',
            't.kriteria',
            't.sebab',
            't.akibat',
            't.lampiran',
            't.rekomendasi',
            'tl.id as tl_id',
            'tl.tahun',
            'tl.bulan',
            'tl.keterangan',
            'tl.progres',
            'tl.tanggal',
            'tl.bukti',
            'tl.status as tl_status',
        ];

        if ($hasReviewColumns) {
            $selectColumns[] = 'tl.hasil_evaluasi';
            $selectColumns[] = 'tl.kesimpulan';
        } else {
            $selectColumns[] = DB::raw('NULL as hasil_evaluasi');
            $selectColumns[] = DB::raw('NULL as kesimpulan');
        }

        if (strtolower($jenis) === 'eksternal') {
            $selectColumns[] = DB::raw('NULL as lampiran_name');
            $selectColumns[] = 't.keterangan as analisa';
            $selectColumns[] = 't.rencana as rencana_koreksi';
            $selectColumns[] = DB::raw('NULL as rencana_kolektif');
            $selectColumns[] = 't.target_penyelesaian';
            $selectColumns[] = 't.status as status_temuan';

            $data = DB::table('external_audit_temuan as t')
                ->leftJoin('tindak_lanjut as tl', function($join) {
                    $join->on('t.id', '=', 'tl.temuan_id')
                         ->where('tl.jenis_audit', '=', 'eksternal');
                })
                ->select($selectColumns)
                ->where('t.id', $temuanId)
                ->get();
        } else {
            $selectColumns[] = 't.lampiran_name';
            $selectColumns[] = 'at.analisa';
            $selectColumns[] = 'at.rencana_koreksi';
            $selectColumns[] = 'at.rencana_kolektif';
            $selectColumns[] = 'at.target_penyelesaian';
            $selectColumns[] = 'at.status as status_temuan';

            $data = DB::table('pemeriksaan_temuan as t')
                ->leftJoin('analisis_temuan as at', 't.id', '=', 'at.temuan_id')
                ->leftJoin('tindak_lanjut as tl', function($join) {
                    $join->on('t.id', '=', 'tl.temuan_id')
                         ->where(function($q) {
                             $q->where('tl.jenis_audit', '=', 'internal')
                               ->orWhereNull('tl.jenis_audit');
                         });
                })
                ->select($selectColumns)
                ->where('t.id', $temuanId)
                ->get();
        }

        if ($data->isEmpty()) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        // 🔥 HISTORI TINDAK LANJUT
        $tindakLanjut = collect($data)
            ->filter(function ($d) {
                return $d->tl_id !== null && (
                    $d->tahun !== null ||
                    $d->bulan !== null ||
                    $d->keterangan !== null ||
                    $d->bukti !== null ||
                    $d->hasil_evaluasi !== null ||
                    $d->kesimpulan !== null
                );
            })
            ->map(function ($d) {
                return [
                    'id' => $d->tl_id,
                    'tahun' => $d->tahun,
                    'bulan' => $d->bulan,
                    'keterangan' => $d->keterangan,
                    'progres' => $d->progres,
                    'tanggal' => $d->tanggal,
                    'bukti' => $d->bukti,
                    'status' => $d->tl_status ?? 'draft',
                    'hasil_evaluasi' => $d->hasil_evaluasi,
                    'kesimpulan' => $d->kesimpulan,
                ];
            })
            ->sortBy('id', SORT_REGULAR, false) // 🔥 urut ID kecil ke besar (ASC)
            ->values();

        $status = $data[0]->status_temuan ?? 'draft';
        if ($status !== 'close' && $tindakLanjut->isEmpty()) {
            $status = 'draft';
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
            'lampiran_name' => $data[0]->lampiran_name,
            'rekomendasi' => $data[0]->rekomendasi,
            'analisa' => $data[0]->analisa,
            'rencana_koreksi' => $data[0]->rencana_koreksi,
            'rencana_kolektif' => $data[0]->rencana_kolektif,
            'target_selesai' => $data[0]->target_penyelesaian,
            'status' => $status,
            'is_locked' => $status === 'close',
        ];

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

        $analisis = AnalisisTemuan::where('temuan_id', $data->temuan_id)->first();

        if ($analisis && $analisis->status === 'close') {
            return response()->json([
                'message' => 'Tindak lanjut sudah ditutup dan tidak dapat diubah'
            ], 422);
        }

        $validated = $request->validate([
            'keterangan' => 'required|string',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'bukti' => 'nullable|file|max:5120'
        ]);

        // upload file
        if ($request->hasFile('bukti')) {
            if ($data->bukti) {
                Storage::disk('public')->delete($data->bukti);
            }

            $data->bukti = $request->file('bukti')->store('tindak_lanjut', 'public');
        }

        // update field
        $data->keterangan = $validated['keterangan'];
        $data->tahun = $validated['tahun'];
        $data->bulan = $validated['bulan'];

        // 🔥 AUTO STATUS
        $data->status = 'draft';

        $data->save();

        return response()->json([
            'message' => 'Tindak lanjut berhasil diperbarui',
            'data' => $data
        ]);
    }

    public function storeDetail(Request $request, $temuanId)
    {
        $analisis = null;

        // Coba cari di external audit dulu
        $context = DB::table('external_audit_temuan as t')
            ->leftJoin('external_audits as ea', 't.external_audit_id', '=', 'ea.id')
            ->select(
                't.id',
                't.masalah',
                't.rekomendasi',
                't.target_penyelesaian',
                DB::raw("'eksternal' as jenis_audit"),
                DB::raw("COALESCE(ea.objek_pemeriksaan, ea.lokasi, ea.objek_audit, '-') as unit")
            )
            ->where('t.id', $temuanId)
            ->first();

        // Jika tidak ketemu, cari di internal audit
        if (!$context) {
            $analisis = AnalisisTemuan::where('temuan_id', $temuanId)->first();
            $context = $this->getTemuanContext($temuanId);
        }

        if (!$context) {
            return response()->json([
                'message' => 'Data temuan tidak ditemukan'
            ], 404);
        }

        if ($analisis && $analisis->status === 'close') {
            return response()->json([
                'message' => 'Tindak lanjut sudah ditutup dan tidak dapat diubah'
            ], 422);
        }

        $validated = $request->validate([
            'keterangan' => 'required|string',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'bukti' => 'nullable|file|max:5120'
        ]);

        $payload = [
            'temuan_id' => $temuanId,
            'jenis_audit' => $context->jenis_audit ?? 'internal',
            'masalah' => $context->masalah,
            'rekomendasi' => $context->rekomendasi,
            'unit' => $context->unit,
            'target_selesai' => $context->target_penyelesaian,
            'status' => 'draft',
            'keterangan' => $validated['keterangan'],
            'tahun' => $validated['tahun'],
            'bulan' => $validated['bulan'],
            'tanggal' => now()->toDateString(),
            'hasil_evaluasi' => null,
            'kesimpulan' => null,
        ];

        if ($request->hasFile('bukti')) {
            $payload['bukti'] = $request->file('bukti')->store('tindak_lanjut', 'public');
        }

        $tindakLanjut = TindakLanjut::create($payload);

        return response()->json([
            'message' => 'Tindak lanjut berhasil ditambahkan',
            'data' => $tindakLanjut
        ], 201);
    }

    public function review(Request $request, $id)
    {
        try {
            if (
                !Schema::hasColumn('tindak_lanjut', 'hasil_evaluasi') ||
                !Schema::hasColumn('tindak_lanjut', 'kesimpulan')
            ) {
                return response()->json([
                    'message' => 'Kolom review tindak lanjut belum tersedia. Jalankan migration terlebih dahulu.'
                ], 422);
            }

            $data = TindakLanjut::find($id);

            if (!$data) {
                return response()->json([
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $status_source = 'draft';
            if ($data->jenis_audit === 'eksternal') {
                $source = DB::table('external_audit_temuan')->where('id', $data->temuan_id)->first();
                $status_source = $source->status ?? 'draft';
            } else {
                $analisis = AnalisisTemuan::where('temuan_id', $data->temuan_id)->first();
                $status_source = $analisis->status ?? 'draft';
            }

            if ($status_source === 'close') {
                return response()->json([
                    'message' => 'Tindak lanjut sudah ditutup dan tidak dapat direview ulang'
                ], 422);
            }

            $validated = $request->validate([
                'hasil_evaluasi' => 'required|in:sesuai,potensi sesuai,belum sesuai',
                'kesimpulan' => 'nullable|string'
            ]);

            $isClose = $validated['hasil_evaluasi'] === 'sesuai';
            $status_baru = $isClose ? 'close' : 'monev';

            $data->hasil_evaluasi = $validated['hasil_evaluasi'];
            $data->kesimpulan = $validated['kesimpulan'] ?? null;
            $data->status = $status_baru;
            $data->save();

            // Sync status ke semua progress records untuk temuan ini
            TindakLanjut::where('temuan_id', $data->temuan_id)
                ->where('id', '!=', $data->id)
                ->update(['status' => $status_baru]);

            // Sync status ke tabel asal (Internal/External)
            if ($data->jenis_audit === 'eksternal') {
                DB::table('external_audit_temuan')
                    ->where('id', $data->temuan_id)
                    ->update(['status' => $status_baru]);

                // 🔥 AUTO CLOSE EXTERNAL AUDIT
                if ($isClose) {
                    $temuan = DB::table('external_audit_temuan')->find($data->temuan_id);
                    if ($temuan && $temuan->external_audit_id) {
                        $allFindings = DB::table('external_audit_temuan')
                            ->where('external_audit_id', $temuan->external_audit_id)
                            ->get();
                        
                        $allClosed = $allFindings->every(function($f) {
                            return strtolower($f->status) === 'close';
                        });

                        if ($allClosed) {
                            $statusSelesai = DB::table('status_pemeriksaans')->where('nama', 'Selesai')->first();
                            if ($statusSelesai) {
                                DB::table('external_audits')
                                    ->where('id', $temuan->external_audit_id)
                                    ->update([
                                        'id_status_pemeriks' => $statusSelesai->id,
                                        'status' => 'Selesai'
                                    ]);
                            }
                        }
                    }
                }
            } else {
                AnalisisTemuan::updateOrCreate(
                    ['temuan_id' => $data->temuan_id],
                    ['status' => $status_baru]
                );
            }

            return response()->json([
                'message' => 'Review tindak lanjut berhasil disimpan',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan review: ' . $e->getMessage()
            ], 500);
        }
    }

    protected function getTemuanContext($temuanId)
    {
        return DB::table('pemeriksaan_temuan as t')
            ->leftJoin('analisis_temuan as at', 'at.temuan_id', '=', 't.id')
            ->leftJoin('perencanaan_kkas as pk', 't.kka_id', '=', 'pk.id')
            ->leftJoin('assurance as a', 'pk.assurance_id', '=', 'a.id')
            ->select(
                't.id',
                't.masalah',
                't.rekomendasi',
                'at.target_penyelesaian',
                DB::raw("'internal' as jenis_audit"),
                DB::raw("COALESCE(a.objek_pemeriksaan, a.nama_kegiatan, a.objek_audit, a.lokasi, '-') as unit")
            )
            ->where('t.id', $temuanId)
            ->first();
    }
}
