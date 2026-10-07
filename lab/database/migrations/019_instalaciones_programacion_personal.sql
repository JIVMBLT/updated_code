-- [Claude | 2026-10-07 | CLAUDE-MG | LAB DGB - INSTALACIONES PROGRAMACION DE PERSONAL V001]
-- INT-9. Programacion de personal de Instalaciones: Montadores y Ajustadores.
--   * instalaciones_personal_montadores : contratista, nombre, puesto (Mecanico/Ayudante), categoria.
--   * instalaciones_personal_ajustadores: nombre, categoria, experiencia.
--   * instalaciones_programacion_asignaciones: liga personal <-> equipo (ins_fl).
--     Los dias de trabajo NO se capturan: salen de las fechas del reporte de
--     Instalaciones (montaje: inicio/fin; ajuste: inicio/fin). fecha_desde y
--     fecha_hasta son OPCIONALES y solo sirven para acotar los dias de una
--     persona dentro del equipo (p. ej. relevo a mitad de obra) o cuando el
--     reporte aun no tiene fechas.
-- Seguido de: permisos del catalogo (+ concesion a LAB R01) y datos FICTICIOS.
-- IDs fijos e INSERT OR IGNORE: idempotente.

CREATE TABLE IF NOT EXISTS `instalaciones_personal_montadores` (
  `id_montador` INTEGER PRIMARY KEY AUTOINCREMENT,
  `contratista` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `puesto` TEXT NOT NULL CHECK (`puesto` IN ('Mecánico','Ayudante')),
  `categoria` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT 1,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS `instalaciones_personal_montadores__idx_contratista` ON `instalaciones_personal_montadores` (`contratista`);
CREATE INDEX IF NOT EXISTS `instalaciones_personal_montadores__idx_nombre` ON `instalaciones_personal_montadores` (`nombre`);

CREATE TABLE IF NOT EXISTS `instalaciones_personal_ajustadores` (
  `id_ajustador` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre` TEXT NOT NULL,
  `categoria` TEXT DEFAULT NULL,
  `experiencia` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT 1,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS `instalaciones_personal_ajustadores__idx_nombre` ON `instalaciones_personal_ajustadores` (`nombre`);

CREATE TABLE IF NOT EXISTS `instalaciones_programacion_asignaciones` (
  `id_asignacion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `tipo_personal` TEXT NOT NULL CHECK (`tipo_personal` IN ('MONTADOR','AJUSTADOR')),
  `id_montador` INTEGER DEFAULT NULL,
  `id_ajustador` INTEGER DEFAULT NULL,
  `id_ins_fl` INTEGER NOT NULL,
  `fecha_desde` TEXT DEFAULT NULL,
  `fecha_hasta` TEXT DEFAULT NULL,
  `notas` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT 1,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  CHECK ((`tipo_personal`='MONTADOR' AND `id_montador` IS NOT NULL AND `id_ajustador` IS NULL)
      OR (`tipo_personal`='AJUSTADOR' AND `id_ajustador` IS NOT NULL AND `id_montador` IS NULL)),
  FOREIGN KEY (`id_montador`) REFERENCES `instalaciones_personal_montadores` (`id_montador`) ON DELETE CASCADE,
  FOREIGN KEY (`id_ajustador`) REFERENCES `instalaciones_personal_ajustadores` (`id_ajustador`) ON DELETE CASCADE,
  FOREIGN KEY (`id_ins_fl`) REFERENCES `ins_fl` (`id_ins_fl`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `instalaciones_programacion_asignaciones__idx_equipo` ON `instalaciones_programacion_asignaciones` (`id_ins_fl`);
CREATE INDEX IF NOT EXISTS `instalaciones_programacion_asignaciones__idx_montador` ON `instalaciones_programacion_asignaciones` (`id_montador`);
CREATE INDEX IF NOT EXISTS `instalaciones_programacion_asignaciones__idx_ajustador` ON `instalaciones_programacion_asignaciones` (`id_ajustador`);
-- Una misma persona no puede quedar dos veces activa en el mismo equipo.
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_programacion_asignaciones__uq_montador_equipo` ON `instalaciones_programacion_asignaciones` (`id_montador`,`id_ins_fl`) WHERE `activo`=1 AND `id_montador` IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_programacion_asignaciones__uq_ajustador_equipo` ON `instalaciones_programacion_asignaciones` (`id_ajustador`,`id_ins_fl`) WHERE `activo`=1 AND `id_ajustador` IS NOT NULL;

-- ---------------------------------------------------------------------
-- Catalogo de permisos (mismo esquema que 012/017). Reutiliza la
-- agrupacion 6 (INSTALACIONES) y las acciones VER=1, CREAR=847,
-- EDITAR=848, DESACTIVAR=849. IDs 9020-9026 / rol_permisos 14956-14959
-- (maximos previos: modulos 9005, elementos 9012, subelementos 9013,
-- subelemento_acciones 9014, rol_permisos 14955).
-- ---------------------------------------------------------------------
INSERT OR IGNORE INTO `perm_modulos` (id_modulo,id_agrupacion,codigo,nombre,ruta_frontend,orden,activo,created_at,updated_at)
VALUES (9020,6,'INSTALACIONES_PROGRAMACION_PERSONAL','Programación de personal','instalaciones-programacion-personal',100,1,'2026-10-07 00:00:00','2026-10-07 00:00:00');
INSERT OR IGNORE INTO `perm_elementos` (id_elemento,id_modulo,codigo,nombre,tipo,orden,activo,created_at,updated_at)
VALUES (9021,9020,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO','Calendario de programación','VISTA',1,1,'2026-10-07 00:00:00','2026-10-07 00:00:00');
INSERT OR IGNORE INTO `perm_subelementos` (id_subelemento,id_elemento,codigo,nombre,orden,activo,created_at,updated_at)
VALUES (9022,9021,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION','Programación y personal',1,1,'2026-10-07 00:00:00','2026-10-07 00:00:00');
INSERT OR IGNORE INTO `perm_subelemento_acciones` (id_subelemento_accion,id_subelemento,id_accion,codigo_permiso,activo,created_at,updated_at)
VALUES
 (9023,9022,1,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.VER',1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (9024,9022,847,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.CREAR',1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (9025,9022,848,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.EDITAR',1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (9026,9022,849,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.DESACTIVAR',1,'2026-10-07 00:00:00','2026-10-07 00:00:00');
-- Concesion al rol Director General (id_rol=1, usuario LAB R01), igual que 013/015/017.
INSERT OR IGNORE INTO `rol_permisos` (id_rol_permiso,id_rol,id_subelemento_accion,permitido,created_at,updated_at)
VALUES
 (14956,1,9023,1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (14957,1,9024,1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (14958,1,9025,1,'2026-10-07 00:00:00','2026-10-07 00:00:00'),
 (14959,1,9026,1,'2026-10-07 00:00:00','2026-10-07 00:00:00');

-- =====================================================================
-- DATOS FICTICIOS (dummy) para ver la programacion en el LAB.
-- Va aqui y no en seed.sql porque las tablas nuevas existen a partir de
-- esta migracion (el seed corre antes) y asi tambien llega a las bases
-- LAB ya inicializadas en el navegador.
-- =====================================================================

-- Equipos adicionales para que haya demanda futura (2026-2027) en el reporte.
-- (Las filas 966101/966102 vienen de la migracion 018 y solo reciben fechas de ajuste.)
UPDATE `ins_fl` SET `fecha_inicio_ajuste`='2026-11-23',`fecha_fin_ajuste_planeado`='2026-12-18' WHERE `id_ins_fl`=966101 AND `fecha_inicio_ajuste` IS NULL;
UPDATE `ins_fl` SET `fecha_inicio_ajuste`='2026-11-02',`fecha_fin_ajuste_planeado`='2026-11-20' WHERE `id_ins_fl`=966102 AND `fecha_inicio_ajuste` IS NULL;

INSERT OR IGNORE INTO `ins_fl` (`id_ins_fl`,`proyecto`,`id_proyecto`,`referencia_sitio`,`estatus`,`fecha_visita`,`comentarios_fl`,`avance_oc`,`avance_mo`,`avance_aj`,`fecha_inicio_montaje`,`fecha_fin_montaje_planeado`,`fecha_fin_montaje_modificado`,`fecha_fin_montaje_real`,`fecha_inicio_ajuste`,`fecha_fin_ajuste_planeado`,`subcontratista`,`estado`,`supervisor_fl`,`ciudad`,`vendedor`,`cliente`,`id_sup`,`id_asesor`,`id_admin`,`activo`) VALUES
 (966103,'LAB - TORRE ALAMEDA','PPNS-LAB-0101','Torre Alameda - Elevador 2','02-OC','2026-10-01','Equipo de ejemplo ficticio (programación de personal).','30','0','0','2026-10-20','2027-01-15',NULL,NULL,'2027-01-18','2027-02-05','Montajes Demo LAB SA','Ciudad de México','Usuario LAB Supervisor 2','Ciudad de México','Asesor LAB','Desarrolladora Alameda LAB SA de CV',910051,910039,910037,1),
 (966104,'LAB - PLAZA CENTRO SUR','PPNS-LAB-0102','Plaza Centro Sur - Escalera 1','03-PM','2026-09-29','Equipo de ejemplo ficticio: montaje terminado, en ajuste.','100','100','20','2026-08-25','2026-10-02',NULL,'2026-10-04','2026-10-06','2026-10-20','Instalaciones Demo LAB SA','Jalisco','Usuario LAB Supervisor 3','Guadalajara','Asesor LAB','Operadora Centro Sur LAB SA de CV',910051,910039,910037,1),
 (966105,'LAB - PLAZA CENTRO SUR','PPNS-LAB-0102','Plaza Centro Sur - Escalera 2','03-PM','2026-09-29','Equipo de ejemplo ficticio: fin de montaje reprogramado.','100','80','0','2026-09-01','2026-10-18','2026-10-28',NULL,'2026-10-29','2026-11-12','Instalaciones Demo LAB SA','Jalisco','Usuario LAB Supervisor 3','Guadalajara','Asesor LAB','Operadora Centro Sur LAB SA de CV',910051,910039,910037,1),
 (966106,'LAB - PLAZA CENTRO SUR','PPNS-LAB-0102','Plaza Centro Sur - Escalera 4','02-OC','2026-09-29','Equipo de ejemplo ficticio: arranca en noviembre.','60','0','0','2026-11-02','2026-12-15',NULL,NULL,'2026-12-16','2027-01-10','Instalaciones Demo LAB SA','Jalisco','Usuario LAB Supervisor 3','Guadalajara','Asesor LAB','Operadora Centro Sur LAB SA de CV',910051,910039,910037,1),
 (966107,'LAB - HOSPITAL VALLE NORTE','PPNS-LAB-0103','Hospital Valle Norte - Elevador A','02-OC','2026-10-02','Equipo de ejemplo ficticio: demanda 2027.','10','0','0','2026-12-07','2027-03-12',NULL,NULL,'2027-03-15','2027-04-09','Montajes Demo LAB SA','Nuevo León','Usuario LAB Supervisor 2','Monterrey','Asesor LAB','Servicios Hospitalarios Norte LAB SA de CV',910051,910039,910037,1),
 (966108,'LAB - HOSPITAL VALLE NORTE','PPNS-LAB-0103','Hospital Valle Norte - Elevador B','02-OC','2026-10-02','Equipo de ejemplo ficticio: demanda 2027.','10','0','0','2027-01-11','2027-04-16',NULL,NULL,'2027-04-19','2027-05-14','Elevadores del Centro Demo LAB SA','Nuevo León','Usuario LAB Supervisor 2','Monterrey','Asesor LAB','Servicios Hospitalarios Norte LAB SA de CV',910051,910039,910037,1);

-- Montadores: 15 personas, 3 contratistas.
INSERT OR IGNORE INTO `instalaciones_personal_montadores` (`id_montador`,`contratista`,`nombre`,`puesto`,`categoria`,`activo`,`created_by`,`updated_by`) VALUES
 (969101,'Montajes Demo LAB SA','Ramón Delgado Cruz','Mecánico','Oficial A',1,910037,910037),
 (969102,'Montajes Demo LAB SA','Iván Ochoa Ruiz','Mecánico','Oficial B',1,910037,910037),
 (969103,'Montajes Demo LAB SA','Pedro Villalobos Mena','Mecánico','Oficial A',1,910037,910037),
 (969104,'Montajes Demo LAB SA','Luis Fabela Ponce','Ayudante','Ayudante general',1,910037,910037),
 (969105,'Montajes Demo LAB SA','Jesús Barrera Luna','Ayudante','Ayudante general',1,910037,910037),
 (969106,'Montajes Demo LAB SA','Omar Rentería Gil','Ayudante','Ayudante en capacitación',1,910037,910037),
 (969107,'Instalaciones Demo LAB SA','Gilberto Núñez Soto','Mecánico','Oficial A',1,910037,910037),
 (969108,'Instalaciones Demo LAB SA','Saúl Quintero Vega','Mecánico','Oficial B',1,910037,910037),
 (969109,'Instalaciones Demo LAB SA','Mario Zavala Prieto','Ayudante','Ayudante general',1,910037,910037),
 (969110,'Instalaciones Demo LAB SA','Erick Duarte Lara','Ayudante','Ayudante general',1,910037,910037),
 (969111,'Instalaciones Demo LAB SA','Hugo Landa Mora','Ayudante','Ayudante en capacitación',1,910037,910037),
 (969112,'Elevadores del Centro Demo LAB SA','Arturo Beltrán Rojas','Mecánico','Oficial A',1,910037,910037),
 (969113,'Elevadores del Centro Demo LAB SA','Felipe Camacho Ríos','Mecánico','Oficial B',1,910037,910037),
 (969114,'Elevadores del Centro Demo LAB SA','Brandon Salazar Ortiz','Ayudante','Ayudante general',1,910037,910037),
 (969115,'Elevadores del Centro Demo LAB SA','Raúl Ibarra Maya','Ayudante','Ayudante general',1,910037,910037);

-- Ajustadores: 6 personas.
INSERT OR IGNORE INTO `instalaciones_personal_ajustadores` (`id_ajustador`,`nombre`,`categoria`,`experiencia`,`activo`,`created_by`,`updated_by`) VALUES
 (969201,'Carlos Mejía Arce','Ajustador líder','15 años',1,910037,910037),
 (969202,'Beatriz Olvera Pons','Ajustador Sr','12 años',1,910037,910037),
 (969203,'Fernando Ledesma Cano','Ajustador Sr','8 años',1,910037,910037),
 (969204,'Karla Domínguez Ávila','Ajustador Jr','4 años',1,910037,910037),
 (969205,'Esteban Orozco Paz','Ajustador Jr','2 años',1,910037,910037),
 (969206,'Rodrigo Valdés Herrera','Ajustador Sr','9 años',1,910037,910037);

-- Asignaciones (sin fechas propias salvo los 3 casos marcados: los dias salen del reporte).
-- Ningun traslape entre asignaciones de la misma persona.
INSERT OR IGNORE INTO `instalaciones_programacion_asignaciones` (`id_asignacion`,`tipo_personal`,`id_montador`,`id_ajustador`,`id_ins_fl`,`fecha_desde`,`fecha_hasta`,`notas`,`activo`,`created_by`,`updated_by`) VALUES
 -- Torre Alameda E1 (montaje 2026-09-14 > 2026-11-20): cuadrilla de Montajes Demo
 (969301,'MONTADOR',969101,NULL,966101,NULL,NULL,NULL,1,910037,910037),
 (969302,'MONTADOR',969102,NULL,966101,NULL,NULL,NULL,1,910037,910037),
 (969303,'MONTADOR',969104,NULL,966101,NULL,NULL,NULL,1,910037,910037),
 (969304,'MONTADOR',969105,NULL,966101,NULL,NULL,NULL,1,910037,910037),
 -- Plaza Centro Sur E3 (montaje 2026-08-25 > 2026-10-30): Instalaciones Demo
 (969305,'MONTADOR',969107,NULL,966102,NULL,NULL,NULL,1,910037,910037),
 (969306,'MONTADOR',969108,NULL,966102,NULL,NULL,NULL,1,910037,910037),
 (969307,'MONTADOR',969109,NULL,966102,NULL,NULL,NULL,1,910037,910037),
 (969308,'MONTADOR',969110,NULL,966102,NULL,NULL,NULL,1,910037,910037),
 -- Plaza Centro Sur E1 (montaje terminado el 2026-10-04): historial; Brandon se retira el 30-sep y Raul lo releva
 (969309,'MONTADOR',969112,NULL,966104,NULL,NULL,NULL,1,910037,910037),
 (969310,'MONTADOR',969113,NULL,966104,NULL,NULL,NULL,1,910037,910037),
 (969311,'MONTADOR',969114,NULL,966104,NULL,'2026-09-30','Se retira de la obra; lo releva Raúl Ibarra.',1,910037,910037),
 (969312,'MONTADOR',969115,NULL,966104,'2026-10-01',NULL,'Relevo de Brandon Salazar.',1,910037,910037),
 -- Plaza Centro Sur E2 (fin de montaje reprogramado a 2026-10-28)
 (969313,'MONTADOR',969103,NULL,966105,NULL,NULL,NULL,1,910037,910037),
 (969314,'MONTADOR',969111,NULL,966105,NULL,NULL,NULL,1,910037,910037),
 -- Torre Alameda E2 (futuro: 2026-10-20 > 2027-01-15): cuadrilla que sale libre de Escalera 1
 (969315,'MONTADOR',969112,NULL,966103,NULL,NULL,NULL,1,910037,910037),
 (969316,'MONTADOR',969113,NULL,966103,NULL,NULL,NULL,1,910037,910037),
 (969317,'MONTADOR',969115,NULL,966103,NULL,NULL,NULL,1,910037,910037),
 -- Plaza Centro Sur E4 (futuro: 2026-11-02 > 2026-12-15)
 (969318,'MONTADOR',969107,NULL,966106,NULL,NULL,NULL,1,910037,910037),
 (969319,'MONTADOR',969108,NULL,966106,NULL,NULL,NULL,1,910037,910037),
 (969320,'MONTADOR',969109,NULL,966106,NULL,NULL,NULL,1,910037,910037),
 -- Hospital Valle Norte A (futuro 2026-12-07 > 2027-03-12) y B (2027-01-11 > 2027-04-16)
 (969321,'MONTADOR',969101,NULL,966107,NULL,NULL,NULL,1,910037,910037),
 (969322,'MONTADOR',969102,NULL,966107,NULL,NULL,NULL,1,910037,910037),
 (969323,'MONTADOR',969104,NULL,966107,NULL,NULL,NULL,1,910037,910037),
 (969324,'MONTADOR',969105,NULL,966107,NULL,NULL,NULL,1,910037,910037),
 (969325,'MONTADOR',969103,NULL,966108,NULL,NULL,NULL,1,910037,910037),
 (969326,'MONTADOR',969111,NULL,966108,NULL,NULL,NULL,1,910037,910037),
 -- Historial en un equipo cerrado sin fechas de ajuste/montaje propias: dias capturados a mano
 (969327,'MONTADOR',969106,NULL,966007,'2026-08-03','2026-08-21','Capacitación en obra (dias capturados manualmente).',1,910037,910037),
 -- Ajustadores (fechas = INICIO DE AJUSTE > FIN DE AJUSTE del reporte)
 (969401,'AJUSTADOR',NULL,969201,966104,NULL,NULL,NULL,1,910037,910037),
 (969402,'AJUSTADOR',NULL,969201,966105,NULL,NULL,NULL,1,910037,910037),
 (969403,'AJUSTADOR',NULL,969202,966102,NULL,NULL,NULL,1,910037,910037),
 (969404,'AJUSTADOR',NULL,969202,966101,NULL,NULL,NULL,1,910037,910037),
 (969405,'AJUSTADOR',NULL,969203,966101,NULL,NULL,NULL,1,910037,910037),
 (969406,'AJUSTADOR',NULL,969204,966106,NULL,NULL,NULL,1,910037,910037),
 (969407,'AJUSTADOR',NULL,969201,966103,NULL,NULL,NULL,1,910037,910037),
 (969408,'AJUSTADOR',NULL,969202,966107,NULL,NULL,NULL,1,910037,910037),
 (969409,'AJUSTADOR',NULL,969205,966107,NULL,NULL,NULL,1,910037,910037),
 (969410,'AJUSTADOR',NULL,969201,966108,NULL,NULL,NULL,1,910037,910037),
 (969411,'AJUSTADOR',NULL,969206,966003,'2026-08-10','2026-08-24','Ajuste previo en proyecto cerrado (dias capturados manualmente).',1,910037,910037);
