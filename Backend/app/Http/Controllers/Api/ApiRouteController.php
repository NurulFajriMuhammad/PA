<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApiRoute;

class ApiRouteController extends Controller
{
    // READ (Index) - Memuat semua route yang tersimpan
    public function index()
    {
        $routes = ApiRoute::all();

        return response()->json([
            'success' => true,
            'data' => $routes,
        ]);
    }

    // CREATE (Store) - Menyimpan route baru ke database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'method' => 'required|string|in:GET,POST,PUT,DELETE,PATCH',
            'path' => 'required|string|unique:api_routes,path',
            'controller' => 'required|string',
            'action'      => 'nullable|string',        // ← tambah
            'permission'  => 'nullable|string',        // ← tambah
            'is_active' => 'boolean',
        ]);

        $route = ApiRoute::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Route API berhasil dibuat',
            'data' => $route,
        ], 201);
    }

    // UPDATE - Memperbarui route yang ada
    public function update(Request $request, ApiRoute $apiRoute)
    {
        $validated = $request->validate([
            'method' => 'required|string|in:GET,POST,PUT,DELETE,PATCH',
            'path' => 'required|string|unique:api_routes,path,' . $apiRoute->id, 
            'controller' => 'required|string',
            'action'      => 'nullable|string',        // ← tambah
            'permission'  => 'nullable|string',        // ← tambah
            'is_active' => 'boolean',
        ]);

        $apiRoute->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Route API berhasil diperbarui',
            'data' => $apiRoute,
        ]);
    }

    // DELETE - Menghapus route
    public function destroy(ApiRoute $apiRoute)
    {
        $apiRoute->delete();

        return response()->json([
            'success' => true,
            'message' => 'Route API berhasil dihapus',
        ]);
    }
}