<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\StatusPemeriksaan;
use Illuminate\Http\Request;

class StatusPemeriksaanController extends Controller
{
    public function index()
    {
        return StatusPemeriksaan::orderBy('urutan')->get();
    }

    public function store(Request $request)
    {
        $data = StatusPemeriksaan::create($request->all());
        return response()->json($data, 201);
    }

    public function show($id)
    {
        return StatusPemeriksaan::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $data = StatusPemeriksaan::findOrFail($id);
        $data->update($request->all());
        return response()->json($data);
    }

    public function destroy($id)
    {
        StatusPemeriksaan::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
