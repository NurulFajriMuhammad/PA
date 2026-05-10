<?php

namespace App\Http\Controllers;

use App\Models\AnalisisTemuan;
use App\Models\TindakLanjut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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
                foreach ($insertData as $data) {
                    TindakLanjut::create($data);
                }
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

        // 1. Ambil Data Temuan (Header)
        if (strtolower($jenis) === 'eksternal') {
            $temuanModel = \App\Models\ExternalAuditTemuan::with(['externalAudit', 'rtlSubmitter.roles'])->find($temuanId);
            if ($temuanModel) {
                $temuan = (object) $temuanModel->toArray();
                $temuan->rencana_koreksi = $temuanModel->rencana_koreksi;
                $temuan->status_temuan = $temuanModel->status;
                
                // Ambil Nama & Role Submitter RTL
                if ($temuanModel->rtlSubmitter) {
                    $roleName = $temuanModel->rtlSubmitter->roles->first() ? $temuanModel->rtlSubmitter->roles->first()->name : 'Auditee';
                    $temuan->rtl_submitted_by_name = $temuanModel->rtlSubmitter->name;
                    $temuan->rtl_submitted_by_role = $roleName;
                } else {
                    $temuan->rtl_submitted_by_name = null;
                    $temuan->rtl_submitted_by_role = null;
                }

                $ea = $temuanModel->externalAudit;
                $temuan->unit = $ea ? ($ea->objek_pemeriksaan ?? $ea->lokasi ?? $ea->objek_audit ?? '-') : '-';
                $temuan->external_audit_id = $temuanModel->external_audit_id;
                $temuan->audit_status = $ea ? ($ea->statusPemeriksaan ? $ea->statusPemeriksaan->nama : $ea->status) : null;

            } else {
                $temuan = null;
            }
        } else {
            $temuan = DB::table('pemeriksaan_temuan as t')
                ->leftJoin('analisis_temuan as at', 't.id', '=', 'at.temuan_id')
                ->leftJoin('perencanaan_kkas as pk', 't.kka_id', '=', 'pk.id')
                ->leftJoin('assurance as a', 'pk.assurance_id', '=', 'a.id')
                ->select([
                    't.*',
                    'at.analisa',
                    'at.rencana_koreksi',
                    'at.rencana_kolektif',
                    'at.target_penyelesaian',
                    'at.status as status_temuan',
                    DB::raw("COALESCE(a.objek_pemeriksaan, a.nama_kegiatan, a.objek_audit, a.lokasi, '-') as unit")
                ])
                ->where('t.id', $temuanId)
                ->first();
        }

        if (!$temuan) {
            return response()->json(['message' => 'Data temuan tidak ditemukan'], 404);
        }

        // 2. Ambil Riwayat Progres (List)
        $tindakLanjut = DB::table('tindak_lanjut as tl')
            ->leftJoin('users as reviewer', 'tl.reviewer_id', '=', 'reviewer.id')
            ->leftJoin('users as creator', 'tl.created_by', '=', 'creator.id')
            ->where('tl.temuan_id', $temuanId)
            ->where('tl.jenis_audit', strtolower($jenis))
            ->whereNotNull('tl.keterangan')
            ->select([
                'tl.*',
                'reviewer.name as reviewer_name',
                'creator.name as created_by_name'
            ])
            ->orderBy('tl.id', 'asc')
            ->get();

        // Mapping hasil agar sesuai dengan format lama frontend
        $formattedTL = $tindakLanjut->map(function($d) {
            return [
                'id' => $d->id,
                'tahun' => $d->tahun,
                'bulan' => $d->bulan,
                'keterangan' => $d->keterangan,
                'bukti' => $d->bukti,
                'status' => $d->status ?? 'draft',
                'hasil_evaluasi' => $d->hasil_evaluasi,
                'kesimpulan' => $d->kesimpulan,
                'persentase' => $d->persentase,
                'estimasi_selesai' => $d->estimasi_selesai,
                'pic_pelaksana' => $d->pic_pelaksana,
                'kendala' => $d->kendala,
                'catatan_tambahan' => $d->catatan_tambahan,
                'bukti_name' => $d->bukti_name,
                'reviewer_name' => $d->reviewer_name,
                'created_by_name' => $d->created_by_name,
                'reviewed_at' => $d->reviewed_at,
                'created_at' => $d->created_at,
            ];
        });

        return response()->json([
            'temuan' => $temuan,
            'tindak_lanjut' => $formattedTL
        ]);
    }

    // =========================
    // 🔒 SIMPAN RTL (Satu Kali)
    // =========================
    public function saveRtl(Request $request, $id)
    {
        try {
            $temuan = \App\Models\ExternalAuditTemuan::findOrFail($id);

            $validated = $request->validate([
                'langkah_perbaikan' => 'required|string',
                'target_penyelesaian' => 'required|date',
                'prioritas' => 'required|string',
                'pic_rtls' => 'required|array',
                'estimasi_anggaran' => 'nullable|numeric',
                'sdm_dibutuhkan' => 'nullable|string',
                'sarana_alat' => 'nullable|string',
                'potensi_kendala' => 'nullable|string',
                'catatan_auditor' => 'nullable|string',
            ]);

            // Update temuan with RTL data
            $temuan->update([
                'rencana' => $validated['langkah_perbaikan'], // reuse existing 'rencana' as primary field
                'target_penyelesaian' => $validated['target_penyelesaian'],
                'prioritas' => $validated['prioritas'],
                'estimasi_anggaran' => $validated['estimasi_anggaran'] ?? 0,
                'sdm_dibutuhkan' => $validated['sdm_dibutuhkan'],
                'sarana_alat' => $validated['sarana_alat'],
                'potensi_kendala' => $validated['potensi_kendala'],
                'catatan_auditor' => $validated['catatan_auditor'],
                'pic_rtls' => $validated['pic_rtls'],
                'rtl_submitted_at' => now(),
                'rtl_submitted_by' => Auth::id(),
            ]);

            // Auto-update parent audit status if it's still in "Pengisian Rencana Tindak Lanjut"
            $audit = $temuan->externalAudit;
            if ($audit) {
                $statusRtl = "Pengisian Rencana Tindak Lanjut";
                $statusNext = "Pengisian Tindak Lanjut"; // Sesuaikan dengan DB

                if ($audit->status === $statusRtl) {
                    // Cek apakah SEMUA temuan sudah mengisi RTL
                    $allFindingsCount = \App\Models\ExternalAuditTemuan::where('external_audit_id', $audit->id)->count();
                    $submittedRtlCount = \App\Models\ExternalAuditTemuan::where('external_audit_id', $audit->id)
                        ->whereNotNull('rtl_submitted_at')
                        ->count();

                    if ($allFindingsCount > 0 && $allFindingsCount === $submittedRtlCount) {
                        $nextStatusModel = DB::table('status_pemeriksaans')->where('nama', $statusNext)->first();
                        if ($nextStatusModel) {
                            $audit->update([
                                'status' => $statusNext,
                                'id_status_pemeriks' => $nextStatusModel->id
                            ]);
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Rencana Tindak Lanjut (RTL) berhasil disimpan',
                'data' => $temuan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan RTL: ' . $e->getMessage()
            ], 500);
        }
    }

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
            'bukti' => 'nullable|file|max:5120',
            'persentase' => 'nullable',
            'estimasi_selesai' => 'nullable',
            'pic_pelaksana' => 'nullable',
            'kendala' => 'nullable',
            'catatan_tambahan' => 'nullable'
        ]);

        // upload file
        if ($request->hasFile('bukti')) {
            if ($data->bukti) {
                Storage::disk('public')->delete($data->bukti);
            }

            $data->bukti = $request->file('bukti')->store('tindak_lanjut', 'public');
            $data->bukti_name = $request->file('bukti')->getClientOriginalName();
        }

        // update field
        $data->keterangan = $validated['keterangan'];
        $data->tahun = $validated['tahun'];
        $data->bulan = $validated['bulan'];
        $data->persentase = $validated['persentase'] ?? 0;
        $data->estimasi_selesai = $validated['estimasi_selesai'] ?? null;
        $data->pic_pelaksana = $validated['pic_pelaksana'] ?? null;
        $data->kendala = $validated['kendala'] ?? null;
        $data->catatan_tambahan = $validated['catatan_tambahan'] ?? null;

        // 🔥 AUTO STATUS
        $data->status = 'draft';
        if (!$data->created_by) {
            $data->created_by = Auth::id();
        }

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
            'bukti' => 'nullable|file|max:5120',
            'persentase' => 'nullable',
            'estimasi_selesai' => 'nullable',
            'pic_pelaksana' => 'nullable',
            'kendala' => 'nullable',
            'catatan_tambahan' => 'nullable'
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
            'persentase' => $validated['persentase'] ?? 0,
            'estimasi_selesai' => $validated['estimasi_selesai'] ?? null,
            'pic_pelaksana' => $validated['pic_pelaksana'] ?? null,
            'kendala' => $validated['kendala'] ?? null,
            'catatan_tambahan' => $validated['catatan_tambahan'] ?? null,
            'tanggal' => now()->toDateString(),
            'hasil_evaluasi' => null,
            'kesimpulan' => null,
            'created_by' => Auth::id(),
        ];

        if ($request->hasFile('bukti')) {
            $payload['bukti'] = $request->file('bukti')->store('tindak_lanjut', 'public');
            $payload['bukti_name'] = $request->file('bukti')->getClientOriginalName();
        }

        $tindakLanjut = TindakLanjut::create($payload);

        // Auto-update parent temuan status to "Monev" when progress is added
        if (($context->jenis_audit ?? 'internal') === 'eksternal') {
            DB::table('external_audit_temuan')
                ->where('id', $temuanId)
                ->where('status', '!=', 'Close')
                ->update(['status' => 'Monev']);
        } else {
             \App\Models\AnalisisTemuan::updateOrCreate(
                ['temuan_id' => $temuanId],
                ['status' => 'monev']
            );
        }

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

            // Cek apakah temuan sudah Close
            if ($data->jenis_audit === 'eksternal') {
                $source = DB::table('external_audit_temuan')->where('id', $data->temuan_id)->first();
                $status_source = $source->status ?? 'draft';
            } else {
                $analisis = AnalisisTemuan::where('temuan_id', $data->temuan_id)->first();
                $status_source = $analisis->status ?? 'draft';
            }

            if (strtolower($status_source) === 'close') {
                return response()->json([
                    'message' => 'Tindak lanjut sudah ditutup dan tidak dapat direview ulang'
                ], 422);
            }

            // Support both lowercase and capitalized values from frontend
            $validated = $request->validate([
                'hasil_evaluasi' => 'required|in:sesuai,belum sesuai,dalam proses,Sesuai,Belum Sesuai,Dalam Proses',
                'kesimpulan' => 'nullable|string'
            ]);

            $hasil = strtolower($validated['hasil_evaluasi']);
            $isSesuai = ($hasil === 'sesuai');

            $data->hasil_evaluasi = $hasil;
            $data->kesimpulan = $validated['kesimpulan'] ?? null;
            $data->reviewer_id = Auth::id();
            $data->reviewed_at = now();
            $data->save();

            if ($data->jenis_audit === 'eksternal') {
                $statusTemuan = "";
                if ($hasil === 'sesuai') {
                    $statusTemuan = 'Close';
                } else if ($hasil === 'belum sesuai') {
                    $statusTemuan = 'Pengisian Tindak Lanjut';
                } else if ($hasil === 'dalam proses') {
                    $statusTemuan = 'Monev';
                }

                if ($statusTemuan) {
                    DB::table('external_audit_temuan')
                        ->where('id', $data->temuan_id)
                        ->update(['status' => $statusTemuan]);
                }
            } else {
                if ($hasil === 'sesuai') {
                    AnalisisTemuan::updateOrCreate(
                        ['temuan_id' => $data->temuan_id],
                        ['status' => 'close']
                    );
                }
            }


            return response()->json([
                'message' => $isSesuai
                    ? 'Tindakan sudah diverifikasi sesuai. Status temuan berhasil diupdate.'
                    : 'Hasil review berhasil disimpan.',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan review: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // 🔒 TUTUP TEMUAN (Monev → Close)
    // =========================
    public function closeTemuan(Request $request, $temuanId)
    {
        try {
            $jenis = $request->query('jenis', 'eksternal');

            if ($jenis === 'eksternal') {
                $temuan = DB::table('external_audit_temuan')->where('id', $temuanId)->first();

                if (!$temuan) {
                    return response()->json(['message' => 'Temuan tidak ditemukan'], 404);
                }

                if (strtolower($temuan->status) !== 'monev') {
                    return response()->json([
                        'message' => 'Temuan harus berstatus Monev sebelum dapat ditutup'
                    ], 422);
                }

                // Update status temuan ke Close
                DB::table('external_audit_temuan')
                    ->where('id', $temuanId)
                    ->update(['status' => 'Close']);

                // Lock semua progres tindak lanjut untuk temuan ini
                DB::table('tindak_lanjut')
                    ->where('temuan_id', $temuanId)
                    ->where('jenis_audit', 'eksternal')
                    ->update(['status' => 'close']);

                // Cek apakah semua temuan dalam audit sudah Close
                $auditId = $temuan->external_audit_id;
                $allTemuan = DB::table('external_audit_temuan')
                    ->where('external_audit_id', $auditId)->get();

                $allClosed = $allTemuan->every(fn($f) => strtolower($f->status) === 'close');

                if ($allClosed && $allTemuan->count() > 0) {
                    $statusSelesai = DB::table('status_pemeriksaans')->where('nama', 'Selesai')->first();
                    if ($statusSelesai) {
                        DB::table('external_audits')
                            ->where('id', $auditId)
                            ->update([
                                'id_status_pemeriks' => $statusSelesai->id,
                                'status' => 'Selesai'
                            ]);
                    }
                }

                return response()->json([
                    'message' => 'Temuan berhasil ditutup' . ($allClosed ? '. Semua temuan sudah Close, audit Selesai.' : ''),
                    'audit_selesai' => $allClosed
                ]);
            }

            return response()->json(['message' => 'Jenis audit tidak didukung'], 422);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menutup temuan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $data = TindakLanjut::find($id);

            if (!$data) {
                return response()->json([
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            // Hapus file bukti jika ada
            if ($data->bukti) {
                Storage::disk('public')->delete($data->bukti);
            }

            $data->delete();

            return response()->json([
                'message' => 'Data progres berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
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
