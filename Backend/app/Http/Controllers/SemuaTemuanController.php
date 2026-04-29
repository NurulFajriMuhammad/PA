<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SemuaTemuan;

class SemuaTemuanController extends Controller
{
    public function index()
    {
        try {
            // Ambil semua data dari view v_semua_temuan
            // Kita urutkan berdasarkan tanggal terbaru (asumsi field tanggal ada)
            $temuan = SemuaTemuan::orderBy('tanggal', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil semua data temuan audit',
                'data' => $temuan
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }
}
