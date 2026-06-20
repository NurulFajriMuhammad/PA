import React, { useState } from "react";
import { Plus, Trash2, Edit, Search, Link2, Sliders } from "lucide-react";
import ApiRouteForm from "./ApiRouteForm";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const ApiRoutePage = ({ routes = [], onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterController, setFilterController] = useState("all");
  const [searchPath, setSearchPath] = useState("");

  const handleAddRoute = () => {
    setEditingRoute(null);
    setIsModalOpen(true);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleSaveRoute = async (formData) => {
    setIsLoading(true);
    try {
      if (formData.id) {
        await apiClient.put(`/api/api-routes/${formData.id}`, formData);
        notifySuccess("✅ Route berhasil diperbarui.");
      } else {
        await apiClient.post("/api/api-routes", formData);
        notifySuccess("✅ Route berhasil ditambahkan.");
      }
      setIsModalOpen(false);
      setEditingRoute(null);
      await onRefresh();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Gagal menyimpan route.";
      notifyError(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/api/api-routes/${itemToDelete.id}`);
      notifySuccess("✅ Route berhasil dihapus.");
      setItemToDelete(null);
      await onRefresh();
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Gagal menghapus route.";
      notifyError(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const controllerList = ["all", ...Array.from(new Set(routes.map((r) => r.controller))).sort()];

  const filteredRoutes = routes.filter((route) => {
    const methodMatch = filterMethod === "all" || route.method.toUpperCase() === filterMethod.toUpperCase();
    const controllerMatch = filterController === "all" || route.controller === filterController;
    const pathMatch = route.path?.toLowerCase().includes(searchPath.toLowerCase());
    return methodMatch && controllerMatch && pathMatch;
  });

  const methodColors = {
    GET: "bg-sky-50 text-sky-700 border border-sky-100",
    POST: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    PUT: "bg-amber-50 text-amber-700 border border-amber-100",
    DELETE: "bg-rose-50 text-rose-700 border border-rose-100",
    PATCH: "bg-purple-50 text-purple-700 border border-purple-100",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Link2 className="w-7 h-7 text-blue-600" />
            Manajemen API Routes
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola dan petakan rute API secara dinamis serta definisikan pengendali (controllers/actions) di sistem.
          </p>
        </div>
        <button 
          onClick={handleAddRoute} 
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200 w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Route
        </button>
      </div>

      {/* Control Actions (Filters & Search) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Filter & Pencarian</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan path..."
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm placeholder-slate-400"
            />
          </div>
          <div>
            <select 
              value={filterMethod} 
              onChange={(e) => setFilterMethod(e.target.value)} 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-700 bg-white transition-all cursor-pointer"
            >
              <option value="all">Semua Method HTTP</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <select 
              value={filterController} 
              onChange={(e) => setFilterController(e.target.value)} 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-700 bg-white transition-all cursor-pointer"
            >
              {controllerList.map((ctrl) => (
                <option key={ctrl} value={ctrl}>
                  {ctrl === "all" ? "Semua Controller" : ctrl.split('\\').pop()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Path</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Controller</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action / Method Controller</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Method HTTP */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-xs font-extrabold rounded-lg border ${methodColors[route.method] || "bg-slate-50 text-slate-800 border-slate-200"}`}>
                        {route.method}
                      </span>
                    </td>
                    
                    {/* Path */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-slate-700">/api/{route.path}</span>
                    </td>
                    
                    {/* Controller */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">{route.controller}</span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {route.action ? (
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md font-mono text-xs font-bold border border-slate-100">
                          {route.action}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">-</span>
                      )}
                    </td>

                    {/* Status & Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${route.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${route.is_active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {route.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditRoute(route)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit
                          </button>
                          <button 
                            onClick={() => setItemToDelete(route)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Link2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Tidak ada route ditemukan</p>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda atau tambahkan route baru.</p>
                      </div>
                      <button
                        onClick={handleAddRoute}
                        className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        Buat route pertama
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApiRouteForm isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingRoute(null); }} onSave={handleSaveRoute} existingRoute={editingRoute} isLoading={isLoading} />
      <DeleteConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDeleteRoute} itemName={`Route: ${itemToDelete?.method} /api${itemToDelete?.path}`} />
    </div>
  );
};

export default ApiRoutePage;