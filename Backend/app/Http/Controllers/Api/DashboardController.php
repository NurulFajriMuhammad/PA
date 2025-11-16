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
            $totalAudit = Audit::count();
            $auditBerlangsung = Audit::where('status', 'berlangsung')->count();
            $totalTemuan = Temuan::count();
            $auditSelesai = Audit::where('status', 'selesai')->count();

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
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
