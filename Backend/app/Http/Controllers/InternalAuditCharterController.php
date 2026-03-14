<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InternalAuditCharter; // Penting: Hubungkan ke Model
use Illuminate\Support\Facades\Storage;

class InternalAuditCharterController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf|max:5120', // Max 5MB
            'organization_name' => 'required|string'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // Simpan file ke storage/app/public/charters
            $path = $file->store('charters', 'public');

            $charter = InternalAuditCharter::create([
                'organization_name' => $request->organization_name,
                'file_name' => $file->getClientOriginalName(),
                'stored_name' => basename($path),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'version' => 1, 
                'issued_date' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Upload berhasil', 
                'data' => $charter
            ], 201);
        }

        return response()->json(['message' => 'File tidak ditemukan'], 400);
    }

        public function getLatest()
    {
        // Mengambil satu dokumen terakhir berdasarkan tanggal upload
        $latest = InternalAuditCharter::orderBy('created_at', 'desc')->first();
        if (!$latest) {
            return response()->json(['message' => 'Belum ada dokumen'], 404);
        }

        return response()->json($latest);
    }

        public function download($filename)
    {
        $path = storage_path('app/public/charters/' . $filename);

        if (!file_exists($path)) {
            return response()->json([
                'message' => 'File tidak ditemukan'
            ], 404);
        }

        return response()->download($path);
    }
}