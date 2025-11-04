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
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|string|exists:roles,name',
        ]);

        // Buat user baru
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign role ke user baru
        $user->assignRole($request->role);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data'    => $user->load('roles'),
        ]);
    }
}
