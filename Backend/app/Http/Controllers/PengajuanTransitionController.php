<?php

namespace App\Http\Controllers;

use App\Models\PengajuanTransition;
use Illuminate\Http\Request;

class PengajuanTransitionController extends Controller
{
    public function index()
    {
        $data = PengajuanTransition::with([
            'statusPemeriksaan',
            'role',
            'statusSelanjutnya',
            'statusDikembalikan',
        ])->orderBy('status_pemeriksaan_id')->get();

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'status_pemeriksaan_id'  => 'required|exists:status_pemeriksaans,id',
            'role_id'                => 'required|exists:roles,id',
            'status_selanjutnya_id'  => 'nullable|exists:status_pemeriksaans,id',
            'status_dikembalikan_id' => 'nullable|exists:status_pemeriksaans,id',
            'jenis'                  => 'required|in:internal,eksternal,keduanya',
        ]);

        $transition = PengajuanTransition::create($validated);
        $transition->load(['statusPemeriksaan', 'role', 'statusSelanjutnya', 'statusDikembalikan']);

        return response()->json($transition, 201);
    }

    public function update(Request $request, $id)
    {
        $transition = PengajuanTransition::findOrFail($id);

        $validated = $request->validate([
            'status_pemeriksaan_id'  => 'sometimes|exists:status_pemeriksaans,id',
            'role_id'                => 'sometimes|exists:roles,id',
            'status_selanjutnya_id'  => 'nullable|exists:status_pemeriksaans,id',
            'status_dikembalikan_id' => 'nullable|exists:status_pemeriksaans,id',
            'jenis'                  => 'sometimes|in:internal,eksternal,keduanya',
        ]);

        $transition->update($validated);
        $transition->load(['statusPemeriksaan', 'role', 'statusSelanjutnya', 'statusDikembalikan']);

        return response()->json($transition);
    }

    public function destroy($id)
    {
        PengajuanTransition::findOrFail($id)->delete();
        return response()->json(['message' => 'Berhasil dihapus']);
    }
}
