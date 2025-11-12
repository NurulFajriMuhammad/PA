<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

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
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role_id' => 'required|integer|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role_id);
        $newUser = User::with('roles')->find($user->id);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data' => $newUser, // Kirim data user baru ke frontend
        ], 201); // Beri status 201 Created
    }
}
