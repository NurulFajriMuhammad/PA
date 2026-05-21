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
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240',
            'tipe_dokumen' => 'nullable|string',
            'terkait_kka' => 'nullable|string',
            'keterangan' => 'nullable|string'
        ]);

        $path = $request->file('file')->store('auditee_documents', 'public');

        $doc = AuditeeDocument::create([
            'assurance_id' => $assuranceId,
            'judul_dokumen' => $request->judul,
            'tipe_dokumen' => $request->tipe_dokumen,
            'terkait_kka' => $request->terkait_kka,
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientOriginalExtension(),
            'keterangan' => $request->keterangan
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
            'keterangan' => 'nullable|string',
            'prosedur_audit' => 'nullable|string',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date'
        ]);

        $data = PerencanaanKka::create([
            'assurance_id' => $assuranceId,
            'uraian' => $request->uraian,
            'user_id' => $request->user_id,
            'no_kka' => $request->no_kka,
            'anggaran' => $request->anggaran,
            'keterangan' => $request->keterangan,
            'prosedur_audit' => $request->prosedur_audit,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai
        ]);

        return response()->json([
            'message' => 'KKA berhasil ditambahkan',
            'data' => $data
        ]);
    }

    public function destroyKka($id)
    {
        $kka = PerencanaanKka::findOrFail($id);
        $kka->delete();
        return response()->json([
            'message' => 'KKA berhasil dihapus'
        ]);
    }

    public function destroyDoc($id)
    {
        $doc = AuditeeDocument::findOrFail($id);
        // Optionally delete the physical file too
        if ($doc->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($doc->file_path);
        }
        $doc->delete();
        return response()->json([
            'message' => 'Dokumen berhasil dihapus'
        ]);
    }
}