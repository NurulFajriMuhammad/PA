<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\PermissionMatrix;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next, $moduleCode, $permissionType)
    {
        $user = $request->user();

        // Jika user tidak login atau tidak punya jabatan, tolak
        if (!$user || !$user->jabatan_id) {
            return response()->json(['message' => 'Akses ditolak: User tidak memiliki jabatan.'], 403);
        }

        // Cek izin di tabel permission_matrix berdasarkan kode_modul
        $hasAccess = PermissionMatrix::where('jabatan_id', $user->jabatan_id)
            ->whereHas('module', function($q) use ($moduleCode) {
                $q->where('kode_modul', $moduleCode);
            })
            ->where($permissionType, true)
            ->exists();

        if (!$hasAccess) {
            return response()->json([
                'message' => "Anda tidak memiliki akses ($permissionType) untuk modul $moduleCode!"
            ], 403);
        }

        return $next($request);
    }
}