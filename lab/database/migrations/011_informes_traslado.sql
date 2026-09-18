-- [Claude | 2026-09-17 | CLAUDE-MG | LAB DGB - TRASLADO INFORMES V001]
-- Registra Operacion > Informes en el catalogo de permisos del LAB
-- (mismo esquema que produccion: perm_modulos/perm_elementos/perm_subelementos/
-- perm_subelemento_acciones). No crea tablas nuevas. Reutiliza perm_agrupaciones
-- id_agrupacion=2 (OPERACION, ya existente) y perm_acciones.codigo='VER' (id=1,
-- ya existente, ver 004_permissions_catalog.sql). IDs elegidos en el rango
-- 9001-9004 para no colisionar con los IDs ya usados por el catalogo existente.

INSERT OR IGNORE INTO `perm_modulos` (id_modulo,id_agrupacion,codigo,nombre,ruta_frontend,orden,activo,created_at,updated_at)
VALUES (9001,2,'OPERACION_INFORMES','Informes','informes',9,1,'2026-09-17 00:00:00','2026-09-17 00:00:00');

INSERT OR IGNORE INTO `perm_elementos` (id_elemento,id_modulo,codigo,nombre,tipo,orden,activo,created_at,updated_at)
VALUES (9002,9001,'OPERACION_INFORMES_INFORMES','Informes','VISTA',1,1,'2026-09-17 00:00:00','2026-09-17 00:00:00');

INSERT OR IGNORE INTO `perm_subelementos` (id_subelemento,id_elemento,codigo,nombre,orden,activo,created_at,updated_at)
VALUES (9003,9002,'OPERACION_INFORMES_INFORMES_INFORMES','Informes',1,1,'2026-09-17 00:00:00','2026-09-17 00:00:00');

-- perm_acciones.id_accion=1 ya es 'VER' (ver 004_permissions_catalog.sql linea 5).
INSERT OR IGNORE INTO `perm_subelemento_acciones` (id_subelemento_accion,id_subelemento,id_accion,codigo_permiso,activo,created_at,updated_at)
VALUES (9004,9003,1,'OPERACION_INFORMES_INFORMES_INFORMES.VER',1,'2026-09-17 00:00:00','2026-09-17 00:00:00');
