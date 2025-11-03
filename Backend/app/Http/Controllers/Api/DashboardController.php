<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Audit; 
use App\Models\Temuan;
// use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Mengambil data statistik untuk dashboard.
     */
    public function getStats(Request $request)
    {
        try {
            // Logika ini hanya contoh. Silakan sesuaikan dengan query Anda.
            
            // Contoh: Menghitung total audit
            $totalAudit = Audit::count();
            
            // Contoh: Menghitung audit yang masih berjalan (misal status 'berlangsung')
            $auditBerlangsung = Audit::where('status', 'berlangsung')->count();
            
            // Contoh: Menghitung total temuan
            $totalTemuan = Temuan::count();
            
            // Contoh: Menghitung audit yang sudah selesai
            $auditSelesai = Audit::where('status', 'selesai')->count();

            // Kembalikan data dalam format JSON
            return response()->json([
                'success' => true,
                'data' => [
                    'total_audit' => $totalAudit,
                    'audit_berlangsung' => $auditBerlangsung,
                    'total_temuan' => $totalTemuan,
                    'audit_selesai' => $auditSelesai,
                ]
            ]);

        } catch (\Exception $e) {
            // Jika terjadi error
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
