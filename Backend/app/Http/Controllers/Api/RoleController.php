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

            // $role = Role::create(['name' => $validated['name']]);
            $role = Role::create([
    'name' => $validated['name'],
    'guard_name' => 'web'
]);
            
            if (!empty($validated['permission_ids'])) {
                // Filter out invalid permission IDs
                $validPermissionIds = \Spatie\Permission\Models\Permission::whereIn('id', $validated['permission_ids'])->pluck('id')->toArray();
                $role->syncPermissions($validPermissionIds);
            } else {
                $role->syncPermissions([]);
            }

            $role->load('permissions');

            broadcast(new \App\Events\EntityUpdated('roles', 'created', [
                'id' => $role->id
            ]))->toOthers();

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

            // update nama jika berubah
            $role->name = $validated['name'];
            $role->save();

            // sinkronkan permission (array bisa kosong/null)
            if (!empty($validated['permission_ids'])) {
                $validPermissionIds = \Spatie\Permission\Models\Permission::whereIn('id', $validated['permission_ids'])->pluck('id')->toArray();
                $role->syncPermissions($validPermissionIds);
            } else {
                $role->syncPermissions([]);
            }

            $role->load('permissions');

            broadcast(new \App\Events\EntityUpdated('roles', 'updated', [
                'id' => $role->id
            ]))->toOthers();

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
            $roleId = $role->id;
            $role->delete();

            broadcast(new \App\Events\EntityUpdated('roles', 'deleted', [
                'id' => $roleId
            ]))->toOthers();

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