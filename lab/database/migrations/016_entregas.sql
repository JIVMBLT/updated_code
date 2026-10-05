-- [Claude | 2026-10-05 | CLAUDE-MG | LAB DGB - ENTREGAS V001]
-- Nueva seccion independiente del sidebar: Entregas. Control de entregas
-- recurrentes (unica/semanal/quincenal/mensual) de colaboradores, con carga
-- de documento directo en el registro (sin depender de correo/fechas
-- externas) y validacion por el responsable que la creo, para evitar
-- cumplimiento falso (subir cualquier archivo solo para marcar "entregado").
PRAGMA foreign_keys = ON;

-- entregas_programadas: la definicion/plantilla que crea el responsable.
CREATE TABLE IF NOT EXISTS `entregas_programadas` (
  `id_entrega_programada` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_responsable` INTEGER NOT NULL,
  `id_colaborador` INTEGER NOT NULL,
  `titulo` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `tipo_recurrencia` TEXT NOT NULL CHECK (`tipo_recurrencia` IN ('UNICA','SEMANAL','QUINCENAL','MENSUAL')),
  `fecha_inicio` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_by` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_responsable`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_colaborador`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `entregas_programadas__idx_responsable` ON `entregas_programadas` (`id_responsable`,`activo`);
CREATE INDEX IF NOT EXISTS `entregas_programadas__idx_colaborador` ON `entregas_programadas` (`id_colaborador`,`activo`);

-- entregas_instancias: cada ocurrencia concreta a cumplir (1 para UNICA,
-- varias generadas por adelantado para las recurrentes).
CREATE TABLE IF NOT EXISTS `entregas_instancias` (
  `id_instancia` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_entrega_programada` INTEGER NOT NULL,
  `numero_ocurrencia` INTEGER NOT NULL DEFAULT '1',
  `fecha_limite` TEXT NOT NULL,
  `fecha_entrega` TEXT DEFAULT NULL,
  `nombre_archivo` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamano_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `entregado_por` INTEGER DEFAULT NULL,
  `validado` INTEGER DEFAULT NULL,
  `validado_por` INTEGER DEFAULT NULL,
  `fecha_validacion` TEXT DEFAULT NULL,
  `comentario_validacion` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_entrega_programada`) REFERENCES `entregas_programadas` (`id_entrega_programada`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`entregado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`validado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `entregas_instancias__idx_programada` ON `entregas_instancias` (`id_entrega_programada`,`fecha_limite`);
CREATE INDEX IF NOT EXISTS `entregas_instancias__idx_fecha_limite` ON `entregas_instancias` (`fecha_limite`);
CREATE UNIQUE INDEX IF NOT EXISTS `entregas_instancias__uq_ocurrencia` ON `entregas_instancias` (`id_entrega_programada`,`numero_ocurrencia`);

-- No existe una accion generica 'VALIDAR' en el catalogo (solo
-- VALIDAR_VO_BO, especifica de otro modulo) -- se agrega una nueva,
-- siguiendo el mismo patron con que se agregaron ADJUNTAR_ARCHIVO(851) y
-- GESTIONAR_RELACION_COTIZACION(852) cuando hicieron falta. Max
-- id_accion confirmado antes de esta migracion: 1190.
INSERT OR IGNORE INTO `perm_acciones` (id_accion,codigo,nombre,descripcion,requiere_auditoria,activo,created_at,updated_at)
VALUES (1191,'VALIDAR','Validar','Permite marcar como valido o rechazado un registro entregado en el subelemento relacionado.',1,1,'2026-10-05 00:00:00','2026-10-05 00:00:00');

-- Catalogo de permisos: nueva agrupacion independiente 'ENTREGAS' (max
-- id_agrupacion confirmado antes de escribir esta migracion: 17). IDs de
-- modulos/elementos/subelementos/acciones elegidos a partir del maximo
-- real confirmado antes de escribir esta migracion (modulos=42,
-- elementos=173, subelementos=2252, subelemento_acciones=2559,
-- rol_permisos=14944).
INSERT OR IGNORE INTO `perm_agrupaciones` (`id_agrupacion`,`codigo`,`nombre`,`empresa`,`orden`,`activo`) VALUES (18,'ENTREGAS','Entregas','BLT LAB',18,1);

INSERT OR IGNORE INTO `perm_modulos` (id_modulo,id_agrupacion,codigo,nombre,ruta_frontend,orden,activo,created_at,updated_at)
VALUES (43,18,'ENTREGAS_CONTROL','Control de Entregas','entregas-control',10,1,'2026-10-05 00:00:00','2026-10-05 00:00:00');

INSERT OR IGNORE INTO `perm_elementos` (id_elemento,id_modulo,codigo,nombre,tipo,orden,activo,created_at,updated_at)
VALUES
 (174,43,'ENTREGAS_CONTROL_ACCESO_VISUAL','Acceso visual','VISUAL',0,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (175,43,'ENTREGAS_CONTROL_PROGRAMADAS','Entregas programadas por mí',10,1,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (176,43,'ENTREGAS_CONTROL_MIS_ENTREGAS','Mis entregas pendientes',20,1,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (177,43,'ENTREGAS_CONTROL_VALIDACION','Validación de entregas',30,1,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (178,43,'ENTREGAS_CONTROL_INDICADORES','Indicadores',40,1,1,'2026-10-05 00:00:00','2026-10-05 00:00:00');

INSERT OR IGNORE INTO `perm_subelementos` (id_subelemento,id_elemento,codigo,nombre,orden,activo,created_at,updated_at)
VALUES
 (2253,174,'ENTREGAS_CONTROL_ACCESO_VISUAL_MODULO','Mostrar módulo',0,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2254,175,'ENTREGAS_CONTROL_PROGRAMADAS_LISTADO','Listado de entregas programadas',10,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2255,176,'ENTREGAS_CONTROL_MIS_ENTREGAS_LISTADO','Listado de mis entregas',10,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2256,177,'ENTREGAS_CONTROL_VALIDACION_LISTADO','Listado para validar',10,1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2257,178,'ENTREGAS_CONTROL_INDICADORES_PANEL','Panel de indicadores',10,1,'2026-10-05 00:00:00','2026-10-05 00:00:00');

INSERT OR IGNORE INTO `perm_subelemento_acciones` (id_subelemento_accion,id_subelemento,id_accion,codigo_permiso,activo,created_at,updated_at)
VALUES
 (2560,2253,34,'ENTREGAS_CONTROL_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2561,2254,1,'ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.VER',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2562,2254,847,'ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.CREAR',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2563,2254,848,'ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.EDITAR',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2564,2254,849,'ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.DESACTIVAR',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2565,2255,1,'ENTREGAS_CONTROL_MIS_ENTREGAS_LISTADO.VER',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2566,2255,851,'ENTREGAS_CONTROL_MIS_ENTREGAS_LISTADO.ADJUNTAR_ARCHIVO',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2567,2256,1,'ENTREGAS_CONTROL_VALIDACION_LISTADO.VER',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2568,2256,1191,'ENTREGAS_CONTROL_VALIDACION_LISTADO.VALIDAR',1,'2026-10-05 00:00:00','2026-10-05 00:00:00'),
 (2569,2257,1,'ENTREGAS_CONTROL_INDICADORES_PANEL.VER',1,'2026-10-05 00:00:00','2026-10-05 00:00:00');

-- Concede todo el modulo a LAB R01 (rol 1, Director General) en la misma
-- migracion (sin dejar el pendiente de permiso-sin-conceder).
INSERT OR IGNORE INTO `rol_permisos` (id_rol_permiso,id_rol,id_subelemento_accion,permitido,created_at,updated_at,created_by,updated_by)
VALUES
 (14945,1,2560,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14946,1,2561,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14947,1,2562,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14948,1,2563,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14949,1,2564,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14950,1,2565,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14951,1,2566,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14952,1,2567,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14953,1,2568,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL),
 (14954,1,2569,1,'2026-10-05 00:00:00','2026-10-05 00:00:00',NULL,NULL);
