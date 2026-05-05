-- ===========================================
-- DOCUMENT REPOSITORY - PostgreSQL Queries
-- ===========================================

-- 1. Create document_repositories table
CREATE TABLE IF NOT EXISTS document_repositories (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    module_id BIGINT NOT NULL,
    uploaded_by VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_repositories_category ON document_repositories(category);
CREATE INDEX IF NOT EXISTS idx_document_repositories_module ON document_repositories(module);
CREATE INDEX IF NOT EXISTS idx_document_repositories_file_type ON document_repositories(file_type);
CREATE INDEX IF NOT EXISTS idx_document_repositories_created_at ON document_repositories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_repositories_title ON document_repositories USING gin(to_tsvector('indonesian', title));

-- 3. Function to sync documents from all modules
CREATE OR REPLACE FUNCTION sync_document_repository()
RETURNS TEXT AS $$
DECLARE
    synced_count INTEGER := 0;
BEGIN
    -- Clear existing data
    DELETE FROM document_repositories;

    -- Sync from tindak_lanjut
    INSERT INTO document_repositories (
        title, file_path, file_name, file_type, file_size, category,
        module, module_id, uploaded_by, metadata, created_at, updated_at
    )
    SELECT
        'Tindak Lanjut - ' || COALESCE(keterangan, 'Tanpa Keterangan') as title,
        bukti as file_path,
        split_part(bukti, '/', -1) as file_name,
        'file' as file_type,
        NULL as file_size,
        'Arsip Tindak Lanjut' as category,
        'tindak_lanjut' as module,
        id as module_id,
        NULL as uploaded_by,
        json_build_object('unit', unit, 'jenis_audit', jenis_audit, 'tahun', tahun, 'bulan', bulan) as metadata,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM tindak_lanjut
    WHERE bukti IS NOT NULL;

    synced_count := synced_count + (SELECT COUNT(*) FROM tindak_lanjut WHERE bukti IS NOT NULL);

    -- Sync from analisis_temuan
    INSERT INTO document_repositories (
        title, file_path, file_name, file_type, file_size, category,
        module, module_id, uploaded_by, metadata, created_at, updated_at
    )
    SELECT
        'Analisis Temuan - Lampiran' as title,
        lampiran as file_path,
        lampiran_name as file_name,
        'file' as file_type,
        NULL as file_size,
        'Arsip Analisis' as category,
        'analisis_temuan' as module,
        id as module_id,
        NULL as uploaded_by,
        json_build_object('temuan_id', temuan_id) as metadata,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM analisis_temuan
    WHERE lampiran IS NOT NULL;

    synced_count := synced_count + (SELECT COUNT(*) FROM analisis_temuan WHERE lampiran IS NOT NULL);

    -- Sync from auditee_documents
    INSERT INTO document_repositories (
        title, file_path, file_name, file_type, file_size, category,
        module, module_id, uploaded_by, metadata, created_at, updated_at
    )
    SELECT
        judul_dokumen as title,
        file_path,
        split_part(file_path, '/', -1) as file_name,
        file_type,
        NULL as file_size,
        'Dokumen Auditee' as category,
        'auditee_document' as module,
        id as module_id,
        NULL as uploaded_by,
        json_build_object('assurance_id', assurance_id) as metadata,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM auditee_documents;

    synced_count := synced_count + (SELECT COUNT(*) FROM auditee_documents);

    -- Sync from external_audit_temuans
    INSERT INTO document_repositories (
        title, file_path, file_name, file_type, file_size, category,
        module, module_id, uploaded_by, metadata, created_at, updated_at
    )
    SELECT
        'External Audit - Lampiran' as title,
        lampiran as file_path,
        split_part(lampiran, '/', -1) as file_name,
        'file' as file_type,
        NULL as file_size,
        'Arsip External Audit' as category,
        'external_audit_temuan' as module,
        id as module_id,
        NULL as uploaded_by,
        json_build_object('external_audit_id', external_audit_id) as metadata,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM external_audit_temuans
    WHERE lampiran IS NOT NULL;

    synced_count := synced_count + (SELECT COUNT(*) FROM external_audit_temuans WHERE lampiran IS NOT NULL);

    -- Sync from lhe_files
    INSERT INTO document_repositories (
        title, file_path, file_name, file_type, file_size, category,
        module, module_id, uploaded_by, metadata, created_at, updated_at
    )
    SELECT
        file_name as title,
        file_path,
        file_name,
        file_type,
        file_size,
        'Laporan Hasil Audit' as category,
        'lhe_file' as module,
        id as module_id,
        uploaded_by,
        json_build_object('kka_id', kka_id) as metadata,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM lhe_files;

    synced_count := synced_count + (SELECT COUNT(*) FROM lhe_files);

    RETURN 'Berhasil mensinkronisasi ' || synced_count || ' dokumen ke document repository';

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_documents', (SELECT COUNT(*) FROM document_repositories),
        'categories', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM document_repositories
                GROUP BY category
                ORDER BY category
            ) t
        ),
        'modules', (
            SELECT json_object_agg(module, count)
            FROM (
                SELECT module, COUNT(*) as count
                FROM document_repositories
                GROUP BY module
                ORDER BY module
            ) t
        ),
        'file_types', (
            SELECT json_object_agg(file_type, count)
            FROM (
                SELECT file_type, COUNT(*) as count
                FROM document_repositories
                WHERE file_type IS NOT NULL
                GROUP BY file_type
                ORDER BY file_type
            ) t
        ),
        'total_size', (
            SELECT COALESCE(SUM(file_size), 0)
            FROM document_repositories
            WHERE file_size IS NOT NULL
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to search documents
CREATE OR REPLACE FUNCTION search_documents(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    module_filter TEXT DEFAULT NULL,
    file_type_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    title TEXT,
    file_path TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    category TEXT,
    module TEXT,
    module_id BIGINT,
    uploaded_by TEXT,
    metadata JSONB,
    created_at TIMESTAMP,
    formatted_size TEXT,
    download_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dr.id,
        dr.title,
        dr.file_path,
        dr.file_name,
        dr.file_type,
        dr.file_size,
        dr.category,
        dr.module,
        dr.module_id,
        dr.uploaded_by,
        dr.metadata,
        dr.created_at,
        CASE
            WHEN dr.file_size IS NULL THEN '-'
            WHEN dr.file_size < 1024 THEN dr.file_size || ' B'
            WHEN dr.file_size < 1024*1024 THEN ROUND(dr.file_size::numeric/1024, 2) || ' KB'
            WHEN dr.file_size < 1024*1024*1024 THEN ROUND(dr.file_size::numeric/(1024*1024), 2) || ' MB'
            ELSE ROUND(dr.file_size::numeric/(1024*1024*1024), 2) || ' GB'
        END as formatted_size,
        CASE
            WHEN dr.file_path LIKE 'storage/%' THEN '/storage/' || substring(dr.file_path from 9)
            ELSE '/storage/' || dr.file_path
        END as download_url
    FROM document_repositories dr
    WHERE
        (search_term IS NULL OR dr.title ILIKE '%' || search_term || '%') AND
        (category_filter IS NULL OR category_filter = 'Semua' OR dr.category = category_filter) AND
        (module_filter IS NULL OR dr.module = module_filter) AND
        (file_type_filter IS NULL OR dr.file_type = file_type_filter)
    ORDER BY dr.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Usage examples:

-- Sync all documents:
-- SELECT sync_document_repository();

-- Get statistics:
-- SELECT get_document_statistics();

-- Search documents:
-- SELECT * FROM search_documents('audit', NULL, NULL, NULL, 10, 0);
-- SELECT * FROM search_documents(NULL, 'SOP', NULL, NULL, 20, 0);

-- 7. Create a view for easy querying
CREATE OR REPLACE VIEW document_repository_view AS
SELECT
    id,
    title,
    file_path,
    file_name,
    file_type,
    file_size,
    category,
    module,
    module_id,
    uploaded_by,
    metadata,
    created_at,
    CASE
        WHEN file_size IS NULL THEN '-'
        WHEN file_size < 1024 THEN file_size || ' B'
        WHEN file_size < 1024*1024 THEN ROUND(file_size::numeric/1024, 2) || ' KB'
        WHEN file_size < 1024*1024*1024 THEN ROUND(file_size::numeric/(1024*1024), 2) || ' MB'
        ELSE ROUND(file_size::numeric/(1024*1024*1024), 2) || ' GB'
    END as formatted_size,
    CASE
        WHEN file_path LIKE 'storage/%' THEN '/storage/' || substring(file_path from 9)
        ELSE '/storage/' || file_path
    END as download_url
FROM document_repositories
ORDER BY created_at DESC;