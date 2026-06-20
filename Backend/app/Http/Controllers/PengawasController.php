<?php

namespace App\Http\Controllers;

use App\Models\PengawasSpi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PengawasController extends Controller
{
    /**
     * Mengambil semua data pengawas
     */
    public function index()
    {
        try {
            $data = PengawasSpi::orderBy('id', 'asc')->get();
            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data'], 500);
        }
    }

    /**
     * Menyimpan data pengawas baru dengan Upload Foto
     */
public function store(Request $request)
{
    // validate incoming data; any failure will result in a 422 with an "errors" payload
    $request->validate([
        'name'      => 'required|string|max:255',
        'role'      => 'required|string|max:100',
        'email'     => 'nullable|email',
        'specialty' => 'nullable|string',
        'education' => 'nullable|string',
        'bio'       => 'nullable|string',
        // note: Laravel provides a dedicated "image" rule which also checks mime types
        // default limit is 2048 kilobytes (2 MB); increase here if you need to accept larger files
        'image'     => 'nullable|image|max:20480',
        // frontend sends `certs` as a JSON‑encoded string; we accept it but don't treat it
        'certs'     => 'nullable|string'
    ], [
        'image.max'   => 'Ukuran file tidak boleh lebih dari 20MB.',
        'image.image' => 'Yang diunggah harus berupa gambar (jpg, png, dll).'  
    ]);

    try {

        $data = [
            'nama' => $request->name,
            'jabatan' => $request->role,
            'keahlian' => $request->specialty,
            'pendidikan' => $request->education,
            'email' => $request->email,
            'bio' => $request->bio,
            'created_by' => auth()->id()
        ];

        if ($request->hasFile('image')) {

            $file = $request->file('image');

            $path = $file->store('pengawas', 'public');
            $data['foto_url'] = $path;
        }

        if ($request->has('certs')) {

            $certs = json_decode($request->certs, true);

            $data['sertifikasi'] = implode(',', $certs);
        }

        $pengawas = PengawasSpi::create($data);

        $addedByUser = auth()->user() ? auth()->user()->name : 'Unknown';

        return response()->json([
            'success'=>true,
            'data'=>$pengawas,
            'added_by_user'=>$addedByUser
        ],201);

    } catch (\Exception $e) {

        Log::error($e->getMessage());

        return response()->json([
            'message'=>$e->getMessage()
        ],500);
    }
}

    /**
     * Menghapus data pengawas dan fotonya
     */
    public function destroy($id)
    {
        try {
            $pengawas = PengawasSpi::findOrFail($id);

            // Hapus foto dari storage jika ada
            if ($pengawas->image) {
                $filename = basename($pengawas->image);
                Storage::delete('public/pengawas/' . $filename);
            }

            $pengawas->delete();

            return response()->json([
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }
    }
}