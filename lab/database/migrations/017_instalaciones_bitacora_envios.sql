-- [Claude | 2026-10-06 | CLAUDE-MG | LAB DGB - BITACORA ENVIOS POR CORREO V001]
-- Registro de envios (simulados) de documentos de la Bitacora de Obra a los
-- contactos de 1 o varias categorias del mismo proyecto. El LAB no tiene
-- servidor de correo real; esta tabla deja trazabilidad de que documento se
-- envio, a quien, a que categorias y quien lo disparo.
CREATE TABLE IF NOT EXISTS instalaciones_bitacora_envios (
  id_envio INTEGER PRIMARY KEY AUTOINCREMENT,
  id_documento INTEGER NOT NULL,
  id_proyecto TEXT NOT NULL,
  categorias TEXT NOT NULL,
  destinatarios TEXT NOT NULL,
  total_destinatarios INTEGER NOT NULL DEFAULT 0,
  enviado_por INTEGER DEFAULT NULL,
  fecha_envio TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_documento) REFERENCES instalaciones_bitacora_documentos(id_documento) ON DELETE CASCADE,
  FOREIGN KEY (enviado_por) REFERENCES usuarios(id_SB) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS instalaciones_bitacora_envios__idx_documento ON instalaciones_bitacora_envios(id_documento);
CREATE INDEX IF NOT EXISTS instalaciones_bitacora_envios__idx_proyecto ON instalaciones_bitacora_envios(id_proyecto);

-- Permiso que exige la vista de detalle de proyecto para mostrar la
-- Bitacora de Obra (core/details.js: BITACORA_VIEW_PERMISSION). No existia en
-- el catalogo LAB. Reutiliza perm_modulos id=18 (INSTALACIONES_PROYECTOS) y la
-- accion VER=1 ya existente; IDs 9012-9014 (max previo: elementos=9006,
-- subelementos=9007, subelemento_acciones=9011). Se concede a LAB R01
-- (rol Director General id=1), igual que en migraciones 013/015.
INSERT OR IGNORE INTO `perm_elementos` (id_elemento,id_modulo,codigo,nombre,tipo,orden,activo,created_at,updated_at)
VALUES (9012,18,'INSTALACIONES_PROYECTOS_DETALLE_PROYECTO','Detalle de proyecto','VISTA',90,1,'2026-10-06 00:00:00','2026-10-06 00:00:00');
INSERT OR IGNORE INTO `perm_subelementos` (id_subelemento,id_elemento,codigo,nombre,orden,activo,created_at,updated_at)
VALUES (9013,9012,'INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA','Bitacora de Obra',1,1,'2026-10-06 00:00:00','2026-10-06 00:00:00');
INSERT OR IGNORE INTO `perm_subelemento_acciones` (id_subelemento_accion,id_subelemento,id_accion,codigo_permiso,activo,created_at,updated_at)
VALUES (9014,9013,1,'INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER',1,'2026-10-06 00:00:00','2026-10-06 00:00:00');
INSERT OR IGNORE INTO `rol_permisos` (id_rol_permiso,id_rol,id_subelemento_accion,permitido,created_at,updated_at)
VALUES (14955,1,9014,1,'2026-10-06 00:00:00','2026-10-06 00:00:00');
