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
        // $users = User::with('roles')->get();
        $users = User::with(['roles', 'jabatan'])->get();

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
            'jabatan_id' => 'nullable|exists:jabatans,id',
            'role_id' => 'required|array', 
            // 'role_id.*' => 'integer|exists:roles,id', 
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'jabatan_id' => $request->jabatan_id,
        ]);
        
        // $user->assignRole($request->role_id, 'api');
        if (!empty($request->role_id)) {
            // Filter out invalid role IDs
            $validRoleIds = \Spatie\Permission\Models\Role::whereIn('id', $request->role_id)->pluck('id')->toArray();
            $user->assignRole($validRoleIds); 
        }
        
        $newUser = User::with('roles')->find($user->id);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data' => $newUser,
        ], 201);
    }

    // Update user oleh admin
    // public function update(Request $request, User $user)
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
    //         'role_id' => 'required|array',
    //         'role_id.*' => 'integer|exists:roles,id',
    //         'password' => 'nullable|min:6',
    //         'jabatan_id' => 'nullable|exists:jabatans,id',
    //     ]);

    //     try {
    //         // 1. Update data user
    //         $user->update([
    //             'name' => $request->name,
    //             'email' => $request->email,
    //             'password' => $request->password ? Hash::make($request->password) : $user->password,
    //             'jabatan_id' => $request->jabatan_id,
    //         ]);
            
    //         // 2. Sinkronkan Peran dengan validasi ketat
    //         if (!empty($request->role_id)) {
    //             $requestedRoleIds = $request->role_id;
                
    //             // Cek apakah semua role ID valid di database
    //             $validRoleIds = \Spatie\Permission\Models\Role::whereIn('id', $requestedRoleIds)
    //                 ->pluck('id')
    //                 ->toArray();
                
    //             // Jika ada role yang tidak ditemukan, throw error
    //             if (count($validRoleIds) !== count($requestedRoleIds)) {
    //                 $invalidIds = array_diff($requestedRoleIds, $validRoleIds);
    //                 throw new \Exception("Role dengan ID " . implode(', ', $invalidIds) . " tidak ditemukan di database");
    //             }
                
    //             $user->syncRoles($validRoleIds); 
    //         } else {
    //              $user->syncRoles([]); 
    //         }
            
    //         // $updatedUser = $user->load('roles'); 
    //         $updatedUser = $user->load(['roles', 'jabatan']);
            
    //         return response()->json([
    //             'success' => true,
    //             'message' => 'User berhasil diperbarui',
    //             'data' => $updatedUser,
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Gagal memperbarui user: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function update(Request $request, User $user)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        'role_id' => 'required|array',
        'role_id.*' => 'integer|exists:roles,id',
        'password' => 'nullable|min:6',
        'jabatan_id' => 'nullable|exists:jabatans,id', // Tambahkan validasi ini
    ]);

    try {
        // 1. Update data user (Sertakan jabatan_id di sini)
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'jabatan_id' => $request->jabatan_id, // WAJIB ADA AGAR TERSIMPAN
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);
        
        // 2. Sinkronkan Peran (Role)
        if (!empty($request->role_id)) {
            $validRoleIds = \Spatie\Permission\Models\Role::whereIn('id', $request->role_id)->pluck('id')->toArray();
            $user->syncRoles($validRoleIds); 
        } else {
             $user->syncRoles([]); 
        }
        
        // Load relasi agar data yang dikembalikan ke frontend lengkap
        $updatedUser = $user->load(['roles', 'jabatan']); 
        
        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data' => $updatedUser,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui user: ' . $e->getMessage(),
        ], 500);
    }
}

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'foreign key constraint')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghapus user: User ini memiliki data terkait (seperti tugas audit, kka, dll.) dan tidak bisa dihapus.',
                ], 400);
            }
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getUsersForDropdown() {
        // Ambil id, name, dan role
        $users = User::select('id', 'name', 'roles')->get();
        return response()->json($users);
    }
}