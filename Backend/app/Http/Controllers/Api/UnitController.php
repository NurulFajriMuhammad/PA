<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::orderBy('nama', 'asc')->get();
        return response()->json([
            'success' => true,
            'data'    => $units
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:units,kode',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $unit = Unit::create($request->all());
        return response()->json(['success' => true, 'data' => $unit], 201);
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::find($id);
        if (!$unit) return response()->json(['message' => 'Unit tidak ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:units,kode,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $unit->update($request->all());
        return response()->json(['success' => true, 'data' => $unit]);
    }

    public function destroy($id)
    {
        $unit = Unit::find($id);
        if (!$unit) return response()->json(['message' => 'Unit tidak ditemukan'], 404);
        
        $unit->delete();
        return response()->json(['success' => true, 'message' => 'Unit dihapus']);
    }
}