<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    // Fungsi untuk mengambil semua user beserta rolenya
    public function index()
    {
        // 'with('roles')' adalah cara efisien untuk mengambil user sekaligus rolenya
        $users = User::with('roles')->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    // Fungsi untuk mengambil semua role yang tersedia
    public function getRoles()
    {
        $roles = Role::all();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}