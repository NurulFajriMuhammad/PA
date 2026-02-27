<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApiRoute; // Ganti dengan Model yang Anda gunakan

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
            // store the path without any leading slash or "/api" prefix
            'path' => 'required|string|unique:api_routes,path',
            'controller' => 'required|string',
            'action'      => 'nullable|string',
            'permission'  => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // sanitization – remove leading slashes and api/ prefix so loader can consistently add it
        $validated['path'] = ltrim(preg_replace('#^/?api/?#i', '', $validated['path']), '/');

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
            'action'      => 'nullable|string',
            'permission'  => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // sanitize path same as store
        $validated['path'] = ltrim(preg_replace('#^/?api/?#i', '', $validated['path']), '/');

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