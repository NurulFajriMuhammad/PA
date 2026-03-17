<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PerencanaanKka;
use App\Models\AuditeeDocument;
use Illuminate\Http\Request;

class perencanaancontroller extends Controller {
    
    // Get Data KKA Perencanaan
    public function getKka($assuranceId) {
        $data = PerencanaanKka::with('auditor:id,name')
                ->where('assurance_id', $assuranceId)
                ->get();
        return response()->json(['data' => $data]);
    }

    // Get Data Dokumen
    public function getDocs($assuranceId) {
        $data = AuditeeDocument::where('assurance_id', $assuranceId)->get();
        return response()->json(['data' => $data]);
    }

    // Store Dokumen (Validasi Non-Media)
    public function storeDoc(Request $request, $assuranceId) {
        $request->validate([
            'judul' => 'required|string',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:5120',
        ]);

        $path = $request->file('file')->store('auditee_documents', 'public');

        $doc = AuditeeDocument::create([
            'assurance_id' => $assuranceId,
            'judul_dokumen' => $request->judul,
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientOriginalExtension()
        ]);

        return response()->json(['message' => 'Upload berhasil', 'data' => $doc]);
    }

    public function storeKka(Request $request, $assuranceId)
    {
        $request->validate([
            'uraian' => 'required|string',
            'user_id' => 'required|integer',
            'no_kka' => 'required|string',
            'anggaran' => 'nullable|numeric',
            'keterangan' => 'nullable|string'
        ]);

        $data = PerencanaanKka::create([
            'assurance_id' => $assuranceId,
            'uraian' => $request->uraian,
            'user_id' => $request->user_id,
            'no_kka' => $request->no_kka,
            'anggaran' => $request->anggaran,
            'keterangan' => $request->keterangan
        ]);

        return response()->json([
            'message' => 'KKA berhasil ditambahkan',
            'data' => $data
        ]);
    }
}