-- [Claude | 2026-09-25 | CLAUDE-MG | LAB DGB - CONCESION PERMISOS ROL DIRECTOR GENERAL V001]
-- Concede al rol 'Director General' (id_rol=1 -- rol del usuario LAB R01,
-- id_SB=910001) los 5 permisos funcionales registrados en el catalogo por
-- las integraciones INT-1 (Informes) e INT-2 (Instalaciones > Base de Datos
-- de Contactos), que quedaron en el catalogo pero sin conceder a ningun rol
-- (pendiente senalado explicitamente en ambos documentos de integracion).
-- El alcance de informacion (groupAllowed) de este usuario para OPERACION e
-- INSTALACIONES ya esta abierto -- verificado antes de escribir esta
-- migracion -- asi que conceder el permiso funcional es suficiente.
-- IDs elegidos a partir de MAX(id_rol_permiso)=14937 (verificado antes de
-- escribir esta migracion, sobre schema+seed+migraciones 004-012).
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO `rol_permisos` (id_rol_permiso,id_rol,id_subelemento_accion,permitido,created_at,updated_at,created_by,updated_by)
VALUES
 (14938,1,9004,1,'2026-09-25 00:00:00','2026-09-25 00:00:00',NULL,NULL),
 (14939,1,9008,1,'2026-09-25 00:00:00','2026-09-25 00:00:00',NULL,NULL),
 (14940,1,9009,1,'2026-09-25 00:00:00','2026-09-25 00:00:00',NULL,NULL),
 (14941,1,9010,1,'2026-09-25 00:00:00','2026-09-25 00:00:00',NULL,NULL),
 (14942,1,9011,1,'2026-09-25 00:00:00','2026-09-25 00:00:00',NULL,NULL);
