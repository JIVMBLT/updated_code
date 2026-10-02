-- [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE DETALLE V001]
-- Concede al rol 1 (Director General / LAB R01) el permiso de la pestana
-- "Encuestas" de Customer Experience, que ya existia en el catalogo
-- (placeholder de fases previas, id_modulo=41) pero no estaba concedido a
-- ningun rol -- mismo patron que la migracion 014 con el Dashboard.
INSERT OR IGNORE INTO `rol_permisos` (id_rol_permiso,id_rol,id_subelemento_accion,permitido,created_at,updated_at,created_by,updated_by)
VALUES (14944,1,325,1,'2026-10-02 00:00:00','2026-10-02 00:00:00',NULL,NULL);
