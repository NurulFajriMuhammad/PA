<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PerencanaanKka;
use App\Models\LheFile;
use App\Models\PemeriksaanTemuan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class KkaPelaksanaanController extends Controller
{
    public function index($assuranceId)
    {
        $data = PerencanaanKka::with([
            'auditor:id,name',
            'lheFile',
            'temuan.analisis'
        ])
        ->withCount('temuan')
        ->where('assurance_id',$assuranceId)
        ->get();

        return response()->json([
            'data'=>$data
        ]);
    }

    public function uploadLhe(Request $request,$kkaId)
    {
        $request->validate([
            'file'=>'required|file|max:5120'
        ]);

        $file = $request->file('file');

        $path = $file->store('lhe_files','public');

        LheFile::updateOrCreate(

            ['kka_id'=>$kkaId],

            [
                'file_name'=>$file->getClientOriginalName(),
                'file_path'=>$path,
                'file_type'=>$file->getClientOriginalExtension(),
                'file_size'=>$file->getSize(),
                // 'uploaded_by'=>auth()->id()
                'uploaded_by' => Auth::id()
            ]
        );

        return response()->json([
            'message'=>'File berhasil diupload'
        ]);
    }

    public function getTemuan($kkaId)
    {
        $data = PemeriksaanTemuan::where('kka_id',$kkaId)
            // ->orderBy('id', 'desc')
            ->orderBy('id', 'asc')
            // ->latest()
            ->get();

        return response()->json([
            'data'=>$data
        ]);
    }

    public function storeTemuan(Request $request,$kkaId)
    {

        $data = $request->all();

        if($request->hasFile('lampiran')){

            $file = $request->file('lampiran');

            $path = $request->file('lampiran')
                ->store('temuan_lampiran','public');

            $data['lampiran'] = $path;
            $data['lampiran_name'] = $file->getClientOriginalName();
        }

        $data['kka_id'] = $kkaId;

        PemeriksaanTemuan::create($data);

        return response()->json([
            'message'=>'Temuan berhasil disimpan'
        ]);
    }

    public function destroyTemuan($id)
    {
        PemeriksaanTemuan::findOrFail($id)->delete();

        return response()->json([
            'message'=>'Temuan dihapus'
        ]);
    }

    public function getLhe($kkaId)
    {
        $file = LheFile::where('kka_id',$kkaId)->first();

        return response()->json([
            'data'=>$file
        ]);
    }

    public function deleteLhe($kkaId)
    {
        $file = LheFile::where('kka_id',$kkaId)->first();

        if($file){
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        return response()->json([
            'message'=>'File dihapus'
        ]);
    }
    
    public function updateTemuan(Request $request, $id)
    {
        $data = PemeriksaanTemuan::findOrFail($id);

        $payload = $request->all();

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $path = $request->file('lampiran')
                ->store('temuan_lampiran','public');

            $payload['lampiran'] = $path;
            $payload['lampiran_name'] = $file->getClientOriginalName();
        }

        $data->update($payload);

        return response()->json([
            'message' => 'Temuan berhasil diupdate'
        ]);
    }

    public function getTemuanById($id)
    {
        $data = PemeriksaanTemuan::findOrFail($id);

        return response()->json([
            'data' => $data
        ]);
    }
}
