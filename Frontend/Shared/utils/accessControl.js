/**
 * Helper untuk mengecek akses modul di sisi Frontend
 * @param {Object} user - Object user dari state/context
 * @param {string} moduleCode - Contoh: 'SURAT_TUGAS'
 * @param {string} type - 'can_read', 'can_write', atau 'can_delete'
 */
export const hasAccess = (user, moduleCode, type) => {
    // Jika user admin (opsional: jika kamu punya role superadmin)
    // if (user?.roles?.includes('admin')) return true;

    if (!user || !user.jabatan || !user.jabatan.permissions) {
        return false;
    }

    const permission = user.jabatan.permissions.find(
        (p) => p.module && p.module.kode_modul === moduleCode
    );

    if (!permission) return false;
    
    // Kembalikan nilai boolean dari field (can_read, dll)
    return !!permission[type]; 
};