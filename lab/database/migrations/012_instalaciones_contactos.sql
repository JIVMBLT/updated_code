-- [Claude | 2026-09-19 | CLAUDE-MG | LAB DGB - INSTALACIONES CONTACTOS V001]
-- Nuevo modulo: Base de Datos - Formato de Contactos, dentro de Instalaciones.
-- Tabla nueva `instalaciones_contactos`: Nombre, Puesto, Correo, Telefono,
-- Categoria (3 valores fijos definidos por el usuario) y Proyecto (relacion
-- real via FK a ins_fl.id_ins_fl). Un contacto pertenece a un solo proyecto;
-- si la misma persona trabaja en varios proyectos, se captura una fila por
-- proyecto (decision confirmada con el usuario). Permiso funcional propio,
-- separado del resto de Instalaciones (acceso mas restringido, a definir
-- por roles despues).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS `instalaciones_contactos` (
  `id_contacto` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre` TEXT NOT NULL,
  `puesto` TEXT DEFAULT NULL,
  `correo` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `categoria` TEXT NOT NULL CHECK (`categoria` IN ('Administración y Cobranza','Notificaciones de Avance de Materiales, Obra y/o Instalaciones','Comunicados Críticos')),
  `id_ins_fl` INTEGER NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_ins_fl`) REFERENCES `ins_fl` (`id_ins_fl`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `instalaciones_contactos__idx_proyecto` ON `instalaciones_contactos` (`id_ins_fl`,`activo`);
CREATE INDEX IF NOT EXISTS `instalaciones_contactos__idx_categoria` ON `instalaciones_contactos` (`categoria`);
CREATE INDEX IF NOT EXISTS `instalaciones_contactos__idx_nombre` ON `instalaciones_contactos` (`nombre`);

-- Catalogo de permisos (mismo esquema que produccion: perm_modulos/
-- perm_elementos/perm_subelementos/perm_subelemento_acciones). Reutiliza
-- perm_agrupaciones id_agrupacion=6 (INSTALACIONES, ya existente) y
-- perm_acciones ya existentes: VER=1, CREAR=847, EDITAR=848, DESACTIVAR=849.
-- IDs elegidos en el rango 9005-9011 (max actual confirmado antes de
-- escribir esta migracion: modulos=9001, elementos=9002, subelementos=9003,
-- subelemento_acciones=9004, del traslado de Informes).
INSERT OR IGNORE INTO `perm_modulos` (id_modulo,id_agrupacion,codigo,nombre,ruta_frontend,orden,activo,created_at,updated_at)
VALUES (9005,6,'INSTALACIONES_CONTACTOS','Base de Datos - Contactos','instalaciones-contactos',90,1,'2026-09-19 00:00:00','2026-09-19 00:00:00');

INSERT OR IGNORE INTO `perm_elementos` (id_elemento,id_modulo,codigo,nombre,tipo,orden,activo,created_at,updated_at)
VALUES (9006,9005,'INSTALACIONES_CONTACTOS_DIRECTORIO','Directorio de contactos','VISTA',1,1,'2026-09-19 00:00:00','2026-09-19 00:00:00');

INSERT OR IGNORE INTO `perm_subelementos` (id_subelemento,id_elemento,codigo,nombre,orden,activo,created_at,updated_at)
VALUES (9007,9006,'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO','Listado de contactos',1,1,'2026-09-19 00:00:00','2026-09-19 00:00:00');

INSERT OR IGNORE INTO `perm_subelemento_acciones` (id_subelemento_accion,id_subelemento,id_accion,codigo_permiso,activo,created_at,updated_at)
VALUES
 (9008,9007,1,'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.VER',1,'2026-09-19 00:00:00','2026-09-19 00:00:00'),
 (9009,9007,847,'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.CREAR',1,'2026-09-19 00:00:00','2026-09-19 00:00:00'),
 (9010,9007,848,'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.EDITAR',1,'2026-09-19 00:00:00','2026-09-19 00:00:00'),
 (9011,9007,849,'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.DESACTIVAR',1,'2026-09-19 00:00:00','2026-09-19 00:00:00');
