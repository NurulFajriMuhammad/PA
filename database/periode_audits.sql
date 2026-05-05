CREATE TABLE periode_audits (
    id SERIAL PRIMARY KEY,
    tahun VARCHAR(4) NOT NULL,
    nama_periode VARCHAR(255) NOT NULL,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    is_active BOOLEAN DEFAULT false,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
