import React, { useState, useEffect, useCallback } from "react";
import { Users, Shield, KeySquare, Route } from "lucide-react";
import Notification from "../components/Common/Notification";
import UserPage from "../components/UserManager/UserPage";
import RolePage from "../components/RoleManager/RolePage";
import ApiPage from "../components/Izin/ApiPage.jsx";
import ApiRoutePage from "../components/RouteApi/ApiRoutePage.jsx";
import Header from "../components/Header.jsx";
import axios from "../../../Shared/api/apiClient.js";

// Fungsi helper untuk mengambil array data dari respons API
// Ini menangani format { data: [...] } atau array langsung
const extractData = (res) => {
    return res.data?.data || (Array.isArray(res.data) ? res.data : []);
};

// ----------------------------------------
// NAV BUTTON (Tidak berubah)
// ----------------------------------------
const NavButton = ({
  page,
  label,
  icon: Icon,
  currentPage,
  setCurrentPage,
}) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center px-4 py-2 font-medium rounded-lg transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span>{label}</span>
    </button>
  );
};

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------
export default function DashboardApp() {
    const [currentPage, setCurrentPage] = useState("users");
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [apiRoutes, setApiRoutes] = useState([]);
    const [notification, setNotification] = useState({
        message: null,
        type: "success",
    });
    const [loadingData, setLoadingData] = useState(true);
    const userId = "LOCAL_ADMIN_ID_123";

    // ----------------------------------------
    // FETCH DATA - MENGGUNAKAN PANGGILAN TERPISAH (KRITIS & NON-KRITIS)
    // ----------------------------------------
    const fetchData = useCallback(async () => {
        setLoadingData(true);
        let criticalDataLoaded = false;

        // 1. Panggilan Data Kritis (Users, Roles, Permissions)
        try {
            console.log("📡 Fetching critical data (Users, Roles, Permissions)...");
            
            const [userRes, roleRes, permRes] = await Promise.all([
                axios.get("/api/users"),
                axios.get("/api/roles"),
                axios.get("/api/permissions"),
            ]);

            // ✅ Set state dengan data yang sudah diekstrak dan divalidasi
            setUsers(extractData(userRes));
            setRoles(extractData(roleRes));
            setPermissions(extractData(permRes));

            criticalDataLoaded = true;
            console.log("✅ Critical data loaded successfully. Permissions count:", extractData(permRes).length);
            
        } catch (err) {
            console.error("❌ Fetch Error (Critical Data):", err);
            const errorMsg = err.response?.data?.message || err.message || "Gagal memuat data utama. Cek log API Users/Roles/Permissions.";
            setNotification({
                message: `Error: ${errorMsg}`,
                type: "error",
            });
            // Jika data kritis gagal, set state ke array kosong
            setUsers([]);
            setRoles([]);
            setPermissions([]);
            setLoadingData(false);
            return; 
        }

        // 2. Panggilan Data Non-Kritis (API Routes)
        try {
            console.log("📡 Fetching API Routes...");
            const routeRes = await axios.get("/api/api-routes");
            setApiRoutes(extractData(routeRes));
            console.log("✅ API Routes loaded successfully.");
        } catch (err) {
            console.error("❌ Fetch Error (API Routes - 403/500):", err.response?.status, err.message);
            // Memberi notifikasi, tapi biarkan data lain ditampilkan
            setApiRoutes([]);
            setNotification({
                message: `Peringatan: Gagal memuat API Routes (${err.response?.status || 'network'}). Cek log server backend.`,
                type: "warning",
            });
        } finally {
            setLoadingData(false);
        }
    }, []); 

    // ----------------------------------------
    // FETCH DATA ON MOUNT
    // ----------------------------------------
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------
    // NOTIFICATION HANDLER (Tidak berubah)
    // ----------------------------------------
    const handleSetNotification = useCallback((notif) => {
        setNotification(notif);
        setTimeout(() => {
            setNotification({ message: null, type: "success" });
        }, 3000);
    }, []);

    // ----------------------------------------
    // MAIN LAYOUT (Tidak berubah)
    // ----------------------------------------
    return (
        <div className="min-h-full">
            <Header />

            <div className="p-4 md:p-8 pt-[94px]">
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onDismiss={() => setNotification({ message: null, type: "success" })}
                />

                {/* HEADER */}
                <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600 mt-1">
                            Kelola pengguna, peran, dan izin API untuk aplikasi Anda.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <span className="text-sm text-gray-500">UserID: {userId}</span>
                    </div>
                </header>

                {/* NAVIGATION */}
                <nav className="flex flex-wrap gap-2 mb-6 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                    <NavButton
                        page="users"
                        label="Pengguna"
                        icon={Users}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                    <NavButton
                        page="roles"
                        label="Role"
                        icon={Shield}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                    <NavButton
                        page="permissions"
                        label="Izin"
                        icon={KeySquare}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                    <NavButton
                        page="routes"
                        label="API Routes"
                        icon={Route}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </nav>

                {/* HALAMAN */}
                <main>
                    {loadingData ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <p className="mt-2">Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {currentPage === "users" && (
                                <UserPage
                                    users={users}
                                    roles={roles}
                                    setNotification={handleSetNotification}
                                />
                            )}

                            {currentPage === "roles" && (
                                <RolePage
                                    roles={roles}
                                    permissions={permissions} // Kini dijamin array atau array kosong
                                    setNotification={handleSetNotification}
                                    onRefresh={fetchData} // Meneruskan fetchData agar RolePage bisa refresh semua data
                                />
                            )}

                            {currentPage === "permissions" && (
                                <ApiPage
                                    permissions={permissions}
                                    setNotification={handleSetNotification}
                                />
                            )}

                            {currentPage === "routes" && (
                                <ApiRoutePage
                                    routes={apiRoutes}
                                    permissions={permissions}
                                    setNotification={handleSetNotification}
                                    onRefresh={fetchData}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}