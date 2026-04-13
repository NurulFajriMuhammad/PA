<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PermissionMatrix;
use App\Models\Jabatan;
use App\Models\Module; // Pastikan model Module di-import
use Illuminate\Http\Request;

class PermissionMatrixController extends Controller
{
    public function index()
    {
        // Ambil semua data jabatan dan modul
        $jabatans = Jabatan::all();
        $modules = Module::all();

        // Jika modul atau jabatan masih kosong, return array kosong agar frontend tidak bingung
        if ($jabatans->isEmpty() || $modules->isEmpty()) {
            return response()->json([]);
        }

        // Loop untuk memastikan setiap jabatan punya baris di setiap modul
        foreach ($jabatans as $j) {
            foreach ($modules as $m) {
                // PERBAIKAN: Gunakan ->id (PHP style), bukan .id (JS style)
                PermissionMatrix::firstOrCreate(
                    ['jabatan_id' => $j->id, 'module_id' => $m->id],
                    ['can_read' => true, 'can_write' => false, 'can_delete' => false]
                );
            }
        }

        // Ambil data lengkap dengan relasi untuk ditampilkan di tabel frontend
        $matrix = PermissionMatrix::with(['jabatan', 'module'])
            ->orderBy('jabatan_id', 'asc')
            ->get();

        return response()->json($matrix);
    }

    public function updateMatrix(Request $request)
    {
        // Validasi agar tidak error jika data kosong
        if (!$request->has('permissions')) {
            return response()->json(['message' => 'Tidak ada data yang dikirim'], 400);
        }

        foreach ($request->permissions as $perm) {
            PermissionMatrix::updateOrCreate(
                [
                    'jabatan_id' => $perm['jabatan_id'], 
                    'module_id' => $perm['module_id']
                ],
                [
                    'can_read' => $perm['can_read'] ?? true,
                    'can_write' => $perm['can_write'] ?? false,
                    'can_delete' => $perm['can_delete'] ?? false,
                ]
            );
        }

        return response()->json(['message' => 'Matriks akses berhasil diperbarui']);
    }
}