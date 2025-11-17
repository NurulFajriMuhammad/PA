<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule; // 🎯 TAMBAHKAN BARIS INI

class UserController extends Controller
{
    // Ambil semua user dan rolenya
    public function index()
    {
        $users = User::with('roles')->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    // Ambil semua role yang tersedia
    public function getRoles()
    {
        $roles = Role::all();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    // Tambah user baru oleh admin
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role_id' => 'required|array', 
            'role_id.*' => 'integer|exists:roles,id', 
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        // $user->assignRole($request->role_id, 'api');
        if (!empty($request->role_id)) {
            $user->assignRole($request->role_id); 
        }
        
        $newUser = User::with('roles')->find($user->id);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data' => $newUser,
        ], 201);
    }

    // Update user oleh admin
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            // Perbaikan: Menggunakan Rule::unique dengan pengecualian ID pengguna saat ini
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role_id' => 'required|array',
            'role_id.*' => 'integer|exists:roles,id',
            'password' => 'nullable|min:6',
        ]);

        // 1. Update data user
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);
        
        // 2. Sinkronkan Peran
        // $user->syncRoles($request->role_id, 'api');
        if (!empty($request->role_id)) {
            $user->syncRoles($request->role_id); 
        } else {
             $user->syncRoles([]); 
        }
        $updatedUser = $user->load('roles'); 
        
        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data' => $updatedUser,
        ]);
    }
}