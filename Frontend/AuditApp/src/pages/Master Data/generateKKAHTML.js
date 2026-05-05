export const generateKKAHTML = (item) => {

  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const risikoClass = {
    Tinggi: "badge-tinggi",
    Sedang: "badge-sedang",
    Rendah: "badge-rendah"
  }[item.risiko] || "badge-sedang";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>KKA - ${item.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Source Serif 4','Times New Roman',serif; color: #1a1a18; line-height: 1.6; font-size: 12px; }
    .kop { display:flex; align-items:stretch; padding-bottom:14px; margin-bottom:18px; border-bottom:3px double #1a1a18; gap:20px; }
    .kop-logo { width:72px; height:72px; flex-shrink:0; border:1.5px solid #c0bbb2; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'DM Sans',sans-serif; font-size:9px; color:#999; text-align:center; background:#f8f6f2; }
    .kop-divider { width:1.5px; background:#d4d0c8; flex-shrink:0; }
    .kop-text { flex:1; display:flex; flex-direction:column; justify-content:center; }
    .kop-instansi { font-family:'DM Sans',sans-serif; font-size:9px; font-weight:600; color:#7a7870; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px; }
    .kop-nama { font-size:17px; font-weight:700; color:#1a1a18; margin-bottom:5px; }
    .kop-alamat { font-family:'DM Sans',sans-serif; font-size:10px; color:#7a7870; line-height:1.7; }
    .doc-title-block { text-align:center; margin:20px 0 18px; padding-bottom:16px; border-bottom:1px solid #d4d0c8; }
    .doc-badge { display:inline-block; font-family:'DM Sans',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#4a6741; background:#ebf3e8; border:1px solid #c4dbbf; padding:3px 14px; border-radius:100px; margin-bottom:10px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .doc-title-main { font-size:19px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; text-decoration:underline; text-underline-offset:5px; margin-bottom:4px; }
    .doc-subtitle { font-family:'DM Sans',sans-serif; font-size:11px; color:#7a7870; }
    .doc-ref { font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; color:#4a6741; margin-top:7px; }
    .info-table { width:100%; border-collapse:collapse; margin-bottom:22px; }
    .info-table th, .info-table td { border:1px solid #c0bbb2; padding:8px 12px; vertical-align:top; }
    .info-table th { background:#f4f1ec; width:28%; font-family:'DM Sans',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#5a5850; text-align:left; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .info-table .row-alt td { background:#f8f6f2; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .badge { display:inline-block; font-family:'DM Sans',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; padding:2px 9px; border-radius:4px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .badge-tinggi { background:#fbeaea; color:#8b2a2a; border:1px solid #e8b8b8; }
    .badge-sedang { background:#faeeda; color:#854f0b; border:1px solid #e8c87a; }
    .badge-rendah { background:#eaf3de; color:#3b6d11; border:1px solid #c4dbbf; }
    .section-label { font-family:'DM Sans',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#4a6741; margin:20px 0 8px; display:flex; align-items:center; gap:8px; }
    .section-label::after { content:''; flex:1; height:1px; background:#d4d0c8; }
    .content-area { border:1px dashed #c0bbb2; background:#faf8f4; padding:14px 18px; margin-bottom:20px; min-height:100px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .content-area-label { font-family:'DM Sans',sans-serif; font-size:10px; color:#aaa8a0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:7px; }
    .content-lines div { height:1px; background:#e8e4de; margin-bottom:20px; }
    .content-placeholder { font-style:italic; font-size:11.5px; color:#c8c4bc; }
    .temuan-table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:22px; }
    .temuan-table th { background:#f4f1ec; border:1px solid #c0bbb2; padding:6px 9px; font-family:'DM Sans',sans-serif; font-size:9px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#5a5850; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .temuan-table td { border:1px solid #c0bbb2; padding:7px 9px; vertical-align:top; }
    .temuan-table .row-alt td { background:#faf8f4; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .opini-box { border:1px solid #c0bbb2; background:#faf8f4; padding:12px 16px; margin-bottom:22px; line-height:1.75; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .signature-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; margin-top:28px; padding-top:22px; border-top:1px solid #d4d0c8; }
    .sig-box { text-align:center; }
    .sig-role { font-family:'DM Sans',sans-serif; font-size:10px; color:#7a7870; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:52px; }
    .sig-line { border-top:1px solid #1a1a18; margin:0 auto 6px; width:150px; }
    .sig-name { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500; }
    .sig-nip { font-family:'DM Sans',sans-serif; font-size:10px; color:#9a9890; margin-top:3px; }
    .auditee-box { border:1px solid #c0bbb2; background:#f8f6f2; padding:12px 16px; margin-top:18px; display:flex; justify-content:space-between; align-items:flex-end; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .auditee-label { font-family:'DM Sans',sans-serif; font-size:10px; color:#7a7870; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:7px; }
    .auditee-info { font-size:12px; color:#3a3830; line-height:1.8; }
    .auditee-line { width:140px; border-top:1px solid #6a6860; margin-bottom:4px; margin-left:auto; }
    .auditee-name-label { font-family:'DM Sans',sans-serif; font-size:10px; color:#9a9890; }
    .doc-footer { margin-top:28px; padding-top:10px; border-top:1px solid #e0dcd4; display:flex; justify-content:space-between; font-family:'DM Sans',sans-serif; font-size:9px; color:#b0aca4; }
    .footer-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:#4a6741; margin-right:5px; vertical-align:middle; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  </style>
</head>
<body>

  <div class="kop">
    <div class="kop-logo">Logo<br>Institusi</div>
    <div class="kop-divider"></div>
    <div class="kop-text">
      <div class="kop-instansi">Satuan Pengawasan Intern (SPI)</div>
      <div class="kop-nama">${item.institusi || 'Nama Institusi / Perusahaan'}</div>
      <div class="kop-alamat">
        ${item.alamat || 'Gedung Kantor Lt. 3, Jl. Raya No. 01 — Kota, Provinsi'}<br>
        ${item.telepon ? 'Telepon: ' + item.telepon : ''}
      </div>
    </div>
  </div>

  <div class="doc-title-block">
    <div class="doc-badge">Dokumen Audit Internal</div>
    <div class="doc-title-main">Kertas Kerja Audit (KKA)</div>
    <div class="doc-subtitle">Satuan Pengawasan Intern &mdash; Sistem Manajemen Audit Terintegrasi</div>
    <div class="doc-ref">Nomor Referensi: ${item.id}</div>
  </div>

  <table class="info-table">
    <tr><th>Nomor KKA</th><td><strong>${item.id}</strong></td></tr>
    <tr class="row-alt"><th>Program / Judul Audit</th><td>${item.nama}</td></tr>
    <tr><th>Unit yang Diaudit</th><td>${item.unit || '-'}</td></tr>
    <tr class="row-alt"><th>Periode Audit</th><td>${item.periode || '-'}</td></tr>
    <tr><th>Jenis Audit</th><td>${item.jenisAudit || 'Audit Operasional'}</td></tr>
    <tr class="row-alt"><th>Tingkat Risiko</th><td><span class="badge ${risikoClass}">${item.risiko || '-'}</span></td></tr>
    <tr><th>Tanggal Dibuat</th><td>${tanggal}</td></tr>
    <tr class="row-alt"><th>Ketua Tim Audit</th><td>${item.ketuaTim || '-'}</td></tr>
    <tr><th>Anggota Tim</th><td>${item.anggotaTim || '-'}</td></tr>
    <tr class="row-alt"><th>Supervisor / Kepala SPI</th><td>${item.supervisor || '-'}</td></tr>
  </table>

  <div class="section-label">Tujuan &amp; Ruang Lingkup Audit</div>
  <div class="content-area">
    <div class="content-area-label">Tujuan Audit:</div>
    <p style="font-size:12px;line-height:1.75;">${item.tujuan || '[ Tujuan audit diisi di sini ]'}</p>
    <div style="margin-top:12px;" class="content-area-label">Ruang Lingkup:</div>
    <p style="font-size:12px;line-height:1.75;">${item.lingkup || '[ Ruang lingkup audit diisi di sini ]'}</p>
  </div>

  <div class="section-label">Deskripsi &amp; Keterangan</div>
  <div class="content-area">
    <p style="font-size:12px;line-height:1.75;">${item.keterangan || '[ Keterangan tambahan diisi di sini ]'}</p>
  </div>

  <div class="section-label">Catatan Pengujian &amp; Analisis</div>
  <div class="content-area" style="min-height:110px;">
    <div class="content-area-label">Hasil pengujian dan bukti pendukung:</div>
    <div class="content-lines"><div></div><div></div><div></div><div></div><div></div></div>
    <div class="content-placeholder">[ Uraian pengujian, analisis data, dan referensi bukti dicatat di sini ]</div>
  </div>

  <div class="section-label">Kesimpulan &amp; Opini Auditor</div>
  <div class="opini-box">
    <strong>Opini: ${item.opini || '[ Diisi setelah pengujian selesai ]'}</strong><br><br>
    ${item.kesimpulan || '[ Narasi kesimpulan audit diisi di sini berdasarkan hasil pengujian yang telah dilakukan. ]'}
  </div>

  <div class="signature-grid">
    <div class="sig-box">
      <div class="sig-role">Disusun oleh (Auditor)</div>
      <div class="sig-line"></div>
      <div class="sig-name">( ............................................. )</div>
      <div class="sig-nip">NIP / ID: _____________________</div>
      <div class="sig-nip">Tanggal: ______________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">Direview oleh (Ketua Tim)</div>
      <div class="sig-line"></div>
      <div class="sig-name">( ............................................. )</div>
      <div class="sig-nip">NIP / ID: _____________________</div>
      <div class="sig-nip">Tanggal: ______________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">Disetujui (Kepala SPI)</div>
      <div class="sig-line"></div>
      <div class="sig-name">( ............................................. )</div>
      <div class="sig-nip">NIP / ID: _____________________</div>
      <div class="sig-nip">Tanggal: ______________________</div>
    </div>
  </div>

  <div class="auditee-box">
    <div>
      <div class="auditee-label">Respons &amp; Persetujuan Auditee</div>
      <div class="auditee-info">Nama &nbsp;&nbsp;&nbsp;: ________________________________________</div>
      <div class="auditee-info">Jabatan : ________________________________________</div>
      <div class="auditee-info" style="font-family:'DM Sans',sans-serif;font-size:11px;color:#8a8880;margin-top:4px;">Tanggal: _______________________________________</div>
    </div>
    <div>
      <div style="height:48px;"></div>
      <div class="auditee-line"></div>
      <div class="auditee-name-label">Tanda Tangan Auditee</div>
    </div>
  </div>

  <div class="doc-footer">
    <div><span class="footer-dot"></span>Satuan Pengawasan Intern &mdash; E-Audit System v2.0</div>
    <span>Dicetak: ${tanggal}</span>
    <span>ID: ${item.id} &nbsp;|&nbsp; Halaman 1 dari 1 &nbsp;|&nbsp; Dokumen Rahasia</span>
  </div>

</body>
</html>
`;
};
