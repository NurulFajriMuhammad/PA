import React, { useState } from 'react';
import apiClient from '../api/axios';

// Komponen ini menerima 3 props:
// 1. isOpen: (boolean) untuk tahu modal sedang terbuka atau tidak
// 2. onClose: (function) untuk menutup modal dari dalam
// 3. onUserAdded: (function) untuk memberitahu halaman UserManagement bahwa user baru telah ditambahkan
export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [roleId, setRoleId] = useState('2'); // Default 'Auditee' (sesuaikan ID-nya)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setError('Password dan Konfirmasi Password tidak cocok.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/users', {
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
        role_id: parseInt(roleId) // Kirim ID rolenya
      });

      if (response.data && response.data.success) {
        // Beritahu komponen induk (UserManagementPage) bahwa ada user baru
        onUserAdded(response.data.data); 
        handleClose(); // Tutup modal
      } else {
        setError(response.data.message || 'Gagal menambahkan pengguna.');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        // Jika ada error validasi dari Laravel
        const validationErrors = Object.values(err.response.data.errors).join(', ');
        setError(validationErrors);
      } else {
        setError('Terjadi kesalahan koneksi ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form saat modal ditutup
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setRoleId('2');
    setError(null);
    onClose(); // Panggil fungsi onClose dari props
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <style>
        {`
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }

          .modal-header h2 {
            margin: 0;
          }

          .modal-close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #888;
          }

          .modal-body .form-group {
            margin-bottom: 15px;
          }
          
          .modal-body label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
          }

          .modal-body input,
          .modal-body select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box; /* Penting agar padding tidak merusak lebar */
          }

          .modal-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          
          .btn {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
          }
          .btn-secondary {
            background-color: #f0f0f0;
            color: #333;
          }
          .btn-primary {
            background-color: #007bff;
            color: white;
          }
          .btn-primary:disabled {
            background-color: #a0cfff;
            cursor: not-allowed;
          }
          
          .error-message-modal {
            color: red;
            background-color: #ffebee;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
          }
        `}
      </style>

      <div className="modal-backdrop" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <h2>Tambah Pengguna Baru</h2>
            <button className="modal-close-btn" onClick={handleClose}>&times;</button>
          </header>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="error-message-modal">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Nama</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select 
                  id="role" 
                  value={roleId} 
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  {/* Sesuaikan ID (value) ini dengan ID di database Anda */}
                  <option value="1">Admin</option>
                  <option value="2">Auditee</option>
                  <option value="3">Auditor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password_confirmation">Konfirmasi Password</label>
                <input
                  type="password"
                  id="password_confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>

            </div>
            <footer className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}