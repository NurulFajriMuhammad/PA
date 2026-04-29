<?php

namespace App\Http\Controllers;

use App\Models\StatusTemuan;
use Illuminate\Http\Request;

class StatusTemuanController extends Controller
{
    public function index()
    {
        return response()->json(StatusTemuan::orderBy('urutan')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'       => 'required|string|max:100',
            'warna'      => 'required|string|max:20',
            'warna_teks' => 'required|string|max:20',
        ]);

        $max = StatusTemuan::max('urutan') ?? 0;
        $data = StatusTemuan::create([
            'nama'       => $request->nama,
            'warna'      => $request->warna,
            'warna_teks' => $request->warna_teks,
            'urutan'     => $max + 1,
        ]);

        return response()->json($data, 201);
    }

    public function update(Request $request, $id)
    {
        $item = StatusTemuan::findOrFail($id);
        $request->validate([
            'nama'       => 'sometimes|string|max:100',
            'warna'      => 'sometimes|string|max:20',
            'warna_teks' => 'sometimes|string|max:20',
        ]);
        $item->update($request->only(['nama', 'warna', 'warna_teks']));
        return response()->json($item);
    }

    public function destroy($id)
    {
        StatusTemuan::findOrFail($id)->delete();
        return response()->json(['message' => 'Berhasil dihapus']);
    }
}
