<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Menampilkan daftar semua permission.
     */
    public function index()
    {
        // 2. Ambil semua data permission dari database
        $permissions = Permission::all();
        // 3. Kembalikan sebagai JSON
        return response()->json($permissions);
    }

    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|unique:permissions,name',
    ]);

    $permission = Permission::create([
        'name' => $request->name,
        'guard_name' => 'web'
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Permission berhasil dibuat',
        'data' => $permission
    ], 201);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // (Nanti bisa diisi untuk hapus permission)
    }
}