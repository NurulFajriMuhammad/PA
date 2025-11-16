<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        try {
            $roles = Role::with('permissions')->get();
            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|unique:roles,name',
                'permission_ids' => 'array|nullable',
            ]);

            $role = Role::create(['name' => $validated['name']]);
            
            if (!empty($validated['permission_ids'])) {
                $role->syncPermissions($validated['permission_ids']);
            }

            $role->load('permissions');

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|unique:roles,name,' . $role->id,
                'permission_ids' => 'array|nullable',
            ]);

            $role->update(['name' => $validated['name']]);
            
            if (!empty($validated['permission_ids'])) {
                $role->syncPermissions($validated['permission_ids']);
            }

            $role->load('permissions');

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Role $role)
    {
        try {
            $role->delete();
            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}