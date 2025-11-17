import React, { useState } from "react";
import { Plus, Trash2, Edit, Copy } from "lucide-react";
import ApiRouteForm from "./ApiRouteForm";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const ApiRoutePage = ({ routes = [], setNotification, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterController, setFilterController] = useState("all");

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
        notifySuccess("Route berhasil diperbarui.");
      } else {
        await apiClient.post("/api/api-routes", formData);
        notifySuccess("Route berhasil ditambahkan.");
      }

      setIsModalOpen(false);
      setEditingRoute(null);
      await onRefresh();
    } catch (err) {
      console.error("Error:", err);
      const message = err.response?.data?.message || "Gagal menyimpan route.";
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    try {
      await apiClient.delete(`/api/api-routes/${itemToDelete.id}`);
      notifySuccess("Route berhasil dihapus.");
      setItemToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error("Error:", err);
      const message = err.response?.data?.message || "Gagal menghapus route.";
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRoute = (route) => {
    const routeText = `${route.method} /api${route.path}`;
    navigator.clipboard.writeText(routeText);
    notifySuccess(`Route disalin: ${routeText}`);
  };

  const controllerList = [
    "all",
    ...Array.from(new Set(routes.map((r) => r.controller))).sort(),
  ];

  const filteredRoutes = routes.filter((route) => {
    const methodMatch =
      filterMethod === "all" ||
      route.method.toUpperCase() === filterMethod.toUpperCase();

    const controllerMatch =
      filterController === "all" || route.controller === filterController;

    return methodMatch && controllerMatch;
  });

  // const filteredRoutes =
  //   filterMethod === "all"
  //     ? routes
  //     : routes.filter(
  //         (r) => r.method.toUpperCase() === filterMethod.toUpperCase()
  // );

  const methodColors = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-green-100 text-green-800",
    PUT: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
    PATCH: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ⚡ Manajemen API Routes
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Buat dan kelola routes API secara dinamis tanpa mengubah kode PHP
          </p>
        </div>
        <button
          onClick={handleAddRoute}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Route
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Method</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <select
          value={filterController}
          onChange={(e) => setFilterController(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {controllerList.map((ctrl) => (
            <option key={ctrl} value={ctrl}>
              {ctrl === "all" ? "Semua Controller" : ctrl}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-600 py-2">
          Total: <strong>{filteredRoutes.length}</strong> routes
        </span>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Path
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Controller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Izin
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {Array.isArray(filteredRoutes) && filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded ${
                        methodColors[route.method] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {route.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                    /api{route.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {route.controller}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {route.action || (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {route.permission || (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        route.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {route.is_active ? "✓ Aktif" : "✗ Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => setItemToDelete(route)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  ℹ️ Tidak ada routes ditemukan. <br />
                  <button
                    onClick={handleAddRoute}
                    className="text-blue-600 hover:underline mt-2"
                  >
                    Buat route pertama Anda
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ApiRouteForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoute(null);
        }}
        onSave={handleSaveRoute}
        existingRoute={editingRoute}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteRoute}
        itemName={`Route: ${itemToDelete?.method} /api${itemToDelete?.path}`}
      />
    </div>
  );
};

export default ApiRoutePage;
