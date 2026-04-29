<?php

namespace App\Http\Controllers;

use App\Models\StatusPemeriksaanAkses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatusPemeriksaanAksesController extends Controller
{
    public function index()
    {
        // Kembalikan dikelompokkan per role per status
        $data = StatusPemeriksaanAkses::with(['role', 'statusPemeriksaan'])
            ->orderBy('role_id')
            ->orderBy('status_pemeriksaan_id')
            ->get();

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id'               => 'required|exists:roles,id',
            'status_pemeriksaan_id' => 'required|exists:status_pemeriksaans,id',
            'url'                   => 'required|string|max:255',
        ]);

        // Hindari duplikasi
        $existing = StatusPemeriksaanAkses::where($validated)->first();
        if ($existing) {
            return response()->json(['message' => 'Data sudah ada'], 422);
        }

        $akses = StatusPemeriksaanAkses::create($validated);
        $akses->load(['role', 'statusPemeriksaan']);

        return response()->json($akses, 201);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'role_id'               => 'required|exists:roles,id',
            'status_pemeriksaan_id' => 'required|exists:status_pemeriksaans,id',
            'urls'                  => 'required|array',
            'urls.*'                => 'string|max:255',
        ]);

        // Hapus yang lama lalu insert yang baru
        StatusPemeriksaanAkses::where('role_id', $request->role_id)
            ->where('status_pemeriksaan_id', $request->status_pemeriksaan_id)
            ->delete();

        $created = [];
        foreach ($request->urls as $url) {
            $created[] = StatusPemeriksaanAkses::create([
                'role_id'               => $request->role_id,
                'status_pemeriksaan_id' => $request->status_pemeriksaan_id,
                'url'                   => $url,
            ]);
        }

        return response()->json(['message' => 'Berhasil disimpan', 'data' => $created], 201);
    }

    public function destroy($id)
    {
        StatusPemeriksaanAkses::findOrFail($id)->delete();
        return response()->json(['message' => 'Berhasil dihapus']);
    }
}
