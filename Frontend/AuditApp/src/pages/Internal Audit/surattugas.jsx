import React, { useState, useEffect } from 'react';
import { 
  BsPlusLg, BsSearch, BsFileEarmarkPdf, 
  BsPencilSquare, BsTrash, BsX, BsPrinter 
} from 'react-icons/bs';
import { 
  Hash, Calendar, Briefcase, FileText, 
  UserCheck, UserCircle, Users 
} from 'lucide-react';
import apiClient from "../../../../Shared/api/axios";

const SuratTugas = () => {
  const [users, setUsers] = useState([]);
  const [dataSurat, setDataSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  const [formData, setFormData] = useState({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split('T')[0],
    tgl_mulai: "", 
    tgl_selesai: "",
    deskripsi: "",
    koordinator: "",
    pengendali_teknis: "",
    ketua: "",
    auditor: [] 
  });

  const handleSelectAuditor = (name) => {
    if (!formData.auditor.includes(name)) {
      setFormData({
        ...formData,
        auditor: [...formData.auditor, name]
      });
    }
  };

  const removeAuditor = (name) => {
    setFormData({
      ...formData,
      auditor: formData.auditor.filter(a => a !== name)
    });
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Gagal ambil users:", err);
    }
  };
  const renderUserOptions = () => {
    return users.map(user => (
      <option key={user.id} value={user.name}>
        {user.name} ({user.roles?.[0]?.name})
      </option>
    ));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/surat-tugas");
      setDataSurat(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => { fetchData(); }, []);
  useEffect(() => { 
    fetchData(); 
    fetchUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      auditor: formData.auditor.join(", "),
      periode_pemeriksaan: `${formData.tgl_mulai} s/d ${formData.tgl_selesai}`
    };

    try {
      if (editId) {
        await apiClient.put(`/api/surat-tugas/${editId}`, payload);
      } else {
        await apiClient.post("/api/surat-tugas", payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

const resetForm = () => {
  setFormData({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split('T')[0],
    tgl_mulai: "",
    tgl_selesai: "",
    deskripsi: "",
    koordinator: "",
    pengendali_teknis: "",
    ketua: "",
    auditor: []   // HARUS ARRAY
  });
  setEditId(null);
};

const hitungHariKerja = (range) => {
  if (!range) return 0;

  const [start, end] = range.split(" s/d ");

  const startDate = new Date(start);
  const endDate = new Date(end);

  let count = 0;

  const current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();

    if (day !== 0 && day !== 6) { // tidak termasuk sabtu minggu
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
};

const handleEdit = (item) => {
  const tgl = item.periode_pemeriksaan?.split(" s/d ") || ["", ""];

  setEditId(item.id);

  setFormData({
    ...item,
    tgl_mulai: tgl[0],
    tgl_selesai: tgl[1],
    auditor: item.auditor ? item.auditor.split(", ") : []
  });

  setShowModal(true);
};

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await apiClient.delete(`/api/surat-tugas/${id}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus");
      }
    }
  };

const handlePrint = (item) => {
  setSelectedSurat(item);
  setShowPrintModal(true);
};
const getUserRole = (name) => {
  const user = users.find(u => u.name === name);
  return user?.roles?.[0]?.name || "-";
};

const handlePrintDocument = () => {
  const printContent = document.getElementById("print-area").innerHTML;

  const newWindow = window.open("", "", "width=900,height=1000");

  newWindow.document.write(`
    <html>
      <head>
        <title>Surat Tugas</title>
        <style>
          body{
            font-family: "Times New Roman";
            padding:50px;
            line-height:1.6;
          }

          table{
            font-size:16px;
          }

          h2{
            text-align:center;
            margin-bottom:30px;
          }

          p{
            font-size:16px;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.print();
};

  const filteredData = dataSurat.filter(item => 
    item.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatAuditors = () => {
  if (!selectedSurat?.auditor) return [];

  return selectedSurat.auditor.split(", ");
};

  return (
    <div style={{ padding: '25px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '1.8rem' }}>Data Surat Tugas</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Daftar penugasan audit internal.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={btnPrimaryStyle}>
          <BsPlusLg /> Tambah Surat Tugas
        </button>
      </div>

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <div style={{ position: 'relative', flex: 1 }}>
          <BsSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari nomor atau deskripsi..." 
            style={inputSearchStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Ringkas */}
      <div style={tableContainerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={theadStyle}>
            <tr>
              <th style={{...thStyle, width: '50px'}}>No</th>
              <th style={thStyle}>Nomor Surat</th>
              <th style={thStyle}>Tanggal</th>
              <th style={thStyle}>Deskripsi</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.9rem' }}>
            {filteredData.map((item, index) => (
              <tr key={index} style={trStyle}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}><b>{item.nomor_surat}</b></td>
                <td style={tdStyle}>{item.tanggal_surat}</td>
                <td style={tdStyle}>{item.deskripsi}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button onClick={() => handlePrint(item)} title="Print" style={{...actionBtnStyle, color:'#3b82f6'}}><BsPrinter /></button>
                    <button onClick={() => handleEdit(item)} title="Edit" style={{...actionBtnStyle, color:'#f59e0b'}}><BsPencilSquare /></button>
                    <button onClick={() => handleDelete(item.id)} title="Hapus" style={{...actionBtnStyle, color:'#ef4444'}}><BsTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showPrintModal && selectedSurat && (
  <div style={modalOverlayStyle}>
    <div style={backdropStyle} onClick={()=>setShowPrintModal(false)}></div>

<div style={printContainerStyle}>

      {/* AREA PRINT */}
<div id="print-area" style={{fontFamily:'Times New Roman', lineHeight:'1.7'}}>

  <div style={{textAlign:'center'}}>
    <h2 style={{marginBottom:'0'}}>SURAT TUGAS</h2>
    <p style={{marginTop:'5px'}}>
      <b>Nomor : {selectedSurat.nomor_surat}</b>
    </p>
  </div>

  <p style={{marginTop:'20px'}}>
    Manajer Senior Satuan Pengawasan Intern dengan ini:
  </p>

  <p style={{
    textAlign:'center',
    fontWeight:'bold',
    marginTop:'10px'
  }}>
    MENUGASKAN
  </p>

  <table style={{
    width:'100%',
    borderCollapse:'collapse',
    marginTop:'15px',
    border:'1px solid black'
  }}>
    <thead>
      <tr>
        <th style={tableHeader}>No</th>
        <th style={tableHeader}>Nama</th>
        <th style={tableHeader}>Jabatan / Peran</th>
      </tr>
    </thead>

    <tbody>

      <tr>
        <td style={tableCell}>1</td>
        <td style={tableCell}>{selectedSurat.koordinator}</td>
        <td style={tableCell}>
          {getUserRole(selectedSurat.koordinator)} / Koordinator
        </td>
      </tr>

      <tr>
        <td style={tableCell}>2</td>
        <td style={tableCell}>{selectedSurat.pengendali_teknis}</td>
        <td style={tableCell}>
          {getUserRole(selectedSurat.pengendali_teknis)} / Pengendali Teknis
        </td>
      </tr>

      <tr>
        <td style={tableCell}>3</td>
        <td style={tableCell}>{selectedSurat.ketua}</td>
        <td style={tableCell}>
          {getUserRole(selectedSurat.ketua)} / Ketua Tim
        </td>
      </tr>

      {formatAuditors().map((auditor, index) => (
        <tr key={index}>
          <td style={tableCell}>{index + 4}</td>
          <td style={tableCell}>{auditor}</td>
          <td style={tableCell}>
            {getUserRole(auditor)} / Auditor
          </td>
        </tr>
      ))}

    </tbody>
  </table>

<p style={{marginTop:'15px', textAlign:'justify'}}>
  Untuk melaksanakan pemeriksaan <b>{selectedSurat.deskripsi}.</b> Penugasan ini dilaksanakan selama <b>{hitungHariKerja(selectedSurat.periode_pemeriksaan)}</b> hari kerja 
  terhitung mulai tanggal <b>{selectedSurat.periode_pemeriksaan.split(" s/d ")[0]}</b>.
</p>
  <p style={{marginTop:'5px'}}>
    Segala pengeluaran akibat dikeluarkannya Surat Tugas ini
    dibebankan kepada anggaran operasional.
  </p>

  <div style={{
    marginTop:'50px',
    textAlign:'right'
  }}>
    <p>Lamongan, {selectedSurat.tanggal_surat}</p>
    <p><b>KEPALA SPI</b></p>

    <br/><br/>

    (........................................)
  </div>

  <div style={{marginTop:'30px', fontSize:'15px', lineHeight:'1.6'}}>

<p><b>Tembusan disampaikan kepada Yth:</b></p>
<p>Direktur Utama PT Dua Putra Utama Makmur Tbk.</p>
<br/>
<p><b>Layanan Pengaduan / Hotline:</b></p>
<p>
Apabila Pengawas Unit Kerja SPI menerima atau meminta gratifikasi / suap,
dapat dilaporkan melalui mekanisme penyampaian pengaduan.
</p>

</div>

</div>

      {/* BUTTON */}
      <div style={{
        marginTop:'30px',
        display:'flex',
        gap:'10px'
      }}>

        <button
          onClick={handlePrintDocument}
          style={btnSubmitStyle}
        >
          Print
        </button>

        <button
          onClick={()=>window.open(`/api/surat-tugas/word/${selectedSurat.id}`)}
          style={btnPrimaryStyle}
        >
          Download Word
        </button>

        <button
          onClick={()=>setShowPrintModal(false)}
          style={btnCancelStyle}
        >
          Tutup
        </button>

      </div>

    </div>
  </div>
)}



      {/* Modal Pop-up (Tetap Lengkap) */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={backdropStyle} onClick={() => setShowModal(false)}></div>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editId ? 'Edit' : 'Tambah'} Surat Tugas</h3>
              <button onClick={() => setShowModal(false)} style={closeBtnStyle}><BsX size={24}/></button>
            </div>

            <form onSubmit={handleSave}>
              <div style={modalBodyStyle}>
                <div style={grid2Style}>
                  <div>
                    <label style={labelStyle}><Hash size={12}/> No. Surat</label>
                    <input required style={inputStyle} value={formData.nomor_surat} onChange={e => setFormData({...formData, nomor_surat: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}><Calendar size={12}/> Tanggal Surat</label>
                    <input type="date" required style={inputStyle} value={formData.tanggal_surat} onChange={e => setFormData({...formData, tanggal_surat: e.target.value})} />
                  </div>
                </div>

                <div style={periodeBoxStyle}>
                  <div style={{fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', marginBottom: '10px'}}>PERIODE PEMERIKSAAN</div>
                  <div style={grid2Style}>
                    <input type="date" required style={inputStyle} value={formData.tgl_mulai} onChange={e => setFormData({...formData, tgl_mulai: e.target.value})} />
                    <input type="date" required style={inputStyle} value={formData.tgl_selesai} onChange={e => setFormData({...formData, tgl_selesai: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}><FileText size={12}/> Deskripsi</label>
                  <textarea required style={{...inputStyle, height:'60px'}} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
                </div>
                
<div style={dividerStyle}>PERSONIL TIM</div>
                
                <div style={grid2Style}>
                  <div>
                    <label style={labelStyle}><UserCheck size={12}/> Koordinator</label>
<select
  required
  style={inputStyle}
  value={formData.koordinator}
  onChange={e => setFormData({...formData, koordinator: e.target.value})}
>
  <option value="">Pilih Koordinator</option>
  {renderUserOptions()}
</select>                  </div>
                  <div>
                    <label style={labelStyle}><UserCircle size={12}/> Pengendali Teknis</label>
<select
  required
  style={inputStyle}
  value={formData.pengendali_teknis}
  onChange={e => setFormData({...formData, pengendali_teknis: e.target.value})}
>
  <option value="">Pilih Pengendali Teknis</option>
  {renderUserOptions()}
</select>                  </div>
                </div>

                <div style={grid2Style}>
                  <div>
                    <label style={labelStyle}><Users size={12}/> Ketua Tim</label>
<select
  required
  style={inputStyle}
  value={formData.ketua}
  onChange={e => setFormData({...formData, ketua: e.target.value})}
>
  <option value="">Pilih Ketua Tim</option>
  {renderUserOptions()}
</select>                  </div>
                  {/* <div>
                    <label style={labelStyle}><Users size={12}/> Auditor</label>
                  </div> */}
                  <div>
<label style={labelStyle}>Auditor</label>

{/* TAG AUDITOR TERPILIH */}
<div style={{
  display:'flex',
  flexWrap:'wrap',
  gap:'6px',
  marginBottom:'6px'
}}>
  {formData.auditor.map((a, i) => (
    <div key={i} style={{
      background:'#e0f2fe',
      padding:'4px 8px',
      borderRadius:'6px',
      display:'flex',
      alignItems:'center',
      gap:'5px',
      fontSize:'12px'
    }}>
      {a}
      <span
        style={{cursor:'pointer', fontWeight:'bold'}}
        onClick={() => removeAuditor(a)}
      >
        ✕
      </span>
    </div>
  ))}
</div>

{/* DROPDOWN */}
<select
  style={inputStyle}
  onChange={(e) => handleSelectAuditor(e.target.value)}
>
  <option value="">Pilih Auditor</option>

  {users.map(user => (
    <option key={user.id} value={user.name}>
      {user.name} ({user.roles?.[0]?.name})
    </option>
  ))}

</select>
</div>
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setShowModal(false)} style={btnCancelStyle}>Batal</button>
                <button type="submit" style={btnSubmitStyle}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const tableHeader = {
  border:'1px solid black',
  padding:'8px',
  textAlign:'center',
  fontWeight:'bold'
}

const tableCell = {
  border:'1px solid black',
  padding:'8px'
}
const btnPrimaryStyle = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' };
const filterBarStyle = { backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const inputSearchStyle = { width: '100%', padding: '12px 12px 12px 45px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' };
const tableContainerStyle = { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const theadStyle = { backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' };
const thStyle = { padding: '15px', fontWeight: 700, color: '#64748b', fontSize: '0.8rem' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f1f5f9' };
const trStyle = { transition: '0.2s' };

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflowY: 'auto',
  padding:'30px'
};
const printContainerStyle = {
  position:'relative',
  width:'850px',
  maxHeight:'90vh',
  overflowY:'auto',
  background:'white',
  borderRadius:'12px',
  padding:'40px',
  fontFamily:'Times New Roman',
  boxShadow:'0 10px 40px rgba(0,0,0,0.2)',
  scrollbarWidth:'thin'
};
const backdropStyle = { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' };
const modalContentStyle = { position: 'relative', width: '90%', maxWidth: '550px', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden' };
const modalHeaderStyle = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' };
const modalBodyStyle = { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' };
const modalFooterStyle = { padding: '15px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' };

const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const labelStyle = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' };
const periodeBoxStyle = { backgroundColor: '#f0f7ff', padding: '12px', borderRadius: '10px', border: '1px solid #dbeafe' };
const dividerStyle = { fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', borderBottom: '1px solid #eff6ff', paddingBottom: '3px' };

const btnSubmitStyle = { flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };
const btnCancelStyle = { flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' };
const closeBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' };

export default SuratTugas;