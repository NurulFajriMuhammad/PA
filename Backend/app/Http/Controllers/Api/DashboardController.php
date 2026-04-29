<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditUniverse;
use App\Models\assurance;
use App\Models\SemuaTemuan;
use DB;

class DashboardController extends Controller
{
    /**
     * Mengambil data statistik untuk dashboard.
     */
    public function getStats(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));

            // 1. KPI Stats
            $totalObjekAudit = AuditUniverse::count();
            $auditBerjalan = assurance::where('id_status_pemeriksaan', '!=', 7)->count();
            
            $totalTemuan = SemuaTemuan::count();
            $temuanClose = SemuaTemuan::whereRaw('LOWER(status) = ?', ['close'])->count();
            $temuanOpen = SemuaTemuan::whereRaw('LOWER(status) != ?', ['close'])->count();
            
            $penyelesaian = $totalTemuan > 0 ? round(($temuanClose / $totalTemuan) * 100, 1) : 0;

            // 2. Data Tren Audit (12 Bulan) untuk tahun yang dipilih
            $auditSelesaiPerBulan = array_fill(1, 12, 0);
            $temuanBaruPerBulan = array_fill(1, 12, 0);

            // Perbaikan untuk PostgreSQL
            $audits = assurance::where('id_status_pemeriksaan', 7)
                ->whereYear('periode_akhir', $tahun)
                ->select(DB::raw('EXTRACT(MONTH FROM periode_akhir) as bulan'), DB::raw('count(*) as total'))
                ->groupBy('bulan')
                ->get();
            foreach ($audits as $audit) {
                if ($audit->bulan) {
                    $auditSelesaiPerBulan[(int)$audit->bulan] = $audit->total;
                }
            }

            $temuans = SemuaTemuan::whereYear('tanggal', $tahun)
                ->select(DB::raw('EXTRACT(MONTH FROM tanggal) as bulan'), DB::raw('count(*) as total'))
                ->groupBy('bulan')
                ->get();
            foreach ($temuans as $temuan) {
                if ($temuan->bulan) {
                    $temuanBaruPerBulan[(int)$temuan->bulan] = $temuan->total;
                }
            }

            // 3. Aktivitas Terkini (Gabungan dari audit baru dan temuan baru)
            $latestAudits = assurance::orderBy('created_at', 'desc')->take(5)->get()->map(function($item) {
                return [
                    'id' => 'a_'.$item->id,
                    'title' => 'Audit Baru: ' . $item->objek_pemeriksaan,
                    'desc' => $item->nama_kegiatan,
                    'time' => $item->created_at,
                    'type' => 'audit'
                ];
            });

            $latestTemuans = SemuaTemuan::orderBy('tanggal', 'desc')->take(5)->get()->map(function($item) {
                return [
                    'id' => 't_'.$item->id_format,
                    'title' => 'Temuan Baru: ' . $item->unit,
                    'desc' => $item->judul_masalah,
                    'time' => $item->tanggal,
                    'type' => 'temuan'
                ];
            });

            $aktivitas = $latestAudits->concat($latestTemuans)
                ->sortByDesc('time')
                ->take(5)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'kpi' => [
                        'total_objek_audit' => $totalObjekAudit,
                        'audit_berjalan' => $auditBerjalan,
                        'temuan_open' => $temuanOpen,
                        'penyelesaian' => $penyelesaian,
                    ],
                    'tren' => [
                        'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
                        'audit_selesai' => array_values($auditSelesaiPerBulan),
                        'temuan_baru' => array_values($temuanBaruPerBulan),
                    ],
                    'aktivitas' => $aktivitas
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
