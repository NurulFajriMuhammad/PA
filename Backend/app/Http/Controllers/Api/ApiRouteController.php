<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiRoute;
use Illuminate\Http\Request;

class ApiRouteController extends Controller
{

    public function index()
    {
        try {
            $routes = ApiRoute::all();
            return response()->json(['data' => $routes]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'method' => 'required|in:GET,POST,PUT,DELETE,PATCH',
            'path' => 'required|unique:api_routes,path',
            'controller' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $route = ApiRoute::create($validated);
        return response()->json(['data' => $route], 201);
    }

    public function show(ApiRoute $apiRoute)
    {
        return response()->json(['data' => $apiRoute]);
    }

    public function update(Request $request, ApiRoute $apiRoute)
    {
        $validated = $request->validate([
            'method' => 'required|in:GET,POST,PUT,DELETE,PATCH',
            'path' => 'required|unique:api_routes,path,' . $apiRoute->id,
            'controller' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $apiRoute->update($validated);
        return response()->json(['data' => $apiRoute]);
    }

    public function destroy(ApiRoute $apiRoute)
    {
        $apiRoute->delete();
        return response()->json(['message' => 'Route deleted']);
    }
}