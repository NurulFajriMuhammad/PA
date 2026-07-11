import { createPortal } from 'react-dom';

const PrintPerencanaan = ({ assurance, kka, docs }) => {
  if (!assurance) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPeriod = (start, end) => {
    if (!start || !end) return "-";
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) return "-";
    return `${sDate.getDate()} ${sDate.toLocaleString('id-ID', {month:'short'})} - ${eDate.getDate()} ${eDate.toLocaleString('id-ID', {month:'short'})}`;
  };

  const totalAnggaran = kka.reduce((acc, item) => acc + Number(item.anggaran || 0), 0);

  const printContent = (
    <div className="hidden print:block bg-white text-black font-sans w-full print-only">
      
      {/* HEADER KOP SURAT */}
      <div className="flex justify-between items-center border-b-4 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">
            Internal Audit — Perencanaan
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-1 uppercase tracking-wider">
            Dokumen Kertas Kerja Audit (IIA Std. 2240)
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-500">Dicetak pada:</p>
          <p className="text-sm font-bold text-slate-800">{formatTanggal(new Date())}</p>
        </div>
      </div>

      {/* INFORMASI REGISTRASI AUDIT */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
          I. Identitas Penugasan Audit
        </h2>
        <div className="text-sm space-y-2">
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Nama Kegiatan</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">{assurance.nama_kegiatan}</div>
          </div>
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Surat Tugas</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">{assurance.surat_tugas?.nomor_surat || "-"}</div>
          </div>
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Objek Pemeriksaan</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">{assurance.objek_pemeriksaan || "-"}</div>
          </div>
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Periode Audit</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">{formatTanggal(assurance.periode_awal)} s/d {formatTanggal(assurance.periode_akhir)}</div>
          </div>
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Ketua Tim</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">{assurance.ketua_tim?.name || "-"}</div>
          </div>
          <div className="flex break-inside-avoid">
            <div className="font-bold w-1/3">Sasaran & Tujuan</div>
            <div className="px-2">:</div>
            <div className="font-medium flex-1">
              <div><strong>Sasaran:</strong> {assurance.sasaran || "-"}</div>
              <div className="mt-1"><strong>Tujuan:</strong> {assurance.tujuan || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KERTAS KERJA AUDIT (KKA) */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
          II. Daftar Kertas Kerja Audit (KKA)
        </h2>
        <table className="w-full text-xs border border-slate-400">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-400 p-2 w-8 text-center">No</th>
              <th className="border border-slate-400 p-2 text-left">Uraian Tugas / Prosedur</th>
              <th className="border border-slate-400 p-2 text-center w-24">Template</th>
              <th className="border border-slate-400 p-2 text-center w-32">Auditor</th>
              <th className="border border-slate-400 p-2 text-center w-24">Periode</th>
              <th className="border border-slate-400 p-2 text-right w-28">Anggaran</th>
            </tr>
          </thead>
          <tbody>
            {kka.length > 0 ? (
              kka.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border border-slate-400 p-2 text-center align-top">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 align-top">
                    <div className="font-bold">{item.uraian}</div>
                    {item.prosedur_audit && <div className="text-slate-600 mt-1">Prosedur: {item.prosedur_audit}</div>}
                  </td>
                  <td className="border border-slate-400 p-2 text-center font-bold align-top">{item.no_kka}</td>
                  <td className="border border-slate-400 p-2 text-center align-top">{item.auditor?.name || "-"}</td>
                  <td className="border border-slate-400 p-2 text-center align-top">{formatPeriod(item.tgl_mulai, item.tgl_selesai)}</td>
                  <td className="border border-slate-400 p-2 text-right font-bold align-top">{formatCurrency(item.anggaran)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border border-slate-400 p-4 text-center italic text-slate-500">
                  Belum ada daftar KKA perencanaan.
                </td>
              </tr>
            )}
            {kka.length > 0 && (
              <tr className="bg-slate-50">
                <td colSpan="5" className="border border-slate-400 p-2 text-right font-black uppercase">Total Anggaran</td>
                <td className="border border-slate-400 p-2 text-right font-black">{formatCurrency(totalAnggaran)}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="table-footer-group">
            <tr>
              <td colSpan="6" style={{ padding: 0, margin: 0, height: 0, border: 'none', borderTop: '1px solid black' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* DOKUMEN AUDITEE */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
          III. Daftar Dokumen Referensi Auditee
        </h2>
        <table className="w-full text-xs border border-slate-400">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-400 p-2 w-8 text-center">No</th>
              <th className="border border-slate-400 p-2 text-left">Judul Dokumen</th>
              <th className="border border-slate-400 p-2 text-center w-32">Tipe Dokumen</th>
              <th className="border border-slate-400 p-2 text-center w-32">Terkait KKA</th>
            </tr>
          </thead>
          <tbody>
            {docs.length > 0 ? (
              docs.map((doc, idx) => (
                <tr key={doc.id}>
                  <td className="border border-slate-400 p-2 text-center align-top">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 align-top font-bold">{doc.judul_dokumen}</td>
                  <td className="border border-slate-400 p-2 text-center align-top">{doc.tipe_dokumen || "-"}</td>
                  <td className="border border-slate-400 p-2 text-center align-top">{doc.terkait_kka || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-slate-400 p-4 text-center italic text-slate-500">
                  Belum ada dokumen yang diunggah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER PENGESAHAN */}
      <div className="mt-16 pt-8 grid grid-cols-2 text-center text-sm">
        <div>
          <p className="mb-16 font-semibold">Koordinator Audit</p>
          <p className="font-bold underline uppercase">{assurance.koordinator?.name || "(.............................)"}</p>
        </div>
        <div>
          <p className="mb-16 font-semibold">Ketua Tim</p>
          <p className="font-bold underline uppercase">{assurance.ketua_tim?.name || "(.............................)"}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          #root { display: none !important; }
          .print-only { 
            display: block !important; 
          }
          .print-only, .print-only * {
            visibility: visible !important; 
          }
          .print-only {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }
          th, td {
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
          }
          @page { margin: 2cm !important; size: A4 portrait; }
        }
      `}} />
    </div>
  );

  return createPortal(printContent, document.body);
};

export default PrintPerencanaan;
