<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Traits\BroadcastsRealTime;

class DocumentRepository extends Model
{
    use BroadcastsRealTime;

    protected $fillable = [
        'title',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'category',
        'module',
        'module_id',
        'uploaded_by',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'file_size' => 'integer'
    ];

    /**
     * Sinkronisasi dokumen dari seluruh modul aplikasi
     */
    public static function syncDocuments()
    {
        self::truncate();

        self::syncInternalAuditCharter();      // Profil SPI / Piagam Audit
        self::syncAuditeeDocument();           // Renstra / Dokumen Auditee
        self::syncLheFile();                   // Laporan Hasil Audit (LHE)
        self::syncPemeriksaanTemuan();         // Lampiran Temuan Internal (Pelaksanaan)
        self::syncAnalisisTemuan();            // Lampiran Analisis Penyebab
        self::syncTindakLanjut();              // Bukti Dukung Tindak Lanjut
        self::syncExternalAuditTemuan();       // Lampiran Temuan Eksternal
    }

    /** 1. Profil SPI / Piagam Audit Internal */
    private static function syncInternalAuditCharter()
    {
        $rows = DB::table('internal_audit_charters')
            ->whereNotNull('file_path')
            ->select(
                DB::raw("COALESCE(file_name, 'Piagam Audit Internal') as title"),
                'file_path',
                'file_name',
                DB::raw("'pdf' as file_type"),
                'file_size',
                DB::raw("'Profil SPI' as category"),
                DB::raw("'internal_audit_charter' as module"),
                'id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('organization_name', organization_name, 'version', version, 'issued_date', issued_date) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 2. Dokumen Auditee / Renstra */
    private static function syncAuditeeDocument()
    {
        $rows = DB::table('auditee_documents')
            ->whereNotNull('file_path')
            ->select(
                DB::raw("COALESCE(judul_dokumen, split_part(file_path, '/', -1)) as title"),
                'file_path',
                DB::raw("COALESCE(judul_dokumen, split_part(file_path, '/', -1)) as file_name"),
                'file_type',
                DB::raw("NULL as file_size"),
                DB::raw("'Dokumen Auditee' as category"),
                DB::raw("'auditee_document' as module"),
                'id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('assurance_id', assurance_id) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 3. Laporan Hasil Audit (LHE) */
    private static function syncLheFile()
    {
        $rows = DB::table('lhe_files')
            ->whereNotNull('file_path')
            ->select(
                DB::raw("COALESCE(file_name, 'LHE') as title"),
                'file_path',
                'file_name',
                'file_type',
                'file_size',
                DB::raw("'Laporan Hasil Audit' as category"),
                DB::raw("'lhe_file' as module"),
                'id as module_id',
                'uploaded_by',
                DB::raw("json_build_object('kka_id', kka_id) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 4. Lampiran Temuan Internal (dari Pelaksanaan Audit) */
    private static function syncPemeriksaanTemuan()
    {
        $rows = DB::table('pemeriksaan_temuan')
            ->whereNotNull('lampiran')
            ->select(
                DB::raw("COALESCE(lampiran_name, split_part(lampiran, '/', -1), 'Lampiran Temuan') as title"),
                'lampiran as file_path',
                DB::raw("COALESCE(lampiran_name, split_part(lampiran, '/', -1)) as file_name"),
                DB::raw("'file' as file_type"),
                DB::raw("NULL as file_size"),
                DB::raw("'Temuan Audit Internal' as category"),
                DB::raw("'pemeriksaan_temuan' as module"),
                'id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('kka_id', kka_id, 'masalah', masalah) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 5. Lampiran Analisis Penyebab */
    private static function syncAnalisisTemuan()
    {
        $rows = DB::table('analisis_temuan')
            ->whereNotNull('lampiran')
            ->leftJoin('pemeriksaan_temuan as pt', 'analisis_temuan.temuan_id', '=', 'pt.id')
            ->select(
                DB::raw("COALESCE(split_part(analisis_temuan.lampiran, '/', -1), 'Lampiran Analisis') as title"),
                'analisis_temuan.lampiran as file_path',
                DB::raw("split_part(analisis_temuan.lampiran, '/', -1) as file_name"),
                DB::raw("'file' as file_type"),
                DB::raw("NULL as file_size"),
                DB::raw("'Analisis Penyebab' as category"),
                DB::raw("'analisis_temuan' as module"),
                'analisis_temuan.id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('temuan_id', analisis_temuan.temuan_id, 'masalah', pt.masalah) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 6. Bukti Dukung Tindak Lanjut */
    private static function syncTindakLanjut()
    {
        $rows = DB::table('tindak_lanjut')
            ->whereNotNull('bukti')
            ->select(
                DB::raw("'Bukti TL - ' || COALESCE(split_part(bukti, '/', -1), 'Tanpa Nama') as title"),
                'bukti as file_path',
                DB::raw("split_part(bukti, '/', -1) as file_name"),
                DB::raw("'file' as file_type"),
                DB::raw("NULL as file_size"),
                DB::raw("'Tindak Lanjut' as category"),
                DB::raw("'tindak_lanjut' as module"),
                'id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('unit', unit, 'jenis_audit', jenis_audit, 'tahun', tahun, 'bulan', bulan, 'masalah', masalah) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }

    /** 7. Lampiran Temuan Audit Eksternal */
    private static function syncExternalAuditTemuan()
    {
        $rows = DB::table('external_audit_temuan as eat')
            ->whereNotNull('eat.lampiran')
            ->leftJoin('external_audits as ea', 'eat.external_audit_id', '=', 'ea.id')
            ->select(
                DB::raw("COALESCE(split_part(eat.lampiran, '/', -1), 'Lampiran Eksternal') as title"),
                'eat.lampiran as file_path',
                DB::raw("split_part(eat.lampiran, '/', -1) as file_name"),
                DB::raw("'file' as file_type"),
                DB::raw("NULL as file_size"),
                DB::raw("'Temuan Audit Eksternal' as category"),
                DB::raw("'external_audit_temuan' as module"),
                'eat.id as module_id',
                DB::raw("NULL as uploaded_by"),
                DB::raw("json_build_object('external_audit_id', eat.external_audit_id, 'nama_kegiatan', ea.nama_kegiatan, 'masalah', eat.masalah) as metadata")
            )
            ->get();

        foreach ($rows as $row) {
            self::create((array)$row);
        }
    }
}
