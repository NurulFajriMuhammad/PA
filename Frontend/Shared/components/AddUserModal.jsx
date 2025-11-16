import React, { useState, useEffect } from "react";
import apiClient from "../api/axios"; // Sesuaikan path ini jika perlu

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch role ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await apiClient.get("/api/roles");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setRoles(data);
      setRoleId("");
    } catch (err) {
      console.error("Gagal mengambil roles", err);
      setError("Gagal memuat daftar role.");
      setRoles([]);
      setRoleId("");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post("/api/users", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role_id: parseInt(roleId),
      });

      onUserAdded(res.data.data);
      handleClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const validation = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        setError(validation);
      } else {
        setError("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membersihkan state dan menutup modal
  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setRoleId("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <h2>Tambah Pengguna Baru</h2>
            <button className="modal-close-btn" onClick={handleClose}>
              ×
            </button>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="error-message-modal">{error}</div>}

              {/* NAMA */}
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap" 
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com" 
                  required
                />
              </div>

              {/* ROLE */}
              <div className="form-group">
                <label>Role</label>
                {loadingRoles ? (
                  <div>Mengambil role...</div>
                ) : (
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      -- Pilih Role --
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter" 
                  required
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">
                <label>Konfirmasi Password</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Ketik ulang password" 
                  required
                />
              </div>
            </div>

            <footer className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || loadingRoles}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </footer>
          </form>
        </div>
      </div>

      {/* BLOK STYLE LAMA ANDA (YANG BERFUNGSI) */}
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.5); /* Sedikit lebih gelap */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(2px); /* Efek blur modern */
        }
        .modal-content {
          background: white;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }
        .modal-close-btn {
          font-size: 28px;
          font-weight: 300;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          line-height: 1;
        }
        .modal-close-btn:hover {
          color: #000;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
        }
        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box; /* Penting untuk padding */
        }
        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        /* Styling untuk Placeholder */
        .form-group input::placeholder {
          color: #aaa;
          font-style: italic;
          font-size: 0.9rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }
        
        .btn-secondary, .btn-primary {
          padding: 10px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .btn-secondary { 
          background: #f1f5f9; 
          color: #333;
          border: 1px solid #ddd;
        }
        .btn-secondary:hover { background: #e2e8f0; }
        
        .btn-primary { 
          background: #2563eb; 
          color: white; 
        }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .error-message-modal { 
          color: #dc2626; 
          background: #fee2e2;
          border: 1px solid #fca5a5;
          padding: 10px;
          border-radius: 6px;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}