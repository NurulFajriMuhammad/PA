import React, { useState, useEffect } from "react";
import {
  Building2,
  Wallet,
  Users,
  Monitor,
  ShieldAlert,
  Globe,
  Layers,
  Search,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Target,
} from "lucide-react";
import apiClient from "../../../../Shared/api/axios";

const AuditUniverseSPI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitQuery, setUnitQuery] = useState("");
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null); // State untuk Detail View
  const [filters, setFilters] = useState({
    sub_unit: "Semua Unit",
    assessment_type: "Semua Asesmen",
    risk_register: "Semua Register",
    corporate_risk_category: "Semua Dampak",
    risk: "Semua Risiko",
  });

  const [newEntry, setNewEntry] = useState({
    name: "",
    category: "",
    sub_unit: "",
    assessment_type: "",
    risk_register: "",
    corporate_risk_category: "",
    risk: "Medium",
    last_audit: new Date().getFullYear().toString(),
  });

  const unitToCategoryMap = {
    "Business Development": "Operasional & Produksi",
    "Customer Service": "Operasional & Produksi",
    "Kantor Pusat": "Operasional & Produksi",
    "Finance & Accounting": "Keuangan & Logistik",
    "Human Resources Development": "SDM & Hukum",
    "Legal": "SDM & Hukum",
    "APU-PPT": "SDM & Hukum",
    "Compliance & Internal Auditor": "SDM & Hukum",
    "Information Technology": "IT & Infrastruktur",
    "Data Analyst": "IT & Infrastruktur",
  };

  const filteredUnits = units
    .map((unit) => unit.nama)
    .filter((value, index, self) => self.indexOf(value) === index)
    .filter((unitName) =>
      unitName.toLowerCase().includes(unitQuery.toLowerCase())
    );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/audit-universe");
      setAuditData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data universe:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await apiClient.get("/api/units");
      const responseData = response.data?.data || response.data || [];
      setUnits(responseData);
    } catch (error) {
      console.error("Gagal mengambil daftar unit:", error);
      setUnits([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUnits();
  }, []);

  const categoriesConfig = [
    {
      title: "Operasional & Produksi",
      icon: <Building2 size={20} className="text-blue-600" />,
    },
    {
      title: "Keuangan & Logistik",
      icon: <Wallet size={20} className="text-emerald-600" />,
    },
    {
      title: "SDM & Hukum",
      icon: <Users size={20} className="text-purple-600" />,
    },
    {
      title: "IT & Infrastruktur",
      icon: <Monitor size={20} className="text-orange-600" />,
    },
  ];

  const getRiskStyle = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/audit-universe", newEntry);
      if (response.status === 201) {
        setShowModal(false);
        setNewEntry({
          name: "",
          category: "",
          sub_unit: "",
          assessment_type: "",
          risk_register: "",
          corporate_risk_category: "",
          risk: "Medium",
          last_audit: new Date().getFullYear().toString(),
        });
        fetchData();
      }
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="flex flex-col min-w-[160px]">
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer shadow-sm appearance-none hover:bg-slate-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          backgroundSize: "12px",
        }}
      >
        <option value={`Semua ${label}`}>{`Semua ${label}`}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const handleDelete = async (id) => {
    try {
      const response = await apiClient.delete(`/api/audit-universe/${id}`);
      if (response.status === 200) {
        setSelectedAudit(null); // Tutup modal detail
        fetchData(); // Refresh data di grid
      }
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6 relative font-sans">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <Globe size={12} /> Corporate Risk Map
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Audit <span className="text-indigo-600">Universe</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Pemetaan objek pengawasan internal perusahaan berbasis risiko.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? "text-indigo-600" : "text-slate-400"
                }`}
                size={16}
              />
              <input
                type="text"
                placeholder="Filter Unit, Nama, atau Asesmen..."
                className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Tombol Clear Filter: Muncul hanya jika ada teks */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={18} /> Tambah Unit
            </button>
          </div>
        </div>

        {/* --- STATS --- */}
        {/* --- BARIS FILTER DROPDOWN --- */}
        <div className="flex flex-wrap items-center gap-10 mb-4">
          <FilterDropdown
            label="Unit"
            value={filters.sub_unit}
            options={[...new Set(auditData.map((d) => d.sub_unit))]}
            onChange={(val) => setFilters({ ...filters, sub_unit: val })}
          />
          <FilterDropdown
            label="Asesmen"
            value={filters.assessment_type}
            options={[...new Set(auditData.map((d) => d.assessment_type))]}
            onChange={(val) => setFilters({ ...filters, assessment_type: val })}
          />
          <FilterDropdown
            label="Register"
            value={filters.risk_register}
            options={[...new Set(auditData.map((d) => d.risk_register))]}
            onChange={(val) => setFilters({ ...filters, risk_register: val })}
          />
          <FilterDropdown
            label="Dampak"
            value={filters.corporate_risk_category}
            options={[
              ...new Set(auditData.map((d) => d.corporate_risk_category)),
            ]}
            onChange={(val) =>
              setFilters({ ...filters, corporate_risk_category: val })
            }
          />
          <FilterDropdown
            label="Risiko"
            value={filters.risk}
            options={["Low", "Medium", "High"]}
            onChange={(val) => setFilters({ ...filters, risk: val })}
          />

          {/* Tombol Reset Filter */}
          <button
            onClick={() =>
              setFilters({
                sub_unit: "Semua Unit",
                assessment_type: "Semua Asesmen",
                risk_register: "Semua Register",
                corporate_risk_category: "Semua Dampak",
                risk: "Semua Risiko",
              })
            }
            className="mt-5 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors uppercase tracking-widest"
          >
            Reset
          </button>
        </div>

        {/* --- GRID DIVISI (MASONRY) --- */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium tracking-widest animate-pulse">
            SINKRONISASI DATABASE...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {categoriesConfig.map((cat, index) => {
              const filteredItems = auditData.filter((item) => {
                const matchesSearch = item.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
                const matchesUnit =
                  filters.sub_unit === "Semua Unit" ||
                  item.sub_unit === filters.sub_unit;
                const matchesType =
                  filters.assessment_type === "Semua Asesmen" ||
                  item.assessment_type === filters.assessment_type;
                const matchesRegister =
                  filters.risk_register === "Semua Register" ||
                  item.risk_register === filters.risk_register;
                const matchesImpact =
                  filters.corporate_risk_category === "Semua Dampak" ||
                  item.corporate_risk_category ===
                    filters.corporate_risk_category;
                const matchesRisk =
                  filters.risk === "Semua Risiko" || item.risk === filters.risk;

                return (
                  item.category === cat.title &&
                  matchesSearch &&
                  matchesUnit &&
                  matchesType &&
                  matchesRegister &&
                  matchesImpact &&
                  matchesRisk
                );
              });

              return (
                <div
                  key={index}
                  className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden h-fit transition-all"
                >
                  <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 shrink-0">
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-slate-800 text-[13px] leading-tight">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="p-3 space-y-3">
                    {filteredItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAudit(item)}
                        className="group p-3 border border-slate-100 rounded-[16px] hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer bg-white"
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                              {item.sub_unit}
                            </span>
                            <h4 className="text-[11px] font-bold text-slate-700 uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                              {item.name}
                            </h4>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] font-black border ${getRiskStyle(item.risk)}`}
                          >
                            {item.risk}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 pt-2 border-t border-slate-50">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {item.last_audit}
                          </span>
                          <span className="font-bold text-slate-500 truncate ml-2 max-w-[80px]">
                            {item.assessment_type?.split("(")[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="py-6 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase italic">
                          Empty
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- MODAL INPUT --- */}
        {showModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest">
                    Register Audit Universe
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Input parameter objek pengawasan internal.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddData} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Nama Audit / Objek
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-indigo-500 focus:ring-1"
                    placeholder="Contoh: Audit Logistik"
                    value={newEntry.name}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Unit Kerja (Auto-Mapping)
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ketik untuk mencari unit kerja..."
                    value={unitQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setUnitQuery(query);
                      setShowUnitSuggestions(true);
                      setNewEntry({
                        ...newEntry,
                        sub_unit: query,
                        category: unitToCategoryMap[query] || "Operasional & Produksi",
                      });
                    }}
                    onFocus={() => setShowUnitSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowUnitSuggestions(false), 120)}
                  />

                  {showUnitSuggestions && filteredUnits.length > 0 && (
                    <div className="absolute left-0 right-0 z-20 max-h-52 overflow-auto border border-slate-200 bg-white rounded-2xl shadow-xl mt-1">
                      {filteredUnits.map((unitName, index) => (
                        <button
                          key={`${unitName}-${index}`}
                          type="button"
                          onMouseDown={() => {
                            setUnitQuery(unitName);
                            setNewEntry({
                              ...newEntry,
                              sub_unit: unitName,
                              category: unitToCategoryMap[unitName] || "Operasional & Produksi",
                            });
                            setShowUnitSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors text-sm text-slate-700"
                        >
                          {unitName}
                        </button>
                      ))}
                    </div>
                  )}

                  {units.length === 0 && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Memuat unit dari database...
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Assessment Type
                    </label>
                    <select
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          assessment_type: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih Asesmen</option>
                      <option>Risiko Fitur & Produk Baru (Product RCSA)</option>
                      <option>Risiko Program Promosi (Marketing RCSA)</option>
                      <option>Proses Operasional & SOP Baru (SOP RCSA)</option>
                      <option>Kajian Insiden (Post-Mortem / RCA)</option>
                      <option>Risiko Pihak Ketiga & Vendor</option>
                      <option>Kemitraan Strategis (KSO)</option>
                      <option>Rencana Strategis (Tahunan)</option>
                      <option>Rencana Kerja Departemen</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Risk Register
                    </label>
                    <select
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          risk_register: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih Sumber</option>
                      <option>Management</option>
                      <option>Finance</option>
                      <option>HRD (Human Resources Department)</option>
                      <option>IT (Information Technology)</option>
                      <option>Legal</option>
                      <option>Data Analyst</option>
                      <option>Bussiness Development</option>
                      <option>Risk register testing</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Kategori Dampak
                    </label>
                    <select
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          corporate_risk_category: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih Dampak</option>
                      <option>Risiko Finansial</option>
                      <option>Risiko Sistem Teknologi Informasi</option>
                      <option>Risiko Reputasi Bisnis</option>
                      <option>Risiko Operasional</option>
                      <option>Risiko Kepatuhan</option>
                      <option>Risiko Strategis</option>
                      <option>Risiko Pihak Ketiga / Vendor</option>
                      <option>Risiko Legal</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Tingkat Risiko
                    </label>
                    <select
                      className={`w-full p-3 border rounded-xl text-sm font-bold outline-none ${newEntry.risk === "High" ? "bg-red-50 border-red-200 text-red-700" : newEntry.risk === "Medium" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, risk: e.target.value })
                      }
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] mt-4 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Simpan ke Audit Universe
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL DETAIL VIEW --- */}
        {selectedAudit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {selectedAudit.category}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 leading-tight uppercase">
                    {selectedAudit.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <DetailItem
                    label="Unit Kerja"
                    value={selectedAudit.sub_unit}
                    icon={<Building2 size={14} />}
                  />
                  <DetailItem
                    label="Tingkat Risiko"
                    value={selectedAudit.risk}
                    isRisk
                    color={getRiskStyle(selectedAudit.risk)}
                  />
                  <DetailItem
                    label="Tahun Audit"
                    value={selectedAudit.last_audit}
                    icon={<Calendar size={14} />}
                  />
                  <DetailItem
                    label="Tipe Asesmen"
                    value={selectedAudit.assessment_type}
                    icon={<ClipboardCheck size={14} />}
                  />
                </div>
                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <DetailItem
                    label="Risk Register Source"
                    value={selectedAudit.risk_register}
                    icon={<Layers size={14} />}
                    fullWidth
                  />
                  <DetailItem
                    label="Corporate Risk Category"
                    value={selectedAudit.corporate_risk_category}
                    icon={<Target size={14} />}
                    fullWidth
                  />
                </div>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
                >
                  Tutup Detail
                </button>
                <button
                  onClick={() => handleDelete(selectedAudit.id)}
                  className="w-full py-4 text-red-500 font-bold uppercase tracking-widest hover:bg-red-200 rounded-2xl transition-all flex items-center justify-center"
                >
                  Hapus Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, icon, active, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
      active
        ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 ring-2 ring-indigo-100"
        : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
    }`}
  >
    <div className="flex justify-between items-start">
      <div
        className={`p-1.5 rounded-lg ${active ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400"}`}
      >
        {icon}
      </div>
      <span
        className={`text-lg font-black ${active ? "text-white" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
    <p
      className={`text-[9px] font-bold uppercase tracking-wider ${active ? "text-indigo-100" : "text-slate-400"}`}
    >
      {title}
    </p>
  </div>
);

const DetailItem = ({ label, value, isRisk, color, icon, fullWidth }) => (
  <div className={`${fullWidth ? "col-span-2" : ""}`}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <div
      className={`flex items-center gap-2 ${isRisk ? `px-3 py-1 rounded-lg border font-black text-[10px] w-fit ${color}` : "text-[13px] font-extrabold text-slate-700"}`}
    >
      {!isRisk && icon && <span className="text-slate-400">{icon}</span>}
      {value || "-"}
    </div>
  </div>
);

export default AuditUniverseSPI;
