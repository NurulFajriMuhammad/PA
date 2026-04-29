<?php

namespace App\Http\Controllers;

use App\Models\DocumentRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentRepositoryController extends Controller
{
    /**
     * Ambil semua dokumen dari semua sumber (real-time, tanpa perlu sync dulu)
     */
    public function index(Request $request)
    {
        // Bangun UNION dari semua sumber dokumen
        $baseUrl = config('app.url');

        $queries = [];

        // 1. Piagam Audit Internal (Profil SPI)
        $queries[] = DB::table('internal_audit_charters')
            ->whereNotNull('file_path')
            ->selectRaw("
                id,
                COALESCE(file_name, 'Piagam Audit Internal') as title,
                file_path,
                COALESCE(file_name, split_part(file_path, '/', -1)) as file_name,
                'pdf' as file_type,
                file_size,
                'Profil SPI' as category,
                'Piagam Audit Internal' as sub_category,
                'internal_audit_charter' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // 2. Dokumen Auditee (Renstra dll)
        $queries[] = DB::table('auditee_documents')
            ->whereNotNull('file_path')
            ->selectRaw("
                id,
                COALESCE(judul_dokumen, split_part(file_path, '/', -1)) as title,
                file_path,
                COALESCE(judul_dokumen, split_part(file_path, '/', -1)) as file_name,
                COALESCE(file_type, 'file') as file_type,
                NULL::BIGINT as file_size,
                'Dokumen Auditee' as category,
                'Renstra / Dokumen Perencanaan' as sub_category,
                'auditee_document' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // 3. LHE - Laporan Hasil Audit
        $queries[] = DB::table('lhe_files')
            ->whereNotNull('file_path')
            ->selectRaw("
                id,
                COALESCE(file_name, 'LHE') as title,
                file_path,
                COALESCE(file_name, split_part(file_path, '/', -1)) as file_name,
                COALESCE(file_type, 'pdf') as file_type,
                file_size,
                'Laporan Hasil Audit' as category,
                'LHE Internal' as sub_category,
                'lhe_file' as module,
                CAST(id AS TEXT) as module_id,
                CAST(uploaded_by AS TEXT) as uploaded_by,
                created_at
            ");

        // 4. Lampiran Temuan Internal (Pelaksanaan)
        $queries[] = DB::table('pemeriksaan_temuan')
            ->whereNotNull('lampiran')
            ->selectRaw("
                id,
                COALESCE(lampiran_name, split_part(lampiran, '/', -1), 'Lampiran Temuan') as title,
                lampiran as file_path,
                COALESCE(lampiran_name, split_part(lampiran, '/', -1)) as file_name,
                'file' as file_type,
                NULL::BIGINT as file_size,
                'Temuan Audit Internal' as category,
                'Lampiran Temuan Pelaksanaan' as sub_category,
                'pemeriksaan_temuan' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // 5. Lampiran Analisis Penyebab
        $queries[] = DB::table('analisis_temuan')
            ->whereNotNull('lampiran')
            ->selectRaw("
                id,
                split_part(lampiran, '/', -1) as title,
                lampiran as file_path,
                split_part(lampiran, '/', -1) as file_name,
                'file' as file_type,
                NULL::BIGINT as file_size,
                'Analisis Penyebab' as category,
                'Lampiran Analisis' as sub_category,
                'analisis_temuan' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // 6. Bukti Tindak Lanjut
        $queries[] = DB::table('tindak_lanjut')
            ->whereNotNull('bukti')
            ->selectRaw("
                id,
                split_part(bukti, '/', -1) as title,
                bukti as file_path,
                split_part(bukti, '/', -1) as file_name,
                'file' as file_type,
                NULL::BIGINT as file_size,
                'Tindak Lanjut' as category,
                'Bukti Dukung' as sub_category,
                'tindak_lanjut' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // 7. Lampiran Temuan Eksternal
        $queries[] = DB::table('external_audit_temuan')
            ->whereNotNull('lampiran')
            ->selectRaw("
                id,
                split_part(lampiran, '/', -1) as title,
                lampiran as file_path,
                split_part(lampiran, '/', -1) as file_name,
                'file' as file_type,
                NULL::BIGINT as file_size,
                'Temuan Audit Eksternal' as category,
                'Lampiran Temuan Eksternal' as sub_category,
                'external_audit_temuan' as module,
                CAST(id AS TEXT) as module_id,
                NULL::TEXT as uploaded_by,
                created_at
            ");

        // Gabungkan semua query dengan UNION ALL
        $unionQuery = null;
        foreach ($queries as $q) {
            if ($unionQuery === null) {
                $unionQuery = $q;
            } else {
                $unionQuery = $unionQuery->unionAll($q);
            }
        }

        // Bungkus sebagai subquery untuk filtering & sorting
        $wrapped = DB::table(DB::raw("({$unionQuery->toSql()}) as docs"))
            ->mergeBindings($unionQuery);

        // Filter: search
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $wrapped->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', $search)
                  ->orWhere('file_name', 'ILIKE', $search)
                  ->orWhere('category', 'ILIKE', $search);
            });
        }

        // Filter: category
        if ($request->filled('category') && $request->category !== 'Semua') {
            $wrapped->where('category', $request->category);
        }

        // Filter: module
        if ($request->filled('module')) {
            $wrapped->where('module', $request->module);
        }

        // Filter: file_type
        if ($request->filled('file_type')) {
            $wrapped->where('file_type', $request->file_type);
        }

        $total = (clone $wrapped)->count();
        $perPage = 20;
        $page = max(1, (int)$request->get('page', 1));
        $offset = ($page - 1) * $perPage;

        $documents = $wrapped
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        // Map download_url
        $backendUrl = rtrim(env('APP_URL', config('app.url')), '/');
        $documents = $documents->map(function ($doc) use ($backendUrl) {
            $filePath = $doc->file_path;
            return [
                'id'            => $doc->id,
                'title'         => $doc->title ?: ($doc->file_name ?: 'Dokumen'),
                'file_path'     => $filePath,
                'file_name'     => $doc->file_name ?: basename($filePath),
                'file_type'     => $doc->file_type,
                'file_size'     => $doc->file_size,
                'category'      => $doc->category,
                'sub_category'  => $doc->sub_category,
                'module'        => $doc->module,
                'module_id'     => $doc->module_id,
                'uploaded_by'   => $doc->uploaded_by,
                'created_at'    => $doc->created_at,
                'formatted_size'=> $this->formatFileSize($doc->file_size),
                'download_url'  => $backendUrl . '/storage/' . ltrim($filePath, '/')
            ];
        });

        // Ambil daftar kategori dan modul dari semua sumber
        $allDocs = DB::table(DB::raw("({$unionQuery->toSql()}) as docs"))
            ->mergeBindings($unionQuery)
            ->select('category', 'module', 'file_type')
            ->get();

        $categories = $allDocs->pluck('category')->unique()->filter()->sort()->values();
        $modules    = $allDocs->pluck('module')->unique()->filter()->sort()->values();
        $fileTypes  = $allDocs->pluck('file_type')->unique()->filter()->sort()->values();

        return response()->json([
            'success'    => true,
            'data'       => [
                'data'         => $documents,
                'total'        => $total,
                'current_page' => $page,
                'last_page'    => (int)ceil($total / $perPage),
                'per_page'     => $perPage,
            ],
            'categories' => $categories,
            'modules'    => $modules,
            'file_types' => $fileTypes,
        ]);
    }

    /**
     * Sync ke tabel document_repositories (opsional / untuk backup)
     */
    public function sync(Request $request)
    {
        try {
            DocumentRepository::syncDocuments();

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil disinkronisasi ke repository'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal sinkronisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistik dokumen real-time
     */
    public function statistics()
    {
        $counts = [
            'Profil SPI'              => DB::table('internal_audit_charters')->whereNotNull('file_path')->count(),
            'Dokumen Auditee'         => DB::table('auditee_documents')->whereNotNull('file_path')->count(),
            'Laporan Hasil Audit'     => DB::table('lhe_files')->whereNotNull('file_path')->count(),
            'Temuan Audit Internal'   => DB::table('pemeriksaan_temuan')->whereNotNull('lampiran')->count(),
            'Analisis Penyebab'       => DB::table('analisis_temuan')->whereNotNull('lampiran')->count(),
            'Tindak Lanjut'           => DB::table('tindak_lanjut')->whereNotNull('bukti')->count(),
            'Temuan Audit Eksternal'  => DB::table('external_audit_temuan')->whereNotNull('lampiran')->count(),
        ];

        $totalDocuments = array_sum($counts);

        return response()->json([
            'success' => true,
            'data'    => [
                'total_documents' => $totalDocuments,
                'categories'      => $counts,
                'modules'         => $counts,
                'total_size'      => DB::table('lhe_files')->sum('file_size')
                    + DB::table('internal_audit_charters')->sum('file_size'),
            ]
        ]);
    }

    /**
     * Download dokumen
     */
    public function download($id)
    {
        $document = DocumentRepository::find($id);

        if (!$document || !Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 404);
        }

        return response()->download(
            storage_path('app/public/' . $document->file_path),
            $document->file_name ?? $document->title
        );
    }

    private function formatFileSize($bytes)
    {
        if (!$bytes) return '-';
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
